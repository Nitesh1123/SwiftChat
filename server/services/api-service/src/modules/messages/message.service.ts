import { prisma } from "@swiftchat/prisma";
import crypto from "crypto";

interface SendMessageType {
  conversationId: string;
  senderId: string;
  content: string;
  type?: "text" | "image" | "file";
}

interface FetchMessageType {
  conversationId: string;
  userId: string;
  limit?: number;
  before?: string;
}

const formatMessage = (msg: any) => {
  return {
    ...msg,
    _id: msg.id,
    sender: msg.senderId,
    readBy: msg.readBy ? msg.readBy.map((r: any) => r.userId) : [],
  };
};

export const sendMessageService = async ({
  conversationId,
  senderId,
  content,
  type = "text",
}: SendMessageType) => {

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: true }
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const isParticipant = conversation.participants.some(
    (p) => p.userId === senderId
  );

  if (!isParticipant) {
    throw new Error("Not a participant of this conversation");
  }

  const messageId = crypto.randomUUID();

  // Create message in DB directly instead of relying on Kafka
  const savedMessage = await prisma.message.create({
    data: {
      id: messageId,
      conversationId,
      senderId,
      content,
      type,
      readBy: {
        create: [{ userId: senderId }]
      }
    },
    include: {
      readBy: true
    }
  });

  // Update conversation's last message
  await prisma.conversation.update({
    where: { id: conversationId },
    data: { lastMessageId: messageId }
  });

  return formatMessage(savedMessage);
};

export const fetchMessagesService = async ({
  conversationId,
  userId,
  limit = 20,
  before,
}: FetchMessageType) => {

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { participants: true }
  });

  if (!conversation) {
    throw new Error("Conversation not found");
  }

  const isParticipant = conversation.participants.some(
    (p) => p.userId === userId
  );

  if (!isParticipant) {
    throw new Error("Not a participant of this conversation");
  }

  const query: any = {
    conversationId: conversationId,
  };

  if (before) {
    query.createdAt = { lt: new Date(before) };
  }

  const messages = await prisma.message.findMany({
    where: query,
    orderBy: { createdAt: 'desc' },
    take: limit + 1,
    include: {
      readBy: true
    }
  });

  const hasMore = messages.length > limit;
  if (hasMore) messages.pop();

  if (messages.length > 0) {
    const latestMessage = messages[0];

    prisma.conversationRead.upsert({
      where: {
        conversationId_userId: {
          conversationId: conversationId,
          userId: userId,
        }
      },
      update: {
        lastReadMessageId: latestMessage.id,
      },
      create: {
        conversationId: conversationId,
        userId: userId,
        lastReadMessageId: latestMessage.id,
      }
    }).catch(err => console.error("Failed to update read state asynchronously:", err));
  }

  return {
    messages: messages.reverse().map(formatMessage),
    hasMore,
  };
};
