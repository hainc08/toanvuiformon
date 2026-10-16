import type { SessionUser } from "@/lib/auth/session";
import { prisma } from "@/lib/db/prisma";
import { hashPassword } from "@/lib/auth/password";

export async function makeUser(role: "ADMIN" | "EDITOR", email = `${role.toLowerCase()}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}@test.vn`): Promise<SessionUser> {
  const u = await prisma.user.create({ data: { email, name: `Test ${role}`, role, passwordHash: await hashPassword("password12345") } });
  return { id: u.id, email: u.email, name: u.name, role: u.role };
}

export async function topicBySlug(slug: string) {
  return prisma.topic.findFirstOrThrow({ where: { slug }, include: { chapter: true } });
}
