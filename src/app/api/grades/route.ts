import { jsonOk, route } from "@/lib/http";
import { getPublishedGrades } from "@/services/catalog.service";

export const GET = route(async () => {
  const grades = await getPublishedGrades();
  return jsonOk({ items: grades }, { headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=300" } });
});
