import { jsonOk, route } from "@/lib/http";
import { worksheetKeySchema } from "@/lib/validation/common";
import { getWorksheetOrThrow, toPublicWorksheetJson } from "@/services/worksheet.service";

/** Worksheet questions without answers. */
export const GET = route<{ id: string }>(async (_req, ctx) => {
  const key = worksheetKeySchema.parse((await ctx.params).id);
  const ws = await getWorksheetOrThrow(key);
  return jsonOk(toPublicWorksheetJson(ws), { headers: { "Cache-Control": "public, max-age=60" } });
});
