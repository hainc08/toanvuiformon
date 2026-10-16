# Implementation Plan — Toán Vui MVP

Cập nhật: 2026-10-16 · Trạng thái: **MVP code hoàn chỉnh, đã kiểm thử local; chờ triển khai Hostinger.**

## Môi trường kiểm tra ban đầu (Phase A)

- Thư mục dự án trống (greenfield). Máy người dùng: Windows, Node 22, không có PostgreSQL/Docker cục bộ.
- Phát triển & kiểm thử trong môi trường Linux có PostgreSQL 16 + Chromium; mã nguồn bàn giao vào thư mục dự án.
- Phiên bản chốt (stable tại 10/2026): Next.js 16.4, React 19.3, Prisma 7.10, TypeScript 5.9, Tailwind 4.3, Zod 4, Vitest 5, Playwright 1.64, Node 22 LTS.
- Ghi chú: sandbox chặn `binaries.prisma.sh` nên migration đầu được sinh bằng schema-engine **WASM chính thức** của Prisma (cùng commit engine). CI chạy `prisma migrate deploy` + `migrate diff --exit-code` để xác nhận migration khớp schema.

## Checklist

### Phase A — Discovery & Architecture ✅
- [x] Khảo sát repo, môi trường, phiên bản dependency
- [x] Kiến trúc (docs/ARCHITECTURE.md), data model (docs/DATABASE.md), sitemap (docs/UI_UX.md), phạm vi MVP (docs/PRD.md)
- [x] Khảo sát Hostinger: Node.js Web Apps vs VPS → chọn VPS + Docker (DEPLOYMENT.md §1)

### Phase B — UI/UX ✅
- [x] Design tokens, font Be Vietnam Pro tự host, component library (shadcn-style)
- [x] Header/footer/breadcrumb/pagination responsive, mobile menu
- [x] Trang chủ, Lớp, Chương, Dạng toán, Thư viện, Chi tiết đề, Tạo đề
- [x] Admin layout + sidebar
- [x] Loading / empty / error / 404 states

### Phase C — Database & Backend ✅
- [x] Prisma schema (14 bảng), migration init, indexes & constraints
- [x] Seed: lớp 6, 9 chương, 44 dạng toán, 134 câu hỏi (133 kiểm chứng tự động), 8 bộ đề
- [x] Repositories + services, Zod validation
- [x] Public API (grades, chapters, topics, questions, worksheets, generate, pdf, answers, answers/pdf, report, health)
- [x] Admin API (auth, CRUD lớp/chương/dạng/câu hỏi/bộ đề, trạng thái, import, stats, users, reports, đổi mật khẩu)
- [x] Session auth + RBAC + CSRF origin check + rate limit + audit log

### Phase D — Core features ✅
- [x] Danh mục chương/dạng toán từ DB
- [x] Ngân hàng câu hỏi + quy trình duyệt + versioning
- [x] Tạo đề tự động (10/20/30, trộn câu, trộn dạng, kiểm tra đủ câu)
- [x] Xem trước đề, đáp án tải theo yêu cầu
- [x] PDF đề + PDF đáp án (A4, tiếng Việt, KaTeX, số trang)
- [x] Admin CRUD, bulk import JSON, báo lỗi

### Phase E — Quality ✅ (local)
- [x] Unit tests: 51 (renderer, slug, chọn câu, validation, RBAC, rate limit, CSRF, snapshot, PDF template, toàn bộ seed data)
- [x] Integration tests: 20 (DB thật, generator, versioning, import, PDF render thật)
- [x] E2E + security: 21 (desktop + mobile; luồng học sinh, tạo đề, admin tạo→duyệt→xuất bản→học sinh thấy, 401/403/CSRF/XSS/rate limit/không lộ đáp án/SEO)
- [x] Lint, typecheck, production build, `npm audit --omit=dev` (0 lỗ hổng)
- [~] Accessibility/Performance: đã áp dụng checklist (docs/UI_UX.md §5); **chưa chạy Lighthouse/axe** trên production

### Phase F — Deployment ⏳
- [x] Dockerfile multi-stage (runner + tools), .dockerignore, docker-compose (db, backup-predeploy, migrate, app, caddy, backup)
- [x] GitHub Actions: ci.yml, deploy.yml (Hostinger action, health check, smoke test)
- [x] .env.example, DEPLOYMENT.md (backup/restore/rollback), scripts restore/backup-now/create-admin/cleanup
- [ ] **Build Docker image thật** (sandbox không có Docker daemon — CI job `docker` sẽ kiểm tra)
- [ ] Tạo repo GitHub, cấu hình secrets/variables (người dùng)
- [ ] VPS Hostinger, DNS, firewall (người dùng)
- [ ] Deploy lần đầu, tạo admin, smoke test production, Search Console

## Blockers (cần người dùng)

1. Quyền GitHub (tạo repo / push) và Hostinger (API token, VPS, domain) — chưa được cấp.
2. Xác nhận gói Hostinger thực tế. Nếu chỉ có Web/Cloud hosting: xem DEPLOYMENT.md §10 (PDF chưa xác minh).
3. Giáo viên rà soát văn phong/sư phạm 133 câu seed đã xuất bản tự động (hoặc deploy với `SEED_PUBLISH_VERIFIED=false`).

## Rủi ro / nợ kỹ thuật

| Mục | Ghi chú |
| --- | --- |
| Rate limit in-memory | Đúng cho 1 instance; scale ngang cần store chung |
| CSP `'unsafe-inline'` script | Có thể chuyển nonce-based CSP |
| Chương 4, 5, 8, 9 ít câu hỏi | Bổ sung qua Admin; chương 5 (đối xứng) cần hình minh họa — MVP chưa hỗ trợ upload ảnh |
| Ảnh trong câu hỏi | Chưa hỗ trợ (định dạng MathText có thể mở rộng `![alt](url)` + storage) |
| Lint dev-dependency | `eslint-config-next` kéo `micromatch` có cảnh báo high (chỉ dev, không vào production) |

## Next actions

1. Người dùng tạo repo GitHub và push (hướng dẫn trong báo cáo bàn giao).
2. Chạy CI lần đầu → xác nhận job Docker build xanh.
3. Thuê/kiểm tra VPS, cấu hình secrets, merge `main` → deploy.
4. Rà soát nội dung, bổ sung câu hỏi chương 3–9, chạy Lighthouse + axe trên production.
5. Phase 2: làm bài online + chấm điểm (thiết kế bảng ở DATABASE.md §6).
