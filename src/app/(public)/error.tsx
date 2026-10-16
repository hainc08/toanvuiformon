"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PublicError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-lg py-16 text-center" role="alert">
      <p className="text-5xl" aria-hidden="true">🧮</p>
      <h1 className="mt-4 text-2xl font-bold">Ôi, có lỗi xảy ra!</h1>
      <p className="mt-2 text-muted">Trang này tạm thời không tải được. Bạn thử lại sau ít phút nhé.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Button onClick={reset}>Thử lại</Button>
        <Button asChild variant="outline">
          <Link href="/">Về trang chủ</Link>
        </Button>
      </div>
    </div>
  );
}
