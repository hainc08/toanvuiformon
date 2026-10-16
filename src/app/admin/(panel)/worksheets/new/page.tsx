import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { WorksheetForm } from "@/components/admin/worksheet-form";
import { requireAdminPage } from "@/lib/auth/guard";
import { catalogOptions } from "@/services/catalog-admin.service";

export const metadata = { title: "Tạo bộ đề" };

export default async function NewWorksheetPage() {
  await requireAdminPage("worksheet:write");
  return (
    <>
      <Link href="/admin/worksheets" className="text-sm text-primary hover:underline">← Bộ đề</Link>
      <PageHeader title="Tạo bộ đề" description="Nhập mã các câu hỏi đã xuất bản. Mỗi câu được gắn cố định với phiên bản hiện tại để đề và đáp án luôn khớp." />
      <WorksheetForm catalog={await catalogOptions()} />
    </>
  );
}
