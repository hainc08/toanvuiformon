import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import type { SessionUser } from "@/lib/auth/session";
import { changeQuestionStatus, createQuestion, deleteQuestion, updateQuestion } from "@/services/question.service";
import { createWorksheet } from "@/services/worksheet-admin.service";
import { getWorksheet, toAnswers } from "@/services/worksheet.service";
import { importQuestions } from "@/services/import.service";
import { ApiError } from "@/lib/http";
import { makeUser, topicBySlug } from "../support/fixtures";

let admin: SessionUser;
let editor: SessionUser;

beforeAll(async () => {
  admin = await makeUser("ADMIN");
  editor = await makeUser("EDITOR");
});

const input = (topicId: string, content = "Tính $7 \\cdot 8$.") => ({
  topicId,
  difficulty: "BASIC" as const,
  type: "ESSAY" as const,
  content,
  answer: "$56$",
  solution: "$7 \\cdot 8 = 56$.",
  tags: ["test"],
  options: [],
});

describe("question admin workflow (database)", () => {
  it("create → submit → approve → publish, with codes and revisions", async () => {
    const topic = await topicBySlug("cong-tru-nhan-chia");
    const q = await createQuestion(input(topic.id), editor);
    expect(q.status).toBe("DRAFT");
    expect(q.code).toMatch(/^T6-C1-\d{3}$/);
    expect(await prisma.questionRevision.count({ where: { questionId: q.id } })).toBe(1);

    await changeQuestionStatus(q.id, "submit", editor);
    // Editor cannot approve or publish
    await expect(changeQuestionStatus(q.id, "approve", editor)).rejects.toMatchObject({ status: 403 });
    // Cannot publish before approval
    await expect(changeQuestionStatus(q.id, "publish", admin)).rejects.toMatchObject({ status: 409 });
    await changeQuestionStatus(q.id, "approve", admin);
    const published = await changeQuestionStatus(q.id, "publish", admin);
    expect(published.status).toBe("PUBLISHED");
    const logs = await prisma.auditLog.count({ where: { entityId: q.id } });
    expect(logs).toBeGreaterThanOrEqual(4);
  });

  it("editing a published question creates a new revision and sends it back to review, while existing worksheets keep their snapshot", async () => {
    const topic = await topicBySlug("cong-tru-nhan-chia");
    const q = await createQuestion(input(topic.id, "Tính $9 \\cdot 6$."), admin);
    await changeQuestionStatus(q.id, "submit", admin);
    await changeQuestionStatus(q.id, "approve", admin);
    await changeQuestionStatus(q.id, "publish", admin);

    const ws = await createWorksheet(
      { title: "Đề kiểm tra phiên bản", gradeId: q.gradeId, durationMinutes: 15, isFeatured: false, questionCodes: [q.code] },
      admin,
    );
    await prisma.worksheet.update({ where: { id: ws.id }, data: { status: "PUBLISHED" } });

    const res = await updateQuestion(q.id, { ...input(topic.id, "Tính $9 \\cdot 7$."), answer: "$63$", solution: "$9 \\cdot 7 = 63$." }, admin);
    expect(res.contentChanged).toBe(true);
    expect(res.sentBackToReview).toBe(true);
    expect(res.question.currentVersion).toBe(2);
    expect(res.question.status).toBe("PENDING_REVIEW");

    const detail = await getWorksheet(ws.slug);
    expect(detail!.items[0]!.snapshot.content).toBe("Tính $9 \\cdot 6$.");
    expect(toAnswers(detail!)[0]!.answerHtml).toContain("56");
  });

  it("saving without content changes does not create a revision", async () => {
    const topic = await topicBySlug("tim-x");
    const q = await createQuestion(input(topic.id, "Tìm $x$ biết $x + 1 = 3$."), editor);
    const res = await updateQuestion(q.id, input(topic.id, "Tìm $x$ biết $x + 1 = 3$."), editor);
    expect(res.contentChanged).toBe(false);
    expect(await prisma.questionRevision.count({ where: { questionId: q.id } })).toBe(1);
  });

  it("only published questions can be pinned in worksheets", async () => {
    const topic = await topicBySlug("tim-x");
    const draft = await createQuestion(input(topic.id, "Tìm $x$ biết $x + 2 = 9$."), editor);
    await expect(
      createWorksheet({ title: "Đề có câu nháp", gradeId: draft.gradeId, durationMinutes: 15, isFeatured: false, questionCodes: [draft.code] }, admin),
    ).rejects.toBeInstanceOf(ApiError);
  });

  it("cannot hard-delete a question used in a worksheet", async () => {
    const used = await prisma.worksheetQuestion.findFirstOrThrow();
    await expect(deleteQuestion(used.questionId, admin)).rejects.toMatchObject({ status: 409 });
  });

  it("bulk import validates everything and is all-or-nothing", async () => {
    const good = { chapterSlug: "phan-so", topicSlug: "cong-tru-phan-so", difficulty: "BASIC", type: "ESSAY", content: "Tính $\\dfrac{1}{3} + \\dfrac{1}{3}$.", answer: "$\\dfrac{2}{3}$", solution: "Cộng tử: $\\dfrac{2}{3}$." };
    const bad = { ...good, topicSlug: "khong-ton-tai" };
    const before = await prisma.question.count();
    const failed = await importQuestions([good, bad, { foo: 1 }], false, editor);
    expect(failed.errors.map((e) => e.row)).toEqual([2, 3]);
    expect(await prisma.question.count()).toBe(before);

    const dry = await importQuestions([good], true, editor);
    expect(dry).toMatchObject({ valid: 1, created: 0 });
    expect(await prisma.question.count()).toBe(before);

    const ok = await importQuestions([good], false, editor);
    expect(ok.created).toBe(1);
    const imported = await prisma.question.findFirstOrThrow({ where: { content: good.content } });
    expect(imported.status).toBe("PENDING_REVIEW");
    expect(imported.code).toMatch(/^T6-C6-\d{3}$/);
  });
});
