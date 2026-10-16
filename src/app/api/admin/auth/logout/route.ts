import { jsonOk, route } from "@/lib/http";
import { assertSameOrigin } from "@/lib/security/origin";
import { destroyCurrentSession } from "@/lib/auth/session";

export const POST = route(async (req) => {
  assertSameOrigin(req);
  await destroyCurrentSession();
  return jsonOk({ ok: true }, { headers: { "Cache-Control": "no-store" } });
});
