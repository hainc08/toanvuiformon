import "server-only";
import { clientIp } from "@/lib/security/client-ip";
import { enforceRateLimit, RATE_LIMITS } from "@/lib/security/rate-limit";
import { worksheetKeySchema } from "@/lib/validation/common";
import { getWorksheetOrThrow, recordDownload } from "@/services/worksheet.service";
import { pdfFilename, worksheetPdf, type PdfKind } from "@/services/pdf.service";

export async function worksheetPdfResponse(req: Request, rawId: string, kind: PdfKind): Promise<Response> {
  enforceRateLimit(RATE_LIMITS.pdf, clientIp(req));
  const ws = await getWorksheetOrThrow(worksheetKeySchema.parse(rawId));
  const pdf = await worksheetPdf(ws, kind);
  await recordDownload(ws.id, kind === "questions" ? "QUESTION_PDF" : "ANSWER_PDF");
  const inline = new URL(req.url).searchParams.get("inline") === "1";
  const filename = pdfFilename(ws, kind);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Length": String(pdf.byteLength),
      "Content-Disposition": `${inline ? "inline" : "attachment"}; filename="${filename}"`,
      "Cache-Control": "public, max-age=300",
      "X-Robots-Tag": "noindex",
    },
  });
}
