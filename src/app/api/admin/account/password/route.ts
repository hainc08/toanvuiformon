import { cookies } from "next/headers";
import { jsonOk, readJson } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { SESSION_COOKIE } from "@/lib/auth/session";
import { changePasswordSchema } from "@/lib/validation/user";
import { changeOwnPassword } from "@/services/user.service";

export const POST = adminRoute("question:read", async (req, user) => {
  const { currentPassword, newPassword } = changePasswordSchema.parse(await readJson(req, 4_096));
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  await changeOwnPassword(user, currentPassword, newPassword, token);
  return jsonOk({ ok: true });
});
