import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/env";
import { getGradeTree, getPublishedGrades } from "@/services/catalog.service";
import { worksheetRepository } from "@/repositories/worksheet.repository";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteUrl();
  const entries: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/thu-vien`, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/tao-de`, changeFrequency: "monthly", priority: 0.6 },
  ];
  for (const g of await getPublishedGrades()) {
    entries.push({ url: `${base}/${g.slug}`, changeFrequency: "weekly", priority: 0.9 });
    const tree = await getGradeTree(g.slug);
    for (const c of tree?.chapters ?? []) {
      entries.push({ url: `${base}/${g.slug}/${c.slug}`, lastModified: c.updatedAt, priority: 0.8 });
      for (const t of c.topics) {
        // Skip empty topic pages (thin content).
        if (t._count.questions > 0) entries.push({ url: `${base}/${g.slug}/${c.slug}/${t.slug}`, lastModified: t.updatedAt, priority: 0.7 });
      }
    }
  }
  for (const ws of await worksheetRepository.listPublishedSlugs()) {
    entries.push({ url: `${base}/de-bai/${ws.slug}`, lastModified: ws.updatedAt, priority: 0.7 });
  }
  return entries;
}
