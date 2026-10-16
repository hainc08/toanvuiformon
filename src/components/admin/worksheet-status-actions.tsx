"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/state";
import { api } from "./api";

export function WorksheetStatusActions({ id, status, isAdmin }: { id: string; status: "DRAFT" | "PUBLISHED" | "ARCHIVED"; isAdmin: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  if (!isAdmin) return <p className="text-xs text-muted">Quản trị viên sẽ xuất bản bộ đề.</p>;

  async function setStatus(next: "DRAFT" | "PUBLISHED" | "ARCHIVED") {
    setPending(true);
    setError(null);
    const res = await api(`/api/admin/worksheets/${id}/status`, "POST", { status: next });
    setPending(false);
    if (!res.ok) setError(res.error);
    else router.refresh();
  }
  async function remove() {
    if (!window.confirm("Xóa bộ đề này?")) return;
    setPending(true);
    const res = await api(`/api/admin/worksheets/${id}`, "DELETE");
    setPending(false);
    if (!res.ok) setError(res.error);
    else router.push("/admin/worksheets");
  }
  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {status !== "PUBLISHED" ? <Button size="sm" onClick={() => setStatus("PUBLISHED")} disabled={pending}>Xuất bản</Button> : null}
        {status === "PUBLISHED" ? <Button size="sm" variant="outline" onClick={() => setStatus("ARCHIVED")} disabled={pending}>Ẩn (lưu trữ)</Button> : null}
        {status === "ARCHIVED" ? <Button size="sm" variant="outline" onClick={() => setStatus("DRAFT")} disabled={pending}>Chuyển về nháp</Button> : null}
        {status !== "PUBLISHED" ? <Button size="sm" variant="danger" onClick={remove} disabled={pending}>Xóa</Button> : null}
      </div>
      {error ? <Alert>{error}</Alert> : null}
    </div>
  );
}
