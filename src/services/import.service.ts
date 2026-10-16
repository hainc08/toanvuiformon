import "server-only";
import { prisma } from "@/lib/db/prisma";
import { buildSnapshot } from "@/features/questions/snapshot";
import type { SessionUser } from "@/lib/auth/session";
import { importItemSchema, type ImportItem } from "@/lib/validation/question";
import type { Prisma } from "@/generated/prisma/client";
import { audit } from "./audit.service";
import { nextQuestionCode, withCodeRetry } from "./question.service";

export interface ImportRowError {
  row: number;
  messages: string[];
}

export interface ImportResult {
  dryRun: boolean;
  total: number;
  valid: number;
  created: number;
  errors: ImportRowError[];
}

interface ResolvedRow {
  row: number;
  item: ImportItem;
  gradeId: string;
  gradeLevel: number;
  chapterId: string;
  chapterNumber: number;
  topicId: string;
}

/**
 * Bulk import (JSON). All-or-nothing: if any row is invalid nothing is written.
 * Imported questions always start in PENDING_REVIEW and must be approved before publishing.
 */
export async function importQuestions(rawItems: unknown[], dryRun: boolean, user: SessionUser): Promise<ImportResult> {
  const errors: ImportRowError[] = [];
  const parsed: { row: number; item: ImportItem }[] = [];

  rawItems.forEach((raw, i) => {
    const res = importItemSchema.safeParse(raw);
    if (res.success) parsed.push({ row: i + 1, item: res.data });
    else errors.push({ row: i + 1, messages: res.error.issues.map((iss) => `${iss.path.join(".") || "row"}: ${iss.message}`) });
  });

  const topics = await prisma.topic.findMany({
    select: { id: true, slug: true, chapter: { select: { id: true, slug: true, number: true, grade: { select: { id: true, level: true } } } } },
  });
  const topicKey = (level: number, chapter: string, topic: string) => `${level}/${chapter}/${topic}`;
  const topicMap = new Map(topics.map((t) => [topicKey(t.chapter.grade.level, t.chapter.slug, t.slug), t]));

  const providedCodes = parsed.map((p) => p.item.code).filter((c): c is string => Boolean(c));
  const existingCodes = new Set(
    (await prisma.question.findMany({ where: { code: { in: providedCodes } }, select: { code: true } })).map((q) => q.code),
  );
  const seenCodes = new Set<string>();

  const resolved: ResolvedRow[] = [];
  for (const { row, item } of parsed) {
    const msgs: string[] = [];
    const topic = topicMap.get(topicKey(item.grade, item.chapterSlug, item.topicSlug));
    if (!topic) msgs.push(`Không tìm thấy dạng toán "${item.chapterSlug}/${item.topicSlug}" của lớp ${item.grade}`);
    if (item.code) {
      if (existingCodes.has(item.code)) msgs.push(`Mã câu hỏi ${item.code} đã tồn tại`);
      if (seenCodes.has(item.code)) msgs.push(`Mã câu hỏi ${item.code} bị trùng trong file`);
      seenCodes.add(item.code);
    }
    if (msgs.length || !topic) {
      errors.push({ row, messages: msgs });
      continue;
    }
    resolved.push({
      row,
      item,
      gradeId: topic.chapter.grade.id,
      gradeLevel: topic.chapter.grade.level,
      chapterId: topic.chapter.id,
      chapterNumber: topic.chapter.number,
      topicId: topic.id,
    });
  }

  errors.sort((a, b) => a.row - b.row);
  const result: ImportResult = { dryRun, total: rawItems.length, valid: resolved.length, created: 0, errors };
  if (dryRun || errors.length > 0) return result;

  await withCodeRetry(() =>
    prisma.$transaction(
      async (tx) => {
        for (const r of resolved) {
          const code = r.item.code ?? (await nextQuestionCode(tx, r.gradeLevel, r.chapterNumber));
          const options = r.item.options.map((o, i) => ({ label: o.label, content: o.content, isCorrect: o.isCorrect, sortOrder: i }));
          const q = await tx.question.create({
            data: {
              code,
              gradeId: r.gradeId,
              chapterId: r.chapterId,
              topicId: r.topicId,
              difficulty: r.item.difficulty,
              type: r.item.type,
              content: r.item.content,
              answer: r.item.answer,
              solution: r.item.solution,
              tags: r.item.tags,
              source: r.item.source ?? "Nhập hàng loạt",
              status: "PENDING_REVIEW",
              createdById: user.id,
              updatedById: user.id,
              options: { create: options },
            },
          });
          await tx.questionRevision.create({
            data: {
              questionId: q.id,
              version: 1,
              createdById: user.id,
              changeNote: "Nhập hàng loạt",
              snapshot: JSON.parse(JSON.stringify(buildSnapshot({ ...r.item, code, options }))) as Prisma.InputJsonValue,
            },
          });
        }
      },
      { timeout: 60_000 },
    ),
  );
  result.created = resolved.length;
  await audit(user.id, "question.import", "Question", null, { created: resolved.length });
  return result;
}
