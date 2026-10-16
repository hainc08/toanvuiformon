import "server-only";
import { prisma } from "@/lib/db/prisma";
import type { Prisma } from "@/generated/prisma/client";
import type { Difficulty } from "@/generated/prisma/enums";

export interface PublicWorksheetFilter {
  gradeSlug?: string;
  chapterSlug?: string;
  topicSlug?: string;
  difficulty?: Difficulty;
  q?: string;
  featured?: boolean;
}

export const worksheetCardSelect = {
  id: true,
  slug: true,
  title: true,
  description: true,
  difficulty: true,
  durationMinutes: true,
  questionCount: true,
  isFeatured: true,
  downloadCount: true,
  grade: { select: { name: true, slug: true } },
  chapter: { select: { number: true, title: true, slug: true } },
  topic: { select: { title: true, slug: true } },
} satisfies Prisma.WorksheetSelect;

export type WorksheetCardRow = Prisma.WorksheetGetPayload<{ select: typeof worksheetCardSelect }>;

function publicWhere(f: PublicWorksheetFilter): Prisma.WorksheetWhereInput {
  const and: Prisma.WorksheetWhereInput[] = [{ kind: "CURATED", status: "PUBLISHED" }];
  if (f.gradeSlug) and.push({ grade: { slug: f.gradeSlug } });
  if (f.chapterSlug) and.push({ chapter: { slug: f.chapterSlug } });
  if (f.topicSlug) {
    and.push({
      OR: [{ topic: { slug: f.topicSlug } }, { questions: { some: { question: { topic: { slug: f.topicSlug } } } } }],
    });
  }
  if (f.difficulty) and.push({ OR: [{ difficulty: f.difficulty }, { difficulty: null, questions: { some: { question: { difficulty: f.difficulty } } } }] });
  if (f.featured) and.push({ isFeatured: true });
  if (f.q) {
    and.push({
      OR: [
        { title: { contains: f.q, mode: "insensitive" } },
        { description: { contains: f.q, mode: "insensitive" } },
        { chapter: { title: { contains: f.q, mode: "insensitive" } } },
        { topic: { title: { contains: f.q, mode: "insensitive" } } },
      ],
    });
  }
  return { AND: and };
}

export const worksheetRepository = {
  async listPublic(f: PublicWorksheetFilter, page: number, pageSize: number) {
    const where = publicWhere(f);
    const [items, total] = await Promise.all([
      prisma.worksheet.findMany({
        where,
        select: worksheetCardSelect,
        orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { title: "asc" }],
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.worksheet.count({ where }),
    ]);
    return { items, total };
  },

  /** Worksheet with pinned question revisions. Only PUBLISHED worksheets are publicly visible. */
  findPublishedByIdOrSlug(idOrSlug: string) {
    return prisma.worksheet.findFirst({
      where: { status: "PUBLISHED", OR: [{ id: idOrSlug }, { slug: idOrSlug }] },
      select: {
        ...worksheetCardSelect,
        kind: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        questions: {
          orderBy: { position: "asc" },
          select: {
            position: true,
            questionId: true,
            revision: { select: { id: true, version: true, snapshot: true } },
          },
        },
      },
    });
  },

  recordDownload(worksheetId: string, kind: "QUESTION_PDF" | "ANSWER_PDF") {
    return prisma.$transaction(async (tx) => {
      await tx.download.create({ data: { worksheetId, kind } });
      await tx.worksheet.update({ where: { id: worksheetId }, data: { downloadCount: { increment: 1 } } });
    });
  },

  listPublishedSlugs() {
    return prisma.worksheet.findMany({
      where: { kind: "CURATED", status: "PUBLISHED" },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: "desc" },
      take: 5_000,
    });
  },
};
