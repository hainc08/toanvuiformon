import { jsonOk, readJson } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { idSchema } from "@/lib/validation/common";
import { topicUpsertSchema } from "@/lib/validation/catalog";
import { deleteTopic, updateTopic } from "@/services/catalog-admin.service";

export const PATCH = adminRoute<{ id: string }>("catalog:manage", async (req, user, { id }) => {
  return jsonOk(await updateTopic(idSchema.parse(id), topicUpsertSchema.parse(await readJson(req)), user));
});

export const DELETE = adminRoute<{ id: string }>("catalog:manage", async (_req, user, { id }) => {
  await deleteTopic(idSchema.parse(id), user);
  return jsonOk({ ok: true });
});
