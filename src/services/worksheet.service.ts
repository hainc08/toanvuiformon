import "server-only";
import { cache } from "react";
import { worksheetRepository, type PublicWorksheetFilter, type WorksheetCardRow } from "@/repositories/worksheet.repository";
import { answerStartsWithLabel, parseSnapshot, type QuestionSnapshot } from "@/features/questions/snapshot";
import { renderMathText } from "@/lib/math/render";
import { notFound } from "@/lib/http";
import type { Difficulty, QuestionType, WorksheetKind } from "@/generated/prisma/enums";

export type WorksheetCard = WorksheetCardRow;

export interface WorksheetDetail {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  kind: WorksheetKind;
  difficulty: Difficulty | null;
  durationMinutes: number;
  questionCount: number;
  downloadCount: number;
  updatedAt: Date;
  grade: { name: string; slug: string };
  chapter: { number: number; title: string; slug: string } | null;
  topic: { title: string; slug: string } | null;
  /** Pinned snapshots — the single source for preview, question PDF and answer PDF. */
  items: { position: number; questionId: string; revisionId: string; snapshot: QuestionSnapshot }[];
}

export interface PublicQuestionView {
  position: number;
  type: QuestionType;
  difficulty: Difficulty;
  contentHtml: string;
  options: { label: string; contentHtml: string }[];
}

export interface AnswerView {
  position: number;
  correctLabel: string | null;
  answerHtml: string;
  solutionHtml: string;
}

export async function listPublicWorksheets(filter: PublicWorksheetFilter, page: number, pageSize: number) {
  const { items, total } = await worksheetRepository.listPublic(filter, page, pageSize);
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export const getWorksheet = cache(async (idOrSlug: string): Promise<WorksheetDetail | null> => {
  const row = await worksheetRepository.findPublishedByIdOrSlug(idOrSlug);
  if (!row) return null;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    kind: row.kind,
    difficulty: row.difficulty,
    durationMinutes: row.durationMinutes,
    questionCount: row.questionCount,
    downloadCount: row.downloadCount,
    updatedAt: row.updatedAt,
    grade: row.grade,
    chapter: row.chapter,
    topic: row.topic,
    items: row.questions.map((q) => ({
      position: q.position,
      questionId: q.questionId,
      revisionId: q.revision.id,
      snapshot: parseSnapshot(q.revision.snapshot),
    })),
  };
});

export async function getWorksheetOrThrow(idOrSlug: string): Promise<WorksheetDetail> {
  const ws = await getWorksheet(idOrSlug);
  if (!ws) throw notFound("Không tìm thấy bộ đề.");
  return ws;
}

/** Question-only view. Never includes answers, solutions or which option is correct. */
export function toPublicQuestions(ws: WorksheetDetail): PublicQuestionView[] {
  return ws.items.map(({ position, snapshot }) => ({
    position,
    type: snapshot.type,
    difficulty: snapshot.difficulty,
    contentHtml: renderMathText(snapshot.content),
    options: snapshot.options.map((o) => ({ label: o.label, contentHtml: renderMathText(o.content) })),
  }));
}

export function toAnswers(ws: WorksheetDetail): AnswerView[] {
  return ws.items.map(({ position, snapshot }) => ({
    position,
    correctLabel: answerStartsWithLabel(snapshot.answer) ? null : (snapshot.options.find((o) => o.isCorrect)?.label ?? null),
    answerHtml: renderMathText(snapshot.answer),
    solutionHtml: renderMathText(snapshot.solution),
  }));
}

/** Public JSON for GET /api/worksheets/:id — no answer data. */
export function toPublicWorksheetJson(ws: WorksheetDetail) {
  return {
    id: ws.id,
    slug: ws.slug,
    title: ws.title,
    description: ws.description,
    kind: ws.kind,
    difficulty: ws.difficulty,
    durationMinutes: ws.durationMinutes,
    questionCount: ws.questionCount,
    grade: ws.grade,
    chapter: ws.chapter,
    topic: ws.topic,
    url: `/de-bai/${ws.slug}`,
    questions: ws.items.map(({ position, snapshot }) => ({
      position,
      type: snapshot.type,
      difficulty: snapshot.difficulty,
      content: snapshot.content,
      options: snapshot.options.map((o) => ({ label: o.label, content: o.content })),
    })),
  };
}

export async function recordDownload(worksheetId: string, kind: "QUESTION_PDF" | "ANSWER_PDF"): Promise<void> {
  try {
    await worksheetRepository.recordDownload(worksheetId, kind);
  } catch {
    // Download statistics must never break the download itself.
  }
}
