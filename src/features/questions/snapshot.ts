import type { Difficulty, QuestionType } from "@/generated/prisma/enums";

/** Immutable copy of a question stored in question_revisions.snapshot. */
export interface QuestionSnapshot {
  code: string;
  type: QuestionType;
  difficulty: Difficulty;
  content: string;
  answer: string;
  solution: string;
  options: { label: string; content: string; isCorrect: boolean }[];
}

interface SnapshotSource {
  code: string;
  type: QuestionType;
  difficulty: Difficulty;
  content: string;
  answer: string;
  solution: string;
  options: { label: string; content: string; isCorrect: boolean; sortOrder?: number }[];
}

export function buildSnapshot(q: SnapshotSource): QuestionSnapshot {
  return {
    code: q.code,
    type: q.type,
    difficulty: q.difficulty,
    content: q.content,
    answer: q.answer,
    solution: q.solution,
    options: [...q.options]
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.label.localeCompare(b.label))
      .map((o) => ({ label: o.label, content: o.content, isCorrect: o.isCorrect })),
  };
}

export function parseSnapshot(value: unknown): QuestionSnapshot {
  if (!value || typeof value !== "object") throw new Error("Invalid question snapshot");
  const v = value as Partial<QuestionSnapshot>;
  if (typeof v.content !== "string" || typeof v.answer !== "string" || typeof v.solution !== "string" || !Array.isArray(v.options)) {
    throw new Error("Invalid question snapshot");
  }
  return v as QuestionSnapshot;
}

/** Content fields that, when changed, require a new revision. */
export function snapshotsDiffer(a: QuestionSnapshot, b: QuestionSnapshot): boolean {
  return JSON.stringify({ ...a, code: "" }) !== JSON.stringify({ ...b, code: "" });
}

/** True when the short answer already begins with the option label, e.g. "**B.** $36$". */
export function answerStartsWithLabel(answer: string): boolean {
  return /^\s*\*\*[A-F]\.\*\*/.test(answer);
}
