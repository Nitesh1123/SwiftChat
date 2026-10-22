import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { Pool, neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import ws from "ws";

const databaseUrl = process.env.DATABASE_URL;

let prisma: PrismaClient;

if (databaseUrl && databaseUrl.includes("neon.tech")) {
  neonConfig.webSocketConstructor = ws;
  const pool = new Pool({ connectionString: databaseUrl });
  const adapter = new PrismaNeon(pool);
  prisma = new PrismaClient({ adapter });
} else {
  prisma = new PrismaClient();
}

export { prisma };
