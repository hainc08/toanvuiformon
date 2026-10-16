import { expect, type Page } from "@playwright/test";
import { E2E_ADMIN } from "./global-setup";

export async function loginAsAdmin(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill(E2E_ADMIN.email);
  await page.getByLabel("Mật khẩu").fill(E2E_ADMIN.password);
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page).toHaveURL(/\/admin$/);
}
