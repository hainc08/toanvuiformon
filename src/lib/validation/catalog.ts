import { z } from "zod";
import { idSchema, publishStatusSchema, slugSchema } from "./common";

export const gradeUpsertSchema = z.object({
  level: z.coerce.number().int().min(1).max(12),
  name: z.string().trim().min(2).max(40),
  slug: slugSchema,
  description: z.string().trim().max(500).optional().nullable(),
  status: publishStatusSchema.default("DRAFT"),
});

export const chapterUpsertSchema = z.object({
  gradeId: idSchema,
  number: z.coerce.number().int().min(1).max(50),
  title: z.string().trim().min(2).max(160),
  slug: slugSchema,
  summary: z.string().trim().max(1_000).optional().nullable(),
  keyPoints: z.array(z.string().trim().min(1).max(120)).max(12).default([]),
  status: publishStatusSchema.default("DRAFT"),
});

export const topicUpsertSchema = z.object({
  chapterId: idSchema,
  title: z.string().trim().min(2).max(160),
  slug: slugSchema,
  summary: z.string().trim().max(500).optional().nullable(),
  knowledgeSummary: z
    .string()
    .trim()
    .max(5_000)
    .refine((v) => !/<\s*\/?\s*[a-z!]/i.test(v), "Không được chứa thẻ HTML")
    .optional()
    .nullable(),
  example: z
    .string()
    .trim()
    .max(3_000)
    .refine((v) => !/<\s*\/?\s*[a-z!]/i.test(v), "Không được chứa thẻ HTML")
    .optional()
    .nullable(),
  sortOrder: z.coerce.number().int().min(0).max(1_000).default(0),
  status: publishStatusSchema.default("DRAFT"),
});
