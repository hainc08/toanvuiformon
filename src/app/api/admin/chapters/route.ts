import { jsonOk, readJson, searchParamsObject } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { idSchema } from "@/lib/validation/common";
import { chapterUpsertSchema } from "@/lib/validation/catalog";
import { createChapter, listChaptersAdmin } from "@/services/catalog-admin.service";

export const GET = adminRoute("question:read", async (req) => {
  const gradeId = searchParamsObject(req).gradeId;
  return jsonOk({ items: await listChaptersAdmin(gradeId ? idSchema.parse(gradeId) : undefined) });
});

export const POST = adminRoute("catalog:manage", async (req, user) => {
  return jsonOk(await createChapter(chapterUpsertSchema.parse(await readJson(req)), user), { status: 201 });
});
