"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Alert } from "@/components/ui/state";
import { renderMathText } from "@/lib/math/render";
import { DIFFICULTY_LABEL, QUESTION_TYPE_LABEL } from "@/lib/labels";
import { api } from "./api";

export interface CatalogOption {
  id: string;
  name: string;
  chapters: { id: string; number: number; title: string; topics: { id: string; title: string }[] }[];
}

type QType = "ESSAY" | "SINGLE_CHOICE" | "SHORT_ANSWER" | "TRUE_FALSE";
type Diff = "BASIC" | "APPLIED" | "ADVANCED";
interface OptionRow {
  label: "A" | "B" | "C" | "D" | "E" | "F";
  content: string;
  isCorrect: boolean;
}

export interface QuestionFormValue {
  topicId: string;
  difficulty: Diff;
  type: QType;
  content: string;
  answer: string;
  solution: string;
  tags: string[];
  source: string | null;
  options: OptionRow[];
}

const DEFAULT_OPTIONS: OptionRow[] = (["A", "B", "C", "D"] as const).map((label, i) => ({ label, content: "", isCorrect: i === 0 }));

function Preview({ source }: { source: string }) {
  const html = useMemo(() => renderMathText(source), [source]);
  if (!source.trim()) return <p className="text-xs text-muted">Xem trước sẽ hiển thị ở đây.</p>;
  return <div className="math-content rounded-xl bg-slate-50 p-3 text-sm" dangerouslySetInnerHTML={{ __html: html }} />;
}

export function QuestionEditor({ catalog, initial, questionId }: { catalog: CatalogOption[]; initial?: QuestionFormValue; questionId?: string }) {
  const router = useRouter();
  const [v, setV] = useState<QuestionFormValue>(
    initial ?? { topicId: "", difficulty: "BASIC", type: "ESSAY", content: "", answer: "", solution: "", tags: [], source: null, options: [] },
  );
  const [tagsText, setTagsText] = useState((initial?.tags ?? []).join(", "));
  const [changeNote, setChangeNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isChoice = v.type === "SINGLE_CHOICE" || v.type === "TRUE_FALSE";
  const set = <K extends keyof QuestionFormValue>(k: K, val: QuestionFormValue[K]) => setV((p) => ({ ...p, [k]: val }));

  function setType(type: QType) {
    setV((p) => ({
      ...p,
      type,
      options:
        type === "SINGLE_CHOICE"
          ? p.options.length ? p.options : DEFAULT_OPTIONS
          : type === "TRUE_FALSE"
            ? [
                { label: "A", content: "Đúng", isCorrect: true },
                { label: "B", content: "Sai", isCorrect: false },
              ]
            : [],
    }));
  }

  function setOption(i: number, patch: Partial<OptionRow>) {
    setV((p) => ({
      ...p,
      options: p.options.map((o, idx) => (idx === i ? { ...o, ...patch } : patch.isCorrect ? { ...o, isCorrect: false } : o)),
    }));
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    const body = {
      ...v,
      tags: tagsText.split(",").map((t) => t.trim()).filter(Boolean),
      source: v.source || null,
      options: isChoice ? v.options : [],
      changeNote: changeNote || undefined,
    };
    const res = questionId
      ? await api<{ sentBackToReview?: boolean }>(`/api/admin/questions/${questionId}`, "PATCH", body)
      : await api<{ id: string }>("/api/admin/questions", "POST", body);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (!questionId && res.data && "id" in res.data) {
      router.push(`/admin/questions/${(res.data as { id: string }).id}`);
      return;
    }
    setNotice((res.data as { sentBackToReview?: boolean })?.sentBackToReview ? "Đã lưu. Nội dung thay đổi nên câu hỏi được chuyển về trạng thái Chờ duyệt." : "Đã lưu.");
    setChangeNote("");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="grid gap-4 rounded-2xl border border-line bg-white p-4 sm:grid-cols-3">
        <div className="sm:col-span-3">
          <Label htmlFor="topicId">Dạng toán</Label>
          <Select id="topicId" value={v.topicId} onChange={(e) => set("topicId", e.target.value)} required>
            <option value="">— Chọn dạng toán —</option>
            {catalog.map((g) =>
              g.chapters.map((c) => (
                <optgroup key={c.id} label={`${g.name} · Chương ${c.number}: ${c.title}`}>
                  {c.topics.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.title}
                    </option>
                  ))}
                </optgroup>
              )),
            )}
          </Select>
        </div>
        <div>
          <Label htmlFor="difficulty">Mức độ</Label>
          <Select id="difficulty" value={v.difficulty} onChange={(e) => set("difficulty", e.target.value as Diff)}>
            {Object.entries(DIFFICULTY_LABEL).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="type">Loại câu hỏi</Label>
          <Select id="type" value={v.type} onChange={(e) => setType(e.target.value as QType)}>
            {Object.entries(QUESTION_TYPE_LABEL).map(([k, l]) => (
              <option key={k} value={k}>{l}</option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="tags">Tags (phân cách bằng dấu phẩy)</Label>
          <Input id="tags" value={tagsText} onChange={(e) => setTagsText(e.target.value)} />
        </div>
      </div>

      <p className="text-xs text-muted">
        Định dạng: văn bản thường, công thức trong <code>$...$</code> (cùng dòng) hoặc <code>$$...$$</code> (riêng dòng), in đậm <code>**chữ**</code>, gạch đầu dòng <code>- </code>. Không dùng HTML.
      </p>

      {(
        [
          ["content", "Nội dung câu hỏi", 5],
          ["answer", "Đáp án (ngắn gọn)", 2],
          ["solution", "Lời giải từng bước", 7],
        ] as const
      ).map(([key, label, rows]) => (
        <div key={key} className="grid gap-3 rounded-2xl border border-line bg-white p-4 lg:grid-cols-2">
          <div>
            <Label htmlFor={key}>{label}</Label>
            <Textarea id={key} rows={rows} value={v[key]} onChange={(e) => set(key, e.target.value)} required />
          </div>
          <div>
            <p className="mb-1.5 text-sm font-semibold">Xem trước</p>
            <Preview source={v[key]} />
          </div>
        </div>
      ))}

      {isChoice ? (
        <fieldset className="rounded-2xl border border-line bg-white p-4">
          <legend className="px-1 text-sm font-semibold">Phương án (chọn đúng một phương án đúng)</legend>
          <div className="space-y-3">
            {v.options.map((o, i) => (
              <div key={o.label} className="grid items-start gap-2 lg:grid-cols-[auto_1fr_1fr]">
                <label className="flex items-center gap-2 pt-2 font-bold">
                  <input type="radio" name="correct" checked={o.isCorrect} onChange={() => setOption(i, { isCorrect: true })} aria-label={`Phương án ${o.label} đúng`} />
                  {o.label}.
                </label>
                <Input value={o.content} onChange={(e) => setOption(i, { content: e.target.value })} aria-label={`Nội dung phương án ${o.label}`} required />
                <Preview source={o.content} />
              </div>
            ))}
          </div>
        </fieldset>
      ) : null}

      <div className="grid gap-4 rounded-2xl border border-line bg-white p-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="source">Nguồn / ghi chú tác giả</Label>
          <Input id="source" value={v.source ?? ""} onChange={(e) => set("source", e.target.value)} placeholder="Không chép nguyên văn sách có bản quyền" />
        </div>
        {questionId ? (
          <div>
            <Label htmlFor="changeNote">Ghi chú thay đổi (lưu vào lịch sử)</Label>
            <Input id="changeNote" value={changeNote} onChange={(e) => setChangeNote(e.target.value)} />
          </div>
        ) : null}
      </div>

      {error ? <Alert>{error}</Alert> : null}
      {notice ? <Alert tone="success">{notice}</Alert> : null}
      <Button type="submit" size="lg" disabled={pending}>
        {pending ? <Loader2 className="animate-spin" /> : <Save />} {questionId ? "Lưu thay đổi" : "Tạo câu hỏi (bản nháp)"}
      </Button>
    </form>
  );
}
