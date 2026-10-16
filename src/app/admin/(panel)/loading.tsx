import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div role="status" aria-label="Đang tải">
      <Skeleton className="mb-6 h-8 w-64" />
      <Skeleton className="h-96" />
    </div>
  );
}
