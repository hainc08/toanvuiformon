import { z } from "zod";
import { booleanString, difficultySchema, idSchema, pageSchema, pageSizeSchema, publishStatusSchema, searchQuerySchema, slugSchema } from "./common";

export const QUESTION_COUNTS = [10, 20, 30] as const;

export const generateWorksheetSchema = z.object({
  grade: slugSchema.default("lop-6"),
  chapterId: idSchema.optional(),
  topicIds: z.array(idSchema).max(20).default([]),
  difficulty: z.union([difficultySchema, z.literal("MIXED")]).default("MIXED"),
  count: z.coerce
    .number()
    .int()
    .refine((n) => (QUESTION_COUNTS as readonly number[]).includes(n), "Số câu phải là 10, 20 hoặc 30"),
  shuffle: z.boolean().default(false),
  mixTopics: z.boolean().default(true),
});
export type GenerateWorksheetInput = z.infer<typeof generateWorksheetSchema>;

export const publicWorksheetListSchema = z.object({
  grade: slugSchema.optional(),
  chapter: slugSchema.optional(),
  topic: slugSchema.optional(),
  difficulty: difficultySchema.optional(),
  q: searchQuerySchema,
  featured: booleanString.optional(),
  page: pageSchema,
  pageSize: pageSizeSchema(50, 12),
});

export const worksheetUpsertSchema = z.object({
  title: z.string().trim().min(5).max(160),
  slug: slugSchema.optional(),
  description: z.string().trim().max(500).optional().nullable(),
  gradeId: idSchema,
  chapterId: idSchema.optional().nullable(),
  topicId: idSchema.optional().nullable(),
  difficulty: difficultySchema.optional().nullable(),
  durationMinutes: z.coerce.number().int().min(5).max(180),
  isFeatured: z.boolean().default(false),
  questionCodes: z.array(z.string().trim().min(1).max(30)).min(1, "Cần ít nhất 1 câu hỏi").max(60),
});
export type WorksheetUpsertInput = z.infer<typeof worksheetUpsertSchema>;

export const worksheetStatusSchema = z.object({ status: publishStatusSchema });

export const adminWorksheetListSchema = z.object({
  q: searchQuerySchema,
  kind: z.enum(["CURATED", "GENERATED"]).default("CURATED"),
  status: publishStatusSchema.optional(),
  page: pageSchema,
  pageSize: pageSizeSchema(100, 20),
});
