import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { siteUrl } from "@/lib/env";

export interface Crumb {
  label: string;
  href?: string;
}

/** Visible breadcrumb + BreadcrumbList structured data. */
export function Breadcrumbs({ items }: { items: Crumb[] }) {
  const all: Crumb[] = [{ label: "Trang chủ", href: "/" }, ...items];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: all.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.label,
      ...(c.href ? { item: `${siteUrl()}${c.href}` } : {}),
    })),
  };
  return (
    <>
      <nav aria-label="Đường dẫn" className="no-print mb-4 text-sm">
        <ol className="flex flex-wrap items-center gap-1 text-muted">
          {all.map((c, i) => (
            <li key={`${c.label}-${i}`} className="flex items-center gap-1">
              {i > 0 ? <ChevronRight className="size-3.5 text-slate-400" aria-hidden="true" /> : null}
              {c.href && i < all.length - 1 ? (
                <Link href={c.href} className="hover:text-primary hover:underline">
                  {c.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium text-ink">
                  {c.label}
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />
    </>
  );
}
