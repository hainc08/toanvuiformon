import { PageHeader } from "@/components/admin/page-header";
import { CrudForm } from "@/components/admin/crud-form";
import { gradeFields } from "@/components/admin/catalog-fields";
import { PublishStatusBadge } from "@/components/admin/status-badge";
import { requireAdminPage } from "@/lib/auth/guard";
import { listGradesAdmin } from "@/services/catalog-admin.service";

export const metadata = { title: "Lớp học" };

export default async function GradesPage() {
  await requireAdminPage("catalog:manage");
  const grades = await listGradesAdmin();
  return (
    <>
      <PageHeader title="Lớp học" description="Thêm lớp 7, 8, 9 khi có nội dung. Lớp ở trạng thái Nháp sẽ không hiển thị công khai." />
      <ul className="space-y-3">
        {grades.map((g) => (
          <li key={g.id} className="rounded-2xl border border-line bg-white p-4">
            <details>
              <summary className="flex cursor-pointer flex-wrap items-center gap-3">
                <span className="font-bold">{g.name}</span>
                <code className="text-xs text-muted">/{g.slug}</code>
                <PublishStatusBadge status={g.status} />
                <span className="text-xs text-muted">{g._count.chapters} chương · {g._count.questions} câu hỏi · {g._count.worksheets} bộ đề</span>
              </summary>
              <div className="mt-4">
                <CrudForm
                  fields={gradeFields}
                  endpoint={`/api/admin/grades/${g.id}`}
                  method="PATCH"
                  submitLabel="Lưu"
                  initial={{ level: String(g.level), name: g.name, slug: g.slug, status: g.status, description: g.description ?? "" }}
                />
              </div>
            </details>
          </li>
        ))}
      </ul>
      <section className="mt-8 rounded-2xl border border-dashed border-primary/40 bg-white p-4">
        <h2 className="mb-3 font-bold">Thêm lớp mới</h2>
        <CrudForm fields={gradeFields} endpoint="/api/admin/grades" method="POST" submitLabel="Thêm lớp" initial={{ status: "DRAFT" }} />
      </section>
    </>
  );
}
