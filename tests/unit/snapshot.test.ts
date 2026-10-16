import { describe, expect, it } from "vitest";
import { answerStartsWithLabel, buildSnapshot, snapshotsDiffer } from "@/features/questions/snapshot";

const src = {
  code: "T6-C1-001",
  type: "SINGLE_CHOICE" as const,
  difficulty: "BASIC" as const,
  content: "c",
  answer: "**B.** $2$",
  solution: "s",
  options: [
    { label: "B", content: "2", isCorrect: true, sortOrder: 1 },
    { label: "A", content: "1", isCorrect: false, sortOrder: 0 },
  ],
};

describe("question snapshots", () => {
  it("orders options and strips extra fields", () => {
    expect(buildSnapshot(src).options).toEqual([
      { label: "A", content: "1", isCorrect: false },
      { label: "B", content: "2", isCorrect: true },
    ]);
  });

  it("detects content changes regardless of JSON key order", () => {
    const a = buildSnapshot(src);
    const reordered = JSON.parse(JSON.stringify({ solution: a.solution, options: a.options, answer: a.answer, content: a.content, difficulty: a.difficulty, type: a.type, code: a.code }));
    expect(snapshotsDiffer(a, reordered)).toBe(false);
    expect(snapshotsDiffer(a, { ...a, answer: "x" })).toBe(true);
    expect(snapshotsDiffer(a, { ...a, options: [a.options[0]!, { ...a.options[1]!, isCorrect: false }] })).toBe(true);
  });

  it("recognises answers that already start with the option label", () => {
    expect(answerStartsWithLabel("**B.** $2$")).toBe(true);
    expect(answerStartsWithLabel("$2$")).toBe(false);
  });
});
