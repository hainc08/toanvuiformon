import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export function Pagination({ page, totalPages, hrefFor }: { page: number; totalPages: number; hrefFor: (p: number) => string }) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter((p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1);
  return (
    <nav aria-label="Phân trang" className="mt-8 flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className="inline-flex size-10 items-center justify-center rounded-xl border border-line bg-white" aria-label="Trang trước">
          <ChevronLeft className="size-4" />
        </Link>
      ) : null}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-1">
          {i > 0 && p - (pages[i - 1] ?? p) > 1 ? <span className="px-1 text-muted">…</span> : null}
          <Link
            href={hrefFor(p)}
            aria-current={p === page ? "page" : undefined}
            className={cn("inline-flex size-10 items-center justify-center rounded-xl border font-semibold", p === page ? "border-primary bg-primary text-white" : "border-line bg-white")}
          >
            {p}
          </Link>
        </span>
      ))}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className="inline-flex size-10 items-center justify-center rounded-xl border border-line bg-white" aria-label="Trang sau">
          <ChevronRight className="size-4" />
        </Link>
      ) : null}
    </nav>
  );
}
