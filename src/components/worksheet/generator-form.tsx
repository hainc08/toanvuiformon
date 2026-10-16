"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Wand2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label, Select } from "@/components/ui/form";
import { Alert } from "@/components/ui/state";
import { cn } from "@/lib/utils";

export interface GeneratorTree {
  grade: { slug: string; name: string };
  chapters: { id: string; number: number; title: string; topics: { id: string; title: string; questionCount: number }[] }[];
}

const COUNTS = [10, 20, 30] as const;
const LEVELS = [
  { value: "MIXED", label: "Trộn các mức" },
  { value: "BASIC", label: "Cơ bản" },
  { value: "APPLIED", label: "Vận dụng" },
  { value: "ADVANCED", label: "Nâng cao" },
] as const;

export function GeneratorForm({ tree, initialTopicId, initialChapterId }: { tree: GeneratorTree; initialTopicId?: string; initialChapterId?: string }) {
  const router = useRouter();
  const initialChapter =
    tree.chapters.find((c) => c.topics.some((t) => t.id === initialTopicId))?.id ??
    tree.chapters.find((c) => c.id === initialChapterId)?.id ??
    tree.chapters.find((c) => c.topics.some((t) => t.questionCount > 0))?.id ??
    "";
  const [chapterId, setChapterId] = useState<string>(initialChapter);
  const [topicIds, setTopicIds] = useState<string[]>(initialTopicId ? [initialTopicId] : []);
  const [difficulty, setDifficulty] = useState<(typeof LEVELS)[number]["value"]>("MIXED");
  const [count, setCount] = useState<(typeof COUNTS)[number]>(10);
  const [shuffle, setShuffle] = useState(true);
  const [mixTopics, setMixTopics] = useState(!initialTopicId);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const chapter = useMemo(() => tree.chapters.find((c) => c.id === chapterId), [tree, chapterId]);
  const topics = chapter?.topics ?? tree.chapters.flatMap((c) => c.topics);
  const available = (mixTopics ? (topicIds.length ? topics.filter((t) => topicIds.includes(t.id)) : topics) : topics.filter((t) => topicIds.includes(t.id))).reduce(
    (s, t) => s + t.questionCount,
    0,
  );

  function toggleTopic(id: string) {
    setTopicIds((prev) => (mixTopics ? (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]) : [id]));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!mixTopics && topicIds.length !== 1) {
      setError("Hãy chọn một dạng toán, hoặc bật “Trộn nhiều dạng toán”.");
      return;
    }
    setPending(true);
    try {
      const res = await fetch("/api/worksheets/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ grade: tree.grade.slug, chapterId: chapterId || undefined, topicIds, difficulty, count, shuffle, mixTopics }),
      });
      const data = (await res.json().catch(() => null)) as { url?: string; error?: { message?: string } } | null;
      if (!res.ok || !data?.url) {
        setError(data?.error?.message ?? "Không tạo được đề. Vui lòng thử lại.");
        setPending(false);
        return;
      }
      router.push(data.url);
    } catch {
      setError("Không kết nối được máy chủ. Vui lòng kiểm tra mạng và thử lại.");
      setPending(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-6 rounded-3xl border border-line bg-white p-5 sm:p-7 lg:grid-cols-2" aria-describedby="gen-help">
      <div className="space-y-5">
        <div>
          <Label htmlFor="gen-grade">Lớp</Label>
          <Select id="gen-grade" value={tree.grade.slug} disabled>
            <option value={tree.grade.slug}>{tree.grade.name}</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="gen-chapter">Chương</Label>
          <Select
            id="gen-chapter"
            value={chapterId}
            onChange={(e) => {
              setChapterId(e.target.value);
              setTopicIds([]);
            }}
          >
            <option value="">Tất cả các chương</option>
            {tree.chapters.map((c) => (
              <option key={c.id} value={c.id}>
                Chương {c.number}: {c.title}
              </option>
            ))}
          </Select>
        </div>
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">Mức độ</legend>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {LEVELS.map((l) => (
              <label key={l.value} className={cn("cursor-pointer rounded-xl border px-3 py-2 text-center text-sm font-semibold", difficulty === l.value ? "border-primary bg-primary-soft text-primary-dark" : "border-line")}>
                <input type="radio" name="difficulty" value={l.value} checked={difficulty === l.value} onChange={() => setDifficulty(l.value)} className="sr-only" />
                {l.label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="mb-1.5 text-sm font-semibold">Số câu</legend>
          <div className="grid grid-cols-3 gap-2">
            {COUNTS.map((n) => (
              <label key={n} className={cn("cursor-pointer rounded-xl border px-3 py-2 text-center font-bold", count === n ? "border-primary bg-primary-soft text-primary-dark" : "border-line")}>
                <input type="radio" name="count" value={n} checked={count === n} onChange={() => setCount(n)} className="sr-only" />
                {n} câu
              </label>
            ))}
          </div>
        </fieldset>
        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="size-5 accent-[var(--color-primary)]" checked={shuffle} onChange={(e) => setShuffle(e.target.checked)} />
            Trộn thứ tự câu hỏi
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              className="size-5 accent-[var(--color-primary)]"
              checked={mixTopics}
              onChange={(e) => {
                setMixTopics(e.target.checked);
                if (!e.target.checked) setTopicIds((prev) => prev.slice(0, 1));
              }}
            />
            Trộn câu hỏi nhiều dạng toán
          </label>
        </div>
      </div>

      <div className="flex flex-col">
        <fieldset className="flex-1">
          <legend className="mb-1.5 text-sm font-semibold">
            Dạng toán {mixTopics ? "(chọn một hoặc nhiều; để trống = tất cả)" : "(chọn một)"}
          </legend>
          <ul className="max-h-80 space-y-1 overflow-y-auto rounded-xl border border-line p-2">
            {topics.map((t) => (
              <li key={t.id}>
                <label className={cn("flex cursor-pointer items-center justify-between gap-2 rounded-lg px-2 py-2 text-sm hover:bg-slate-50", t.questionCount === 0 && "opacity-50")}>
                  <span className="flex items-center gap-2">
                    <input
                      type={mixTopics ? "checkbox" : "radio"}
                      name="topic"
                      className="size-4 accent-[var(--color-primary)]"
                      checked={topicIds.includes(t.id)}
                      onChange={() => toggleTopic(t.id)}
                      disabled={t.questionCount === 0}
                    />
                    {t.title}
                  </span>
                  <span className="shrink-0 text-xs text-muted">{t.questionCount} câu</span>
                </label>
              </li>
            ))}
          </ul>
        </fieldset>
        <p id="gen-help" className="mt-3 text-sm text-muted" aria-live="polite">
          Ngân hàng hiện có khoảng <strong className="text-ink">{available}</strong> câu phù hợp phạm vi đã chọn (trước khi lọc mức độ).
        </p>
        {error ? (
          <div className="mt-3">
            <Alert>{error}</Alert>
          </div>
        ) : null}
        <Button type="submit" size="lg" className="mt-4 w-full" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Wand2 />}
          {pending ? "Đang tạo đề…" : "Tạo đề"}
        </Button>
      </div>
    </form>
  );
}
