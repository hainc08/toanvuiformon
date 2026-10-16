import { expect, test } from "@playwright/test";

test("student browses grade → chapter → topic → worksheet, downloads PDFs and reveals answers", async ({ page, request }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Luyện Toán mỗi ngày, tiến bộ từng bước!");

  await page.getByRole("link", { name: "Khám phá bài tập" }).click();
  await expect(page).toHaveURL(/\/lop-6$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Toán Lớp 6");

  await page.getByRole("link", { name: "Tính chia hết trong tập hợp các số tự nhiên" }).click();
  await expect(page).toHaveURL(/\/lop-6\/tinh-chia-het-trong-tap-hop-so-tu-nhien$/);

  await page.getByRole("link", { name: /Dấu hiệu chia hết cho 2, 3, 5, 9/ }).first().click();
  await expect(page).toHaveURL(/\/lop-6\/tinh-chia-het-trong-tap-hop-so-tu-nhien\/dau-hieu-chia-het$/);
  await expect(page.getByRole("heading", { name: "Tóm tắt kiến thức" })).toBeVisible();

  await page.locator('main a[href="/de-bai/dau-hieu-chia-het-cho-2-3-5-9"]').click();
  await expect(page).toHaveURL(/\/de-bai\/dau-hieu-chia-het-cho-2-3-5-9$/);
  await expect(page.getByRole("heading", { name: "Câu 1" })).toBeVisible();

  // Answers are not visible by default
  await expect(page.getByText("Lời giải chi tiết")).toHaveCount(0);

  // PDFs (real files, not only HTTP 200)
  const pdfHref = await page.getByTestId("download-pdf").getAttribute("href");
  const answersHref = await page.getByTestId("download-answers").getAttribute("href");
  for (const href of [pdfHref!, answersHref!]) {
    const res = await request.get(href);
    expect(res.status()).toBe(200);
    expect(res.headers()["content-type"]).toBe("application/pdf");
    const body = await res.body();
    expect(body.subarray(0, 5).toString()).toBe("%PDF-");
    expect(body.byteLength).toBeGreaterThan(20_000);
  }

  await page.getByRole("button", { name: "Xem đáp án" }).click();
  await expect(page.getByText("Lời giải chi tiết").first()).toBeVisible();
  await page.getByRole("button", { name: "Ẩn đáp án" }).click();
  await expect(page.getByText("Lời giải chi tiết")).toHaveCount(0);
});

test("library search and difficulty filter", async ({ page }) => {
  await page.goto("/thu-vien");
  await page.getByLabel("Từ khóa").fill("phân số");
  await page.getByRole("button", { name: "Tìm" }).click();
  await expect(page).toHaveURL(/q=ph/);
  await expect(page.getByRole("link", { name: "Phép tính với phân số" })).toBeVisible();

  await page.goto("/thu-vien?q=khongcobodenao");
  await expect(page.getByText("Không tìm thấy bộ đề phù hợp")).toBeVisible();
});

test("worksheet generator creates a 10-question worksheet", async ({ page }) => {
  await page.goto("/tao-de");
  await page.getByLabel("Chương").selectOption({ label: "Chương 1: Tập hợp các số tự nhiên" });
  await page.getByRole("radio", { name: "10 câu" }).check({ force: true });
  await page.getByRole("button", { name: "Tạo đề" }).click();
  await expect(page).toHaveURL(/\/de-bai\/de-tu-tao-[a-z0-9]+$/);
  await expect(page.getByRole("heading", { name: /^Câu \d+$/ })).toHaveCount(10);
  await expect(page.getByTestId("download-pdf")).toBeVisible();
  // Generated worksheets are not indexed
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
});

test("generator explains when the bank does not have enough questions", async ({ page }) => {
  await page.goto("/tao-de");
  await page.getByLabel("Chương").selectOption({ label: "Chương 1: Tập hợp các số tự nhiên" });
  await page.getByLabel("Trộn câu hỏi nhiều dạng toán").uncheck();
  await page.getByRole("radio", { name: /Lũy thừa với số mũ tự nhiên/ }).check();
  await page.getByText("Nâng cao", { exact: true }).click();
  await page.getByText("30 câu", { exact: true }).click();
  await page.getByRole("button", { name: "Tạo đề" }).click();
  await expect(page.getByRole("alert").filter({ hasText: "chưa đủ 30 câu" })).toBeVisible();
});

test("unknown pages return 404", async ({ page }) => {
  const res = await page.goto("/lop-6/chuong-khong-ton-tai");
  expect(res?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "Không tìm thấy trang" })).toBeVisible();
});
