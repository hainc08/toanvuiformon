import "server-only";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security/origin";
import { can, type Permission } from "./permissions";
import { getCurrentUser, type SessionUser } from "./session";

/** For API route handlers: authenticates, authorizes and applies CSRF origin checks. */
export async function requireApiUser(req: Request, permission?: Permission): Promise<SessionUser> {
  assertSameOrigin(req);
  const user = await getCurrentUser();
  if (!user) throw new ApiError(401, "UNAUTHORIZED", "Bạn cần đăng nhập.");
  if (permission && !can(user.role, permission)) throw new ApiError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này.");
  return user;
}

/** For admin server components: redirects to the login page when unauthenticated. */
export async function requireAdminPage(permission?: Permission): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (permission && !can(user.role, permission)) redirect("/admin?forbidden=1");
  return user;
}
