import "server-only";
import { prisma } from "@/lib/db/prisma";
import { ApiError, badRequest } from "@/lib/http";
import { DIFFICULTY_LABEL } from "@/lib/labels";
import { randomSuffix } from "@/lib/slug";
import { InsufficientQuestionsError, selectQuestions } from "@/features/worksheets/select-questions";
import type { GenerateWorksheetInput } from "@/lib/validation/worksheet";
import type { Prisma } from "@/generated/prisma/client";

const MINUTES_PER_QUESTION = { BASIC: 2, APPLIED: 3, ADVANCED: 5 } as const;

/**
 * Builds a new GENERATED worksheet from APPROVED+PUBLISHED questions only, pinning the
 * latest revision of every question so the question PDF and answer PDF always match.
 */
export async function generateWorksheet(input: GenerateWorksheetInput) {
  const grade = await prisma.grade.findFirst({ where: { slug: input.grade, status: "PUBLISHED" }, select: { id: true, name: true } });
  if (!grade) throw badRequest("Lớp học không hợp lệ.");

  let chapter: { id: string; title: string; number: number } | null = null;
  if (input.chapterId) {
    chapter = await prisma.chapter.findFirst({
      where: { id: input.chapterId, gradeId: grade.id, status: "PUBLISHED" },
      select: { id: true, title: true, number: true },
    });
    if (!chapter) throw badRequest("Chương không hợp lệ.");
  }

  const topics = await prisma.topic.findMany({
    where: {
      status: "PUBLISHED",
      chapter: { gradeId: grade.id, status: "PUBLISHED", ...(chapter ? { id: chapter.id } : {}) },
      ...(input.topicIds.length > 0 ? { id: { in: input.topicIds } } : {}),
    },
    orderBy: [{ chapter: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    select: { id: true, title: true },
  });
  if (input.topicIds.length > 0 && topics.length !== new Set(input.topicIds).size) throw badRequest("Dạng toán không hợp lệ.");
  if (!input.mixTopics && topics.length !== 1) {
    throw badRequest("Hãy chọn đúng một dạng toán, hoặc bật tùy chọn trộn nhiều dạng toán.");
  }
  if (topics.length === 0) throw badRequest("Không có dạng toán phù hợp.");

  const where: Prisma.QuestionWhereInput = {
    status: "PUBLISHED",
    topicId: { in: topics.map((t) => t.id) },
    ...(input.difficulty !== "MIXED" ? { difficulty: input.difficulty } : {}),
  };
  const candidates = await prisma.question.findMany({ where, select: { id: true, topicId: true, difficulty: true, code: true } });

  let picked;
  try {
    picked = selectQuestions(candidates, { count: input.count, shuffle: input.shuffle, topicOrder: topics.map((t) => t.id) });
  } catch (err) {
    if (err instanceof InsufficientQuestionsError) {
      throw new ApiError(
        422,
        "INSUFFICIENT_QUESTIONS",
        `Hiện chỉ có ${err.available} câu hỏi phù hợp, chưa đủ ${err.requested} câu. Hãy giảm số câu, chọn mức độ "Trộn" hoặc thêm dạng toán.`,
        { available: err.available, requested: err.requested },
      );
    }
    throw err;
  }

  const revisions = await prisma.questionRevision.findMany({
    where: { questionId: { in: picked.map((p) => p.id) } },
    orderBy: { version: "desc" },
    select: { id: true, questionId: true, version: true },
  });
  const latest = new Map<string, string>();
  for (const r of revisions) if (!latest.has(r.questionId)) latest.set(r.questionId, r.id);

  const scope = topics.length === 1 ? topics[0]!.title : chapter ? chapter.title : `Toán ${grade.name}`;
  const level = input.difficulty === "MIXED" ? "Tổng hợp" : DIFFICULTY_LABEL[input.difficulty];
  const duration = Math.min(
    180,
    Math.max(10, Math.round(picked.reduce((sum, q) => sum + MINUTES_PER_QUESTION[q.difficulty], 0) / 5) * 5),
  );

  const worksheet = await prisma.worksheet.create({
    data: {
      slug: `de-tu-tao-${randomSuffix(10)}`,
      title: `Đề luyện tập: ${scope}`,
      description: `${input.count} câu · Mức độ: ${level}`,
      kind: "GENERATED",
      status: "PUBLISHED",
      gradeId: grade.id,
      chapterId: chapter?.id ?? null,
      topicId: topics.length === 1 ? topics[0]!.id : null,
      difficulty: input.difficulty === "MIXED" ? null : input.difficulty,
      durationMinutes: duration,
      questionCount: picked.length,
      publishedAt: new Date(),
      questions: {
        create: picked.map((q, i) => {
          const revisionId = latest.get(q.id);
          if (!revisionId) throw new Error(`Question ${q.code} has no revision`);
          return { questionId: q.id, questionRevisionId: revisionId, position: i + 1 };
        }),
      },
    },
    select: { id: true, slug: true },
  });

  return { id: worksheet.id, slug: worksheet.slug, url: `/de-bai/${worksheet.slug}` };
}
