import { describe, expect, it } from "vitest";
import { CHAPTERS } from "../../prisma/data/curriculum";
import { assignCodes } from "../../prisma/data/codes";
import { ALL_SEED_QUESTIONS } from "../../prisma/data/questions";
import { SEED_WORKSHEETS } from "../../prisma/data/worksheets";
import { importItemSchema } from "@/lib/validation/question";
import { renderMathText } from "@/lib/math/render";

const topicKeys = new Set(CHAPTERS.flatMap((c) => c.topics.map((t) => `${c.slug}/${t.slug}`)));

describe("curriculum seed", () => {
  it("has 9 chapters with unique slugs and numbers 1..9", () => {
    expect(CHAPTERS.map((c) => c.number)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    expect(new Set(CHAPTERS.map((c) => c.slug)).size).toBe(9);
    for (const c of CHAPTERS) expect(new Set(c.topics.map((t) => t.slug)).size).toBe(c.topics.length);
  });
});

describe("question bank seed", () => {
  it("contains at least 100 real questions", () => {
    expect(ALL_SEED_QUESTIONS.length).toBeGreaterThanOrEqual(100);
  });

  it("every machine-checkable answer is verified", () => {
    const failed = assignCodes(ALL_SEED_QUESTIONS).filter(({ q }) => q.verify && !q.verify());
    expect(failed.map((f) => f.code)).toEqual([]);
    expect(ALL_SEED_QUESTIONS.filter((q) => q.verify).length).toBeGreaterThanOrEqual(100);
  });

  it("references existing topics and has unique codes and contents", () => {
    for (const q of ALL_SEED_QUESTIONS) expect(topicKeys.has(q.topic), q.topic).toBe(true);
    const codes = assignCodes(ALL_SEED_QUESTIONS).map((c) => c.code);
    expect(new Set(codes).size).toBe(codes.length);
    expect(new Set(ALL_SEED_QUESTIONS.map((q) => q.content)).size).toBe(ALL_SEED_QUESTIONS.length);
  });

  it("passes the same validation as admin import", () => {
    for (const q of ALL_SEED_QUESTIONS) {
      const [chapterSlug, topicSlug] = q.topic.split("/");
      const res = importItemSchema.safeParse({
        chapterSlug,
        topicSlug,
        difficulty: q.difficulty,
        type: q.type,
        content: q.content,
        answer: q.answer,
        solution: q.solution,
        tags: q.tags,
        options: (q.options ?? []).map((o) => ({ label: o.label, content: o.content, isCorrect: Boolean(o.correct) })),
      });
      expect(res.success, `${q.content.slice(0, 40)}: ${res.success ? "" : res.error.message}`).toBe(true);
    }
  });

  it("single-choice answers name the correct option", () => {
    for (const q of ALL_SEED_QUESTIONS.filter((x) => x.type === "SINGLE_CHOICE")) {
      const correct = q.options?.filter((o) => o.correct) ?? [];
      expect(correct).toHaveLength(1);
      expect(q.answer.startsWith(`**${correct[0]!.label}.**`)).toBe(true);
    }
  });

  it("covers all three difficulty levels in chapters 1 and 2", () => {
    for (const ch of ["tap-hop-cac-so-tu-nhien", "tinh-chia-het-trong-tap-hop-so-tu-nhien"]) {
      const levels = new Set(ALL_SEED_QUESTIONS.filter((q) => q.topic.startsWith(ch)).map((q) => q.difficulty));
      expect([...levels].sort()).toEqual(["ADVANCED", "APPLIED", "BASIC"]);
    }
  });

  it("renders every question, answer and solution without KaTeX errors", () => {
    for (const q of ALL_SEED_QUESTIONS) {
      for (const text of [q.content, q.answer, q.solution, ...(q.options ?? []).map((o) => o.content)]) {
        expect(renderMathText(text), text).not.toContain("katex-error");
      }
    }
  });

  it("defines at least 5 sample worksheets", () => {
    expect(SEED_WORKSHEETS.length).toBeGreaterThanOrEqual(5);
  });
});
