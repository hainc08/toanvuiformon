import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { EmptyState } from "@/components/ui/state";
import { getGradePage } from "@/services/catalog.service";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ grade: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const grade = await getGradePage((await params).grade);
  if (!grade) return { title: "Không tìm thấy" };
  return {
    title: `Toán ${grade.name} — Bài tập theo chương`,
    description: grade.description ?? `Bài tập Toán ${grade.name} theo chương, dạng toán và mức độ.`,
    alternates: { canonical: `/${grade.slug}` },
    openGraph: { title: `Toán ${grade.name} | Toán Vui`, url: `/${grade.slug}` },
  };
}

export default async function GradePage({ params }: Props) {
  const { grade: gradeSlug } = await params;
  if (!/^lop-\d{1,2}$/.test(gradeSlug)) notFound();
  const grade = await getGradePage(gradeSlug);
  if (!grade) notFound();

  return (
    <>
      <Breadcrumbs items={[{ label: grade.name }]} />
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Toán {grade.name}</h1>
        {grade.description ? <p className="mt-2 max-w-3xl text-muted">{grade.description}</p> : null}
      </header>
      {grade.chapters.length === 0 ? (
        <EmptyState title="Chưa có chương nào" description="Nội dung đang được cập nhật, bạn quay lại sau nhé." />
      ) : (
        <ul className="grid gap-4 md:grid-cols-2">
          {grade.chapters.map((c) => (
            <li key={c.id}>
              <article className="relative flex h-full flex-col rounded-2xl border border-line bg-white p-5 transition hover:border-primary hover:shadow-md">
                <div className="flex items-start gap-3">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-primary text-xl font-extrabold text-white">{c.number}</span>
                  <div>
                    <p className="text-sm font-semibold text-primary">Chương {c.number}</p>
                    <h2 className="text-lg font-bold leading-snug">
                      <Link href={`/${grade.slug}/${c.slug}`} className="after:absolute after:inset-0">
                        {c.title}
                      </Link>
                    </h2>
                  </div>
                </div>
                {c.summary ? <p className="mt-3 text-sm text-muted">{c.summary}</p> : null}
                {c.keyPoints.length > 0 ? (
                  <ul className="mt-3 space-y-1 text-sm" aria-label="Kiến thức chính">
                    {c.keyPoints.slice(0, 5).map((k) => (
                      <li key={k} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-secondary" aria-hidden="true" />
                        {k}
                      </li>
                    ))}
                  </ul>
                ) : null}
                <p className="mt-auto flex gap-4 pt-4 text-sm font-semibold text-slate-700">
                  <span>{c.topicCount} dạng bài</span>
                  <span>{c.worksheetCount} bộ đề</span>
                  <span>{c.questionCount} câu hỏi</span>
                </p>
              </article>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
