import type { Permission } from "@/lib/auth/permissions";
import type { QuestionStatus } from "@/generated/prisma/enums";
import type { QuestionStatusAction } from "@/lib/validation/question";

/** Review workflow: DRAFT → PENDING_REVIEW → APPROVED → PUBLISHED. Only approved questions can be published. */
type Transition = { from: QuestionStatus[]; to: QuestionStatus; permission: Permission };

export const QUESTION_TRANSITIONS: Record<QuestionStatusAction, Transition> = {
  submit: { from: ["DRAFT"], to: "PENDING_REVIEW", permission: "question:submit" },
  approve: { from: ["PENDING_REVIEW"], to: "APPROVED", permission: "question:review" },
  reject: { from: ["PENDING_REVIEW", "APPROVED"], to: "DRAFT", permission: "question:review" },
  publish: { from: ["APPROVED"], to: "PUBLISHED", permission: "question:publish" },
  unpublish: { from: ["PUBLISHED"], to: "APPROVED", permission: "question:publish" },
  archive: { from: ["DRAFT", "PENDING_REVIEW", "APPROVED", "PUBLISHED"], to: "ARCHIVED", permission: "question:delete" },
  restore: { from: ["ARCHIVED"], to: "DRAFT", permission: "question:delete" },
};
