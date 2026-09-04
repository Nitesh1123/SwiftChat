import "dotenv/config";
import { PrismaClient } from "@prisma/client";

// The native Rust engine securely handles Neon Serverless connection pooling
const prisma = new PrismaClient();

export { prisma };