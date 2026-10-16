import "server-only";
import { prisma } from "@/lib/db/prisma";
import { ApiError, badRequest, notFound } from "@/lib/http";
import { buildSnapshot, snapshotsDiffer, parseSnapshot } from "@/features/questions/snapshot";
import { can } from "@/lib/auth/permissions";
import type { SessionUser } from "@/lib/auth/session";
import type { QuestionInput, QuestionStatusAction } from "@/lib/validation/question";
import type { Prisma } from "@/generated/prisma/client";
import type { QuestionStatus } from "@/generated/prisma/enums";
import { audit } from "./audit.service";

export interface AdminQuestionFilter {
  q?: string;
  status?: QuestionStatus;
  difficulty?: "BASIC" | "APPLIED" | "ADVANCED";
  type?: "ESSAY" | "SINGLE_CHOICE" | "SHORT_ANSWER" | "TRUE_FALSE";
  chapterId?: string;
  topicId?: string;
  reported?: "1";
}

export async function listAdminQuestions(f: AdminQuestionFilter, page: number, pageSize: number) {
  const where: Prisma.QuestionWhereInput = {
    ...(f.status ? { status: f.status } : {}),
    ...(f.difficulty ? { difficulty: f.difficulty } : {}),
    ...(f.type ? { type: f.type } : {}),
    ...(f.chapterId ? { chapterId: f.chapterId } : {}),
    ...(f.topicId ? { topicId: f.topicId } : {}),
    ...(f.reported ? { reports: { some: { status: "OPEN" } } } : {}),
    ...(f.q
      ? {
          OR: [
            { code: { contains: f.q, mode: "insensitive" } },
            { content: { contains: f.q, mode: "insensitive" } },
            { tags: { has: f.q } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.question.findMany({
      where,
      orderBy: [{ updatedAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        code: true,
        type: true,
        difficulty: true,
        status: true,
        content: true,
        currentVersion: true,
        updatedAt: true,
        chapter: { select: { number: true, title: true } },
        topic: { select: { title: true } },
        _count: { select: { reports: { where: { status: "OPEN" } }, worksheets: true } },
      },
    }),
    prisma.question.count({ where }),
  ]);
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getAdminQuestion(id: string) {
  const q = await prisma.question.findUnique({
    where: { id },
    include: {
      options: { orderBy: { sortOrder: "asc" } },
      topic: { select: { id: true, title: true, chapter: { select: { id: true, title: true, number: true } } } },
      createdBy: { select: { name: true } },
      updatedBy: { select: { name: true } },
      reviewedBy: { select: { name: true } },
      revisions: {
        orderBy: { version: "desc" },
        take: 20,
        select: { id: true, version: true, changeNote: true, createdAt: true, createdBy: { select: { name: true } } },
      },
      reports: { orderBy: { createdAt: "desc" }, take: 20 },
      _count: { select: { worksheets: true } },
    },
  });
  if (!q) throw notFound("Không tìm thấy câu hỏi.");
  return q;
}

async function resolveTopic(topicId: string) {
  const topic = await prisma.topic.findUnique({ where: { id: topicId }, select: { id: true, chapterId: true, chapter: { select: { gradeId: true, number: true, grade: { select: { level: true } } } } } });
  if (!topic) throw badRequest("Dạng toán không tồn tại.");
  return topic;
}

/** Next free code like T6-C2-041 for the given grade level / chapter number. */
export async function nextQuestionCode(tx: Prisma.TransactionClient, gradeLevel: number, chapterNumber: number): Promise<string> {
  const prefix = `T${gradeLevel}-C${chapterNumber}-`;
  const rows = await tx.question.findMany({ where: { code: { startsWith: prefix } }, select: { code: true } });
  const max = rows.reduce((m, r) => Math.max(m, Number(r.code.slice(prefix.length)) || 0), 0);
  return `${prefix}${String(max + 1).padStart(3, "0")}`;
}

function optionRows(input: QuestionInput) {
  return input.options.map((o, i) => ({ label: o.label, content: o.content, isCorrect: o.isCorrect, sortOrder: i }));
}

export async function createQuestion(input: QuestionInput, user: SessionUser) {
  const topic = await resolveTopic(input.topicId);
  const created = await withCodeRetry(() => prisma.$transaction(async (tx) => {
    const code = await nextQuestionCode(tx, topic.chapter.grade.level, topic.chapter.number);
    const options = optionRows(input);
    const q = await tx.question.create({
      data: {
        code,
        gradeId: topic.chapter.gradeId,
        chapterId: topic.chapterId,
        topicId: topic.id,
        difficulty: input.difficulty,
        type: input.type,
        content: input.content,
        answer: input.answer,
        solution: input.solution,
        tags: input.tags,
        source: input.source ?? null,
        status: "DRAFT",
        currentVersion: 1,
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
        changeNote: input.changeNote || "Tạo mới",
        snapshot: toJson(buildSnapshot({ ...input, code, options })),
      },
    });
    return q;
  }));
  await audit(user.id, "question.create", "Question", created.id, { code: created.code });
  return created;
}

/** Retries when two concurrent creates race for the same generated code (unique violation). */
export async function withCodeRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn();
    } catch (err) {
      const code = (err as { code?: string }).code;
      if (code !== "P2002" || i >= attempts) throw err;
    }
  }
}

function toJson(value: unknown): Prisma.InputJsonValue {
  return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonValue;
}

export async function updateQuestion(id: string, input: QuestionInput, user: SessionUser) {
  const existing = await prisma.question.findUnique({ where: { id }, include: { options: true, revisions: { orderBy: { version: "desc" }, take: 1 } } });
  if (!existing) throw notFound("Không tìm thấy câu hỏi.");
  if (existing.status === "ARCHIVED") throw new ApiError(409, "CONFLICT", "Câu hỏi đã lưu trữ. Hãy khôi phục trước khi sửa.");
  const topic = await resolveTopic(input.topicId);
  const options = optionRows(input);
  const nextSnapshot = buildSnapshot({ ...input, code: existing.code, options });
  const lastSnapshot = existing.revisions[0] ? parseSnapshot(existing.revisions[0].snapshot) : null;
  const contentChanged = !lastSnapshot || snapshotsDiffer(lastSnapshot, nextSnapshot);

  // Any content change on reviewed content sends it back to review (never auto-published).
  const needsReview = contentChanged && (existing.status === "APPROVED" || existing.status === "PUBLISHED");
  const nextStatus: QuestionStatus = needsReview ? "PENDING_REVIEW" : existing.status;
  const nextVersion = contentChanged ? existing.currentVersion + 1 : existing.currentVersion;

  const updated = await prisma.$transaction(async (tx) => {
    await tx.questionOption.deleteMany({ where: { questionId: id } });
    const q = await tx.question.update({
      where: { id },
      data: {
        gradeId: topic.chapter.gradeId,
        chapterId: topic.chapterId,
        topicId: topic.id,
        difficulty: input.difficulty,
        type: input.type,
        content: input.content,
        answer: input.answer,
        solution: input.solution,
        tags: input.tags,
        source: input.source ?? null,
        status: nextStatus,
        currentVersion: nextVersion,
        updatedById: user.id,
        ...(needsReview ? { publishedAt: null, reviewedAt: null, reviewedById: null } : {}),
        options: { create: options },
      },
    });
    if (contentChanged) {
      await tx.questionRevision.create({
        data: { questionId: id, version: nextVersion, createdById: user.id, changeNote: input.changeNote || "Cập nhật nội dung", snapshot: toJson(nextSnapshot) },
      });
    }
    return q;
  });
  await audit(user.id, "question.update", "Question", id, { version: nextVersion, contentChanged, statusChanged: needsReview });
  return { question: updated, contentChanged, sentBackToReview: needsReview };
}

type Transition = { from: QuestionStatus[]; to: QuestionStatus; permission: Parameters<typeof can>[1] };

export const QUESTION_TRANSITIONS: Record<QuestionStatusAction, Transition> = {
  submit: { from: ["DRAFT"], to: "PENDING_REVIEW", permission: "question:submit" },
  approve: { from: ["PENDING_REVIEW"], to: "APPROVED", permission: "question:review" },
  reject: { from: ["PENDING_REVIEW", "APPROVED"], to: "DRAFT", permission: "question:review" },
  publish: { from: ["APPROVED"], to: "PUBLISHED", permission: "question:publish" },
  unpublish: { from: ["PUBLISHED"], to: "APPROVED", permission: "question:publish" },
  archive: { from: ["DRAFT", "PENDING_REVIEW", "APPROVED", "PUBLISHED"], to: "ARCHIVED", permission: "question:delete" },
  restore: { from: ["ARCHIVED"], to: "DRAFT", permission: "question:delete" },
};

export async function changeQuestionStatus(id: string, action: QuestionStatusAction, user: SessionUser, note?: string) {
  const t = QUESTION_TRANSITIONS[action];
  if (!can(user.role, t.permission)) throw new ApiError(403, "FORBIDDEN", "Bạn không có quyền thực hiện thao tác này.");
  const q = await prisma.question.findUnique({ where: { id }, select: { id: true, status: true, code: true } });
  if (!q) throw notFound("Không tìm thấy câu hỏi.");
  if (!t.from.includes(q.status)) {
    throw new ApiError(409, "CONFLICT", `Không thể chuyển câu hỏi từ trạng thái hiện tại bằng thao tác này.`);
  }
  const now = new Date();
  const data: Prisma.QuestionUpdateInput = { status: t.to, updatedBy: { connect: { id: user.id } } };
  if (action === "approve") Object.assign(data, { reviewedAt: now, reviewedBy: { connect: { id: user.id } } });
  if (action === "publish") Object.assign(data, { publishedAt: now });
  if (action === "unpublish" || action === "reject") Object.assign(data, { publishedAt: null });
  if (action === "archive") Object.assign(data, { archivedAt: now, publishedAt: null });
  if (action === "restore") Object.assign(data, { archivedAt: null });

  const updated = await prisma.question.update({ where: { id }, data, select: { id: true, status: true } });
  await audit(user.id, `question.${action}`, "Question", id, { code: q.code, from: q.status, to: t.to, note });
  return updated;
}

/** Hard delete only when the question was never used in a worksheet; otherwise archive. */
export async function deleteQuestion(id: string, user: SessionUser) {
  const q = await prisma.question.findUnique({ where: { id }, select: { code: true, _count: { select: { worksheets: true } } } });
  if (!q) throw notFound("Không tìm thấy câu hỏi.");
  if (q._count.worksheets > 0) {
    throw new ApiError(409, "CONFLICT", "Câu hỏi đã được dùng trong bộ đề nên không thể xóa. Hãy dùng chức năng Lưu trữ.");
  }
  await prisma.$transaction(async (tx) => {
    await tx.questionRevision.deleteMany({ where: { questionId: id } });
    await tx.question.delete({ where: { id } });
  });
  await audit(user.id, "question.delete", "Question", id, { code: q.code });
}

export async function resolveReport(reportId: string, status: "RESOLVED" | "DISMISSED", user: SessionUser) {
  const report = await prisma.questionReport.findUnique({ where: { id: reportId }, select: { id: true, questionId: true } });
  if (!report) throw notFound("Không tìm thấy báo lỗi.");
  await prisma.questionReport.update({ where: { id: reportId }, data: { status, resolvedAt: new Date() } });
  await audit(user.id, `report.${status.toLowerCase()}`, "QuestionReport", reportId, { questionId: report.questionId });
}
