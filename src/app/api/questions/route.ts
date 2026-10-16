import { jsonOk, route, searchParamsObject } from "@/lib/http";
import { publicQuestionListSchema } from "@/lib/validation/question";
import { questionRepository } from "@/repositories/question.repository";

/** Public question list — content and options only, never answers or solutions. */
export const GET = route(async (req) => {
  const p = publicQuestionListSchema.parse(searchParamsObject(req));
  const { items, total } = await questionRepository.listPublic(
    { gradeSlug: p.grade, chapterSlug: p.chapter, topicSlug: p.topic, difficulty: p.difficulty },
    p.page,
    p.pageSize,
  );
  return jsonOk(
    { items, total, page: p.page, pageSize: p.pageSize },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
});
