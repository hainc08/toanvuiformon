import Link from "next/link";

export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#2563EB" />
      <path d="M11 13h8M15 9v8" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
      <path d="M22 13h8" stroke="#F59E0B" strokeWidth="3" strokeLinecap="round" />
      <path d="M11 27h8" stroke="#14B8A6" strokeWidth="3" strokeLinecap="round" />
      <path d="M23 24l6 6M29 24l-6 6" stroke="#fff" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-extrabold text-ink" aria-label="Toán Vui — Trang chủ">
      <LogoMark className="size-9" />
      <span className="text-xl tracking-tight">
        Toán <span className="text-primary">Vui</span>
      </span>
    </Link>
  );
}
