import Link from "next/link";
import { cn } from "@/lib/utils";
import { DIFFICULTIES, DIFFICULTY_LABEL } from "@/lib/labels";

/** Link-based filter: works without JavaScript and is crawlable. */
export function DifficultyFilter({ current, hrefFor }: { current?: string; hrefFor: (d?: string) => string }) {
  const options = [{ key: undefined, label: "Tất cả" }, ...DIFFICULTIES.map((d) => ({ key: d, label: DIFFICULTY_LABEL[d] }))];
  return (
    <nav aria-label="Lọc theo mức độ" className="flex flex-wrap gap-2">
      {options.map((o) => {
        const active = o.key === current || (!o.key && !current);
        return (
          <Link
            key={o.label}
            href={hrefFor(o.key)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "rounded-full border px-4 py-1.5 text-sm font-semibold",
              active ? "border-primary bg-primary text-white" : "border-line bg-white text-slate-700 hover:border-primary",
            )}
            rel="nofollow"
          >
            {o.label}
          </Link>
        );
      })}
    </nav>
  );
}
