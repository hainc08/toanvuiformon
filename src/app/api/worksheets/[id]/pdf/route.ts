import { route } from "@/lib/http";
import { worksheetPdfResponse } from "@/lib/pdf/response";

export const runtime = "nodejs";

export const GET = route<{ id: string }>(async (req, ctx) => worksheetPdfResponse(req, (await ctx.params).id, "questions"));
