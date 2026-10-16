import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogoMark } from "@/components/layout/logo";
import { LoginForm } from "@/components/admin/login-form";
import { getCurrentUser } from "@/lib/auth/session";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Đăng nhập quản trị", robots: { index: false, follow: false } };

export default async function LoginPage() {
  if (await getCurrentUser()) redirect("/admin");
  return (
    <main className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-3xl border border-line bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center gap-2">
          <LogoMark className="size-9" />
          <div>
            <h1 className="text-xl font-extrabold">Toán Vui Admin</h1>
            <p className="text-sm text-muted">Dành cho quản trị viên và biên tập viên</p>
          </div>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
