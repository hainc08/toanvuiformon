import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { PageHeader } from "@/components/admin/page-header";
import { QuestionStatusBadge } from "@/components/admin/status-badge";
import { Pagination } from "@/components/layout/pagination";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/state";
import { requireAdminPage } from "@/lib/auth/guard";
import { DIFFICULTY_LABEL, QUESTION_STATUS_LABEL, QUESTION_TYPE_LABEL } from "@/lib/labels";
import { mathTextToPlain } from "@/lib/math/render";
import { formatDate } from "@/lib/utils";
import { adminQuestionListSchema } from "@/lib/validation/question";
import { catalogOptions } from "@/services/catalog-admin.service";
import { listAdminQuestions } from "@/services/question.service";

export const metadata = { title: "Ngân hàng câu hỏi" };

export default async function QuestionsPage({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireAdminPage("question:read");
  const raw = Object.fromEntries(Object.entries(await searchParams).filter(([, v]) => v));
  const parsed = adminQuestionListSchema.safeParse(raw);
  const { page, pageSize, ...filter } = parsed.success ? parsed.data : adminQuestionListSchema.parse({});
  const [result, grades] = await Promise.all([listAdminQuestions(filter, page, pageSize), catalogOptions()]);
  const chapters = grades.flatMap((g) => g.chapters.map((c) => ({ ...c, grade: g.name })));

  const hrefFor = (p: number) => {
    const s = new URLSearchParams(raw as Record<string, string>);
    s.set("page", String(p));
    return `/admin/questions?${s.toString()}`;
  };

  return (
    <>
      <PageHeader
        title="Ngân hàng câu hỏi"
        description={`${result.total} câu hỏi`}
        actions={
          <Button asChild>
            <Link href="/admin/questions/new">
              <Plus /> Tạo câu hỏi
            </Link>
          </Button>
        }
      />
      <form method="get" className="mb-4 grid gap-2 rounded-2xl border border-line bg-white p-3 sm:grid-cols-2 lg:grid-cols-[2fr_1.5fr_1fr_1fr_1fr_auto]">
        <Input name="q" placeholder="Tìm mã, nội dung, tag…" defaultValue={filter.q ?? ""} aria-label="Từ khóa" />
        <Select name="chapterId" defaultValue={filter.chapterId ?? ""} aria-label="Chương">
          <option value="">Tất cả chương</option>
          {chapters.map((c) => (
            <option key={c.id} value={c.id}>
              {c.grade} · C{c.number}. {c.title}
            </option>
          ))}
        </Select>
        <Select name="status" defaultValue={filter.status ?? ""} aria-label="Trạng thái">
          <option value="">Mọi trạng thái</option>
          {Object.entries(QUESTION_STATUS_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <Select name="difficulty" defaultValue={filter.difficulty ?? ""} aria-label="Mức độ">
          <option value="">Mọi mức độ</option>
          {Object.entries(DIFFICULTY_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <Select name="type" defaultValue={filter.type ?? ""} aria-label="Loại câu hỏi">
          <option value="">Mọi loại</option>
          {Object.entries(QUESTION_TYPE_LABEL).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </Select>
        <Button type="submit" variant="outline">
          <Search /> Lọc
        </Button>
      </form>

      {result.items.length === 0 ? (
        <EmptyState title="Không có câu hỏi phù hợp" />
      ) : (
        <div className="overflow-x-auto rounded-2xl border border-line bg-white">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-slate-50 text-left text-xs uppercase text-muted">
              <tr>
                <th scope="col" className="px-3 py-2">Mã</th>
                <th scope="col" className="px-3 py-2">Nội dung</th>
                <th scope="col" className="px-3 py-2">Chương / Dạng</th>
                <th scope="col" className="px-3 py-2">Mức độ</th>
                <th scope="col" className="px-3 py-2">Trạng thái</th>
                <th scope="col" className="px-3 py-2">Cập nhật</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {result.items.map((q) => (
                <tr key={q.id} className="hover:bg-slate-50">
                  <td className="whitespace-nowrap px-3 py-2 font-mono text-xs">
                    <Link href={`/admin/questions/${q.id}`} className="font-semibold text-primary hover:underline">
                      {q.code}
                    </Link>
                    <span className="block text-muted">v{q.currentVersion}</span>
                  </td>
                  <td className="max-w-md px-3 py-2">
                    <span className="line-clamp-2">{mathTextToPlain(q.content, 140)}</span>
                    {q._count.reports > 0 ? <span className="mt-1 inline-block text-xs font-semibold text-danger">⚑ {q._count.reports} báo lỗi</span> : null}
                  </td>
                  <td className="px-3 py-2 text-xs">
                    C{q.chapter.number} · {q.topic.title}
                    <span className="block text-muted">{QUESTION_TYPE_LABEL[q.type]}</span>
                  </td>
                  <td className="px-3 py-2">{DIFFICULTY_LABEL[q.difficulty]}</td>
                  <td className="px-3 py-2"><QuestionStatusBadge status={q.status} /></td>
                  <td className="whitespace-nowrap px-3 py-2 text-xs text-muted">{formatDate(q.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <Pagination page={result.page} totalPages={result.totalPages} hrefFor={hrefFor} />
    </>
  );
}
