import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Pagination } from "@/components/layout/pagination";
import { EmptyState } from "@/components/ui/state";
import { DifficultyFilter } from "@/components/worksheet/difficulty-filter";
import { WorksheetGrid } from "@/components/worksheet/worksheet-card";
import { difficultySchema } from "@/lib/validation/common";
import { getChapterPage } from "@/services/catalog.service";
import { listPublicWorksheets } from "@/services/worksheet.service";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ grade: string; chapter: string }>; searchParams: Promise<{ difficulty?: string; page?: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { grade, chapter } = await params;
  const data = await getChapterPage(grade, chapter);
  if (!data) return { title: "Không tìm thấy" };
  return {
    title: `Chương ${data.number}: ${data.title} — Toán ${data.grade.name}`,
    description: data.summary ?? `Bài tập ${data.title} lớp ${data.grade.level}.`,
    alternates: { canonical: `/${grade}/${chapter}` },
  };
}

export default async function ChapterPage({ params, searchParams }: Props) {
  const { grade, chapter: chapterSlug } = await params;
  const sp = await searchParams;
  const chapter = await getChapterPage(grade, chapterSlug);
  if (!chapter) notFound();

  const difficulty = difficultySchema.safeParse(sp.difficulty).data;
  const page = Math.max(1, Number(sp.page) || 1);
  const worksheets = await listPublicWorksheets({ gradeSlug: grade, chapterSlug, difficulty }, page, 9);
  const base = `/${grade}/${chapterSlug}`;
  const qs = (d?: string, p?: number) => {
    const s = new URLSearchParams();
    if (d) s.set("difficulty", d);
    if (p && p > 1) s.set("page", String(p));
    const str = s.toString();
    return str ? `${base}?${str}#bo-de` : `${base}#bo-de`;
  };

  return (
    <>
      <Breadcrumbs items={[{ label: chapter.grade.name, href: `/${grade}` }, { label: `Chương ${chapter.number}` }]} />
      <header className="mb-8">
        <p className="font-semibold text-primary">Chương {chapter.number}</p>
        <h1 className="text-3xl font-extrabold sm:text-4xl">{chapter.title}</h1>
        {chapter.summary ? <p className="mt-2 max-w-3xl text-muted">{chapter.summary}</p> : null}
      </header>

      <section aria-labelledby="dang-toan" className="mb-12">
        <h2 id="dang-toan" className="mb-4 text-2xl font-bold">Dạng toán</h2>
        {chapter.topics.length === 0 ? (
          <EmptyState title="Chưa có dạng toán" />
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {chapter.topics.map((t, i) => (
              <li key={t.id}>
                <Link href={`${base}/${t.slug}`} className="group flex h-full items-start gap-3 rounded-2xl border border-line bg-white p-4 transition hover:border-secondary hover:shadow-md">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary-soft text-sm font-bold text-secondary-dark">{i + 1}</span>
                  <span className="flex-1">
                    <span className="block font-bold group-hover:text-secondary-dark">{t.title}</span>
                    {t.summary ? <span className="mt-0.5 block text-sm text-muted">{t.summary}</span> : null}
                    <span className="mt-2 block text-xs font-semibold text-slate-600">{t.questionCount > 0 ? `${t.questionCount} câu hỏi` : "Đang cập nhật"}</span>
                  </span>
                  <ArrowRight className="mt-1 size-4 text-slate-400" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="bo-de-heading" id="bo-de" className="scroll-mt-20">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 id="bo-de-heading" className="text-2xl font-bold">Bộ đề của chương</h2>
          <DifficultyFilter current={difficulty} hrefFor={(d) => qs(d)} />
        </div>
        {worksheets.items.length === 0 ? (
          <EmptyState
            title="Chưa có bộ đề phù hợp"
            description="Bạn có thể tự tạo một đề luyện tập từ ngân hàng câu hỏi."
            action={<Link href="/tao-de" className="font-semibold text-primary hover:underline">Tạo đề luyện tập →</Link>}
          />
        ) : (
          <WorksheetGrid items={worksheets.items} />
        )}
        <Pagination page={worksheets.page} totalPages={worksheets.totalPages} hrefFor={(p) => qs(difficulty, p)} />
      </section>
    </>
  );
}
