import Link from "next/link";
import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { PublishStatusBadge } from "@/components/admin/status-badge";
import { WorksheetForm } from "@/components/admin/worksheet-form";
import { WorksheetStatusActions } from "@/components/admin/worksheet-status-actions";
import { requireAdminPage } from "@/lib/auth/guard";
import { ApiError } from "@/lib/http";
import { idSchema } from "@/lib/validation/common";
import { catalogOptions } from "@/services/catalog-admin.service";
import { getAdminWorksheet } from "@/services/worksheet-admin.service";

export const metadata = { title: "Sửa bộ đề" };

export default async function EditWorksheetPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdminPage("question:read");
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const ws = await getAdminWorksheet(id.data).catch((e: unknown) => {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  });
  const outdated = ws.questions.filter((q) => q.revision.version !== q.question.currentVersion || q.question.status !== "PUBLISHED");
  return (
    <>
      <Link href="/admin/worksheets" className="text-sm text-primary hover:underline">← Bộ đề</Link>
      <PageHeader title={ws.title} description={`/de-bai/${ws.slug} · ${ws.questionCount} câu · ${ws.downloadCount} lượt tải`} actions={<PublishStatusBadge status={ws.status} />} />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <WorksheetForm
          catalog={await catalogOptions()}
          worksheetId={ws.id}
          initial={{
            title: ws.title,
            slug: ws.slug,
            description: ws.description ?? "",
            gradeId: ws.gradeId,
            chapterId: ws.chapterId ?? "",
            topicId: ws.topicId ?? "",
            difficulty: ws.difficulty ?? "",
            durationMinutes: String(ws.durationMinutes),
            isFeatured: ws.isFeatured,
            questionCodes: ws.questions.map((q) => q.question.code).join("\n"),
          }}
        />
        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-white p-4">
            <h2 className="mb-2 font-bold">Xuất bản</h2>
            <WorksheetStatusActions id={ws.id} status={ws.status} isAdmin={user.role === "ADMIN"} />
            {ws.status === "PUBLISHED" ? (
              <Link href={`/de-bai/${ws.slug}`} target="_blank" className="mt-3 inline-flex items-center gap-1 text-sm text-primary hover:underline">
                Xem trang công khai <ExternalLink className="size-3.5" />
              </Link>
            ) : null}
          </section>
          <section className="rounded-2xl border border-line bg-white p-4 text-sm">
            <h2 className="mb-2 font-bold">Phiên bản câu hỏi</h2>
            {outdated.length === 0 ? (
              <p className="text-muted">Tất cả câu hỏi đang dùng phiên bản mới nhất.</p>
            ) : (
              <>
                <p className="text-amber-800">{outdated.length} câu đã có phiên bản mới hoặc không còn xuất bản. Đề hiện tại vẫn dùng phiên bản cũ (đề và đáp án vẫn khớp nhau).</p>
                <p className="mt-1 text-xs text-muted">Bấm “Lưu bộ đề” để cập nhật lên phiên bản mới nhất đã xuất bản.</p>
              </>
            )}
            <ol className="mt-2 space-y-0.5 font-mono text-xs">
              {ws.questions.map((q) => (
                <li key={q.id}>{q.position}. {q.question.code} · v{q.revision.version}{q.revision.version !== q.question.currentVersion ? ` (mới: v${q.question.currentVersion})` : ""}</li>
              ))}
            </ol>
          </section>
        </aside>
      </div>
    </>
  );
}
