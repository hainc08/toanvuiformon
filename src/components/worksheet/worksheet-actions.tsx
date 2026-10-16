import { Download, FileCheck2, Printer } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function WorksheetActions({ worksheetId }: { worksheetId: string }) {
  return (
    <div className="flex flex-wrap gap-2 no-print">
      <a href={`/api/worksheets/${worksheetId}/pdf`} className={cn(buttonVariants({ variant: "primary", size: "lg" }))} download data-testid="download-pdf">
        <Download /> Tải PDF đề bài
      </a>
      <a href={`/api/worksheets/${worksheetId}/pdf?inline=1`} target="_blank" rel="noopener" className={cn(buttonVariants({ variant: "outline", size: "lg" }))}>
        <Printer /> In đề
      </a>
      <a href={`/api/worksheets/${worksheetId}/answers/pdf`} className={cn(buttonVariants({ variant: "secondary", size: "lg" }))} download data-testid="download-answers">
        <FileCheck2 /> Tải đáp án
      </a>
    </div>
  );
}
