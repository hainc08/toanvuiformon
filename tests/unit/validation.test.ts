import { describe, expect, it } from "vitest";
import { generateWorksheetSchema } from "@/lib/validation/worksheet";
import { importItemSchema, questionCreateSchema } from "@/lib/validation/question";
import { loginSchema, userCreateSchema } from "@/lib/validation/user";

const base = { topicId: "abc123", difficulty: "BASIC", type: "ESSAY", content: "Tính $1+1$", answer: "$2$", solution: "$1+1=2$" };

describe("question validation", () => {
  it("accepts a valid essay question", () => {
    expect(questionCreateSchema.safeParse(base).success).toBe(true);
  });

  it("rejects raw HTML in content", () => {
    const r = questionCreateSchema.safeParse({ ...base, content: "<img src=x onerror=alert(1)>" });
    expect(r.success).toBe(false);
  });

  it("allows inequalities inside math", () => {
    expect(questionCreateSchema.safeParse({ ...base, content: "Tìm $x$ biết $2 < x<5$ và $x>3$" }).success).toBe(true);
  });

  it("requires exactly one correct option for single choice", () => {
    const opts = (correct: boolean[]) => ["A", "B", "C", "D"].map((label, i) => ({ label, content: `$${i}$`, isCorrect: correct[i] ?? false }));
    expect(questionCreateSchema.safeParse({ ...base, type: "SINGLE_CHOICE", options: opts([true]) }).success).toBe(true);
    expect(questionCreateSchema.safeParse({ ...base, type: "SINGLE_CHOICE", options: opts([true, true]) }).success).toBe(false);
    expect(questionCreateSchema.safeParse({ ...base, type: "SINGLE_CHOICE", options: opts([]) }).success).toBe(false);
  });

  it("rejects options on essay questions", () => {
    expect(questionCreateSchema.safeParse({ ...base, options: [{ label: "A", content: "x", isCorrect: true }] }).success).toBe(false);
  });

  it("validates import rows", () => {
    const row = { chapterSlug: "phan-so", topicSlug: "cong-tru-phan-so", difficulty: "BASIC", type: "ESSAY", content: "a", answer: "b", solution: "c" };
    expect(importItemSchema.parse(row).grade).toBe(6);
    expect(importItemSchema.safeParse({ ...row, difficulty: "HARD" }).success).toBe(false);
    expect(importItemSchema.safeParse({ ...row, chapterSlug: "Phân Số" }).success).toBe(false);
  });
});

describe("worksheet generator validation", () => {
  it("only allows 10, 20 or 30 questions", () => {
    expect(generateWorksheetSchema.safeParse({ count: 10 }).success).toBe(true);
    expect(generateWorksheetSchema.safeParse({ count: 15 }).success).toBe(false);
    expect(generateWorksheetSchema.safeParse({ count: 1000 }).success).toBe(false);
  });

  it("applies defaults", () => {
    expect(generateWorksheetSchema.parse({ count: 20 })).toMatchObject({ grade: "lop-6", difficulty: "MIXED", shuffle: false, mixTopics: true, topicIds: [] });
  });
});

describe("user validation", () => {
  it("normalises email and enforces password strength", () => {
    expect(loginSchema.parse({ email: " Admin@Example.COM ", password: "x" }).email).toBe("admin@example.com");
    expect(userCreateSchema.safeParse({ email: "a@b.vn", name: "An", role: "EDITOR", password: "short1" }).success).toBe(false);
    expect(userCreateSchema.safeParse({ email: "a@b.vn", name: "An", role: "EDITOR", password: "onlyletterslong" }).success).toBe(false);
    expect(userCreateSchema.safeParse({ email: "a@b.vn", name: "An", role: "EDITOR", password: "longpassword123" }).success).toBe(true);
    expect(userCreateSchema.safeParse({ email: "a@b.vn", name: "An", role: "SUPERADMIN", password: "longpassword123" }).success).toBe(false);
  });
});
