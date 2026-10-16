import { z } from "zod";
import { jsonOk, readJson } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { idSchema } from "@/lib/validation/common";
import { resolveReport } from "@/services/question.service";

const schema = z.object({ status: z.enum(["RESOLVED", "DISMISSED"]) });

export const PATCH = adminRoute<{ id: string }>("report:manage", async (req, user, { id }) => {
  const { status } = schema.parse(await readJson(req, 1_024));
  await resolveReport(idSchema.parse(id), status, user);
  return jsonOk({ ok: true });
});
