import { expect, test } from "@playwright/test";
import { loginAsAdmin } from "./helpers";

test("admin pages require login", async ({ page }) => {
  await page.goto("/admin/questions");
  await expect(page).toHaveURL(/\/admin\/login$/);
  await page.goto("/admin/login");
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("wrong password is rejected", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Email").fill("e2e-admin@toanvui.test");
  await page.getByLabel("Mật khẩu").fill("wrong-password-1");
  await page.getByRole("button", { name: "Đăng nhập" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "không đúng" })).toBeVisible();
});

test("admin creates, reviews and publishes a question; students see it in a published worksheet", async ({ page }) => {
  const unique = Date.now() % 100000;
  const content = `Tính $${unique} + 1$.`;
  await loginAsAdmin(page);
  await expect(page.getByText("Tổng số câu hỏi")).toBeVisible();

  // Create
  await page.getByRole("link", { name: "Ngân hàng câu hỏi" }).click();
  await page.getByRole("link", { name: "Tạo câu hỏi" }).click();
  await page.getByLabel("Dạng toán").selectOption({ label: "Cộng, trừ, nhân, chia số tự nhiên" });
  await page.getByLabel("Nội dung câu hỏi").fill(content);
  await page.getByLabel("Đáp án (ngắn gọn)").fill(`$${unique + 1}$`);
  await page.getByLabel("Lời giải từng bước").fill(`$${unique} + 1 = ${unique + 1}$.`);
  await expect(page.locator(".katex").first()).toBeVisible(); // live KaTeX preview
  await page.getByRole("button", { name: /Tạo câu hỏi/ }).click();
  await expect(page).toHaveURL(/\/admin\/questions\/(?!new)[a-z0-9]+$/);
  const code = (await page.getByRole("heading", { level: 1 }).textContent())!.replace("Câu hỏi ", "").trim();
  expect(code).toMatch(/^T6-C1-\d{3}$/);

  // Review workflow
  await page.getByTestId("action-submit").click();
  await expect(page.getByText("Chờ duyệt").first()).toBeVisible();
  await page.getByTestId("action-approve").click();
  await expect(page.getByTestId("action-publish")).toBeVisible();
  await page.getByTestId("action-publish").click();
  await expect(page.getByText("Đã xuất bản").first()).toBeVisible();

  // Worksheet with the new question
  await page.goto("/admin/worksheets/new");
  await page.getByLabel("Tiêu đề", { exact: true }).fill(`Đề E2E ${unique}`);
  await page.getByLabel("Slug").fill(`de-e2e-${unique}`);
  await page.getByLabel(/Mã câu hỏi theo thứ tự/).fill(`${code}\nT6-C1-001`);
  await page.getByRole("button", { name: /Tạo bộ đề/ }).click();
  await expect(page).toHaveURL(/\/admin\/worksheets\/(?!new)[a-z0-9]+$/);
  await page.getByRole("button", { name: "Xuất bản" }).click();
  await expect(page.getByRole("link", { name: /Xem trang công khai/ })).toBeVisible();

  // Student side (fresh context, no cookies)
  const student = await page.context().browser()!.newContext();
  const sp = await student.newPage();
  await sp.goto(`/de-bai/de-e2e-${unique}`);
  await expect(sp.getByRole("heading", { level: 1 })).toHaveText(`Đề E2E ${unique}`);
  await expect(sp.locator("#cau-1")).toContainText(String(unique));
  await student.close();
});
