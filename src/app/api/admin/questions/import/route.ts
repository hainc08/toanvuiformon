import { jsonOk, readJson } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import { importRequestSchema } from "@/lib/validation/question";
import { importQuestions } from "@/services/import.service";

const MAX_IMPORT_BYTES = 1024 * 1024; // 1 MB

export const POST = adminRoute("question:import", async (req, user) => {
  enforceRateLimit(RATE_LIMITS.import, user.id);
  const { dryRun, items } = importRequestSchema.parse(await readJson(req, MAX_IMPORT_BYTES));
  const result = await importQuestions(items, dryRun, user);
  return jsonOk(result, { status: result.errors.length > 0 ? 422 : 200 });
});
