import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { Difficulty } from "@/generated/prisma/enums";

/** Fields that are safe to expose publicly: never answer, solution or isCorrect. */
export const publicQuestionSelect = {
  id: true,
  code: true,
  type: true,
  difficulty: true,
  content: true,
  options: { orderBy: { sortOrder: "asc" }, select: { label: true, content: true } },
  topic: { select: { title: true, slug: true } },
  chapter: { select: { title: true, slug: true, number: true } },
} satisfies Prisma.QuestionSelect;

export const questionRepository = {
  async listPublic(f: { gradeSlug: string; chapterSlug?: string; topicSlug?: string; difficulty?: Difficulty }, page: number, pageSize: number) {
    const where: Prisma.QuestionWhereInput = {
      status: "PUBLISHED",
      grade: { slug: f.gradeSlug, status: "PUBLISHED" },
      ...(f.chapterSlug ? { chapter: { slug: f.chapterSlug, status: "PUBLISHED" } } : {}),
      ...(f.topicSlug ? { topic: { slug: f.topicSlug, status: "PUBLISHED" } } : {}),
      ...(f.difficulty ? { difficulty: f.difficulty } : {}),
    };
    const [items, total] = await Promise.all([
      prisma.question.findMany({ where, select: publicQuestionSelect, orderBy: { code: "asc" }, skip: (page - 1) * pageSize, take: pageSize }),
      prisma.question.count({ where }),
    ]);
    return { items, total };
  },

  findPublishedById(id: string) {
    return prisma.question.findFirst({ where: { id, status: "PUBLISHED" }, select: { id: true } });
  },
};
