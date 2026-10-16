export type SeedDifficulty = "BASIC" | "APPLIED" | "ADVANCED";
export type SeedQuestionType = "ESSAY" | "SINGLE_CHOICE" | "SHORT_ANSWER";

export interface SeedOption {
  label: "A" | "B" | "C" | "D";
  content: string;
  correct?: boolean;
}

export interface SeedQuestion {
  /** "chapterSlug/topicSlug" */
  topic: string;
  difficulty: SeedDifficulty;
  type: SeedQuestionType;
  content: string;
  answer: string;
  solution: string;
  options?: SeedOption[];
  tags?: string[];
  /**
   * Independent machine check of the stated answer. Questions with a passing
   * `verify` are seeded as PUBLISHED; questions without one are seeded as
   * PENDING_REVIEW and must be reviewed by an admin before publishing.
   */
  verify?: () => boolean;
}

export interface SeedTopic {
  slug: string;
  title: string;
  summary: string;
  knowledgeSummary?: string;
  example?: string;
}

export interface SeedChapter {
  number: number;
  slug: string;
  title: string;
  summary: string;
  keyPoints: string[];
  topics: SeedTopic[];
}

export interface SeedWorksheet {
  slug: string;
  title: string;
  description: string;
  chapter: string;
  /** topic slugs (within chapter) whose PUBLISHED questions are included, in order */
  topics: string[];
  durationMinutes: number;
  maxQuestions: number;
  isFeatured?: boolean;
}
