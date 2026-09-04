import { prisma } from "@zolo/prisma";
import { Prisma } from "@prisma/client";

interface SetUsernameType {
    userId: string;
    username: string;
}

export const setUserNameService = async ({
    userId,
    username,
}: SetUsernameType) => {
    username = username.toLowerCase().trim();

    if (username.length < 3) {
        throw new Error("USERNAME_TOO_SHORT");
    }

    if (!/^[a-z0-9_.]{3,20}$/.test(username)) {
        throw new Error("INVALID_USERNAME");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, username: true },
    });

    if (!user) {
        throw new Error("USER_NOT_FOUND");
    }

    if (user.username) {
        throw new Error("USERNAME_ALREADY_SET");
    }

    try {
        await prisma.user.update({
            where: { id: userId },
            data: { username },
        });
    } catch (error: any) {
        // Prisma unique constraint violation code
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
            throw new Error("USERNAME_TAKEN");
        }
        throw error;
    }

    return { username };
};

export const getUsers = async (searchQuery: string, currentUserId: string) => {
    const baseWhere: Prisma.UserWhereInput = {
        id: { not: currentUserId },
        isBlocked: false,
    };

    if (searchQuery && searchQuery.trim() !== "") {
        const q = searchQuery.trim();

        const users = await prisma.user.findMany({
            where: {
                ...baseWhere,
                OR: [
                    { name: { startsWith: q, mode: "insensitive" } },
                    { username: { startsWith: q, mode: "insensitive" } },
                ],
            },
            select: {
                id: true,
                name: true,
                username: true,
                avatar: true,
            },
            orderBy: [{ username: "asc" }, { name: "asc" }],
            take: 10,
        });

        return users.map(u => ({ ...u, _id: u.id }));
    }

    const users = await prisma.user.findMany({
        where: baseWhere,
        select: {
            id: true,
            name: true,
            username: true,
            avatar: true,
        },
        orderBy: { name: "asc" },
        take: 10,
    });

    return users.map(u => ({ ...u, _id: u.id }));
};