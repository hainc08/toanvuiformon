import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Đang tải">
      <Skeleton className="mb-4 h-5 w-48" />
      <Skeleton className="mb-3 h-9 w-2/3" />
      <Skeleton className="mb-8 h-5 w-1/2" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
      <span className="sr-only">Đang tải nội dung…</span>
    </div>
  );
}
