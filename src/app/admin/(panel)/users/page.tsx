import { PageHeader } from "@/components/admin/page-header";
import { CreateUserForm, UserRowActions } from "@/components/admin/user-manager";
import { Badge } from "@/components/ui/badge";
import { requireAdminPage } from "@/lib/auth/guard";
import { ROLE_LABEL } from "@/lib/auth/permissions";
import { formatDate } from "@/lib/utils";
import { listUsers } from "@/services/user.service";

export const metadata = { title: "Quản lý tài khoản" };

export default async function UsersPage() {
  const me = await requireAdminPage("user:manage");
  const users = await listUsers();
  return (
    <>
      <PageHeader title="Quản lý tài khoản" description="Chỉ dành cho người quản trị nội dung. Học sinh không cần tài khoản." />
      <ul className="divide-y divide-line rounded-2xl border border-line bg-white">
        {users.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="font-semibold">{u.name} <span className="font-normal text-muted">· {u.email}</span></p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
                <Badge tone={u.role === "ADMIN" ? "blue" : "teal"}>{ROLE_LABEL[u.role]}</Badge>
                {u.isActive ? null : <Badge tone="red">Đã khóa</Badge>}
                Đăng nhập gần nhất: {u.lastLoginAt ? formatDate(u.lastLoginAt) : "chưa"}
              </p>
            </div>
            <UserRowActions id={u.id} role={u.role} isActive={u.isActive} isSelf={u.id === me.id} />
          </li>
        ))}
      </ul>
      <section className="mt-8 rounded-2xl border border-dashed border-primary/40 bg-white p-4">
        <h2 className="mb-3 font-bold">Thêm tài khoản</h2>
        <CreateUserForm />
      </section>
    </>
  );
}
