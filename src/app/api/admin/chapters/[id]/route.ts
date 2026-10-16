import { jsonOk, readJson } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { idSchema } from "@/lib/validation/common";
import { chapterUpsertSchema } from "@/lib/validation/catalog";
import { deleteChapter, updateChapter } from "@/services/catalog-admin.service";

export const PATCH = adminRoute<{ id: string }>("catalog:manage", async (req, user, { id }) => {
  return jsonOk(await updateChapter(idSchema.parse(id), chapterUpsertSchema.parse(await readJson(req)), user));
});

export const DELETE = adminRoute<{ id: string }>("catalog:manage", async (_req, user, { id }) => {
  await deleteChapter(idSchema.parse(id), user);
  return jsonOk({ ok: true });
});
