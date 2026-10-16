import type { Metadata } from "next";
import { Search } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/breadcrumbs";
import { Pagination } from "@/components/layout/pagination";
import { Button } from "@/components/ui/button";
import { Input, Label, Select } from "@/components/ui/form";
import { EmptyState } from "@/components/ui/state";
import { WorksheetGrid } from "@/components/worksheet/worksheet-card";
import { DIFFICULTIES, DIFFICULTY_LABEL } from "@/lib/labels";
import { publicWorksheetListSchema } from "@/lib/validation/worksheet";
import { getGradeTree } from "@/services/catalog.service";
import { listPublicWorksheets } from "@/services/worksheet.service";

export const dynamic = "force-dynamic";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const sp = await searchParams;
  const filtered = Object.keys(sp).length > 0;
  return {
    title: "Thư viện đề Toán",
    description: "Tìm bộ đề Toán lớp 6 theo chương, dạng toán và mức độ. Xem trước đề và tải PDF miễn phí.",
    alternates: { canonical: "/thu-vien" },
    // Filtered/paginated variants are not indexed to avoid near-duplicate pages.
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function LibraryPage({ searchParams }: Props) {
  const raw = await searchParams;
  const flat = Object.fromEntries(Object.entries(raw).map(([k, v]) => [k, Array.isArray(v) ? v[0] : v]).filter(([, v]) => v));
  const parsed = publicWorksheetListSchema.safeParse({ ...flat, grade: flat.grade ?? "lop-6" });
  const p = parsed.success ? parsed.data : publicWorksheetListSchema.parse({ grade: "lop-6" });

  const [tree, result] = await Promise.all([
    getGradeTree(p.grade ?? "lop-6"),
    listPublicWorksheets({ gradeSlug: p.grade, chapterSlug: p.chapter, difficulty: p.difficulty, q: p.q }, p.page, 12),
  ]);

  const hrefFor = (page: number) => {
    const s = new URLSearchParams();
    if (p.chapter) s.set("chapter", p.chapter);
    if (p.difficulty) s.set("difficulty", p.difficulty);
    if (p.q) s.set("q", p.q);
    if (page > 1) s.set("page", String(page));
    const q = s.toString();
    return q ? `/thu-vien?${q}` : "/thu-vien";
  };

  return (
    <>
      <Breadcrumbs items={[{ label: "Thư viện đề" }]} />
      <h1 className="text-3xl font-extrabold sm:text-4xl">Thư viện đề</h1>
      <p className="mt-2 text-muted">Lọc theo chương, mức độ hoặc tìm theo tên bộ đề.</p>

      <form method="get" action="/thu-vien" role="search" className="my-6 grid gap-3 rounded-2xl border border-line bg-white p-4 sm:grid-cols-[2fr_2fr_1fr_auto] sm:items-end">
        <div>
          <Label htmlFor="q">Từ khóa</Label>
          <Input id="q" name="q" type="search" defaultValue={p.q ?? ""} placeholder="Ví dụ: lũy thừa, ƯCLN…" maxLength={100} />
        </div>
        <div>
          <Label htmlFor="chapter">Chương</Label>
          <Select id="chapter" name="chapter" defaultValue={p.chapter ?? ""}>
            <option value="">Tất cả chương</option>
            {tree?.chapters.map((c) => (
              <option key={c.id} value={c.slug}>
                Chương {c.number}: {c.title}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="difficulty">Mức độ</Label>
          <Select id="difficulty" name="difficulty" defaultValue={p.difficulty ?? ""}>
            <option value="">Tất cả</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>
                {DIFFICULTY_LABEL[d]}
              </option>
            ))}
          </Select>
        </div>
        <Button type="submit">
          <Search /> Tìm
        </Button>
      </form>

      <p className="mb-4 text-sm text-muted" aria-live="polite">
        Tìm thấy <strong className="text-ink">{result.total}</strong> bộ đề
      </p>
      {result.items.length === 0 ? (
        <EmptyState title="Không tìm thấy bộ đề phù hợp" description="Hãy thử từ khóa khác, bỏ bớt bộ lọc, hoặc tự tạo đề luyện tập." />
      ) : (
        <WorksheetGrid items={result.items} />
      )}
      <Pagination page={result.page} totalPages={result.totalPages} hrefFor={hrefFor} />
    </>
  );
}
