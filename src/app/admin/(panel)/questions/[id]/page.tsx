import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/admin/page-header";
import { QuestionEditor, type QuestionFormValue } from "@/components/admin/question-editor";
import { QuestionStatusActions } from "@/components/admin/question-status-actions";
import { ReportActions } from "@/components/admin/report-actions";
import { QuestionStatusBadge } from "@/components/admin/status-badge";
import { toStringArray } from "@/lib/db/json";
import { requireAdminPage } from "@/lib/auth/guard";
import { can } from "@/lib/auth/permissions";
import { ApiError } from "@/lib/http";
import { formatDate } from "@/lib/utils";
import { idSchema } from "@/lib/validation/common";
import { catalogOptions } from "@/services/catalog-admin.service";
import { getAdminQuestion } from "@/services/question.service";

export const metadata = { title: "Sửa câu hỏi" };

const REASON = { WRONG_ANSWER: "Đáp án sai", TYPO: "Lỗi chính tả/công thức", UNCLEAR: "Đề khó hiểu", OTHER: "Khác" } as Record<string, string>;

export default async function EditQuestionPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireAdminPage("question:read");
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();
  const q = await getAdminQuestion(id.data).catch((e: unknown) => {
    if (e instanceof ApiError && e.status === 404) notFound();
    throw e;
  });
  const catalog = await catalogOptions();
  const initial: QuestionFormValue = {
    topicId: q.topicId,
    difficulty: q.difficulty,
    type: q.type,
    content: q.content,
    answer: q.answer,
    solution: q.solution,
    tags: toStringArray(q.tags),
    source: q.source,
    options: q.options.map((o) => ({ label: o.label as QuestionFormValue["options"][number]["label"], content: o.content, isCorrect: o.isCorrect })),
  };

  return (
    <>
      <Link href="/admin/questions" className="text-sm text-primary hover:underline">← Ngân hàng câu hỏi</Link>
      <PageHeader title={`Câu hỏi ${q.code}`} description={`Chương ${q.topic.chapter.number} · ${q.topic.title} · phiên bản ${q.currentVersion}`} actions={<QuestionStatusBadge status={q.status} />} />
      <div className="grid gap-6 xl:grid-cols-[1fr_320px]">
        <div className="min-w-0">
          {can(user.role, "question:write") && q.status !== "ARCHIVED" ? (
            <QuestionEditor catalog={catalog} initial={initial} questionId={q.id} />
          ) : (
            <p className="rounded-2xl border border-line bg-white p-4 text-sm text-muted">Câu hỏi đang lưu trữ. Khôi phục để chỉnh sửa.</p>
          )}
        </div>
        <aside className="space-y-4">
          <section className="rounded-2xl border border-line bg-white p-4">
            <h2 className="mb-2 font-bold">Trạng thái duyệt</h2>
            <QuestionStatusActions id={q.id} status={q.status} isAdmin={user.role === "ADMIN"} canDelete={q._count.worksheets === 0} />
            <dl className="mt-3 space-y-1 text-xs text-muted">
              <div>Người tạo: {q.createdBy?.name ?? "Seed hệ thống"}</div>
              <div>Sửa lần cuối: {q.updatedBy?.name ?? "—"} · {formatDate(q.updatedAt)}</div>
              <div>Người duyệt: {q.reviewedBy?.name ?? (q.reviewedAt ? "Kiểm tra tự động (seed)" : "—")}</div>
              <div>Dùng trong {q._count.worksheets} bộ đề</div>
              {q.source ? <div>Nguồn: {q.source}</div> : null}
            </dl>
          </section>
          <section className="rounded-2xl border border-line bg-white p-4">
            <h2 className="mb-2 font-bold">Lịch sử phiên bản</h2>
            <ol className="space-y-2 text-xs">
              {q.revisions.map((r) => (
                <li key={r.id} className="border-l-2 border-primary/40 pl-2">
                  <strong>v{r.version}</strong> · {formatDate(r.createdAt)}
                  <span className="block text-muted">{r.changeNote ?? ""} {r.createdBy ? `— ${r.createdBy.name}` : ""}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="rounded-2xl border border-line bg-white p-4">
            <h2 className="mb-2 font-bold">Báo lỗi ({q.reports.filter((r) => r.status === "OPEN").length} đang mở)</h2>
            {q.reports.length === 0 ? (
              <p className="text-xs text-muted">Chưa có báo lỗi.</p>
            ) : (
              <ul className="space-y-2 text-xs">
                {q.reports.map((r) => (
                  <li key={r.id} className="rounded-lg bg-slate-50 p-2">
                    <strong>{REASON[r.reason] ?? r.reason}</strong> · {formatDate(r.createdAt)} · {r.status}
                    {r.message ? <p className="mt-1">{r.message}</p> : null}
                    {r.status === "OPEN" ? <div className="mt-1"><ReportActions id={r.id} /></div> : null}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>
      </div>
    </>
  );
}
