import { describe, expect, it } from "vitest";
import { InsufficientQuestionsError, selectQuestions, type Candidate } from "@/features/worksheets/select-questions";

const diffs = ["BASIC", "APPLIED", "ADVANCED"] as const;
const pool: Candidate[] = Array.from({ length: 30 }, (_, i) => ({
  id: `q${i}`,
  code: `T6-C1-${String(i).padStart(3, "0")}`,
  topicId: `t${i % 3}`,
  difficulty: diffs[i % 3]!,
}));

describe("selectQuestions", () => {
  it("returns exactly `count` distinct questions", () => {
    const res = selectQuestions(pool, { count: 20, shuffle: true, topicOrder: ["t0", "t1", "t2"], seed: 1 });
    expect(res).toHaveLength(20);
    expect(new Set(res.map((r) => r.id)).size).toBe(20);
  });

  it("throws when there are not enough questions", () => {
    expect(() => selectQuestions(pool.slice(0, 5), { count: 10, shuffle: false, topicOrder: [], seed: 1 })).toThrow(InsufficientQuestionsError);
  });

  it("ignores duplicate candidates", () => {
    const dup = [...pool.slice(0, 9), ...pool.slice(0, 9)];
    expect(() => selectQuestions(dup, { count: 10, shuffle: false, topicOrder: [], seed: 1 })).toThrow(InsufficientQuestionsError);
  });

  it("balances topics", () => {
    const res = selectQuestions(pool, { count: 9, shuffle: true, topicOrder: ["t0", "t1", "t2"], seed: 7 });
    const perTopic = ["t0", "t1", "t2"].map((t) => res.filter((r) => r.topicId === t).length);
    expect(perTopic).toEqual([3, 3, 3]);
  });

  it("orders from easy to hard when not shuffling", () => {
    const res = selectQuestions(pool, { count: 12, shuffle: false, topicOrder: ["t0", "t1", "t2"], seed: 3 });
    const rank = { BASIC: 0, APPLIED: 1, ADVANCED: 2 };
    const ranks = res.map((r) => rank[r.difficulty]);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it("is deterministic for a given seed", () => {
    const a = selectQuestions(pool, { count: 10, shuffle: true, topicOrder: [], seed: 42 }).map((q) => q.id);
    const b = selectQuestions(pool, { count: 10, shuffle: true, topicOrder: [], seed: 42 }).map((q) => q.id);
    expect(a).toEqual(b);
  });
});
