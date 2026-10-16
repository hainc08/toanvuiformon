import type { Difficulty, QuestionStatus, QuestionType, PublishStatus } from "@/generated/prisma/enums";

export const DIFFICULTY_LABEL: Record<Difficulty, string> = {
  BASIC: "Cơ bản",
  APPLIED: "Vận dụng",
  ADVANCED: "Nâng cao",
};

export const DIFFICULTY_SLUG: Record<Difficulty, string> = {
  BASIC: "co-ban",
  APPLIED: "van-dung",
  ADVANCED: "nang-cao",
};

export const QUESTION_TYPE_LABEL: Record<QuestionType, string> = {
  ESSAY: "Tự luận",
  SINGLE_CHOICE: "Trắc nghiệm",
  SHORT_ANSWER: "Điền kết quả",
  TRUE_FALSE: "Đúng/Sai",
};

export const QUESTION_STATUS_LABEL: Record<QuestionStatus, string> = {
  DRAFT: "Nháp",
  PENDING_REVIEW: "Chờ duyệt",
  APPROVED: "Đã duyệt",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Lưu trữ",
};

export const PUBLISH_STATUS_LABEL: Record<PublishStatus, string> = {
  DRAFT: "Nháp",
  PUBLISHED: "Đã xuất bản",
  ARCHIVED: "Lưu trữ",
};

export const DIFFICULTIES = ["BASIC", "APPLIED", "ADVANCED"] as const satisfies readonly Difficulty[];
