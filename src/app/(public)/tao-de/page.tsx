import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EmptyState } from "@/components/ui/state";
import { GeneratorForm, type GeneratorTree } from "@/components/worksheet/generator-form";
import { getGradeTree } from "@/services/catalog.service";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Tạo đề luyện tập",
  description: "Tự tạo đề Toán lớp 6 theo chương, dạng toán, mức độ và số câu. Tải PDF đề bài và đáp án riêng.",
  alternates: { canonical: "/tao-de" },
};

export default async function GeneratorPage({ searchParams }: { searchParams: Promise<{ topic?: string; chapter?: string }> }) {
  const sp = await searchParams;
  const tree = await getGradeTree("lop-6");
  const data: GeneratorTree | null = tree
    ? {
        grade: { slug: tree.slug, name: tree.name },
        chapters: tree.chapters.map((c) => ({
          id: c.id,
          number: c.number,
          title: c.title,
          topics: c.topics.map((t) => ({ id: t.id, title: t.title, questionCount: t._count.questions })),
        })),
      }
    : null;

  return (
    <>
      <Breadcrumbs items={[{ label: "Tạo đề" }]} />
      <h1 className="text-3xl font-extrabold sm:text-4xl">Tạo đề luyện tập</h1>
      <p className="mt-2 max-w-2xl text-muted">
        Chọn phạm vi kiến thức, mức độ và số câu. Toán Vui sẽ chọn ngẫu nhiên các câu hỏi đã được duyệt từ ngân hàng câu hỏi.
      </p>
      <div className="mt-6">
        {data ? <GeneratorForm tree={data} initialTopicId={sp.topic} initialChapterId={sp.chapter} /> : <EmptyState title="Chưa có dữ liệu lớp 6" />}
      </div>
    </>
  );
}
