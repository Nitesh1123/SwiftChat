import { prisma } from "@zolo/prisma";

import { RedisService } from "@zolo/redis";

export const formatConversationAsync = async (conversation: any) => {
    const participants = await Promise.all(
        conversation.participants.map(async (p: any) => {
            const user = p.user;
            const isOnline = await RedisService.isUserOnline(user.id);
            const lastSeen = await RedisService.getUserLastSeen(user.id);
            return {
                ...user,
                _id: user.id,
                isOnline: isOnline === 1,
                lastSeen,
            };
        })
    );

    return {
        ...conversation,
        _id: conversation.id,
        participants,
        admins: conversation.admins ? conversation.admins.map((a: any) => {
            const user = a.user;
            return {
                ...user,
                _id: user.id
            };
        }) : [],
        lastMessage: conversation.lastMessage ? {
            ...conversation.lastMessage,
            _id: conversation.lastMessage.id,
            sender: conversation.lastMessage.sender ? {
                ...conversation.lastMessage.sender,
                _id: conversation.lastMessage.sender.id,
            } : undefined
        } : null
    };
};

export const createOrGetDM = async (
    userId: string,
    otherUserId: string
) => {
    // Check if DM exists
    const conversations = await prisma.conversation.findMany({
        where: {
            type: "dm",
            participants: {
                every: {
                    userId: { in: [userId, otherUserId] }
                }
            }
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: { id: true, name: true, avatar: true }
                    }
                }
            }
        }
    });

    // filter for exact match (both participants present, and only those 2)
    let conversation = conversations.find(
        (c) => c.participants.length === 2 &&
            c.participants.some(p => p.userId === userId) &&
            c.participants.some(p => p.userId === otherUserId)
    );

    if (!conversation) {
        conversation = await prisma.conversation.create({
            data: {
                type: "dm",
                participants: {
                    create: [
                        { userId: userId },
                        { userId: otherUserId }
                    ]
                }
            },
            include: {
                participants: {
                    include: {
                        user: {
                            select: { id: true, name: true, avatar: true }
                        }
                    }
                }
            }
        });
    }

    return await formatConversationAsync(conversation);
};

export const createGroup = async (
    name: string,
    participants: string[],
    creatorId: string
) => {
    const participantIds = new Set(participants);
    participantIds.add(creatorId);
    const uniqueParticipants = Array.from(participantIds);

    const conversation = await prisma.conversation.create({
        data: {
            name,
            type: "group",
            participants: {
                create: uniqueParticipants.map(id => ({ userId: id }))
            },
            admins: {
                create: [{ userId: creatorId }]
            }
        },
        include: {
            admins: {
                include: {
                    user: {
                        select: { id: true, name: true, avatar: true }
                    }
                }
            },
            participants: {
                include: {
                    user: {
                        select: { id: true, name: true, avatar: true }
                    }
                }
            }
        }
    });

    return await formatConversationAsync(conversation);
}

export const getConversationsService = async (userId: string) => {
    const conversations = await prisma.conversation.findMany({
        where: {
            participants: {
                some: { userId: userId }
            }
        },
        include: {
            participants: {
                include: {
                    user: {
                        select: { id: true, name: true, avatar: true }
                    }
                }
            },
            admins: {
                include: {
                    user: {
                        select: { id: true, name: true, avatar: true }
                    }
                }
            },
            lastMessage: {
                include: {
                    sender: {
                        select: { id: true, name: true, avatar: true }
                    }
                }
            }
        },
        orderBy: {
            updatedAt: 'desc'
        }
    });

    const conversationIds = conversations.map(c => c.id);

    // Bulk fetch read states for all conversations
    const readStates = await prisma.conversationRead.findMany({
        where: {
            conversationId: { in: conversationIds },
            userId: userId
        }
    });
    const readStateMap = new Map(readStates.map(rs => [rs.conversationId, rs]));

    // Bulk fetch last read messages for dates
    const lastReadMessageIds = readStates.map(rs => rs.lastReadMessageId).filter(Boolean) as string[];
    const lastReadMessages = await prisma.message.findMany({
        where: { id: { in: lastReadMessageIds } },
        select: { id: true, createdAt: true }
    });
    const lastReadMessageMap = new Map(lastReadMessages.map(m => [m.id, m]));

    const results = await Promise.all(
        conversations.map(async (conv) => {
            const readState = readStateMap.get(conv.id);
            let unreadCount = 0;

            if (readState?.lastReadMessageId) {
                const lastReadMessage = lastReadMessageMap.get(readState.lastReadMessageId);

                if (lastReadMessage) {
                    unreadCount = await prisma.message.count({
                        where: {
                            conversationId: conv.id,
                            senderId: { not: userId },
                            createdAt: { gt: lastReadMessage.createdAt }
                        }
                    });
                }
            } else {
                unreadCount = await prisma.message.count({
                    where: {
                        conversationId: conv.id,
                        senderId: { not: userId }
                    }
                });
            }

            const formatted = await formatConversationAsync(conv);
            return {
                ...formatted,
                unreadCount,
            };
        })
    );

    return results;
};
