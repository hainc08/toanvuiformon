"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/state";

interface AnswerItem {
  position: number;
  correctLabel: string | null;
  answerHtml: string;
  solutionHtml: string;
}

/** Answers are NOT in the initial HTML; they are fetched only when the learner asks. */
export function AnswerPanel({ worksheetId }: { worksheetId: string }) {
  const [items, setItems] = useState<AnswerItem[] | null>(null);
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function toggle() {
    if (visible) {
      setVisible(false);
      return;
    }
    if (!items) {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/worksheets/${worksheetId}/answers`);
        if (!res.ok) throw new Error();
        const data = (await res.json()) as { items: AnswerItem[] };
        setItems(data.items);
      } catch {
        setError("Không tải được đáp án. Vui lòng thử lại.");
        setLoading(false);
        return;
      }
      setLoading(false);
    }
    setVisible(true);
  }

  return (
    <section aria-labelledby="answers-heading" className="mt-8 no-print">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-accent/40 bg-accent-soft/60 p-4">
        <div>
          <h2 id="answers-heading" className="font-bold">Đáp án và lời giải</h2>
          <p className="text-sm text-muted">Hãy tự làm bài trước, sau đó mới xem đáp án nhé!</p>
        </div>
        <Button variant={visible ? "outline" : "accent"} onClick={toggle} disabled={loading} aria-expanded={visible} aria-controls="answers">
          {loading ? <Loader2 className="animate-spin" /> : visible ? <EyeOff /> : <Eye />}
          {visible ? "Ẩn đáp án" : "Xem đáp án"}
        </Button>
      </div>
      {error ? <div className="mt-3"><Alert>{error}</Alert></div> : null}
      {visible && items ? (
        <ol id="answers" className="mt-4 space-y-3">
          {items.map((a) => (
            <li key={a.position} className="rounded-2xl border border-line bg-white p-4">
              <p className="font-bold text-secondary-dark">Câu {a.position}</p>
              <div className="mt-1 flex flex-wrap items-baseline gap-2">
                <span className="font-semibold">Đáp án:</span>
                {a.correctLabel ? <span className="font-bold">{a.correctLabel}.</span> : null}
                <div className="math-content math-inline" dangerouslySetInnerHTML={{ __html: a.answerHtml }} />
              </div>
              <details className="mt-2" open>
                <summary className="cursor-pointer text-sm font-semibold text-primary">Lời giải chi tiết</summary>
                <div className="math-content mt-2 text-[0.98rem]" dangerouslySetInnerHTML={{ __html: a.solutionHtml }} />
              </details>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
