/**
 * Removes user-generated worksheets older than N days (default 90).
 * Run periodically (cron) on production:  npx tsx scripts/cleanup-generated.ts 90
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const days = Math.max(7, Number(process.argv[2] ?? 90));
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
    const res = await prisma.worksheet.deleteMany({ where: { kind: "GENERATED", createdAt: { lt: cutoff } } });
    console.log(`Deleted ${res.count} generated worksheets older than ${days} days`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
