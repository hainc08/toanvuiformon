import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { ReportActions } from "@/components/admin/report-actions";
import { EmptyState } from "@/components/ui/state";
import { prisma } from "@/lib/db/prisma";
import { requireAdminPage } from "@/lib/auth/guard";
import { formatDate } from "@/lib/utils";

export const metadata = { title: "Báo lỗi" };

const REASON: Record<string, string> = { WRONG_ANSWER: "Đáp án sai", TYPO: "Lỗi chính tả/công thức", UNCLEAR: "Đề khó hiểu", OTHER: "Khác" };

export default async function ReportsPage() {
  await requireAdminPage("report:manage");
  const reports = await prisma.questionReport.findMany({
    where: { status: "OPEN" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { question: { select: { id: true, code: true } } },
  });
  return (
    <>
      <PageHeader title="Báo lỗi từ người dùng" description={`${reports.length} báo lỗi đang mở`} />
      {reports.length === 0 ? (
        <EmptyState title="Không có báo lỗi nào đang mở" />
      ) : (
        <ul className="space-y-2">
          {reports.map((r) => (
            <li key={r.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-line bg-white p-4 text-sm">
              <div>
                <Link href={`/admin/questions/${r.question.id}`} className="font-mono font-semibold text-primary hover:underline">{r.question.code}</Link>
                <span className="ml-2 font-semibold">{REASON[r.reason] ?? r.reason}</span>
                <span className="ml-2 text-muted">{formatDate(r.createdAt)}</span>
                {r.message ? <p className="mt-1 text-muted">{r.message}</p> : null}
              </div>
              <ReportActions id={r.id} />
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
