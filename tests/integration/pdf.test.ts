import { afterAll, describe, expect, it } from "vitest";
import { getWorksheet } from "@/services/worksheet.service";
import { buildWorksheetHtml, worksheetPdf } from "@/services/pdf.service";
import { closePdfBrowser } from "@/lib/pdf/renderer";

const pageCount = (pdf: Buffer) => (pdf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;

describe("PDF generation (real Chromium)", () => {
  afterAll(() => closePdfBrowser());

  it("renders an A4 question PDF and a separate answer PDF", async () => {
    const ws = await getWorksheet("uoc-chung-lon-nhat-va-boi-chung-nho-nhat");
    expect(ws).not.toBeNull();
    const questions = await worksheetPdf(ws!, "questions");
    const answers = await worksheetPdf(ws!, "answers");
    for (const pdf of [questions, answers]) {
      expect(pdf.subarray(0, 5).toString()).toBe("%PDF-");
      expect(pdf.byteLength).toBeGreaterThan(20_000);
      expect(pageCount(pdf)).toBeGreaterThanOrEqual(1);
      // A4 = 595.92 x 842.88 pt
      expect(pdf.toString("latin1")).toMatch(/\/MediaBox\s*\[0 0 59[45]\.\d+ 84[12]\.\d+\]/);
    }
    expect(Buffer.compare(questions, answers)).not.toBe(0);
  });

  it("question HTML embeds fonts and excludes solutions; answer HTML matches the pinned snapshot", async () => {
    const ws = (await getWorksheet("tim-so-tu-nhien-x"))!;
    const qHtml = buildWorksheetHtml(ws, "questions");
    const aHtml = buildWorksheetHtml(ws, "answers");
    expect(qHtml).toContain("font/woff2;base64");
    expect(qHtml).toContain("Họ và tên");
    for (const item of ws.items) {
      expect(qHtml).toContain(`Câu ${item.position}.`);
      expect(aHtml).toContain(`Câu ${item.position}.`);
    }
    expect(qHtml).not.toContain("Lời giải");
    expect(aHtml).toContain("Lời giải");
  });
});
