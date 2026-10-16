import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Lightbulb, Wand2 } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { MathHtml } from "@/components/math/math-html";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/state";
import { WorksheetGrid } from "@/components/worksheet/worksheet-card";
import { getTopicPage } from "@/services/catalog.service";
import { listPublicWorksheets } from "@/services/worksheet.service";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ grade: string; chapter: string; topic: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { grade, chapter, topic } = await params;
  const data = await getTopicPage(grade, chapter, topic);
  if (!data) return { title: "Không tìm thấy" };
  return {
    title: `${data.title} — Bài tập Toán ${data.chapter.grade.name}`,
    description: data.summary ?? `Tóm tắt kiến thức, ví dụ và bộ đề dạng ${data.title}.`,
    alternates: { canonical: `/${grade}/${chapter}/${topic}` },
  };
}

export default async function TopicPage({ params }: Props) {
  const { grade, chapter, topic: topicSlug } = await params;
  const topic = await getTopicPage(grade, chapter, topicSlug);
  if (!topic) notFound();
  const worksheets = await listPublicWorksheets({ gradeSlug: grade, chapterSlug: chapter, topicSlug }, 1, 12);

  return (
    <>
      <Breadcrumbs
        items={[
          { label: topic.chapter.grade.name, href: `/${grade}` },
          { label: `Chương ${topic.chapter.number}`, href: `/${grade}/${chapter}` },
          { label: topic.title },
        ]}
      />
      <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
        <div className="min-w-0">
          <header className="mb-6">
            <p className="font-semibold text-secondary-dark">
              Chương {topic.chapter.number}: {topic.chapter.title}
            </p>
            <h1 className="text-3xl font-extrabold sm:text-4xl">{topic.title}</h1>
            {topic.summary ? <p className="mt-2 text-muted">{topic.summary}</p> : null}
          </header>

          {topic.knowledgeSummaryHtml ? (
            <section aria-labelledby="kien-thuc" className="mb-6 rounded-2xl border border-line bg-white p-5">
              <h2 id="kien-thuc" className="mb-3 flex items-center gap-2 text-xl font-bold">
                <Lightbulb className="size-5 text-accent" aria-hidden="true" /> Tóm tắt kiến thức
              </h2>
              <MathHtml html={topic.knowledgeSummaryHtml} className="leading-relaxed" />
            </section>
          ) : null}

          {topic.exampleHtml ? (
            <section aria-labelledby="vi-du" className="mb-8 rounded-2xl border border-secondary/30 bg-secondary-soft/40 p-5">
              <h2 id="vi-du" className="mb-2 text-lg font-bold">Ví dụ minh họa</h2>
              <MathHtml html={topic.exampleHtml} />
            </section>
          ) : null}

          <section aria-labelledby="bo-de-dang">
            <h2 id="bo-de-dang" className="mb-4 text-2xl font-bold">Bộ đề thuộc dạng toán này</h2>
            {worksheets.items.length === 0 ? (
              <EmptyState
                title="Chưa có bộ đề cho dạng toán này"
                description={topic.questionCount > 0 ? `Ngân hàng đang có ${topic.questionCount} câu hỏi. Hãy tạo đề luyện tập tự động.` : "Nội dung đang được thầy cô biên soạn."}
                action={
                  topic.questionCount > 0 ? (
                    <Button asChild>
                      <Link href={`/tao-de?topic=${topic.id}`}>
                        <Wand2 /> Tạo đề từ dạng này
                      </Link>
                    </Button>
                  ) : undefined
                }
              />
            ) : (
              <WorksheetGrid items={worksheets.items} />
            )}
          </section>
        </div>

        <aside aria-label="Các dạng toán trong chương" className="lg:sticky lg:top-24 lg:self-start">
          <p className="mb-2 text-sm font-bold uppercase tracking-wide text-muted">Cùng chương</p>
          <ul className="space-y-1">
            {topic.chapter.topics.map((t) => (
              <li key={t.slug}>
                <Link
                  href={`/${grade}/${chapter}/${t.slug}`}
                  aria-current={t.slug === topic.slug ? "page" : undefined}
                  className={cn("block rounded-xl px-3 py-2 text-sm", t.slug === topic.slug ? "bg-primary-soft font-bold text-primary-dark" : "hover:bg-white")}
                >
                  {t.title}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </>
  );
}
