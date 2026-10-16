import { jsonOk, readJson } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { idSchema } from "@/lib/validation/common";
import { gradeUpsertSchema } from "@/lib/validation/catalog";
import { updateGrade } from "@/services/catalog-admin.service";

export const PATCH = adminRoute<{ id: string }>("catalog:manage", async (req, user, { id }) => {
  return jsonOk(await updateGrade(idSchema.parse(id), gradeUpsertSchema.parse(await readJson(req)), user));
});
