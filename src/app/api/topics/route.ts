import { z } from "zod";
import { jsonOk, notFound, route, searchParamsObject } from "@/lib/http";
import { slugSchema } from "@/lib/validation/common";
import { getChapterPage } from "@/services/catalog.service";

const schema = z.object({ grade: slugSchema.default("lop-6"), chapter: slugSchema });

export const GET = route(async (req) => {
  const { grade, chapter } = schema.parse(searchParamsObject(req));
  const data = await getChapterPage(grade, chapter);
  if (!data) throw notFound("Không tìm thấy chương.");
  return jsonOk(
    { chapter: { id: data.id, number: data.number, title: data.title, slug: data.slug }, items: data.topics },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
});
