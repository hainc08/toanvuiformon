import { z } from "zod";
import { jsonOk, notFound, route, searchParamsObject } from "@/lib/http";
import { slugSchema } from "@/lib/validation/common";
import { getGradePage } from "@/services/catalog.service";

const schema = z.object({ grade: slugSchema.default("lop-6") });

export const GET = route(async (req) => {
  const { grade } = schema.parse(searchParamsObject(req));
  const data = await getGradePage(grade);
  if (!data) throw notFound("Không tìm thấy lớp học.");
  return jsonOk(
    { grade: { name: data.name, slug: data.slug }, items: data.chapters },
    { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } },
  );
});
