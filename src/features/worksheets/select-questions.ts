import type { Difficulty } from "@/generated/prisma/enums";

export interface Candidate {
  id: string;
  topicId: string;
  difficulty: Difficulty;
  code: string;
}

export interface SelectOptions {
  count: number;
  shuffle: boolean;
  /** topic order used when not shuffling (and for balancing) */
  topicOrder: string[];
  seed?: number;
}

export class InsufficientQuestionsError extends Error {
  constructor(
    public readonly requested: number,
    public readonly available: number,
  ) {
    super(`Requested ${requested} questions but only ${available} are available`);
    this.name = "InsufficientQuestionsError";
  }
}

const DIFFICULTY_RANK: Record<Difficulty, number> = { BASIC: 0, APPLIED: 1, ADVANCED: 2 };

/** Small deterministic PRNG (mulberry32) so selection is testable with a seed. */
export function createRng(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function shuffleInPlace<T>(arr: T[], rng: () => number): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j] as T, arr[i] as T];
  }
  return arr;
}

/**
 * Picks `count` distinct questions.
 *  - Balances across topics (round-robin over randomly ordered per-topic pools) to avoid
 *    a worksheet dominated by a single topic.
 *  - Without `shuffle`, the result is ordered from easy to hard, then by topic order.
 */
export function selectQuestions(candidates: Candidate[], opts: SelectOptions): Candidate[] {
  const unique = Array.from(new Map(candidates.map((c) => [c.id, c])).values());
  if (unique.length < opts.count) throw new InsufficientQuestionsError(opts.count, unique.length);

  const rng = createRng(opts.seed ?? Math.floor(Math.random() * 2 ** 31));
  const pools = new Map<string, Candidate[]>();
  for (const c of unique) {
    const pool = pools.get(c.topicId) ?? [];
    pool.push(c);
    pools.set(c.topicId, pool);
  }
  for (const pool of pools.values()) shuffleInPlace(pool, rng);

  const topicKeys = shuffleInPlace(Array.from(pools.keys()), rng);
  const picked: Candidate[] = [];
  while (picked.length < opts.count) {
    for (const key of topicKeys) {
      const next = pools.get(key)?.pop();
      if (next) picked.push(next);
      if (picked.length === opts.count) break;
    }
  }

  if (opts.shuffle) return shuffleInPlace(picked, rng);
  const topicIndex = new Map(opts.topicOrder.map((id, i) => [id, i]));
  return picked.sort(
    (a, b) =>
      DIFFICULTY_RANK[a.difficulty] - DIFFICULTY_RANK[b.difficulty] ||
      (topicIndex.get(a.topicId) ?? 0) - (topicIndex.get(b.topicId) ?? 0) ||
      a.code.localeCompare(b.code),
  );
}
