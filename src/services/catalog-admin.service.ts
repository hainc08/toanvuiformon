import "server-only";
import { z } from "zod";
import { prisma } from "@/lib/db/prisma";
import { ApiError, notFound } from "@/lib/http";
import type { SessionUser } from "@/lib/auth/session";
import { chapterUpsertSchema, gradeUpsertSchema, topicUpsertSchema } from "@/lib/validation/catalog";
import { audit } from "./audit.service";

type GradeInput = z.infer<typeof gradeUpsertSchema>;
type ChapterInput = z.infer<typeof chapterUpsertSchema>;
type TopicInput = z.infer<typeof topicUpsertSchema>;

function conflictOnUnique(err: unknown, message: string): never {
  if ((err as { code?: string }).code === "P2002") throw new ApiError(409, "CONFLICT", message);
  throw err;
}

export function listGradesAdmin() {
  return prisma.grade.findMany({
    orderBy: [{ sortOrder: "asc" }, { level: "asc" }],
    include: { _count: { select: { chapters: true, questions: true, worksheets: true } } },
  });
}

export async function createGrade(input: GradeInput, user: SessionUser) {
  const grade = await prisma.grade.create({ data: { ...input, sortOrder: input.level } }).catch((e) => conflictOnUnique(e, "Lớp hoặc slug đã tồn tại."));
  await audit(user.id, "grade.create", "Grade", grade.id, { level: grade.level });
  return grade;
}

export async function updateGrade(id: string, input: GradeInput, user: SessionUser) {
  const grade = await prisma.grade.update({ where: { id }, data: input }).catch((e) => conflictOnUnique(e, "Lớp hoặc slug đã tồn tại."));
  await audit(user.id, "grade.update", "Grade", id, { status: grade.status });
  return grade;
}

export function listChaptersAdmin(gradeId?: string) {
  return prisma.chapter.findMany({
    where: gradeId ? { gradeId } : {},
    orderBy: [{ grade: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: {
      grade: { select: { name: true } },
      _count: { select: { topics: true, questions: true, worksheets: true } },
    },
  });
}

async function defaultCurriculumId(): Promise<string> {
  const c = await prisma.curriculum.findFirst({ orderBy: { createdAt: "asc" }, select: { id: true } });
  if (!c) throw new ApiError(409, "CONFLICT", "Chưa có chương trình học (curriculum). Hãy chạy seed.");
  return c.id;
}

export async function createChapter(input: ChapterInput, user: SessionUser) {
  const chapter = await prisma.chapter
    .create({ data: { ...input, sortOrder: input.number, curriculumId: await defaultCurriculumId() } })
    .catch((e) => conflictOnUnique(e, "Số chương hoặc slug đã tồn tại trong lớp này."));
  await audit(user.id, "chapter.create", "Chapter", chapter.id, { slug: chapter.slug });
  return chapter;
}

export async function updateChapter(id: string, input: ChapterInput, user: SessionUser) {
  const chapter = await prisma.chapter
    .update({ where: { id }, data: { ...input, sortOrder: input.number } })
    .catch((e) => conflictOnUnique(e, "Số chương hoặc slug đã tồn tại trong lớp này."));
  await audit(user.id, "chapter.update", "Chapter", id, { status: chapter.status });
  return chapter;
}

export async function deleteChapter(id: string, user: SessionUser) {
  const c = await prisma.chapter.findUnique({ where: { id }, select: { _count: { select: { topics: true, questions: true } } } });
  if (!c) throw notFound();
  if (c._count.topics > 0 || c._count.questions > 0) {
    throw new ApiError(409, "CONFLICT", "Chương còn dạng toán hoặc câu hỏi. Hãy chuyển sang trạng thái Lưu trữ thay vì xóa.");
  }
  await prisma.chapter.delete({ where: { id } });
  await audit(user.id, "chapter.delete", "Chapter", id);
}

export function listTopicsAdmin(chapterId?: string) {
  return prisma.topic.findMany({
    where: chapterId ? { chapterId } : {},
    orderBy: [{ chapter: { sortOrder: "asc" } }, { sortOrder: "asc" }],
    include: { chapter: { select: { number: true, title: true } }, _count: { select: { questions: true } } },
  });
}

export async function createTopic(input: TopicInput, user: SessionUser) {
  const topic = await prisma.topic.create({ data: input }).catch((e) => conflictOnUnique(e, "Slug dạng toán đã tồn tại trong chương này."));
  await audit(user.id, "topic.create", "Topic", topic.id, { slug: topic.slug });
  return topic;
}

export async function updateTopic(id: string, input: TopicInput, user: SessionUser) {
  const topic = await prisma.topic.update({ where: { id }, data: input }).catch((e) => conflictOnUnique(e, "Slug dạng toán đã tồn tại trong chương này."));
  await audit(user.id, "topic.update", "Topic", id, { status: topic.status });
  return topic;
}

export async function deleteTopic(id: string, user: SessionUser) {
  const t = await prisma.topic.findUnique({ where: { id }, select: { _count: { select: { questions: true } } } });
  if (!t) throw notFound();
  if (t._count.questions > 0) throw new ApiError(409, "CONFLICT", "Dạng toán còn câu hỏi. Hãy chuyển sang trạng thái Lưu trữ thay vì xóa.");
  await prisma.topic.delete({ where: { id } });
  await audit(user.id, "topic.delete", "Topic", id);
}

/** Options for admin selects (chapters with their topics). */
export function catalogOptions() {
  return prisma.grade.findMany({
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      chapters: {
        orderBy: { sortOrder: "asc" },
        select: { id: true, number: true, title: true, topics: { orderBy: { sortOrder: "asc" }, select: { id: true, title: true } } },
      },
    },
  });
}
