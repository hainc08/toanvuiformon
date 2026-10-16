"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { api } from "./api";

export function ReportActions({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  async function set(status: "RESOLVED" | "DISMISSED") {
    setPending(true);
    await api(`/api/admin/reports/${id}`, "PATCH", { status });
    setPending(false);
    router.refresh();
  }
  return (
    <div className="flex gap-1">
      <Button size="sm" variant="secondary" disabled={pending} onClick={() => set("RESOLVED")}>Đã xử lý</Button>
      <Button size="sm" variant="ghost" disabled={pending} onClick={() => set("DISMISSED")}>Bỏ qua</Button>
    </div>
  );
}
