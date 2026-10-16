import "server-only";
import { pdfStylesheet } from "@/lib/pdf/assets";
import { renderPdf } from "@/lib/pdf/renderer";
import { answerSheetHtml, questionSheetHtml, type PdfWorksheet } from "@/lib/pdf/template";
import type { WorksheetDetail } from "./worksheet.service";

export type PdfKind = "questions" | "answers";

const MAX_CACHE_ENTRIES = 40;
const cache = new Map<string, Buffer>();

function cacheKey(ws: WorksheetDetail, kind: PdfKind): string {
  return `${ws.id}:${kind}:${ws.updatedAt.getTime()}:${ws.items.map((i) => i.revisionId).join(",")}`;
}

export function toPdfWorksheet(ws: WorksheetDetail): PdfWorksheet {
  return {
    title: ws.title,
    gradeName: ws.grade.name,
    chapterTitle: ws.chapter?.title ?? null,
    chapterNumber: ws.chapter?.number ?? null,
    topicTitle: ws.topic?.title ?? null,
    difficulty: ws.difficulty,
    durationMinutes: ws.durationMinutes,
    items: ws.items.map((i) => ({ position: i.position, snapshot: i.snapshot })),
  };
}

export function buildWorksheetHtml(ws: WorksheetDetail, kind: PdfKind): string {
  const data = toPdfWorksheet(ws);
  const css = pdfStylesheet();
  return kind === "questions" ? questionSheetHtml(data, css) : answerSheetHtml(data, css);
}

/** PDFs are deterministic for a given worksheet version, so they are cached in memory (LRU). */
export async function worksheetPdf(ws: WorksheetDetail, kind: PdfKind): Promise<Buffer> {
  const key = cacheKey(ws, kind);
  const hit = cache.get(key);
  if (hit) {
    cache.delete(key);
    cache.set(key, hit);
    return hit;
  }
  const pdf = await renderPdf(buildWorksheetHtml(ws, kind));
  cache.set(key, pdf);
  while (cache.size > MAX_CACHE_ENTRIES) {
    const oldest = cache.keys().next().value;
    if (oldest === undefined) break;
    cache.delete(oldest);
  }
  return pdf;
}

export function pdfFilename(ws: WorksheetDetail, kind: PdfKind): string {
  return `${kind === "answers" ? "dap-an-" : ""}${ws.slug}.pdf`;
}
