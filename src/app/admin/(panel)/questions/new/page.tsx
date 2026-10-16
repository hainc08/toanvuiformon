import Link from "next/link";
import { PageHeader } from "@/components/admin/page-header";
import { QuestionEditor } from "@/components/admin/question-editor";
import { requireAdminPage } from "@/lib/auth/guard";
import { catalogOptions } from "@/services/catalog-admin.service";

export const metadata = { title: "Tạo câu hỏi" };

export default async function NewQuestionPage() {
  await requireAdminPage("question:write");
  const catalog = await catalogOptions();
  return (
    <>
      <Link href="/admin/questions" className="text-sm text-primary hover:underline">← Ngân hàng câu hỏi</Link>
      <PageHeader title="Tạo câu hỏi" description="Câu hỏi mới được lưu ở trạng thái Nháp, cần gửi duyệt và được quản trị viên xuất bản." />
      <QuestionEditor catalog={catalog} />
    </>
  );
}
