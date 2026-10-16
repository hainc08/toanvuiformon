import type { UserRole } from "@/generated/prisma/enums";

export const PERMISSIONS = [
  "stats:read",
  "question:read",
  "question:write",
  "question:submit",
  "question:review",
  "question:publish",
  "question:delete",
  "question:import",
  "catalog:manage",
  "worksheet:write",
  "worksheet:publish",
  "report:manage",
  "user:manage",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const EDITOR_PERMISSIONS: Permission[] = [
  "stats:read",
  "question:read",
  "question:write",
  "question:submit",
  "question:import",
  "worksheet:write",
  "report:manage",
];

export const ROLE_PERMISSIONS: Record<UserRole, ReadonlySet<Permission>> = {
  ADMIN: new Set(PERMISSIONS),
  EDITOR: new Set(EDITOR_PERMISSIONS),
};

export function can(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

export const ROLE_LABEL: Record<UserRole, string> = {
  ADMIN: "Quản trị viên",
  EDITOR: "Biên tập viên",
};
