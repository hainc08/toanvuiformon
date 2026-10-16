import { jsonOk, readJson } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { idSchema } from "@/lib/validation/common";
import { worksheetUpsertSchema } from "@/lib/validation/worksheet";
import { deleteWorksheet, getAdminWorksheet, updateWorksheet } from "@/services/worksheet-admin.service";

export const GET = adminRoute<{ id: string }>("question:read", async (_req, _user, { id }) => {
  return jsonOk(await getAdminWorksheet(idSchema.parse(id)), { headers: { "Cache-Control": "no-store" } });
});

export const PATCH = adminRoute<{ id: string }>("worksheet:write", async (req, user, { id }) => {
  const ws = await updateWorksheet(idSchema.parse(id), worksheetUpsertSchema.parse(await readJson(req)), user);
  return jsonOk({ id: ws.id, slug: ws.slug });
});

export const DELETE = adminRoute<{ id: string }>("worksheet:publish", async (_req, user, { id }) => {
  await deleteWorksheet(idSchema.parse(id), user);
  return jsonOk({ ok: true });
});
