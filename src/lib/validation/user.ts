import { z } from "zod";
import { MIN_PASSWORD_LENGTH } from "@/lib/auth/password";

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email("Email không hợp lệ").max(200),
  password: z.string().min(1, "Vui lòng nhập mật khẩu").max(200),
});

const passwordSchema = z
  .string()
  .min(MIN_PASSWORD_LENGTH, `Mật khẩu tối thiểu ${MIN_PASSWORD_LENGTH} ký tự`)
  .max(200)
  .refine((v) => /[a-zA-Z]/.test(v) && /\d/.test(v), "Mật khẩu cần có cả chữ và số");

export const userCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(200),
  name: z.string().trim().min(2).max(80),
  role: z.enum(["ADMIN", "EDITOR"]),
  password: passwordSchema,
});

export const userUpdateSchema = z.object({
  name: z.string().trim().min(2).max(80).optional(),
  role: z.enum(["ADMIN", "EDITOR"]).optional(),
  isActive: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1).max(200),
  newPassword: passwordSchema,
});
