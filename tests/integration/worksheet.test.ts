import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { generateWorksheet } from "@/services/generator.service";
import { getWorksheet, listPublicWorksheets, toAnswers, toPublicQuestions, toPublicWorksheetJson } from "@/services/worksheet.service";
import { ApiError } from "@/lib/http";

describe("worksheets (database)", () => {
  it("seeded at least 5 published curated worksheets", async () => {
    const res = await listPublicWorksheets({ gradeSlug: "lop-6" }, 1, 50);
    expect(res.total).toBeGreaterThanOrEqual(5);
    expect(res.items.every((w) => w.questionCount > 0)).toBe(true);
  });

  it("filters by chapter, topic, difficulty and search text", async () => {
    expect((await listPublicWorksheets({ chapterSlug: "phan-so" }, 1, 50)).items.every((w) => w.chapter?.slug === "phan-so")).toBe(true);
    expect((await listPublicWorksheets({ topicSlug: "luy-thua" }, 1, 50)).total).toBeGreaterThan(0);
    expect((await listPublicWorksheets({ q: "ƯỚC CHUNG" }, 1, 50)).total).toBeGreaterThan(0);
    expect((await listPublicWorksheets({ q: "khong-co-de-nao-xyz" }, 1, 50)).total).toBe(0);
  });

  it("public worksheet JSON and question view contain no answers", async () => {
    const ws = await getWorksheet("dau-hieu-chia-het-cho-2-3-5-9");
    expect(ws).not.toBeNull();
    const json = JSON.stringify([toPublicWorksheetJson(ws!), toPublicQuestions(ws!)]);
    expect(json).not.toContain("isCorrect");
    expect(json).not.toContain('"answer"');
    expect(json).not.toContain('"solution"');
    for (const item of ws!.items) expect(json).not.toContain(item.snapshot.solution.slice(0, 30).replace(/"/g, '\\"'));
    const answers = toAnswers(ws!);
    expect(answers).toHaveLength(ws!.questionCount);
  });

  it("generates a worksheet from published questions only and pins revisions", async () => {
    const chapter = await prisma.chapter.findFirstOrThrow({ where: { slug: "tap-hop-cac-so-tu-nhien" } });
    const res = await generateWorksheet({ grade: "lop-6", chapterId: chapter.id, topicIds: [], difficulty: "MIXED", count: 20, shuffle: true, mixTopics: true });
    expect(res.url).toMatch(/^\/de-bai\/de-tu-tao-/);
    const ws = await prisma.worksheet.findUniqueOrThrow({ where: { id: res.id }, include: { questions: { include: { question: true, revision: true } } } });
    expect(ws.kind).toBe("GENERATED");
    expect(ws.questions).toHaveLength(20);
    expect(new Set(ws.questions.map((q) => q.questionId)).size).toBe(20);
    expect(ws.questions.every((q) => q.question.status === "PUBLISHED" && q.question.chapterId === chapter.id)).toBe(true);
    expect(ws.questions.map((q) => q.position).sort((a, b) => a - b)).toEqual(Array.from({ length: 20 }, (_, i) => i + 1));
  });

  it("refuses when not enough questions are available", async () => {
    const topic = await prisma.topic.findFirstOrThrow({ where: { slug: "luy-thua" } });
    await expect(
      generateWorksheet({ grade: "lop-6", topicIds: [topic.id], difficulty: "ADVANCED", count: 30, shuffle: false, mixTopics: false }),
    ).rejects.toSatisfy((e: unknown) => e instanceof ApiError && e.code === "INSUFFICIENT_QUESTIONS" && e.status === 422);
  });

  it("requires exactly one topic when mixing is disabled", async () => {
    await expect(generateWorksheet({ grade: "lop-6", topicIds: [], difficulty: "MIXED", count: 10, shuffle: false, mixTopics: false })).rejects.toBeInstanceOf(ApiError);
  });

  it("rejects unknown grade/chapter ids", async () => {
    await expect(generateWorksheet({ grade: "lop-9", topicIds: [], difficulty: "MIXED", count: 10, shuffle: false, mixTopics: true })).rejects.toBeInstanceOf(ApiError);
    await expect(generateWorksheet({ grade: "lop-6", chapterId: "doesnotexist", topicIds: [], difficulty: "MIXED", count: 10, shuffle: false, mixTopics: true })).rejects.toBeInstanceOf(ApiError);
  });
});
