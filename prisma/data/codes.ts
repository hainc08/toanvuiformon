import { CHAPTERS } from "./curriculum";
import type { SeedQuestion } from "./types";

/** Stable question codes: T6-C{chapter}-{nnn} in declaration order. */
export function assignCodes(questions: SeedQuestion[]): { code: string; q: SeedQuestion }[] {
  const counters = new Map<number, number>();
  return questions.map((q) => {
    const chapterSlug = q.topic.split("/")[0];
    const chapter = CHAPTERS.find((c) => c.slug === chapterSlug);
    if (!chapter) throw new Error(`Unknown chapter in topic "${q.topic}"`);
    const next = (counters.get(chapter.number) ?? 0) + 1;
    counters.set(chapter.number, next);
    return { code: `T6-C${chapter.number}-${String(next).padStart(3, "0")}`, q };
  });
}
