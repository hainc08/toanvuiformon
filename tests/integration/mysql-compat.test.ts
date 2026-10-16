import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { toStringArray } from "@/lib/db/json";
import { listAdminQuestions } from "@/services/question.service";

// MySQL/MariaDB has no array columns or `mode: "insensitive"`; these pin the replacements.
describe("MySQL compatibility", () => {
  it("finds questions by exact tag (JSON array column)", async () => {
    const res = await listAdminQuestions({ q: "số chẵn" }, 1, 50);
    expect(res.total).toBeGreaterThan(0);
    const tagged = await prisma.question.findMany({ where: { id: { in: res.items.map((q) => q.id) } }, select: { tags: true, content: true } });
    expect(tagged.some((q) => toStringArray(q.tags).includes("số chẵn"))).toBe(true);
  });

  it("searches question content case-insensitively in Vietnamese", async () => {
    const lower = await listAdminQuestions({ q: "tập hợp" }, 1, 50);
    const upper = await listAdminQuestions({ q: "TẬP HỢP" }, 1, 50);
    expect(lower.total).toBeGreaterThan(0);
    expect(upper.total).toBe(lower.total);
  });

  it("stores chapter key points as a string array", async () => {
    const chapter = await prisma.chapter.findFirstOrThrow({ where: { number: 1 } });
    const points = toStringArray(chapter.keyPoints);
    expect(points.length).toBeGreaterThan(0);
    expect(points.every((p) => typeof p === "string")).toBe(true);
  });
});
