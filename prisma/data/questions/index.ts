import type { SeedQuestion } from "../types";
import { CHAPTER_1_QUESTIONS } from "./chapter1";
import { CHAPTER_2_QUESTIONS } from "./chapter2";
import { OTHER_QUESTIONS } from "./other-chapters";

export const ALL_SEED_QUESTIONS: SeedQuestion[] = [...CHAPTER_1_QUESTIONS, ...CHAPTER_2_QUESTIONS, ...OTHER_QUESTIONS];
