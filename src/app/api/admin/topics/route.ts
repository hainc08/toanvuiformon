import { jsonOk, readJson, searchParamsObject } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { idSchema } from "@/lib/validation/common";
import { topicUpsertSchema } from "@/lib/validation/catalog";
import { createTopic, listTopicsAdmin } from "@/services/catalog-admin.service";

export const GET = adminRoute("question:read", async (req) => {
  const chapterId = searchParamsObject(req).chapterId;
  return jsonOk({ items: await listTopicsAdmin(chapterId ? idSchema.parse(chapterId) : undefined) });
});

export const POST = adminRoute("catalog:manage", async (req, user) => {
  return jsonOk(await createTopic(topicUpsertSchema.parse(await readJson(req)), user), { status: 201 });
});
