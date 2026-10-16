/**
 * Create (or reset the password of) an admin account.
 * Usage:  ADMIN_EMAIL=a@b.vn ADMIN_PASSWORD='...' ADMIN_NAME='Tên' npm run admin:create
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const name = process.env.ADMIN_NAME ?? "Quản trị viên";
  if (!email || !password) throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD");
  if (password.length < 12 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) {
    throw new Error("ADMIN_PASSWORD must be >= 12 chars and contain letters and digits");
  }
  const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }) });
  try {
    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.upsert({
      where: { email },
      update: { passwordHash, role: "ADMIN", isActive: true },
      create: { email, name, passwordHash, role: "ADMIN" },
    });
    await prisma.session.deleteMany({ where: { userId: user.id } });
    console.log(`Admin ready: ${user.email}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
