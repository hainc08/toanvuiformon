import { jsonOk, readJson, route, ApiError } from "@/lib/http";
import { clientIp } from "@/lib/security/client-ip";
import { assertSameOrigin } from "@/lib/security/origin";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import { loginSchema } from "@/lib/validation/user";
import { createSession, setSessionCookie } from "@/lib/auth/session";
import { authenticate } from "@/services/user.service";
import { audit } from "@/services/audit.service";

export const POST = route(async (req) => {
  assertSameOrigin(req);
  const ip = clientIp(req);
  enforceRateLimit(RATE_LIMITS.login, `ip:${ip}`);
  const { email, password } = loginSchema.parse(await readJson(req, 4_096));
  enforceRateLimit(RATE_LIMITS.login, `email:${email}`);
  const userId = await authenticate(email, password);
  if (!userId) throw new ApiError(401, "UNAUTHORIZED", "Email hoặc mật khẩu không đúng.");
  const { token, expiresAt } = await createSession(userId);
  await setSessionCookie(token, expiresAt);
  await audit(userId, "auth.login", "User", userId);
  return jsonOk({ ok: true }, { headers: { "Cache-Control": "no-store" } });
});
