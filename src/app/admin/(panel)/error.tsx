"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <h1 className="font-bold text-red-800">Không tải được trang quản trị</h1>
      <p className="mt-1 text-sm text-red-700">Vui lòng thử lại. Nếu lỗi lặp lại, hãy kiểm tra log máy chủ.</p>
      <Button className="mt-4" onClick={reset}>Thử lại</Button>
    </div>
  );
}
