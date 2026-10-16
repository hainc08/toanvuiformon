"use client";

import { useState } from "react";
import { FileUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/state";
import { api } from "./api";

const MAX_BYTES = 1024 * 1024;

interface ImportResult {
  dryRun: boolean;
  total: number;
  valid: number;
  created: number;
  errors: { row: number; messages: string[] }[];
}

export function ImportForm() {
  const [items, setItems] = useState<unknown[] | null>(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setResult(null);
    setError(null);
    setItems(null);
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_BYTES) {
      setError("File vượt quá 1 MB.");
      return;
    }
    setFileName(file.name);
    try {
      const json = JSON.parse(await file.text()) as unknown;
      const list = Array.isArray(json) ? json : (json as { items?: unknown[] }).items;
      if (!Array.isArray(list)) throw new Error();
      setItems(list);
    } catch {
      setError("File không phải JSON hợp lệ (cần một mảng câu hỏi hoặc { \"items\": [...] }).");
    }
  }

  async function run(dryRun: boolean) {
    if (!items) return;
    setPending(true);
    setError(null);
    const res = await api<ImportResult>("/api/admin/questions/import", "POST", { dryRun, items });
    setPending(false);
    if (res.data && "total" in res.data) setResult(res.data);
    if (!res.ok && !(res.data && "total" in res.data)) setError(res.error);
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-line bg-white p-4">
        <label htmlFor="import-file" className="mb-2 block text-sm font-semibold">Chọn file JSON (tối đa 1 MB, 500 câu)</label>
        <input id="import-file" type="file" accept="application/json,.json" onChange={onFile} className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary file:px-3 file:py-2 file:font-semibold file:text-white" />
        {items ? <p className="mt-2 text-sm text-muted">{fileName}: {items.length} mục</p> : null}
        <div className="mt-4 flex flex-wrap gap-2">
          <Button variant="outline" disabled={!items || pending} onClick={() => run(true)}>
            {pending ? <Loader2 className="animate-spin" /> : null} Kiểm tra (không ghi dữ liệu)
          </Button>
          <Button disabled={!items || pending || !result || result.errors.length > 0 || result.created > 0} onClick={() => run(false)}>
            <FileUp /> Nhập {result?.valid ?? ""} câu hỏi
          </Button>
        </div>
      </div>
      {error ? <Alert>{error}</Alert> : null}
      {result ? (
        <div className="rounded-2xl border border-line bg-white p-4 text-sm">
          {result.created > 0 ? (
            <Alert tone="success">Đã nhập {result.created} câu hỏi ở trạng thái Chờ duyệt.</Alert>
          ) : result.errors.length === 0 ? (
            <Alert tone="info">Hợp lệ: {result.valid}/{result.total} câu. Bấm “Nhập” để ghi vào ngân hàng câu hỏi.</Alert>
          ) : (
            <>
              <Alert>Có {result.errors.length} dòng lỗi — chưa có dữ liệu nào được ghi. Sửa file rồi kiểm tra lại.</Alert>
              <ul className="mt-3 max-h-80 space-y-1 overflow-y-auto">
                {result.errors.map((e) => (
                  <li key={e.row}><strong>Dòng {e.row}:</strong> {e.messages.join("; ")}</li>
                ))}
              </ul>
            </>
          )}
        </div>
      ) : null}
    </div>
  );
}
