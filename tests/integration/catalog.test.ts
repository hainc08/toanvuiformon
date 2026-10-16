import { describe, expect, it } from "vitest";
import { getChapterPage, getGradePage, getTopicPage } from "@/services/catalog.service";
import { questionRepository } from "@/repositories/question.repository";
import { prisma } from "@/lib/db/prisma";

describe("catalog (database)", () => {
  it("lists the 9 published chapters of grade 6 with counts", async () => {
    const grade = await getGradePage("lop-6");
    expect(grade?.chapters).toHaveLength(9);
    const c1 = grade!.chapters[0]!;
    expect(c1.title).toBe("Tập hợp các số tự nhiên");
    expect(c1.topicCount).toBe(6);
    expect(c1.worksheetCount).toBeGreaterThan(0);
  });

  it("hides draft content", async () => {
    const ch = await prisma.chapter.findFirstOrThrow({ where: { slug: "so-thap-phan" } });
    await prisma.chapter.update({ where: { id: ch.id }, data: { status: "DRAFT" } });
    try {
      expect(await getChapterPage("lop-6", "so-thap-phan")).toBeNull();
    } finally {
      await prisma.chapter.update({ where: { id: ch.id }, data: { status: "PUBLISHED" } });
    }
  });

  it("returns topic summary rendered as safe HTML", async () => {
    const topic = await getTopicPage("lop-6", "tap-hop-cac-so-tu-nhien", "luy-thua");
    expect(topic?.knowledgeSummaryHtml).toContain("katex");
    expect(topic?.questionCount).toBeGreaterThan(5);
  });

  it("public question list never contains answers", async () => {
    const { items, total } = await questionRepository.listPublic({ gradeSlug: "lop-6", topicSlug: "luy-thua" }, 1, 50);
    expect(total).toBeGreaterThan(0);
    for (const q of items) {
      expect(q).not.toHaveProperty("answer");
      expect(q).not.toHaveProperty("solution");
      for (const o of q.options) expect(o).not.toHaveProperty("isCorrect");
    }
  });

  it("enforces unique constraints", async () => {
    const ch = await prisma.chapter.findFirstOrThrow({ where: { slug: "phan-so" } });
    await expect(prisma.topic.create({ data: { chapterId: ch.id, title: "Trùng", slug: "phan-so-bang-nhau" } })).rejects.toMatchObject({ code: "P2002" });
  });
});
