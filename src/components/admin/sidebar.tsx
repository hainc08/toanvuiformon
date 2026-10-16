"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { BookMarked, FileStack, FolderTree, GraduationCap, LayoutDashboard, Layers, LogOut, Menu, Settings, Upload, Users, X, Flag, Library } from "lucide-react";
import { cn } from "@/lib/utils";
import { LogoMark } from "@/components/layout/logo";
import { api } from "./api";

const ITEMS = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, perm: null },
  { href: "/admin/grades", label: "Lớp học", icon: GraduationCap, perm: "catalog" },
  { href: "/admin/chapters", label: "Chương học", icon: FolderTree, perm: "catalog" },
  { href: "/admin/topics", label: "Dạng toán", icon: Layers, perm: "catalog" },
  { href: "/admin/questions", label: "Ngân hàng câu hỏi", icon: BookMarked, perm: null },
  { href: "/admin/worksheets", label: "Bộ đề", icon: FileStack, perm: null },
  { href: "/admin/reports", label: "Báo lỗi", icon: Flag, perm: null },
  { href: "/admin/import", label: "Nhập dữ liệu", icon: Upload, perm: null },
  { href: "/admin/users", label: "Quản lý tài khoản", icon: Users, perm: "users" },
  { href: "/admin/settings", label: "Cài đặt", icon: Settings, perm: null },
] as const;

export function AdminSidebar({ user }: { user: { name: string; role: "ADMIN" | "EDITOR" } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const isAdmin = user.role === "ADMIN";
  const items = ITEMS.filter((i) => i.perm === null || isAdmin);

  async function logout() {
    await api("/api/admin/auth/logout", "POST", {});
    router.replace("/admin/login");
    router.refresh();
  }

  const nav = (
    <nav aria-label="Menu quản trị" className="flex-1 space-y-0.5 overflow-y-auto">
      {items.map((i) => {
        const active = i.href === "/admin" ? pathname === "/admin" : pathname.startsWith(i.href);
        return (
          <Link
            key={i.href}
            href={i.href}
            onClick={() => setOpen(false)}
            aria-current={active ? "page" : undefined}
            className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold", active ? "bg-primary text-white" : "text-slate-700 hover:bg-slate-100")}
          >
            <i.icon className="size-4" aria-hidden="true" /> {i.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <div className="flex h-14 items-center justify-between border-b border-line bg-white px-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2 font-extrabold">
          <LogoMark className="size-7" /> Admin
        </Link>
        <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} aria-label="Menu" className="inline-flex size-10 items-center justify-center rounded-xl hover:bg-slate-100">
          {open ? <X /> : <Menu />}
        </button>
      </div>
      <aside className={cn("fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-line bg-white p-4 transition-transform lg:static lg:translate-x-0", open ? "translate-x-0" : "-translate-x-full")}>
        <Link href="/admin" className="mb-6 hidden items-center gap-2 font-extrabold lg:flex">
          <LogoMark className="size-8" /> Toán Vui Admin
        </Link>
        {nav}
        <div className="mt-4 border-t border-line pt-4 text-sm">
          <p className="font-semibold">{user.name}</p>
          <p className="text-xs text-muted">{isAdmin ? "Quản trị viên" : "Biên tập viên"}</p>
          <div className="mt-3 flex gap-2">
            <Link href="/" className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-100">
              <Library className="size-3.5" /> Xem site
            </Link>
            <button type="button" onClick={logout} className="inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs text-danger hover:bg-red-50">
              <LogOut className="size-3.5" /> Đăng xuất
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
