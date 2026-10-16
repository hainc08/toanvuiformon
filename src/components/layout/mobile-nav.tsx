"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { NAV_LINKS } from "./nav-links";

export function MobileNav() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  return (
    <div className="md:hidden">
      <button
        type="button"
        className="inline-flex size-11 items-center justify-center rounded-xl hover:bg-slate-100"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Đóng menu" : "Mở menu"}
        onClick={() => setOpen((v) => !v)}
      >
        {open ? <X className="size-6" /> : <Menu className="size-6" />}
      </button>
      {open ? (
        <div id="mobile-menu" className="absolute inset-x-0 top-16 z-40 border-b border-line bg-white px-4 pb-4 shadow-lg">
          <form action="/thu-vien" role="search" className="relative my-3">
            <label htmlFor="mobile-search" className="sr-only">
              Tìm bộ đề
            </label>
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" aria-hidden="true" />
            <input id="mobile-search" name="q" type="search" placeholder="Tìm bộ đề, dạng toán…" className="h-11 w-full rounded-xl border border-line pl-9 pr-3" />
          </form>
          <nav aria-label="Menu chính (di động)">
            <ul className="space-y-1">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-3 py-3 font-semibold hover:bg-slate-50"
                    aria-current={pathname === l.href ? "page" : undefined}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/admin/login" onClick={() => setOpen(false)} className="block rounded-xl px-3 py-3 text-sm text-muted hover:bg-slate-50">
                  Đăng nhập quản trị
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      ) : null}
    </div>
  );
}
