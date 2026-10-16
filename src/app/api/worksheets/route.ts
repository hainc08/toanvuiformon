import { jsonOk, route, searchParamsObject } from "@/lib/http";
import { publicWorksheetListSchema } from "@/lib/validation/worksheet";
import { listPublicWorksheets } from "@/services/worksheet.service";

export const GET = route(async (req) => {
  const p = publicWorksheetListSchema.parse(searchParamsObject(req));
  const data = await listPublicWorksheets(
    { gradeSlug: p.grade, chapterSlug: p.chapter, topicSlug: p.topic, difficulty: p.difficulty, q: p.q, featured: p.featured },
    p.page,
    p.pageSize,
  );
  return jsonOk(data, { headers: { "Cache-Control": "public, max-age=30, stale-while-revalidate=120" } });
});
