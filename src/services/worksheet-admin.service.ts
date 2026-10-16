import "server-only";
import { prisma } from "@/lib/db/prisma";
import { ApiError, badRequest, notFound } from "@/lib/http";
import { slugify } from "@/lib/slug";
import type { SessionUser } from "@/lib/auth/session";
import type { WorksheetUpsertInput } from "@/lib/validation/worksheet";
import type { Prisma } from "@/generated/prisma/client";
import type { PublishStatus } from "@/generated/prisma/enums";
import { audit } from "./audit.service";

export async function listAdminWorksheets(f: { q?: string; kind: "CURATED" | "GENERATED"; status?: PublishStatus }, page: number, pageSize: number) {
  const where: Prisma.WorksheetWhereInput = {
    kind: f.kind,
    ...(f.status ? { status: f.status } : {}),
    ...(f.q ? { OR: [{ title: { contains: f.q, mode: "insensitive" } }, { slug: { contains: f.q, mode: "insensitive" } }] } : {}),
  };
  const [items, total] = await Promise.all([
    prisma.worksheet.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        kind: true,
        questionCount: true,
        downloadCount: true,
        isFeatured: true,
        updatedAt: true,
        chapter: { select: { number: true, title: true } },
      },
    }),
    prisma.worksheet.count({ where }),
  ]);
  return { items, total, page, pageSize, totalPages: Math.max(1, Math.ceil(total / pageSize)) };
}

export async function getAdminWorksheet(id: string) {
  const ws = await prisma.worksheet.findUnique({
    where: { id },
    include: {
      questions: {
        orderBy: { position: "asc" },
        include: {
          question: { select: { code: true, status: true, currentVersion: true } },
          revision: { select: { version: true } },
        },
      },
    },
  });
  if (!ws) throw notFound("Không tìm thấy bộ đề.");
  return ws;
}

/** Resolves question codes → PUBLISHED questions + their latest revision (pinned). */
async function pinQuestions(codes: string[]) {
  const unique = Array.from(new Set(codes.map((c) => c.toUpperCase())));
  if (unique.length !== codes.length) throw badRequest("Danh sách câu hỏi có mã bị trùng.");
  const rows = await prisma.question.findMany({
    where: { code: { in: unique } },
    select: { id: true, code: true, status: true, revisions: { orderBy: { version: "desc" }, take: 1, select: { id: true } } },
  });
  const byCode = new Map(rows.map((r) => [r.code, r]));
  const missing = unique.filter((c) => !byCode.has(c));
  if (missing.length) throw badRequest(`Không tìm thấy câu hỏi: ${missing.join(", ")}`);
  const unpublished = rows.filter((r) => r.status !== "PUBLISHED").map((r) => r.code);
  if (unpublished.length) throw badRequest(`Chỉ dùng câu hỏi đã xuất bản. Chưa xuất bản: ${unpublished.join(", ")}`);
  return unique.map((code, i) => {
    const r = byCode.get(code)!;
    const revisionId = r.revisions[0]?.id;
    if (!revisionId) throw badRequest(`Câu ${code} chưa có phiên bản.`);
    return { questionId: r.id, questionRevisionId: revisionId, position: i + 1 };
  });
}

export async function createWorksheet(input: WorksheetUpsertInput, user: SessionUser) {
  const pinned = await pinQuestions(input.questionCodes);
  const slug = input.slug ?? slugify(input.title);
  if (!slug) throw badRequest("Không tạo được slug từ tiêu đề.");
  const ws = await prisma.worksheet
    .create({
      data: {
        slug,
        title: input.title,
        description: input.description ?? null,
        kind: "CURATED",
        status: "DRAFT",
        gradeId: input.gradeId,
        chapterId: input.chapterId ?? null,
        topicId: input.topicId ?? null,
        difficulty: input.difficulty ?? null,
        durationMinutes: input.durationMinutes,
        isFeatured: input.isFeatured,
        questionCount: pinned.length,
        createdById: user.id,
        questions: { create: pinned },
      },
    })
    .catch((e) => {
      if ((e as { code?: string }).code === "P2002") throw new ApiError(409, "CONFLICT", "Slug bộ đề đã tồn tại.");
      throw e;
    });
  await audit(user.id, "worksheet.create", "Worksheet", ws.id, { slug: ws.slug, questions: pinned.length });
  return ws;
}

/** Replacing the question list re-pins every question to its latest published revision. */
export async function updateWorksheet(id: string, input: WorksheetUpsertInput, user: SessionUser) {
  const existing = await prisma.worksheet.findUnique({ where: { id }, select: { kind: true, slug: true } });
  if (!existing) throw notFound("Không tìm thấy bộ đề.");
  if (existing.kind !== "CURATED") throw new ApiError(409, "CONFLICT", "Không thể sửa đề do người dùng tự tạo.");
  const pinned = await pinQuestions(input.questionCodes);
  const ws = await prisma.$transaction(async (tx) => {
    await tx.worksheetQuestion.deleteMany({ where: { worksheetId: id } });
    return tx.worksheet.update({
      where: { id },
      data: {
        slug: input.slug ?? existing.slug,
        title: input.title,
        description: input.description ?? null,
        gradeId: input.gradeId,
        chapterId: input.chapterId ?? null,
        topicId: input.topicId ?? null,
        difficulty: input.difficulty ?? null,
        durationMinutes: input.durationMinutes,
        isFeatured: input.isFeatured,
        questionCount: pinned.length,
        questions: { create: pinned },
      },
    });
  });
  await audit(user.id, "worksheet.update", "Worksheet", id, { questions: pinned.length });
  return ws;
}

export async function setWorksheetStatus(id: string, status: PublishStatus, user: SessionUser) {
  const ws = await prisma.worksheet.update({
    where: { id },
    data: { status, ...(status === "PUBLISHED" ? { publishedAt: new Date() } : {}) },
    select: { id: true, status: true },
  });
  await audit(user.id, `worksheet.${status.toLowerCase()}`, "Worksheet", id);
  return ws;
}

export async function deleteWorksheet(id: string, user: SessionUser) {
  const ws = await prisma.worksheet.findUnique({ where: { id }, select: { downloadCount: true, status: true } });
  if (!ws) throw notFound("Không tìm thấy bộ đề.");
  if (ws.status === "PUBLISHED") throw new ApiError(409, "CONFLICT", "Hãy ẩn (lưu trữ) bộ đề trước khi xóa.");
  await prisma.worksheet.delete({ where: { id } });
  await audit(user.id, "worksheet.delete", "Worksheet", id);
}
