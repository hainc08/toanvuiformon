import type { PublicQuestionView } from "@/services/worksheet.service";
import { MathHtml } from "@/components/math/math-html";
import { DIFFICULTY_LABEL } from "@/lib/labels";
import { ReportQuestion } from "./report-question";

export function QuestionList({ questions, questionIds }: { questions: PublicQuestionView[]; questionIds: Record<number, string> }) {
  return (
    <ol className="space-y-4">
      {questions.map((q) => (
        <li key={q.position} id={`cau-${q.position}`} className="rounded-2xl border border-line bg-white p-4 sm:p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <h3 className="font-bold text-primary">Câu {q.position}</h3>
            <span className="text-xs font-medium text-muted">{DIFFICULTY_LABEL[q.difficulty]}</span>
          </div>
          <MathHtml html={q.contentHtml} className="text-[1.05rem] leading-relaxed" />
          {q.options.length > 0 ? (
            <ul className="mt-3 grid gap-2 sm:grid-cols-2" aria-label={`Các phương án câu ${q.position}`}>
              {q.options.map((o) => (
                <li key={o.label} className="flex items-start gap-2 rounded-xl border border-line px-3 py-2">
                  <span className="font-bold text-secondary-dark">{o.label}.</span>
                  <MathHtml html={o.contentHtml} inline />
                </li>
              ))}
            </ul>
          ) : null}
          {questionIds[q.position] ? <ReportQuestion questionId={questionIds[q.position]!} position={q.position} /> : null}
        </li>
      ))}
    </ol>
  );
}
