import { z } from "zod";
import { tokenize } from "@/lib/math/render";

/** Rejects HTML tags in the text parts of MathText (math like `$a < b$` is allowed). */
export function hasHtmlTag(value: string): boolean {
  return tokenize(value).some((seg) => seg.kind === "text" && /<\/?[a-z!][^>]*>/i.test(seg.value));
}


export const idSchema = z.string().min(1).max(64).regex(/^[a-z0-9]+$/i, "ID không hợp lệ");
export const slugSchema = z
  .string()
  .min(1)
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug chỉ gồm chữ thường không dấu, số và dấu gạch ngang");

export const difficultySchema = z.enum(["BASIC", "APPLIED", "ADVANCED"]);
export const questionTypeSchema = z.enum(["ESSAY", "SINGLE_CHOICE", "SHORT_ANSWER", "TRUE_FALSE"]);
export const questionStatusSchema = z.enum(["DRAFT", "PENDING_REVIEW", "APPROVED", "PUBLISHED", "ARCHIVED"]);
export const publishStatusSchema = z.enum(["DRAFT", "PUBLISHED", "ARCHIVED"]);

export const pageSchema = z.coerce.number().int().min(1).max(10_000).default(1);
export const pageSizeSchema = (max = 50, def = 20) => z.coerce.number().int().min(1).max(max).default(def);

/** MathText fields: bounded length, no raw HTML tags. */
export const mathTextSchema = (max: number) =>
  z
    .string()
    .trim()
    .min(1, "Không được để trống")
    .max(max, `Tối đa ${max} ký tự`)
    .refine((v) => !hasHtmlTag(v), "Không được chứa thẻ HTML");

export const optionalMathText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .refine((v) => !hasHtmlTag(v), "Không được chứa thẻ HTML")
    .optional()
    .nullable();

export const searchQuerySchema = z.string().trim().max(100).optional();

export const booleanString = z
  .union([z.boolean(), z.enum(["true", "false", "1", "0"])])
  .transform((v) => v === true || v === "true" || v === "1");

/** Worksheet route param: either a cuid or a slug. */
export const worksheetKeySchema = z.string().min(1).max(120).regex(/^[a-z0-9-]+$/i, "Mã bộ đề không hợp lệ");
