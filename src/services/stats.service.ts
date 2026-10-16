import "server-only";
import { prisma } from "@/lib/db/prisma";

export async function getDashboardStats() {
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const [questions, byStatus, worksheets, generated, downloads, downloads30d, openReports] = await Promise.all([
    prisma.question.count({ where: { status: { not: "ARCHIVED" } } }),
    prisma.question.groupBy({ by: ["status"], orderBy: { status: "asc" }, _count: { _all: true } }),
    prisma.worksheet.count({ where: { kind: "CURATED", status: { not: "ARCHIVED" } } }),
    prisma.worksheet.count({ where: { kind: "GENERATED" } }),
    prisma.download.count(),
    prisma.download.count({ where: { createdAt: { gte: since } } }),
    prisma.questionReport.count({ where: { status: "OPEN" } }),
  ]);
  const statusCount = Object.fromEntries(
    byStatus.map((r) => [r.status, typeof r._count === "object" && r._count ? (r._count._all ?? 0) : 0]),
  ) as Record<string, number>;
  return {
    questions,
    published: statusCount.PUBLISHED ?? 0,
    pendingReview: statusCount.PENDING_REVIEW ?? 0,
    approved: statusCount.APPROVED ?? 0,
    drafts: statusCount.DRAFT ?? 0,
    worksheets,
    generatedWorksheets: generated,
    downloads,
    downloads30d,
    openReports,
  };
}
