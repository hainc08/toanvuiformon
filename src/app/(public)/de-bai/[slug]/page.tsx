import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Clock, ListOrdered } from "lucide-react";
import { Breadcrumbs, type Crumb } from "@/components/layout/breadcrumbs";
import { AnswerPanel } from "@/components/worksheet/answer-panel";
import { DifficultyBadge } from "@/components/worksheet/difficulty-badge";
import { QuestionList } from "@/components/worksheet/question-list";
import { WorksheetActions } from "@/components/worksheet/worksheet-actions";
import { worksheetKeySchema } from "@/lib/validation/common";
import { getWorksheet, toPublicQuestions } from "@/services/worksheet.service";
import { mathTextToPlain } from "@/lib/math/render";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ slug: string }> };

async function load(slug: string) {
  const key = worksheetKeySchema.safeParse(slug);
  if (!key.success) return null;
  return getWorksheet(key.data);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const ws = await load((await params).slug);
  if (!ws) return { title: "Không tìm thấy bộ đề" };
  const first = ws.items[0] ? mathTextToPlain(ws.items[0].snapshot.content, 100) : "";
  const description = ws.description ?? `${ws.questionCount} câu, ${ws.durationMinutes} phút. ${first}`;
  return {
    title: ws.title,
    description,
    alternates: { canonical: `/de-bai/${ws.slug}` },
    openGraph: { title: ws.title, description, url: `/de-bai/${ws.slug}`, type: "article" },
    // User-generated worksheets are not indexed (avoid thin/duplicate pages).
    robots: ws.kind === "GENERATED" ? { index: false, follow: false } : undefined,
  };
}

export default async function WorksheetPage({ params }: Props) {
  const ws = await load((await params).slug);
  if (!ws) notFound();
  const questions = toPublicQuestions(ws);
  const questionIds = Object.fromEntries(ws.items.map((i) => [i.position, i.questionId]));

  const crumbs: Crumb[] = [{ label: ws.grade.name, href: `/${ws.grade.slug}` }];
  if (ws.chapter) crumbs.push({ label: `Chương ${ws.chapter.number}`, href: `/${ws.grade.slug}/${ws.chapter.slug}` });
  if (ws.topic && ws.chapter) crumbs.push({ label: ws.topic.title, href: `/${ws.grade.slug}/${ws.chapter.slug}/${ws.topic.slug}` });
  crumbs.push({ label: ws.kind === "GENERATED" ? "Đề tự tạo" : "Bộ đề" });

  return (
    <article>
      <Breadcrumbs items={crumbs} />
      <header className="mb-6 rounded-3xl border border-line bg-white p-5 sm:p-7">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <DifficultyBadge difficulty={ws.difficulty} />
          {ws.kind === "GENERATED" ? <span className="text-xs font-semibold text-muted">Đề tự tạo</span> : null}
        </div>
        <h1 className="text-2xl font-extrabold leading-tight sm:text-3xl">{ws.title}</h1>
        {ws.description ? <p className="mt-2 text-muted">{ws.description}</p> : null}
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm sm:flex sm:flex-wrap sm:gap-6">
          {ws.chapter ? (
            <div className="col-span-2">
              <dt className="text-muted">Chương</dt>
              <dd className="font-semibold">
                {ws.chapter.number}. {ws.chapter.title}
              </dd>
            </div>
          ) : null}
          {ws.topic ? (
            <div className="col-span-2">
              <dt className="text-muted">Dạng toán</dt>
              <dd className="font-semibold">{ws.topic.title}</dd>
            </div>
          ) : null}
          <div>
            <dt className="text-muted">Số câu</dt>
            <dd className="flex items-center gap-1 font-semibold">
              <ListOrdered className="size-4" aria-hidden="true" /> {ws.questionCount}
            </dd>
          </div>
          <div>
            <dt className="text-muted">Thời gian đề xuất</dt>
            <dd className="flex items-center gap-1 font-semibold">
              <Clock className="size-4" aria-hidden="true" /> {ws.durationMinutes} phút
            </dd>
          </div>
        </dl>
        <div className="mt-5">
          <WorksheetActions worksheetId={ws.id} />
        </div>
      </header>

      <section aria-labelledby="de-bai-heading">
        <h2 id="de-bai-heading" className="mb-3 text-xl font-bold">Đề bài</h2>
        <QuestionList questions={questions} questionIds={questionIds} />
      </section>

      <AnswerPanel worksheetId={ws.id} />
    </article>
  );
}
