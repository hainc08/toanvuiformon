import { PageHeader } from "@/components/admin/page-header";
import { CrudForm } from "@/components/admin/crud-form";
import { topicFields } from "@/components/admin/catalog-fields";
import { PublishStatusBadge } from "@/components/admin/status-badge";
import { requireAdminPage } from "@/lib/auth/guard";
import { listChaptersAdmin, listTopicsAdmin } from "@/services/catalog-admin.service";

export const metadata = { title: "Dạng toán" };

export default async function TopicsPage() {
  await requireAdminPage("catalog:manage");
  const [topics, chapters] = await Promise.all([listTopicsAdmin(), listChaptersAdmin()]);
  const chapterOptions = chapters.map((c) => ({ id: c.id, label: `${c.grade.name} · Chương ${c.number}: ${c.title}` }));
  const fields = topicFields(chapterOptions);
  return (
    <>
      <PageHeader title="Dạng toán" description="Tóm tắt kiến thức hỗ trợ công thức $...$. Không chép nguyên văn sách giáo khoa." />
      <ul className="space-y-2">
        {topics.map((t) => (
          <li key={t.id} className="rounded-2xl border border-line bg-white p-4">
            <details>
              <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                <span className="text-xs text-muted">C{t.chapter.number}</span>
                <span className="font-bold">{t.title}</span>
                <PublishStatusBadge status={t.status} />
                <span className="text-xs text-muted">{t._count.questions} câu hỏi</span>
              </summary>
              <div className="mt-4">
                <CrudForm
                  fields={fields}
                  endpoint={`/api/admin/topics/${t.id}`}
                  deleteEndpoint={`/api/admin/topics/${t.id}`}
                  method="PATCH"
                  submitLabel="Lưu"
                  initial={{
                    chapterId: t.chapterId,
                    title: t.title,
                    slug: t.slug,
                    sortOrder: String(t.sortOrder),
                    status: t.status,
                    summary: t.summary ?? "",
                    knowledgeSummary: t.knowledgeSummary ?? "",
                    example: t.example ?? "",
                  }}
                />
              </div>
            </details>
          </li>
        ))}
      </ul>
      <section className="mt-8 rounded-2xl border border-dashed border-primary/40 bg-white p-4">
        <h2 className="mb-3 font-bold">Thêm dạng toán</h2>
        <CrudForm fields={fields} endpoint="/api/admin/topics" method="POST" submitLabel="Thêm dạng toán" initial={{ chapterId: chapters[0]?.id ?? "", status: "DRAFT", sortOrder: "0" }} />
      </section>
    </>
  );
}
