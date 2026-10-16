import "server-only";
import { cache } from "react";
import { catalogRepository } from "@/repositories/catalog.repository";
import { renderMathText } from "@/lib/math/render";

export const getPublishedGrades = cache(() => catalogRepository.listPublishedGrades());

export const getGradePage = cache(async (gradeSlug: string) => {
  const grade = await catalogRepository.findPublishedGradeBySlug(gradeSlug);
  if (!grade) return null;
  return {
    ...grade,
    chapters: grade.chapters.map((c) => ({
      id: c.id,
      number: c.number,
      title: c.title,
      slug: c.slug,
      summary: c.summary,
      keyPoints: c.keyPoints,
      topicCount: c._count.topics,
      worksheetCount: c._count.worksheets,
      questionCount: c._count.questions,
    })),
  };
});

export const getChapterPage = cache(async (gradeSlug: string, chapterSlug: string) => {
  const chapter = await catalogRepository.findPublishedChapter(gradeSlug, chapterSlug);
  if (!chapter) return null;
  return {
    ...chapter,
    topics: chapter.topics.map((t) => ({ id: t.id, title: t.title, slug: t.slug, summary: t.summary, questionCount: t._count.questions })),
  };
});

export const getTopicPage = cache(async (gradeSlug: string, chapterSlug: string, topicSlug: string) => {
  const topic = await catalogRepository.findPublishedTopic(gradeSlug, chapterSlug, topicSlug);
  if (!topic) return null;
  return {
    ...topic,
    questionCount: topic._count.questions,
    knowledgeSummaryHtml: renderMathText(topic.knowledgeSummary),
    exampleHtml: renderMathText(topic.example),
  };
});

export const getGradeTree = cache((gradeSlug: string) => catalogRepository.findGradeTree(gradeSlug));
