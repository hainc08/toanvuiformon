import { PageHeader } from "@/components/admin/page-header";
import { CrudForm } from "@/components/admin/crud-form";
import { chapterFields } from "@/components/admin/catalog-fields";
import { PublishStatusBadge } from "@/components/admin/status-badge";
import { requireAdminPage } from "@/lib/auth/guard";
import { listChaptersAdmin, listGradesAdmin } from "@/services/catalog-admin.service";

export const metadata = { title: "Chương học" };

export default async function ChaptersPage() {
  await requireAdminPage("catalog:manage");
  const [chapters, grades] = await Promise.all([listChaptersAdmin(), listGradesAdmin()]);
  const fields = chapterFields(grades);
  return (
    <>
      <PageHeader title="Chương học" description="Chỉ xóa được chương chưa có dạng toán/câu hỏi; nếu không, hãy chuyển sang Lưu trữ." />
      <ul className="space-y-3">
        {chapters.map((c) => (
          <li key={c.id} className="rounded-2xl border border-line bg-white p-4">
            <details>
              <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                <span className="font-bold">{c.grade.name} · Chương {c.number}: {c.title}</span>
                <PublishStatusBadge status={c.status} />
                <span className="text-xs text-muted">{c._count.topics} dạng · {c._count.questions} câu · {c._count.worksheets} bộ đề</span>
              </summary>
              <div className="mt-4">
                <CrudForm
                  fields={fields}
                  endpoint={`/api/admin/chapters/${c.id}`}
                  deleteEndpoint={`/api/admin/chapters/${c.id}`}
                  method="PATCH"
                  submitLabel="Lưu"
                  initial={{ gradeId: c.gradeId, number: String(c.number), title: c.title, slug: c.slug, status: c.status, summary: c.summary ?? "", keyPoints: c.keyPoints.join("\n") }}
                />
              </div>
            </details>
          </li>
        ))}
      </ul>
      <section className="mt-8 rounded-2xl border border-dashed border-primary/40 bg-white p-4">
        <h2 className="mb-3 font-bold">Thêm chương</h2>
        <CrudForm fields={fields} endpoint="/api/admin/chapters" method="POST" submitLabel="Thêm chương" initial={{ gradeId: grades[0]?.id ?? "", status: "DRAFT" }} />
      </section>
    </>
  );
}
