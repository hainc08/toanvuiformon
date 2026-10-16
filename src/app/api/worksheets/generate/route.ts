import { jsonOk, readJson, route } from "@/lib/http";
import { clientIp } from "@/lib/security/client-ip";
import { assertSameOrigin } from "@/lib/security/origin";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import { generateWorksheetSchema } from "@/lib/validation/worksheet";
import { generateWorksheet } from "@/services/generator.service";

export const POST = route(async (req) => {
  assertSameOrigin(req);
  enforceRateLimit(RATE_LIMITS.generate, clientIp(req));
  const input = generateWorksheetSchema.parse(await readJson(req, 8_192));
  const result = await generateWorksheet(input);
  return jsonOk(result, { status: 201, headers: { "Cache-Control": "no-store" } });
});
