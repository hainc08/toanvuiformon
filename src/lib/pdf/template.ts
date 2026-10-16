import { escapeHtml, renderMathText } from "@/lib/math/render";
import { DIFFICULTY_LABEL } from "@/lib/labels";
import { answerStartsWithLabel, type QuestionSnapshot } from "@/features/questions/snapshot";
import type { Difficulty } from "@/generated/prisma/enums";

export interface PdfWorksheet {
  title: string;
  gradeName: string;
  chapterTitle: string | null;
  chapterNumber: number | null;
  topicTitle: string | null;
  difficulty: Difficulty | null;
  durationMinutes: number;
  items: { position: number; snapshot: QuestionSnapshot }[];
}

const BASE_CSS = `
@page { size: A4; margin: 16mm 15mm 18mm 15mm; }
* { box-sizing: border-box; }
html, body { margin: 0; padding: 0; }
body { font-family: 'Be Vietnam Pro', 'DejaVu Sans', sans-serif; font-size: 11.5pt; line-height: 1.55; color: #000; }
.katex { font-size: 1.08em; }
.katex-display { margin: 0.4em 0; break-inside: avoid; }
h1 { font-size: 16pt; margin: 0 0 2mm; text-align: center; font-weight: 700; }
.meta { text-align: center; font-size: 10pt; color: #222; margin-bottom: 4mm; }
.student { display: flex; gap: 6mm; border: 1px solid #000; border-radius: 2mm; padding: 3mm 4mm; margin-bottom: 6mm; font-size: 10.5pt; }
.student .field { flex: 1; white-space: nowrap; }
.student .field.name { flex: 2.2; }
.student .line { display: inline-block; border-bottom: 1px dotted #000; width: 70%; height: 1em; vertical-align: bottom; }
.q { break-inside: avoid; page-break-inside: avoid; margin-bottom: 5mm; }
.q-head { font-weight: 700; }
.q-head .lvl { font-weight: 400; font-size: 9.5pt; color: #333; }
.q-body p { margin: 0 0 1.5mm; display: inline; }
.q-body p + p { display: block; margin-top: 1.5mm; }
.q-body ul, .sol ul { margin: 1mm 0 1mm 6mm; padding: 0; }
.opts { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5mm 8mm; margin: 2mm 0 0 6mm; }
.opts.four { grid-template-columns: repeat(4, 1fr); }
.opt p { display: inline; margin: 0; }
.work { margin-top: 2mm; }
.work .ln { border-bottom: 1px dotted #777; height: 7.5mm; }
.ans { break-inside: avoid; margin-bottom: 4mm; border-bottom: 1px solid #ccc; padding-bottom: 3mm; }
.ans .final { margin: 1mm 0; }
.ans .final p { display: inline; margin: 0; }
.sol p { margin: 0 0 1mm; }
.sol-label { font-style: italic; font-weight: 600; }
.note { font-size: 9pt; color: #333; text-align: center; margin-top: 6mm; }
`;

function shell(title: string, body: string, css: string): string {
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8">
<meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; font-src data:; img-src data:">
<title>${escapeHtml(title)}</title><style>${css}${BASE_CSS}</style></head><body>${body}</body></html>`;
}

function metaLine(ws: PdfWorksheet): string {
  const parts = [`Toán ${ws.gradeName}`];
  if (ws.chapterTitle) parts.push(ws.chapterNumber ? `Chương ${ws.chapterNumber}: ${ws.chapterTitle}` : ws.chapterTitle);
  if (ws.topicTitle) parts.push(`Dạng: ${ws.topicTitle}`);
  parts.push(`Mức độ: ${ws.difficulty ? DIFFICULTY_LABEL[ws.difficulty] : "Tổng hợp"}`);
  parts.push(`Thời gian: ${ws.durationMinutes} phút`);
  parts.push(`${ws.items.length} câu`);
  return parts.map(escapeHtml).join(" · ");
}

function workLines(s: QuestionSnapshot): number {
  if (s.type === "SINGLE_CHOICE" || s.type === "TRUE_FALSE") return 0;
  if (s.type === "SHORT_ANSWER") return 2;
  return s.difficulty === "BASIC" ? 4 : s.difficulty === "APPLIED" ? 6 : 8;
}

export function questionSheetHtml(ws: PdfWorksheet, css: string): string {
  const questions = ws.items
    .map(({ position, snapshot: s }) => {
      const shortOpts = s.options.every((o) => o.content.length <= 24);
      const opts = s.options.length
        ? `<div class="opts${shortOpts && s.options.length === 4 ? " four" : ""}">${s.options
            .map((o) => `<div class="opt"><b>${escapeHtml(o.label)}.</b> ${renderMathText(o.content)}</div>`)
            .join("")}</div>`
        : "";
      const lines = workLines(s);
      const work = lines ? `<div class="work">${'<div class="ln"></div>'.repeat(lines)}</div>` : "";
      return `<section class="q"><div class="q-body"><span class="q-head">Câu ${position}. </span>${renderMathText(s.content)}</div>${opts}${work}</section>`;
    })
    .join("");
  const body = `<h1>${escapeHtml(ws.title)}</h1><div class="meta">${metaLine(ws)}</div>
<div class="student"><div class="field name">Họ và tên: <span class="line"></span></div><div class="field">Lớp: <span class="line"></span></div><div class="field">Ngày: <span class="line"></span></div></div>
${questions}`;
  return shell(ws.title, body, css);
}

export function answerSheetHtml(ws: PdfWorksheet, css: string): string {
  const answers = ws.items
    .map(({ position, snapshot: s }) => {
      const correct = answerStartsWithLabel(s.answer) ? undefined : s.options.find((o) => o.isCorrect);
      return `<section class="ans"><div class="q-head">Câu ${position}.</div>
<div class="final"><span class="sol-label">Đáp án:</span> ${correct ? `<b>${escapeHtml(correct.label)}.</b> ` : ""}${renderMathText(s.answer)}</div>
<div class="sol"><span class="sol-label">Lời giải:</span>${renderMathText(s.solution)}</div></section>`;
    })
    .join("");
  const title = `Đáp án — ${ws.title}`;
  const body = `<h1>${escapeHtml(title)}</h1><div class="meta">${metaLine(ws)}</div>${answers}
<div class="note">Đáp án và lời giải khớp với phiên bản đề bài đã tạo.</div>`;
  return shell(title, body, css);
}

export const FOOTER_TEMPLATE = `<div style="width:100%;font-size:8px;color:#444;padding:0 15mm;display:flex;justify-content:space-between;font-family:'DejaVu Sans',sans-serif;">
<span>Toán Vui</span><span>Trang <span class="pageNumber"></span>/<span class="totalPages"></span></span></div>`;
