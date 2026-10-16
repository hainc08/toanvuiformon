import { jsonOk, readJson } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { gradeUpsertSchema } from "@/lib/validation/catalog";
import { createGrade, listGradesAdmin } from "@/services/catalog-admin.service";

export const GET = adminRoute("question:read", async () => jsonOk({ items: await listGradesAdmin() }));

export const POST = adminRoute("catalog:manage", async (req, user) => {
  return jsonOk(await createGrade(gradeUpsertSchema.parse(await readJson(req)), user), { status: 201 });
});
