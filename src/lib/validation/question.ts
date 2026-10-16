import { z } from "zod";
import { difficultySchema, idSchema, mathTextSchema, pageSchema, pageSizeSchema, questionStatusSchema, questionTypeSchema, searchQuerySchema, slugSchema } from "./common";

export const optionInputSchema = z.object({
  label: z.enum(["A", "B", "C", "D", "E", "F"]),
  content: mathTextSchema(2_000),
  isCorrect: z.boolean(),
});

const questionBase = z.object({
  topicId: idSchema,
  difficulty: difficultySchema,
  type: questionTypeSchema,
  content: mathTextSchema(10_000),
  answer: mathTextSchema(5_000),
  solution: mathTextSchema(20_000),
  tags: z.array(z.string().trim().min(1).max(40)).max(15).default([]),
  source: z.string().trim().max(300).optional().nullable(),
  options: z.array(optionInputSchema).max(6).default([]),
  changeNote: z.string().trim().max(300).optional(),
});

function refineOptions<T extends { type: string; options: { label: string; isCorrect: boolean }[] }>(v: T, ctx: z.RefinementCtx) {
  if (v.type === "SINGLE_CHOICE" || v.type === "TRUE_FALSE") {
    const min = v.type === "TRUE_FALSE" ? 2 : 2;
    if (v.options.length < min) ctx.addIssue({ code: "custom", path: ["options"], message: "Cần ít nhất 2 phương án" });
    const correct = v.options.filter((o) => o.isCorrect).length;
    if (correct !== 1) ctx.addIssue({ code: "custom", path: ["options"], message: "Phải có đúng một phương án đúng" });
    const labels = new Set(v.options.map((o) => o.label));
    if (labels.size !== v.options.length) ctx.addIssue({ code: "custom", path: ["options"], message: "Nhãn phương án bị trùng" });
  } else if (v.options.length > 0) {
    ctx.addIssue({ code: "custom", path: ["options"], message: "Chỉ câu trắc nghiệm mới có phương án" });
  }
}

export const questionCreateSchema = questionBase.superRefine(refineOptions);
export const questionUpdateSchema = questionBase.superRefine(refineOptions);
export type QuestionInput = z.infer<typeof questionCreateSchema>;

export const questionStatusActionSchema = z.object({
  action: z.enum(["submit", "approve", "reject", "publish", "unpublish", "archive", "restore"]),
  note: z.string().trim().max(300).optional(),
});
export type QuestionStatusAction = z.infer<typeof questionStatusActionSchema>["action"];

export const adminQuestionListSchema = z.object({
  q: searchQuerySchema,
  status: questionStatusSchema.optional(),
  difficulty: difficultySchema.optional(),
  type: questionTypeSchema.optional(),
  chapterId: idSchema.optional(),
  topicId: idSchema.optional(),
  reported: z.enum(["1"]).optional(),
  page: pageSchema,
  pageSize: pageSizeSchema(100, 20),
});

export const publicQuestionListSchema = z.object({
  grade: slugSchema.default("lop-6"),
  chapter: slugSchema.optional(),
  topic: slugSchema.optional(),
  difficulty: difficultySchema.optional(),
  page: pageSchema,
  pageSize: pageSizeSchema(50, 20),
});

export const importItemSchema = z
  .object({
    code: z.string().trim().regex(/^[A-Z0-9-]{3,30}$/).optional(),
    grade: z.coerce.number().int().min(1).max(12).default(6),
    chapterSlug: slugSchema,
    topicSlug: slugSchema,
    difficulty: difficultySchema,
    type: questionTypeSchema,
    content: mathTextSchema(10_000),
    answer: mathTextSchema(5_000),
    solution: mathTextSchema(20_000),
    tags: z.array(z.string().trim().min(1).max(40)).max(15).default([]),
    source: z.string().trim().max(300).optional(),
    options: z.array(optionInputSchema).max(6).default([]),
  })
  .superRefine(refineOptions);
export type ImportItem = z.infer<typeof importItemSchema>;

export const importRequestSchema = z.object({
  dryRun: z.boolean().default(true),
  items: z.array(z.unknown()).min(1, "File không có câu hỏi nào").max(500, "Tối đa 500 câu hỏi mỗi lần nhập"),
});

export const reportSchema = z.object({
  reason: z.enum(["WRONG_ANSWER", "TYPO", "UNCLEAR", "OTHER"]),
  message: z.string().trim().max(500).optional(),
});
