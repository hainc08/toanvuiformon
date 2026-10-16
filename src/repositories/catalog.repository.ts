import "server-only";
import { prisma } from "@/lib/db/prisma";

const publishedCuratedWorksheet = { kind: "CURATED", status: "PUBLISHED" } as const;

export const catalogRepository = {
  listPublishedGrades() {
    return prisma.grade.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ sortOrder: "asc" }, { level: "asc" }],
      select: { id: true, level: true, name: true, slug: true, description: true },
    });
  },

  findPublishedGradeBySlug(slug: string) {
    return prisma.grade.findFirst({
      where: { slug, status: "PUBLISHED" },
      select: {
        id: true,
        level: true,
        name: true,
        slug: true,
        description: true,
        chapters: {
          where: { status: "PUBLISHED" },
          orderBy: [{ sortOrder: "asc" }, { number: "asc" }],
          select: {
            id: true,
            number: true,
            title: true,
            slug: true,
            summary: true,
            keyPoints: true,
            _count: {
              select: {
                topics: { where: { status: "PUBLISHED" } },
                worksheets: { where: publishedCuratedWorksheet },
                questions: { where: { status: "PUBLISHED" } },
              },
            },
          },
        },
      },
    });
  },

  findPublishedChapter(gradeSlug: string, chapterSlug: string) {
    return prisma.chapter.findFirst({
      where: { slug: chapterSlug, status: "PUBLISHED", grade: { slug: gradeSlug, status: "PUBLISHED" } },
      select: {
        id: true,
        number: true,
        title: true,
        slug: true,
        summary: true,
        keyPoints: true,
        grade: { select: { id: true, name: true, slug: true, level: true } },
        topics: {
          where: { status: "PUBLISHED" },
          orderBy: [{ sortOrder: "asc" }, { title: "asc" }],
          select: {
            id: true,
            title: true,
            slug: true,
            summary: true,
            _count: { select: { questions: { where: { status: "PUBLISHED" } } } },
          },
        },
      },
    });
  },

  findPublishedTopic(gradeSlug: string, chapterSlug: string, topicSlug: string) {
    return prisma.topic.findFirst({
      where: {
        slug: topicSlug,
        status: "PUBLISHED",
        chapter: { slug: chapterSlug, status: "PUBLISHED", grade: { slug: gradeSlug, status: "PUBLISHED" } },
      },
      select: {
        id: true,
        title: true,
        slug: true,
        summary: true,
        knowledgeSummary: true,
        example: true,
        chapter: {
          select: {
            id: true,
            number: true,
            title: true,
            slug: true,
            grade: { select: { id: true, name: true, slug: true } },
            topics: { where: { status: "PUBLISHED" }, orderBy: { sortOrder: "asc" }, select: { title: true, slug: true } },
          },
        },
        _count: { select: { questions: { where: { status: "PUBLISHED" } } } },
      },
    });
  },

  /** Published chapters + topics of a grade (for the generator form and sitemaps). */
  findGradeTree(gradeSlug: string) {
    return prisma.grade.findFirst({
      where: { slug: gradeSlug, status: "PUBLISHED" },
      select: {
        id: true,
        name: true,
        slug: true,
        chapters: {
          where: { status: "PUBLISHED" },
          orderBy: { sortOrder: "asc" },
          select: {
            id: true,
            number: true,
            title: true,
            slug: true,
            updatedAt: true,
            topics: {
              where: { status: "PUBLISHED" },
              orderBy: { sortOrder: "asc" },
              select: {
                id: true,
                title: true,
                slug: true,
                updatedAt: true,
                _count: { select: { questions: { where: { status: "PUBLISHED" } } } },
              },
            },
          },
        },
      },
    });
  },
};
