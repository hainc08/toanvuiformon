import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { PublishStatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/layout/pagination";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { requireAdminPage } from "@/lib/auth/guard";
import { cn, formatDate } from "@/lib/utils";
import { adminWorksheetListSchema } from "@/lib/validation/worksheet";
import { listAdminWorksheets } from "@/services/worksheet-admin.service";

export const metadata = { title: "Bộ đề" };

export default async function AdminWorksheetsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdminPage("question:read");
  const raw = Object.fromEntries(Object.entries(await searchParams).filter(([, v]) => v));
  const parsed = adminWorksheetListSchema.safeParse(raw);
  const { page, pageSize, ...f } = parsed.success ? parsed.data : adminWorksheetListSchema.parse({});
  const result = await listAdminWorksheets(f, page, pageSize);
  return (
    <>
      <PageHeader
        title="Bộ đề"
        description={`${result.total} bộ đề`}
        actions={
          <Button asChild>
            <Link href="/admin/worksheets/new"><Plus /> Tạo bộ đề</Link>
          </Button>
        }
      />
      <nav className="mb-4 flex gap-2" aria-label="Loại bộ đề">
        {(["CURATED", "GENERATED"] as const).map((k) => (
          <Link key={k} href={`/admin/worksheets?kind=${k}`} aria-current={f.kind === k ? "page" : undefined}
            className={cn("rounded-full border px-4 py-1.5 text-sm font-semibold", f.kind === k ? "border-primary bg-primary text-white" : "border-line bg-white")}>
            {k === "CURATED" ? "Bộ đề biên soạn" : "Đề người dùng tự tạo"}
          </Link>
        ))}
      </nav>
      {result.items.length === 0 ? (
        <EmptyState title="Chưa có bộ đề" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th scope="col" className="px-3 py-2">Tiêu đề</th>
                <th scope="col" className="px-3 py-2">Chương</th>
                <th scope="col" className="px-3 py-2">Số câu</th>
                <th scope="col" className="px-3 py-2">Lượt tải</th>
                <th scope="col" className="px-3 py-2">Trạng thái</th>
                <th scope="col" className="px-3 py-2">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {result.items.map((w) => (
                <tr key={w.id}>
                  <td className="px-3 py-2">
                    {w.kind === "CURATED" ? (
                      <Link href={`/admin/worksheets/${w.id}`} className="font-semibold text-primary hover:underline">{w.title}</Link>
                    ) : (
                      <Link href={`/de-bai/${w.slug}`} className="font-semibold hover:underline">{w.title}</Link>
                    )}
                    {w.isFeatured ? <span className="ml-2 text-xs text-amber-700">★ Nổi bật</span> : null}
                  </td>
                  <td className="px-3 py-2 text-xs">{w.chapter ? `C${w.chapter.number}. ${w.chapter.title}` : "—"}</td>
                  <td className="px-3 py-2">{w.questionCount}</td>
                  <td className="px-3 py-2">{w.downloadCount}</td>
                  <td className="px-3 py-2"><PublishStatusBadge status={w.status} /></td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-muted">{formatDate(w.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={result.page} totalPages={result.totalPages} hrefFor={(p) => `/admin/worksheets?kind=${f.kind}&page=${p}`} />
    </>
  );
}
