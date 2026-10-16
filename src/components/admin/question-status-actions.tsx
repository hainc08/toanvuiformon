"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/state";
import { api } from "./api";

type Status = "DRAFT" | "PENDING_REVIEW" | "APPROVED" | "PUBLISHED" | "ARCHIVED";
type Action = "submit" | "approve" | "reject" | "publish" | "unpublish" | "archive" | "restore";

const ACTIONS: Record<Status, { action: Action; label: string; variant: "primary" | "secondary" | "outline" | "danger"; adminOnly: boolean }[]> = {
  DRAFT: [
    { action: "submit", label: "Gửi duyệt", variant: "primary", adminOnly: false },
    { action: "archive", label: "Lưu trữ", variant: "outline", adminOnly: true },
  ],
  PENDING_REVIEW: [
    { action: "approve", label: "Duyệt", variant: "secondary", adminOnly: true },
    { action: "reject", label: "Trả về nháp", variant: "outline", adminOnly: true },
    { action: "archive", label: "Lưu trữ", variant: "outline", adminOnly: true },
  ],
  APPROVED: [
    { action: "publish", label: "Xuất bản", variant: "primary", adminOnly: true },
    { action: "reject", label: "Trả về nháp", variant: "outline", adminOnly: true },
    { action: "archive", label: "Lưu trữ", variant: "outline", adminOnly: true },
  ],
  PUBLISHED: [
    { action: "unpublish", label: "Gỡ xuất bản", variant: "outline", adminOnly: true },
    { action: "archive", label: "Lưu trữ", variant: "outline", adminOnly: true },
  ],
  ARCHIVED: [{ action: "restore", label: "Khôi phục", variant: "outline", adminOnly: true }],
};

export function QuestionStatusActions({ id, status, isAdmin, canDelete }: { id: string; status: Status; isAdmin: boolean; canDelete: boolean }) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const actions = ACTIONS[status].filter((a) => isAdmin || !a.adminOnly);

  async function run(action: Action) {
    setPending(action);
    setError(null);
    const res = await api(`/api/admin/questions/${id}/status`, "POST", { action });
    setPending(null);
    if (!res.ok) setError(res.error);
    else router.refresh();
  }

  async function remove() {
    if (!window.confirm("Xóa vĩnh viễn câu hỏi này? Thao tác không thể hoàn tác.")) return;
    setPending("delete");
    const res = await api(`/api/admin/questions/${id}`, "DELETE");
    setPending(null);
    if (!res.ok) setError(res.error);
    else router.push("/admin/questions");
  }

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-2">
        {actions.map((a) => (
          <Button key={a.action} size="sm" variant={a.variant} disabled={pending !== null} onClick={() => run(a.action)} data-testid={`action-${a.action}`}>
            {pending === a.action ? "…" : a.label}
          </Button>
        ))}
        {isAdmin && canDelete ? (
          <Button size="sm" variant="danger" disabled={pending !== null} onClick={remove}>
            Xóa
          </Button>
        ) : null}
      </div>
      {!isAdmin && status !== "DRAFT" ? <p className="text-xs text-muted">Quản trị viên sẽ duyệt và xuất bản câu hỏi.</p> : null}
      {error ? <Alert>{error}</Alert> : null}
    </div>
  );
}
