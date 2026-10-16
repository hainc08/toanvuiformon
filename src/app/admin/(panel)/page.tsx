import Link from "next/link";
import { BookMarked, Clock, Download, FileStack, Flag } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { Alert } from "@/components/ui/state";
import { requireAdminPage } from "@/lib/auth/guard";
import { formatDate, formatNumber } from "@/lib/utils";
import { getDashboardStats } from "@/services/stats.service";
import { listAuditLogs } from "@/services/audit.service";

export const metadata = { title: "Dashboard" };

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ forbidden?: string }> }) {
  await requireAdminPage("stats:read");
  const sp = await searchParams;
  const [s, logs] = await Promise.all([getDashboardStats(), listAuditLogs(15)]);
  const cards = [
    { label: "Tổng số câu hỏi", value: s.questions, sub: `${s.published} đã xuất bản`, icon: BookMarked, href: "/admin/questions", tone: "bg-primary-soft text-primary-dark" },
    { label: "Tổng số bộ đề", value: s.worksheets, sub: `${s.generatedWorksheets} đề do người dùng tự tạo`, icon: FileStack, href: "/admin/worksheets", tone: "bg-secondary-soft text-secondary-dark" },
    { label: "Tổng số lượt tải", value: s.downloads, sub: `${s.downloads30d} lượt trong 30 ngày`, icon: Download, href: "/admin/worksheets", tone: "bg-slate-100 text-slate-700" },
    { label: "Câu hỏi chưa duyệt", value: s.pendingReview, sub: `${s.drafts} bản nháp · ${s.approved} đã duyệt chờ xuất bản`, icon: Clock, href: "/admin/questions?status=PENDING_REVIEW", tone: "bg-accent-soft text-amber-800" },
    { label: "Câu hỏi bị báo lỗi", value: s.openReports, sub: "Báo lỗi đang mở", icon: Flag, href: "/admin/reports", tone: "bg-red-100 text-red-800" },
  ];
  return (
    <>
      <PageHeader title="Dashboard" description="Tổng quan nội dung và lượt sử dụng." />
      {sp.forbidden ? <div className="mb-4"><Alert>Bạn không có quyền truy cập trang đó.</Alert></div> : null}
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {cards.map((c) => (
          <li key={c.label}>
            <Link href={c.href} className="block rounded-2xl border border-line bg-white p-5 hover:shadow-md">
              <span className={`inline-flex size-10 items-center justify-center rounded-xl ${c.tone}`}>
                <c.icon className="size-5" aria-hidden="true" />
              </span>
              <p className="mt-3 text-sm text-muted">{c.label}</p>
              <p className="text-3xl font-extrabold" data-testid={`stat-${c.label}`}>{formatNumber(c.value)}</p>
              <p className="mt-1 text-xs text-muted">{c.sub}</p>
            </Link>
          </li>
        ))}
      </ul>
      <section className="mt-8 rounded-2xl border border-line bg-white p-5">
        <h2 className="mb-3 font-bold">Hoạt động gần đây</h2>
        {logs.length === 0 ? (
          <p className="text-sm text-muted">Chưa có hoạt động.</p>
        ) : (
          <ul className="divide-y divide-line text-sm">
            {logs.map((l) => (
              <li key={l.id} className="flex flex-wrap justify-between gap-2 py-2">
                <span>
                  <strong>{l.actor?.name ?? "Hệ thống"}</strong> · <code className="rounded bg-slate-100 px-1">{l.action}</code>
                  {l.entityId ? <span className="text-muted"> · {l.entityType}</span> : null}
                </span>
                <time className="text-muted" dateTime={l.createdAt.toISOString()}>{formatDate(l.createdAt)}</time>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
