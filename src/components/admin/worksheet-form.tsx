"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input, Label, Select, Textarea } from "@/components/ui/form";
import { Alert } from "@/components/ui/state";
import { DIFFICULTY_LABEL } from "@/lib/labels";
import type { CatalogOption } from "./question-editor";
import { api } from "./api";

export interface WorksheetFormValue {
  title: string;
  slug: string;
  description: string;
  gradeId: string;
  chapterId: string;
  topicId: string;
  difficulty: string;
  durationMinutes: string;
  isFeatured: boolean;
  questionCodes: string;
}

export function WorksheetForm({ catalog, initial, worksheetId }: { catalog: CatalogOption[]; initial?: WorksheetFormValue; worksheetId?: string }) {
  const router = useRouter();
  const [v, setV] = useState<WorksheetFormValue>(
    initial ?? { title: "", slug: "", description: "", gradeId: catalog[0]?.id ?? "", chapterId: "", topicId: "", difficulty: "", durationMinutes: "30", isFeatured: false, questionCodes: "" },
  );
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const grade = catalog.find((g) => g.id === v.gradeId);
  const chapter = grade?.chapters.find((c) => c.id === v.chapterId);
  const set = <K extends keyof WorksheetFormValue>(k: K, val: WorksheetFormValue[K]) => setV((p) => ({ ...p, [k]: val }));

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPending(true);
    setError(null);
    setNotice(null);
    const body = {
      title: v.title,
      slug: v.slug || undefined,
      description: v.description || null,
      gradeId: v.gradeId,
      chapterId: v.chapterId || null,
      topicId: v.topicId || null,
      difficulty: v.difficulty || null,
      durationMinutes: Number(v.durationMinutes),
      isFeatured: v.isFeatured,
      questionCodes: v.questionCodes.split(/[\s,;]+/).map((s) => s.trim().toUpperCase()).filter(Boolean),
    };
    const res = worksheetId ? await api(`/api/admin/worksheets/${worksheetId}`, "PATCH", body) : await api<{ id: string }>("/api/admin/worksheets", "POST", body);
    setPending(false);
    if (!res.ok) {
      setError(res.error);
      return;
    }
    if (!worksheetId) {
      router.push(`/admin/worksheets/${(res.data as { id: string }).id}`);
      return;
    }
    setNotice("Đã lưu. Các câu hỏi được gắn với phiên bản mới nhất đã xuất bản.");
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-line bg-white p-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Label htmlFor="ws-title">Tiêu đề</Label>
        <Input id="ws-title" value={v.title} onChange={(e) => set("title", e.target.value)} required minLength={5} />
      </div>
      <div>
        <Label htmlFor="ws-slug">Slug (để trống = tự tạo từ tiêu đề)</Label>
        <Input id="ws-slug" value={v.slug} onChange={(e) => set("slug", e.target.value)} placeholder="bai-tap-..." />
      </div>
      <div>
        <Label htmlFor="ws-duration">Thời gian đề xuất (phút)</Label>
        <Input id="ws-duration" type="number" min={5} max={180} value={v.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} />
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="ws-desc">Mô tả</Label>
        <Textarea id="ws-desc" rows={2} className="font-sans" value={v.description} onChange={(e) => set("description", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="ws-grade">Lớp</Label>
        <Select id="ws-grade" value={v.gradeId} onChange={(e) => setV((p) => ({ ...p, gradeId: e.target.value, chapterId: "", topicId: "" }))}>
          {catalog.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="ws-chapter">Chương</Label>
        <Select id="ws-chapter" value={v.chapterId} onChange={(e) => setV((p) => ({ ...p, chapterId: e.target.value, topicId: "" }))}>
          <option value="">— Nhiều chương —</option>
          {grade?.chapters.map((c) => (
            <option key={c.id} value={c.id}>Chương {c.number}: {c.title}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="ws-topic">Dạng toán</Label>
        <Select id="ws-topic" value={v.topicId} onChange={(e) => set("topicId", e.target.value)} disabled={!chapter}>
          <option value="">— Nhiều dạng —</option>
          {chapter?.topics.map((t) => (
            <option key={t.id} value={t.id}>{t.title}</option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="ws-diff">Mức độ</Label>
        <Select id="ws-diff" value={v.difficulty} onChange={(e) => set("difficulty", e.target.value)}>
          <option value="">Tổng hợp</option>
          {Object.entries(DIFFICULTY_LABEL).map(([k, l]) => (
            <option key={k} value={k}>{l}</option>
          ))}
        </Select>
      </div>
      <div className="sm:col-span-2">
        <Label htmlFor="ws-codes">Mã câu hỏi theo thứ tự (mỗi dòng một mã, chỉ câu đã xuất bản)</Label>
        <Textarea id="ws-codes" rows={8} value={v.questionCodes} onChange={(e) => set("questionCodes", e.target.value)} placeholder={"T6-C1-001\nT6-C1-002"} required />
      </div>
      <label className="flex items-center gap-2 sm:col-span-2">
        <input type="checkbox" checked={v.isFeatured} onChange={(e) => set("isFeatured", e.target.checked)} className="size-4" /> Bộ đề nổi bật (hiện trên trang chủ)
      </label>
      {error ? <div className="sm:col-span-2"><Alert>{error}</Alert></div> : null}
      {notice ? <div className="sm:col-span-2"><Alert tone="success">{notice}</Alert></div> : null}
      <div className="sm:col-span-2">
        <Button type="submit" disabled={pending}>
          {pending ? <Loader2 className="animate-spin" /> : <Save />} {worksheetId ? "Lưu bộ đề" : "Tạo bộ đề (nháp)"}
        </Button>
      </div>
    </form>
  );
}
