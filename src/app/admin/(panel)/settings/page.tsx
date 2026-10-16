import { PageHeader } from "@/components/admin/page-header";
import { ChangePasswordForm } from "@/components/admin/user-manager";
import { requireAdminPage } from "@/lib/auth/guard";
import { ROLE_LABEL } from "@/lib/auth/permissions";

export const metadata = { title: "Cài đặt" };

export default async function SettingsPage() {
  const user = await requireAdminPage();
  return (
    <>
      <PageHeader title="Cài đặt" />
      <section className="mb-6 rounded-2xl border border-line bg-white p-4 text-sm">
        <h2 className="mb-2 font-bold">Tài khoản</h2>
        <p>{user.name} · {user.email} · {ROLE_LABEL[user.role]}</p>
      </section>
      <section className="mb-6 rounded-2xl border border-line bg-white p-4">
        <h2 className="mb-3 font-bold">Đổi mật khẩu</h2>
        <ChangePasswordForm />
      </section>
      <section className="rounded-2xl border border-line bg-white p-4 text-sm text-muted">
        <h2 className="mb-2 font-bold text-ink">Cấu hình hệ thống</h2>
        <p>Cấu hình máy chủ (database, domain, PDF) được quản lý qua biến môi trường trên máy chủ, xem <code>DEPLOYMENT.md</code>. Trang quản trị không hiển thị hay sửa secrets.</p>
      </section>
    </>
  );
}
