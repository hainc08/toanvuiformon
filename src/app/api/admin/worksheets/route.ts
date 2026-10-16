import { jsonOk, readJson, searchParamsObject } from "@/lib/http";
import { adminRoute } from "@/lib/auth/admin-route";
import { adminWorksheetListSchema, worksheetUpsertSchema } from "@/lib/validation/worksheet";
import { createWorksheet, listAdminWorksheets } from "@/services/worksheet-admin.service";

export const GET = adminRoute("question:read", async (req) => {
  const { page, pageSize, ...f } = adminWorksheetListSchema.parse(searchParamsObject(req));
  return jsonOk(await listAdminWorksheets(f, page, pageSize), { headers: { "Cache-Control": "no-store" } });
});

export const POST = adminRoute("worksheet:write", async (req, user) => {
  const ws = await createWorksheet(worksheetUpsertSchema.parse(await readJson(req)), user);
  return jsonOk({ id: ws.id, slug: ws.slug }, { status: 201 });
});
