import { prisma } from "@zolo/prisma";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { RedisService } from "@zolo/redis";

export const registerUser = async (
  name: string,
  email: string,
  password: string
) => {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new Error("User already exists");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = await prisma.user.create({
    data: { name, email, password: hashedPassword },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      avatar: true,
      isOnline: true,
      isBlocked: true,
      lastSeen: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return newUser;
};

export const loginUser = async (email: string, password: string) => {
  // Explicitly select password + refreshToken (sensitive fields not returned by default)
  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      username: true,
      avatar: true,
      isOnline: true,
      isBlocked: true,
      lastSeen: true,
      createdAt: true,
      updatedAt: true,
      password: true,
      refreshToken: true,
    },
  });

  if (!user) {
    throw new Error("Invalid email or password");
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Invalid email or password");
  }

  const accessToken = jwt.sign(
    { id: user.id },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.REFRESH_TOKEN_SECRET as string,
    { expiresIn: "7d" }
  );

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });



  // Strip sensitive fields before returning
  const { password: _, refreshToken: __, ...safeUser } = user;
  try {
    await RedisService.setUserOnline(user.id);
  } catch (error) {
    console.error("Redis error setting user online during login:", error);
  }

  return { user: safeUser, accessToken, refreshToken };
};
