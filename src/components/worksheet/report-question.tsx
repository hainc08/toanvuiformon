"use client";

import { useState } from "react";
import { Flag } from "lucide-react";

const REASONS = [
  { value: "WRONG_ANSWER", label: "Đáp án sai" },
  { value: "TYPO", label: "Lỗi chính tả / công thức" },
  { value: "UNCLEAR", label: "Đề khó hiểu" },
  { value: "OTHER", label: "Khác" },
] as const;

/** Inline (no popup) anonymous error report. */
export function ReportQuestion({ questionId, position }: { questionId: string; position: number }) {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [message, setMessage] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setState("sending");
    try {
      const res = await fetch(`/api/questions/${questionId}/report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: form.get("reason"), message: String(form.get("message") ?? "").slice(0, 500) || undefined }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: { message?: string } } | null;
        setMessage(data?.error?.message ?? "Không gửi được. Vui lòng thử lại.");
        setState("error");
        return;
      }
      setState("done");
    } catch {
      setMessage("Không gửi được. Vui lòng kiểm tra kết nối mạng.");
      setState("error");
    }
  }

  if (state === "done") return <p className="mt-3 text-xs text-success no-print">Cảm ơn bạn! Thầy cô sẽ kiểm tra lại câu {position}.</p>;

  return (
    <details className="mt-3 text-sm no-print">
      <summary className="inline-flex cursor-pointer items-center gap-1 text-xs text-muted hover:text-danger">
        <Flag className="size-3.5" aria-hidden="true" /> Báo lỗi câu này
      </summary>
      <form onSubmit={onSubmit} className="mt-2 space-y-2 rounded-xl bg-slate-50 p-3">
        <fieldset className="flex flex-wrap gap-x-4 gap-y-1">
          <legend className="sr-only">Loại lỗi</legend>
          {REASONS.map((r, i) => (
            <label key={r.value} className="flex items-center gap-1.5">
              <input type="radio" name="reason" value={r.value} defaultChecked={i === 0} /> {r.label}
            </label>
          ))}
        </fieldset>
        <label className="block">
          <span className="sr-only">Mô tả thêm (không bắt buộc)</span>
          <input name="message" maxLength={500} placeholder="Mô tả thêm (không ghi thông tin cá nhân)" className="h-10 w-full rounded-lg border border-line px-3" />
        </label>
        <button type="submit" disabled={state === "sending"} className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50">
          {state === "sending" ? "Đang gửi…" : "Gửi báo lỗi"}
        </button>
        {state === "error" ? <p className="text-xs text-danger" role="alert">{message}</p> : null}
      </form>
    </details>
  );
}
