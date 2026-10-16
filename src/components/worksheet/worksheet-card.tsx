import Link from "next/link";
import { Clock, Download, FileText, ListOrdered } from "lucide-react";
import type { WorksheetCard as WorksheetCardData } from "@/services/worksheet.service";
import { Card } from "@/components/ui/card";
import { formatNumber } from "@/lib/utils";
import { DifficultyBadge } from "./difficulty-badge";

export function WorksheetCard({ ws }: { ws: WorksheetCardData }) {
  return (
    <Card className="group flex h-full flex-col p-5 transition-shadow hover:shadow-md">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <DifficultyBadge difficulty={ws.difficulty} />
        {ws.chapter ? <span className="text-xs font-medium text-muted">Chương {ws.chapter.number}</span> : null}
      </div>
      <h3 className="text-lg font-bold leading-snug">
        <Link href={`/de-bai/${ws.slug}`} className="after:absolute after:inset-0 group-hover:text-primary focus:outline-none">
          <span className="relative">{ws.title}</span>
        </Link>
      </h3>
      {ws.description ? <p className="mt-2 line-clamp-2 text-sm text-muted">{ws.description}</p> : null}
      <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-4 text-sm text-muted">
        <div className="flex items-center gap-1">
          <ListOrdered className="size-4" aria-hidden="true" />
          <dt className="sr-only">Số câu</dt>
          <dd>{ws.questionCount} câu</dd>
        </div>
        <div className="flex items-center gap-1">
          <Clock className="size-4" aria-hidden="true" />
          <dt className="sr-only">Thời gian</dt>
          <dd>{ws.durationMinutes} phút</dd>
        </div>
        <div className="flex items-center gap-1">
          <Download className="size-4" aria-hidden="true" />
          <dt className="sr-only">Lượt tải</dt>
          <dd>{formatNumber(ws.downloadCount)}</dd>
        </div>
      </dl>
    </Card>
  );
}

export function WorksheetGrid({ items }: { items: WorksheetCardData[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((ws) => (
        <li key={ws.id} className="relative">
          <WorksheetCard ws={ws} />
        </li>
      ))}
    </ul>
  );
}

export function WorksheetIcon() {
  return <FileText className="size-5" aria-hidden="true" />;
}
