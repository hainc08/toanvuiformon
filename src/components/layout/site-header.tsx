import Link from "next/link";
import { Search } from "lucide-react";
import { Logo } from "./logo";
import { MobileNav } from "./mobile-nav";
import { NAV_LINKS } from "./nav-links";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-white/90 backdrop-blur no-print">
      <div className="relative mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4">
        <Logo />
        <nav aria-label="Menu chính" className="hidden md:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="rounded-xl px-3 py-2 font-semibold text-slate-700 hover:bg-slate-100 hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          <form action="/thu-vien" role="search" className="relative">
            <label htmlFor="header-search" className="sr-only">
              Tìm bộ đề
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input
              id="header-search"
              name="q"
              type="search"
              placeholder="Tìm bộ đề…"
              className="h-10 w-44 rounded-xl border border-line bg-white pl-9 pr-3 text-sm focus:w-56 focus:border-primary focus:outline-none lg:w-52"
            />
          </form>
          <Link href="/admin/login" className="rounded-xl px-3 py-2 text-sm text-muted hover:bg-slate-100">
            Quản trị
          </Link>
        </div>
        <MobileNav />
      </div>
    </header>
  );
}
