import "server-only";
import { prisma } from "@/lib/db/prisma";
import { ApiError, notFound } from "@/lib/http";
import { hashPassword, verifyPassword, verifyPasswordConstantTime } from "@/lib/auth/password";
import { destroyUserSessions, type SessionUser } from "@/lib/auth/session";
import { audit } from "./audit.service";

export async function authenticate(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email }, select: { id: true, passwordHash: true, isActive: true } });
  const ok = await verifyPasswordConstantTime(password, user?.passwordHash ?? null);
  if (!user || !ok || !user.isActive) return null;
  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  return user.id;
}

export function listUsers() {
  return prisma.user.findMany({
    orderBy: { createdAt: "asc" },
    select: { id: true, email: true, name: true, role: true, isActive: true, lastLoginAt: true, createdAt: true },
  });
}

export async function createUser(input: { email: string; name: string; role: "ADMIN" | "EDITOR"; password: string }, actor: SessionUser) {
  const exists = await prisma.user.findUnique({ where: { email: input.email }, select: { id: true } });
  if (exists) throw new ApiError(409, "CONFLICT", "Email đã được sử dụng.");
  const user = await prisma.user.create({
    data: { email: input.email, name: input.name, role: input.role, passwordHash: await hashPassword(input.password) },
    select: { id: true, email: true, name: true, role: true, isActive: true },
  });
  await audit(actor.id, "user.create", "User", user.id, { role: user.role });
  return user;
}

export async function updateUser(id: string, input: { name?: string; role?: "ADMIN" | "EDITOR"; isActive?: boolean }, actor: SessionUser) {
  const target = await prisma.user.findUnique({ where: { id }, select: { id: true, role: true, isActive: true } });
  if (!target) throw notFound("Không tìm thấy tài khoản.");
  if (id === actor.id && (input.isActive === false || (input.role && input.role !== actor.role))) {
    throw new ApiError(409, "CONFLICT", "Bạn không thể tự khóa hoặc tự đổi vai trò của chính mình.");
  }
  // Keep at least one active admin.
  if (target.role === "ADMIN" && (input.role === "EDITOR" || input.isActive === false)) {
    const admins = await prisma.user.count({ where: { role: "ADMIN", isActive: true } });
    if (admins <= 1) throw new ApiError(409, "CONFLICT", "Hệ thống cần ít nhất một quản trị viên đang hoạt động.");
  }
  const user = await prisma.user.update({ where: { id }, data: input, select: { id: true, email: true, name: true, role: true, isActive: true } });
  if (input.isActive === false || input.role) await destroyUserSessions(id);
  await audit(actor.id, "user.update", "User", id, { role: input.role, isActive: input.isActive });
  return user;
}

export async function changeOwnPassword(user: SessionUser, currentPassword: string, newPassword: string, currentToken?: string) {
  const row = await prisma.user.findUniqueOrThrow({ where: { id: user.id }, select: { passwordHash: true } });
  if (!(await verifyPassword(currentPassword, row.passwordHash))) throw new ApiError(400, "BAD_REQUEST", "Mật khẩu hiện tại không đúng.");
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(newPassword) } });
  await destroyUserSessions(user.id, currentToken);
  await audit(user.id, "user.password_change", "User", user.id);
}
