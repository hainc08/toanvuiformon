import "server-only";
import { route } from "@/lib/http";
import { requireApiUser } from "./guard";
import type { Permission } from "./permissions";
import type { SessionUser } from "./session";

type Ctx<P> = { params: Promise<P> };

/** Admin API handler: error handling + same-origin check + authentication + RBAC. */
export function adminRoute<P = Record<string, string>>(
  permission: Permission,
  handler: (req: Request, user: SessionUser, params: P) => Promise<Response>,
) {
  return route<P>(async (req: Request, ctx: Ctx<P>) => {
    const user = await requireApiUser(req, permission);
    return handler(req, user, await ctx.params);
  });
}
