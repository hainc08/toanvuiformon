import "server-only";
import { createAdapter } from "@/lib/db/adapter";
import { PrismaClient } from "@/generated/prisma/client";

declare global {
  var __prisma: PrismaClient | undefined;
}

function createClient(): PrismaClient {
  const adapter = createAdapter(process.env.DATABASE_URL, Number(process.env.DATABASE_POOL_MAX ?? 10));
  return new PrismaClient({ adapter, log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });
}

export const prisma: PrismaClient = globalThis.__prisma ?? createClient();
if (process.env.NODE_ENV !== "production") globalThis.__prisma = prisma;
