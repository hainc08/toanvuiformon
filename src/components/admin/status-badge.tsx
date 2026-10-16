import { Badge } from "@/components/ui/badge";
import { PUBLISH_STATUS_LABEL, QUESTION_STATUS_LABEL } from "@/lib/labels";
import type { PublishStatus, QuestionStatus } from "@/generated/prisma/enums";

const Q_TONE = { DRAFT: "gray", PENDING_REVIEW: "amber", APPROVED: "teal", PUBLISHED: "green", ARCHIVED: "red" } as const;
const P_TONE = { DRAFT: "gray", PUBLISHED: "green", ARCHIVED: "red" } as const;

export function QuestionStatusBadge({ status }: { status: QuestionStatus }) {
  return <Badge tone={Q_TONE[status]}>{QUESTION_STATUS_LABEL[status]}</Badge>;
}

export function PublishStatusBadge({ status }: { status: PublishStatus }) {
  return <Badge tone={P_TONE[status]}>{PUBLISH_STATUS_LABEL[status]}</Badge>;
}
