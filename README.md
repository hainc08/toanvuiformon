# Toán Vui

Nền tảng web luyện Toán THCS miễn phí — MVP: **Toán lớp 6** (Chương trình GDPT 2018). Học sinh tìm bài tập theo chương/dạng toán/mức độ, xem trước đề, tải PDF A4 (đề và đáp án riêng), tự tạo đề luyện tập và xem lời giải khi chủ động yêu cầu. Quản trị viên quản lý ngân hàng câu hỏi có quy trình duyệt.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS 4 + shadcn-style UI · Lucide · PostgreSQL 16 + Prisma 7 · Zod 4 · KaTeX · Playwright (PDF + E2E) · Vitest · Docker + Caddy · GitHub Actions → Hostinger VPS.

## Tính năng

| Học sinh / phụ huynh / giáo viên (không cần đăng nhập) | Quản trị |
| --- | --- |
| Trang chủ, Lớp 6 → Chương → Dạng toán → Bộ đề | Dashboard: số câu hỏi, bộ đề, lượt tải, chờ duyệt, báo lỗi |
| Thư viện đề: tìm kiếm, lọc chương/mức độ, phân trang | CRUD lớp, chương, dạng toán (mở rộng lớp 7–9) |
| Xem đề (KaTeX), tải **PDF đề** và **PDF đáp án** riêng | Ngân hàng câu hỏi: lọc, phân trang, editor LaTeX + xem trước |
| Đáp án **không** có trong HTML ban đầu; chỉ tải khi bấm "Xem đáp án" | Quy trình Nháp → Chờ duyệt → Đã duyệt → Xuất bản; lịch sử phiên bản |
| Tạo đề theo chương/dạng/mức độ, 10/20/30 câu, trộn câu, trộn dạng | Bộ đề: tạo từ mã câu hỏi, ghim phiên bản, xuất bản/ẩn |
| Báo lỗi câu hỏi ẩn danh | Nhập JSON hàng loạt (kiểm tra trước, all-or-nothing) |
| SEO: SSR, metadata, canonical, sitemap, robots, breadcrumb JSON-LD | Tài khoản ADMIN/EDITOR (RBAC), audit log, đổi mật khẩu |

Ngân hàng khởi tạo: **134 câu hỏi** tự biên soạn (Chương 1–2 trọng tâm, có cả 3 mức độ), **133 câu có kiểm chứng đáp án tự động** bằng code (`prisma/data/verify.ts`), 8 bộ đề mẫu.

## Chạy local nhanh (không cần cài PostgreSQL/Docker)

Yêu cầu: Node.js 22.12+ (≤ 24).

```bash
npm install
npm run local
```

Lệnh `local` tự khởi động PostgreSQL nhúng (dữ liệu lưu ở `.local-db/`), áp dụng migrations, nạp dữ liệu Toán 6, tạo tài khoản admin lần đầu (in ra màn hình, lưu ở `.local-db/admin-login.txt`), cài Chromium cho PDF nếu thiếu, rồi chạy http://localhost:3000. Dừng bằng `Ctrl+C`. Xóa thư mục `.local-db/` để làm lại từ đầu.

## Chạy local với PostgreSQL riêng

Yêu cầu: Node.js 22.12+ (≤ 24), PostgreSQL 16.

```bash
cp .env.example .env              # sửa DATABASE_URL, SESSION_SECRET
npm ci                            # tự chạy prisma generate
npm run db:deploy                 # áp dụng migrations
npm run db:seed                   # dữ liệu Toán 6 (idempotent)
ADMIN_EMAIL=ban@example.com ADMIN_PASSWORD='MatKhauManh123' npm run admin:create
npx playwright install chromium-headless-shell   # trình duyệt cho PDF
npm run dev                       # http://localhost:3000  (admin: /admin)
```

## Lệnh

| Lệnh | Mô tả |
| --- | --- |
| `npm run dev` / `build` / `start:standalone` | Phát triển / build production / chạy bản standalone |
| `npm run lint` · `npm run typecheck` | ESLint · TypeScript |
| `npm test` | Unit tests (Vitest) |
| `npm run test:integration` | Integration (cần `TEST_DATABASE_URL` chứa chữ `test`; DB này bị xóa và tạo lại) |
| `npm run test:e2e` | E2E + bảo mật (Playwright; cần `npm run build` trước) |
| `npm run db:migrate` | Tạo migration mới khi sửa `schema.prisma` (dev) |
| `npm run admin:create` | Tạo/đặt lại mật khẩu admin |
| `npm run cleanup:generated` | Xóa đề người dùng tự tạo cũ hơn 90 ngày |

## Tài liệu

- [docs/PRD.md](docs/PRD.md) — yêu cầu sản phẩm, phạm vi MVP/Phase 2
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — kiến trúc, bảo mật, PDF, quyết định kỹ thuật
- [docs/DATABASE.md](docs/DATABASE.md) — ERD, bảng, ràng buộc, versioning
- [docs/UI_UX.md](docs/UI_UX.md) — design system, màn hình, accessibility
- [docs/IMPLEMENTATION_PLAN.md](docs/IMPLEMENTATION_PLAN.md) — kế hoạch, checklist, trạng thái
- [docs/ADMIN_GUIDE.md](docs/ADMIN_GUIDE.md) — hướng dẫn sử dụng trang quản trị
- [DEPLOYMENT.md](DEPLOYMENT.md) — triển khai Hostinger VPS, CI/CD, backup/restore, rollback
