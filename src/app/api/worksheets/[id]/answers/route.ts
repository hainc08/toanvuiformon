import { jsonOk, route } from "@/lib/http";
import { worksheetKeySchema } from "@/lib/validation/common";
import { getWorksheetOrThrow, toAnswers } from "@/services/worksheet.service";

/** Answers + solutions, fetched only when the learner explicitly asks for them. */
export const GET = route<{ id: string }>(async (_req, ctx) => {
  const key = worksheetKeySchema.parse((await ctx.params).id);
  const ws = await getWorksheetOrThrow(key);
  return jsonOk({ worksheetId: ws.id, items: toAnswers(ws) }, { headers: { "Cache-Control": "public, max-age=60", "X-Robots-Tag": "noindex" } });
});
