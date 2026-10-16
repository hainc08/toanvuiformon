import type { Difficulty } from "@/generated/prisma/enums";
import { Badge } from "@/components/ui/badge";
import { DIFFICULTY_LABEL } from "@/lib/labels";

const TONE = { BASIC: "green", APPLIED: "blue", ADVANCED: "amber" } as const;

export function DifficultyBadge({ difficulty }: { difficulty: Difficulty | null }) {
  if (!difficulty) return <Badge tone="teal">Tổng hợp</Badge>;
  return <Badge tone={TONE[difficulty]}>{DIFFICULTY_LABEL[difficulty]}</Badge>;
}
