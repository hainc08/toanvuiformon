# Deployment — Toán Vui trên Hostinger

> Trạng thái: cấu hình đã sẵn sàng và đã kiểm thử local (build standalone, PDF, E2E). **Chưa triển khai lên Hostinger** vì chưa có quyền truy cập tài khoản/VPS — làm theo các bước dưới đây.

## 1. Chọn gói Hostinger

| | Mode A — Web/Cloud hosting "Node.js Web Apps" | **Mode B — VPS + Docker (khuyến nghị)** |
| --- | --- | --- |
| Gói | Business Web Hosting, Cloud Startup/Professional/Enterprise | KVM VPS (≥ 2 vCPU, 4 GB RAM khuyến nghị; tối thiểu 2 GB) |
| Next.js server | Có (Node 18/20/22/24, deploy từ GitHub) | Có (Docker) |
| PostgreSQL | **Không có sẵn** — phải dùng DB ngoài (Supabase, Neon…) | Có (container `db`, volume bền) |
| PDF (Chromium) | **Chưa xác minh** khả năng chạy Chromium/thư viện hệ thống — rủi ro cao | Có (cài trong image, đã test) |
| Backup/rollback | Phụ thuộc nhà cung cấp DB | `pg_dump` tự động + script restore |

Theo tài liệu Hostinger, Node.js Web Apps hỗ trợ Next.js và tự build khi push GitHub, nhưng chỉ tích hợp sẵn MySQL/MongoDB/Supabase và không nêu khả năng chạy Chromium. Vì PDF là chức năng bắt buộc và dự án dùng PostgreSQL, **chọn Mode B**.

Nguồn: [Deploy to Hostinger VPS using GitHub Actions](https://www.hostinger.com/support/?p=5831) · [Node.js Web App in Hostinger](https://www.hostinger.com/support/how-to-deploy-a-nodejs-website-in-hostinger)

## 2. Kiến trúc production (docker-compose.yml)

| Service | Vai trò |
| --- | --- |
| `db` | PostgreSQL 16, volume `pgdata` |
| `backup-predeploy` | `pg_dump` trước mỗi lần deploy → `./backups/predeploy-*.dump` (giữ 30 ngày) |
| `migrate` | `prisma migrate deploy` + seed idempotent (không ghi đè dữ liệu đã có) |
| `app` | Next.js standalone + Chromium headless, user không phải root, healthcheck `/api/health`, giới hạn 1.5 GB RAM |
| `caddy` | HTTPS tự động (Let's Encrypt), HSTS, gzip/zstd, giới hạn body 2 MB |
| `backup` | `pg_dump` mỗi 24 giờ → `./backups/daily-*.dump` (giữ 14 ngày) |

Thứ tự khởi động: `db` (healthy) → `backup-predeploy` → `migrate` → `app` → `caddy`. Nếu backup hoặc migration lỗi, `app` mới **không** khởi động (bản cũ đã bị dừng thì xem §8 Rollback).

## 3. Chuẩn bị VPS (một lần)

1. Hostinger hPanel → VPS → chọn OS template **Ubuntu 24.04 with Docker** (hoặc cài Docker Engine + Compose plugin).
2. Ghi lại **VM ID** (số trong hostname `srv123456.hstgr.cloud` → `123456`).
3. DNS: bản ghi `A` cho `toanvui.vn` và `www.toanvui.vn` → IP VPS (đợi DNS cập nhật trước lần deploy đầu để Caddy lấy chứng chỉ).
4. Firewall VPS (hPanel → Security → Firewall): chỉ mở 22 (SSH, nên giới hạn IP), 80, 443 (TCP) và 443/UDP.
5. SSH: tắt đăng nhập bằng mật khẩu, dùng SSH key.

## 4. Cấu hình GitHub

1. Đẩy mã lên GitHub, nhánh mặc định `main`. Bật branch protection: bắt buộc check **CI / Lint · Typecheck · Test · Build** pass trước khi merge.
2. hPanel → Account → **API** → tạo API token.
3. GitHub → Settings → Environments → tạo environment `production` (có thể yêu cầu người duyệt).
4. Settings → Secrets and variables → Actions:

| Loại | Tên | Giá trị |
| --- | --- | --- |
| Secret | `HOSTINGER_API_KEY` | API token Hostinger |
| Secret | `POSTGRES_PASSWORD` | Mật khẩu mạnh, ví dụ `openssl rand -base64 32` (không đổi sau lần đầu — xem §9) |
| Secret | `SESSION_SECRET` | `openssl rand -base64 48` |
| Secret | `PERSONAL_ACCESS_TOKEN` | Chỉ khi repo private: fine-grained token quyền *Contents: Read* |
| Variable | `HOSTINGER_VM_ID` | VM ID |
| Variable | `DOMAIN` | `toanvui.vn` |
| Variable | `PRODUCTION_URL` | `https://toanvui.vn` |

Không commit `.env`. Secrets chỉ được truyền qua input `environment-variables` của action chính thức `hostinger/deploy-action@v1`.

## 5. CI/CD

- `.github/workflows/ci.yml` (push/PR): `npm ci` → audit dependency production → migrate DB trống + kiểm tra lệch schema → seed 2 lần (idempotent) → typecheck → lint → unit → integration (DB thật + render PDF thật) → build → E2E + bảo mật (Playwright) → build Docker image (runner + tools).
- `.github/workflows/deploy.yml`: chỉ chạy khi **CI thành công trên `main`** (sự kiện push) hoặc chạy tay; gọi `hostinger/deploy-action@v1` với `docker-compose.yml`; sau đó **health check** (đợi `/api/health` trả `status: ok` và đúng commit SHA) và **smoke test** (trang chủ, `/lop-6`, API, tải PDF thật). Kết quả ghi vào Job Summary.
- `concurrency: deploy-production` → không có 2 lần deploy chạy chồng.

> Kiểm tra trước lần đầu: đọc trang Marketplace của `hostinger/deploy-action` để xác nhận input hiện hành (`api-key`, `virtual-machine`, `project-name`, `docker-compose-path`, `environment-variables`, `personal-token`) và cách action build image (`build:` trong compose). Nếu action không build được từ Dockerfile trên VPS, phương án thay thế: build image trong GitHub Actions, đẩy lên GHCR, đổi `build:` thành `image:` trong compose.

## 6. Lần deploy đầu tiên

1. Merge vào `main` → CI xanh → workflow Deploy chạy.
2. Tạo tài khoản quản trị (SSH vào VPS, trong thư mục project mà Hostinger Docker Manager tạo — xem đường dẫn trong hPanel → Docker Manager → project `toanvui`):

   ```bash
   docker compose run --rm --no-deps -e ADMIN_EMAIL=admin@toanvui.vn -e ADMIN_PASSWORD='MatKhauRatManh2026' -e ADMIN_NAME='Quản trị viên' \
     migrate npx tsx scripts/create-admin.ts
   ```
3. Đăng nhập `https://toanvui.vn/admin`, đổi mật khẩu ở **Cài đặt**, tạo tài khoản biên tập viên nếu cần.
4. Rà soát nội dung seed (xem docs/ADMIN_GUIDE.md). Muốn mọi câu seed phải duyệt tay trước khi công khai: thêm `SEED_PUBLISH_VERIFIED=false` vào `environment-variables` **trước** lần deploy đầu.
5. Google Search Console: thêm domain, gửi `https://toanvui.vn/sitemap.xml`.

## 7. Vận hành

| Việc | Lệnh (trên VPS, trong thư mục project) |
| --- | --- |
| Trạng thái | `docker compose ps` · `curl -fsS https://toanvui.vn/api/health` |
| Log | `docker compose logs -f app` · `docker compose logs caddy` |
| Backup ngay | `./scripts/backup-now.sh` |
| Danh sách backup | `ls -lh backups/` |
| Dọn đề tự tạo > 90 ngày | `docker compose run --rm --no-deps migrate npx tsx scripts/cleanup-generated.ts 90` (đặt cron hàng tuần) |
| Đặt lại mật khẩu admin | lệnh tạo admin ở §6 với cùng email |

**Backup off-site (bắt buộc làm):** `./backups` nằm cùng máy với DB. Bật thêm **Hostinger VPS snapshot/backup hằng tuần** trong hPanel và đồng bộ `./backups` ra nơi khác (ví dụ `rclone` lên Google Drive/S3 bằng cron). Thử khôi phục định kỳ (mỗi quý) trên máy khác.

Cron gợi ý (`crontab -e`, sửa đường dẫn):
```
0 3 * * 0  cd /path/to/toanvui && docker compose run --rm --no-deps migrate npx tsx scripts/cleanup-generated.ts 90 >> cleanup.log 2>&1
30 3 * * *  rclone sync /path/to/toanvui/backups remote:toanvui-backups >> rclone.log 2>&1
```

## 8. Rollback

**Lỗi ứng dụng (code):**
1. Cách an toàn nhất: `git revert <commit lỗi>` → push `main` → CI → deploy tự động bản đã revert.
2. Khẩn cấp (cần xác minh với Hostinger): action `hostinger/deploy-action` triển khai mã từ repository — nhiều khả năng là nhánh mặc định, không phải một commit tùy chọn. Vì vậy rollback đáng tin cậy là đưa `main` về trạng thái tốt: `git revert` (khuyến nghị) hoặc tạo nhánh từ tag ổn định rồi merge. Gắn tag cho mỗi bản ổn định (`git tag v0.1.0 && git push --tags`).

**Lỗi dữ liệu / migration:**
1. `docker compose stop app`
2. Chọn bản backup phù hợp (`backups/predeploy-<thời điểm>.dump` được tạo ngay trước lần deploy lỗi).
3. `./scripts/restore.sh backups/predeploy-YYYYMMDD-HHMMSS.dump` (script tự dump trạng thái hiện tại trước khi ghi đè, yêu cầu gõ `RESTORE` để xác nhận).
4. Rollback code về bản tương ứng với schema đã khôi phục (bước "Lỗi ứng dụng" ở trên), rồi kiểm tra `/api/health`.

## 9. Quy tắc an toàn

- **Không bao giờ** chạy `docker compose down -v`, `prisma migrate reset`, `prisma db push` trên production.
- `POSTGRES_PASSWORD` chỉ áp dụng khi volume `pgdata` được khởi tạo lần đầu. Muốn đổi: `ALTER USER toanvui PASSWORD '...'` trong DB rồi mới đổi secret.
- Migration phá hủy dữ liệu: tách bước, review, chạy `./scripts/backup-now.sh` trước.
- Đổi `SESSION_SECRET` sẽ đăng xuất toàn bộ quản trị viên (an toàn).
- `TRUST_PROXY=true` chỉ đúng khi app đứng sau Caddy (mặc định trong compose); không mở cổng 3000 ra ngoài.

## 10. Mode A (nếu buộc phải dùng Node.js Web Apps)

Có thể chạy được phần web nhưng **PDF chưa được xác minh**:
1. Tạo PostgreSQL ngoài (Supabase/Neon), lấy `DATABASE_URL`; chạy `npx prisma migrate deploy && npm run db:seed` từ máy local trỏ tới DB đó.
2. hPanel → Websites → Add Website → Node.js Web App → kết nối GitHub repo, framework Next.js, Node 22, build `npm run build`, start `npm run start:standalone`.
3. Khai báo biến môi trường: `DATABASE_URL`, `SITE_URL`, `SESSION_SECRET`, `TRUST_PROXY=true` (nếu Hostinger có proxy đặt `X-Forwarded-For`).
4. **Không** bật `deploy.yml` (tắt workflow) để tránh 2 luồng deploy chồng nhau; vẫn giữ `ci.yml` + branch protection để chỉ merge code đã qua CI.
5. Kiểm tra `GET /api/worksheets/<slug>/pdf`. Nếu trả 503 `PDF_UNAVAILABLE` → môi trường không chạy được Chromium; phương án: chuyển sang VPS (Mode B), hoặc tách dịch vụ PDF sang một container/VPS nhỏ.
