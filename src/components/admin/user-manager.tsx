"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/state";
import { Input, Label, Select } from "@/components/ui/form";
import { api } from "./api";

export function UserRowActions({ id, role, isActive, isSelf }: { id: string; role: "ADMIN" | "EDITOR"; isActive: boolean; isSelf: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  async function patch(body: Record<string, unknown>) {
    setError(null);
    const res = await api(`/api/admin/users/${id}`, "PATCH", body);
    if (!res.ok) setError(res.error);
    else router.refresh();
  }
  if (isSelf) return <span className="text-xs text-muted">(Bạn)</span>;
  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-1">
        <Button size="sm" variant="outline" onClick={() => patch({ role: role === "ADMIN" ? "EDITOR" : "ADMIN" })}>
          {role === "ADMIN" ? "Đổi thành biên tập viên" : "Đổi thành quản trị viên"}
        </Button>
        <Button size="sm" variant={isActive ? "danger" : "secondary"} onClick={() => patch({ isActive: !isActive })}>
          {isActive ? "Khóa" : "Mở khóa"}
        </Button>
      </div>
      {error ? <Alert>{error}</Alert> : null}
    </div>
  );
}

export function CreateUserForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setError(null);
    setOk(false);
    const res = await api("/api/admin/users", "POST", { email: f.get("email"), name: f.get("name"), role: f.get("role"), password: f.get("password") });
    if (!res.ok) setError(res.error);
    else {
      setOk(true);
      form.reset();
      router.refresh();
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid gap-3 sm:grid-cols-2">
      <div><Label htmlFor="u-name">Họ tên</Label><Input id="u-name" name="name" required /></div>
      <div><Label htmlFor="u-email">Email</Label><Input id="u-email" name="email" type="email" required /></div>
      <div>
        <Label htmlFor="u-role">Vai trò</Label>
        <Select id="u-role" name="role" defaultValue="EDITOR">
          <option value="EDITOR">Biên tập viên (soạn câu hỏi)</option>
          <option value="ADMIN">Quản trị viên (duyệt, xuất bản)</option>
        </Select>
      </div>
      <div><Label htmlFor="u-pass">Mật khẩu tạm (≥ 12 ký tự, có chữ và số)</Label><Input id="u-pass" name="password" type="password" autoComplete="new-password" required minLength={12} /></div>
      <div className="sm:col-span-2 flex items-center gap-2">
        <Button type="submit">Tạo tài khoản</Button>
        {ok ? <span className="text-sm text-success">Đã tạo</span> : null}
      </div>
      {error ? <div className="sm:col-span-2"><Alert>{error}</Alert></div> : null}
    </form>
  );
}

export function ChangePasswordForm() {
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);
  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setError(null);
    setOk(false);
    if (f.get("newPassword") !== f.get("confirm")) {
      setError("Mật khẩu nhập lại không khớp.");
      return;
    }
    const res = await api("/api/admin/account/password", "POST", { currentPassword: f.get("currentPassword"), newPassword: f.get("newPassword") });
    if (!res.ok) setError(res.error);
    else {
      setOk(true);
      form.reset();
    }
  }
  return (
    <form onSubmit={onSubmit} className="grid max-w-md gap-3">
      <div><Label htmlFor="cp-cur">Mật khẩu hiện tại</Label><Input id="cp-cur" name="currentPassword" type="password" autoComplete="current-password" required /></div>
      <div><Label htmlFor="cp-new">Mật khẩu mới</Label><Input id="cp-new" name="newPassword" type="password" autoComplete="new-password" required minLength={12} /></div>
      <div><Label htmlFor="cp-confirm">Nhập lại mật khẩu mới</Label><Input id="cp-confirm" name="confirm" type="password" autoComplete="new-password" required /></div>
      <Button type="submit">Đổi mật khẩu</Button>
      {ok ? <Alert tone="success">Đã đổi mật khẩu. Các phiên đăng nhập khác đã bị đăng xuất.</Alert> : null}
      {error ? <Alert>{error}</Alert> : null}
    </form>
  );
}
