# Review, chạy local & nhánh deploy Hostinger — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Đưa project Toán Vui về trạng thái xanh (typecheck/lint/test/build), dựng lên local để chủ dự án kiểm tra tay, rồi tạo nhánh `deploy` chạy được trên Hostinger Node.js Web App (Mode A, PostgreSQL ngoài).

**Architecture:** Không đổi kiến trúc app (Next.js 16 standalone + Prisma 7 + PostgreSQL). Sửa môi trường dev (Node 22, cài lại dependencies), chặn sai phiên bản Node, rồi trên nhánh `deploy` chỉnh cách khởi động (`npm start` → standalone, bind `0.0.0.0`), cài Chromium cho PDF theo kiểu best-effort, và viết checklist triển khai hPanel.

**Tech Stack:** Node 22 · Next.js 16 · Prisma 7 + `@prisma/adapter-pg` · embedded-postgres (local) · Vitest · Playwright · Hostinger Node.js Web App · Neon/Supabase PostgreSQL.

**Spec:** Yêu cầu của người dùng (2026-10-16): "review lại project, dựng lên local để tôi kiểm tra, nếu xong tạo branch deploy để tôi đưa lên hostinger". Bối cảnh: `README.md`, `DEPLOYMENT.md` §10 (Mode A), `.env.production` (local, không commit — target `https://violet-ram-565010.hostingersite.com`).

## Global Constraints

- Node: `>=22.12 <25` (theo `package.json` `engines`; Prisma 7 yêu cầu `^20.19 || ^22.12 || >=24`). Trên máy này dùng `C:\nvm4w\nodejs` (v22.23.3). Trong Git Bash, đầu mỗi lệnh: `export PATH="/c/nvm4w/nodejs:$PATH"`.
- Không commit `.env`, `.env.production`, `.local-db/`, `*.tar.gz` (đã ignore — giữ nguyên).
- Không chạy `prisma migrate reset` / `db push` vào DB production.
- Nhánh deploy tên `deploy`, tạo từ `main` **sau khi** chủ dự án duyệt bản local.
- Không push lên GitHub khi chưa được chủ dự án đồng ý rõ ràng.
- Thông báo/tài liệu cho người dùng viết tiếng Việt, theo giọng các file hiện có.

## Review Focus

1. **Chạy bằng Node sai phiên bản (20.x mặc định trong Git Bash)** → phải báo lỗi rõ ràng ngay khi `npm install`, không phải lỗi `ERR_MODULE_NOT_FOUND` khó hiểu. (Task 1)
2. **Hostinger tự đặt biến `HOSTNAME` = tên máy** → server standalone của Next bind sai interface, proxy không vào được → site 503. Server phải luôn bind `0.0.0.0` trừ khi được chỉ định rõ. (Task 3)
3. **Build trên Hostinger không truy cập được DB / chưa có `DATABASE_URL`** → `npm run build` vẫn phải pass. (Task 3)
4. **Không có Chromium trên Hostinger** → các trang khác vẫn chạy, riêng tải PDF trả 503 `PDF_UNAVAILABLE` (không làm sập app, build không fail). (Task 3)
5. **Chạy `npm run local` lần thứ hai** (đã có `.local-db/`) → khởi động bình thường, không seed trùng, không tạo admin mới. (Task 2)

---

### Task 1: Sửa môi trường dev và đưa các cổng kiểm tra về xanh

**Hiện trạng đã xác minh (2026-10-16):** `node_modules` hỏng (thiếu `uri-js`, `vitest/node_modules/picomatch/index.js`), chưa có `src/generated/prisma` → `npm run typecheck` báo 171 lỗi (hầu hết là `Cannot find module '../src/generated/prisma/client'`), `npm run lint` lỗi `Cannot find module 'uri-js'`, `npm test` lỗi `ERR_MODULE_NOT_FOUND`. Git Bash mặc định dùng Node v20.11.1.

**Files:**
- Create: `.npmrc`
- Create: `.nvmrc`
- Modify (chỉ khi gặp lỗi thật sau khi cài lại): file nguồn liên quan

**Interfaces:**
- Consumes: không có
- Produces: `node_modules` sạch + `src/generated/prisma` (do `postinstall`), các lệnh `typecheck`, `lint`, `test` pass — các task sau dựa vào đó.

- [ ] **Step 1: Chứng minh lỗi hiện tại do Node sai mà không bị chặn**

Run: `cd /d/10.Toanvui && node -v && npm run lint 2>&1 | tail -3`
Expected: `v20.11.1` và lỗi `Cannot find module 'uri-js'` (không có thông báo nào về phiên bản Node).

- [ ] **Step 2: Bật engine-strict và ghim Node 22**

`.npmrc`:
```
engine-strict=true
```

`.nvmrc`:
```
22
```

- [ ] **Step 3: Kiểm tra Node 20 giờ bị chặn rõ ràng**

Run: `cd /d/10.Toanvui && npm install --dry-run 2>&1 | grep -m1 EBADENGINE`
Expected: một dòng chứa `EBADENGINE` (Node v20.11.1 không thỏa `>=22.12 <25`).

- [ ] **Step 4: Cài lại sạch bằng Node 22**

```bash
cd /d/10.Toanvui
export PATH="/c/nvm4w/nodejs:$PATH"
node -v                      # v22.23.3
rm -rf node_modules src/generated
npm ci                       # postinstall chạy prisma generate
ls src/generated/prisma/client.ts
```
Expected: `npm ci` exit 0, file `src/generated/prisma/client.ts` tồn tại.

- [ ] **Step 5: Chạy các cổng kiểm tra**

```bash
export PATH="/c/nvm4w/nodejs:$PATH"
npm run typecheck && npm run lint && npm test
```
Expected: cả ba exit 0. Nếu còn lỗi: dùng superpowers:systematic-debugging, sửa tận gốc (không thêm `// @ts-ignore`, không tắt rule), ghi lại từng lỗi + cách sửa vào phần "Ghi chú review" cuối file plan này.

- [ ] **Step 6: Commit**

```bash
git add .npmrc .nvmrc
git commit -m "chore: pin Node 22 and enforce engines on install"
```
(Nếu Step 5 phải sửa code: commit riêng từng nhóm sửa với message `fix: ...` mô tả lỗi.)

---

### Task 2: Dựng local với PostgreSQL nhúng, chạy integration + E2E, bàn giao để kiểm tra tay

**Files:**
- Modify: `README.md` (mục "Chạy local nhanh" — thêm hướng dẫn Node 22 trên Windows và cách chạy test với DB nhúng)

**Interfaces:**
- Consumes: Task 1 (dependencies sạch).
- Produces: app chạy ở `http://localhost:3000`, admin trong `.local-db/admin-login.txt`; PostgreSQL nhúng ở cổng `5433`, mật khẩu trong `.local-db/pg-password`.

- [ ] **Step 1: Khởi động lần đầu (chạy nền)**

```bash
cd /d/10.Toanvui
export PATH="/c/nvm4w/nodejs:$PATH"
npm run local > /c/Users/admin/AppData/Local/Temp/claude/toanvui-local.log 2>&1 &
```
Đợi đến khi log có `Toán Vui:   http://localhost:3000` (dùng Monitor/until-loop, không sleep cứng).

- [ ] **Step 2: Smoke test các trang chính**

```bash
curl -fsS http://localhost:3000/api/health
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:3000/
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:3000/lop-6
curl -fsS -o /dev/null -w "%{http_code}\n" http://localhost:3000/thu-vien
SLUG=$(curl -fsS "http://localhost:3000/api/worksheets?limit=1" | node -e "let s='';process.stdin.on('data',d=>s+=d).on('end',()=>{const j=JSON.parse(s);console.log((j.items??j.data??j)[0].slug)})")
curl -fsS -o /c/Users/admin/AppData/Local/Temp/claude/de.pdf -w "%{http_code} %{content_type}\n" "http://localhost:3000/api/worksheets/$SLUG/pdf"
cat .local-db/admin-login.txt
```
Expected: health `{"status":"ok","db":"ok",...}`; các trang `200`; PDF `200 application/pdf`. (Nếu shape JSON của `/api/worksheets` khác, đọc `src/app/api/worksheets/route.ts` để lấy đúng trường.)

- [ ] **Step 3: Review Focus #5 — chạy lại lần hai**

Dừng tiến trình nền (Ctrl+C/kill tiến trình `npm run local`, đợi log `Đang dừng PostgreSQL…`), chạy lại Step 1.
Expected: không có `Khởi tạo PostgreSQL nhúng lần đầu`, seed in thông báo bỏ qua/không lỗi unique, `.local-db/admin-login.txt` giữ nguyên mật khẩu cũ, health `ok`.

- [ ] **Step 4: Integration tests trên DB nhúng**

Trong khi `npm run local` vẫn chạy:
```bash
export PATH="/c/nvm4w/nodejs:$PATH"
PGPW=$(cat .local-db/pg-password)
node -e "const pg=require('pg');const c=new pg.Client({connectionString:'postgresql://postgres:$PGPW@127.0.0.1:5433/postgres'});c.connect().then(()=>c.query('SELECT 1 FROM pg_database WHERE datname=\$1',['toanvui_test'])).then(r=>r.rowCount?0:c.query('CREATE DATABASE toanvui_test')).then(()=>c.end())"
export TEST_DATABASE_URL="postgresql://postgres:$PGPW@127.0.0.1:5433/toanvui_test?schema=public"
npm run test:integration
```
Expected: tất cả pass (bao gồm `pdf.test.ts` render PDF thật).

- [ ] **Step 5: Build + E2E**

```bash
export PATH="/c/nvm4w/nodejs:$PATH"
export TEST_DATABASE_URL="postgresql://postgres:$(cat .local-db/pg-password)@127.0.0.1:5433/toanvui_test?schema=public"
npm run build && npm run test:e2e
```
Expected: build exit 0; Playwright (desktop + mobile) pass. Lỗi → systematic-debugging, sửa, commit `fix: ...`.

- [ ] **Step 6: Cập nhật README**

Thêm vào ngay dưới khối lệnh `npm run local` trong `README.md`:

```markdown
> **Windows nhiều bản Node:** kiểm tra `node -v` ≥ 22.12 trước khi `npm install` (file `.nvmrc` ghi `22`; `npm install` sẽ báo `EBADENGINE` nếu sai bản). Với nvm-windows: `nvm use 22`.

Chạy test tích hợp/E2E bằng chính PostgreSQL nhúng (trong lúc `npm run local` đang chạy):

```bash
# tạo DB test một lần: CREATE DATABASE toanvui_test (cổng 5433, user postgres, mật khẩu trong .local-db/pg-password)
TEST_DATABASE_URL="postgresql://postgres:$(cat .local-db/pg-password)@127.0.0.1:5433/toanvui_test?schema=public" npm run test:integration
```
```

- [ ] **Step 7: Commit**

```bash
git add README.md
git commit -m "docs: Node 22 note and running tests against embedded PostgreSQL"
```

- [ ] **Step 8: ĐIỂM DỪNG — bàn giao cho chủ dự án kiểm tra tay**

Để `npm run local` chạy. Báo cho người dùng: URL `http://localhost:3000`, `/admin`, thông tin đăng nhập trong `.local-db/admin-login.txt`, danh sách đã kiểm tra tự động, và gợi ý kịch bản kiểm tra tay (duyệt Lớp 6 → Chương → Dạng → Bộ đề; tải PDF đề + đáp án; Tạo đề 10 câu; bấm "Xem đáp án"; đăng nhập admin, sửa 1 câu, đưa qua Chờ duyệt → Xuất bản). **Không làm Task 3 cho đến khi người dùng xác nhận OK.** Mọi lỗi người dùng báo → sửa trên `main` (TDD, commit `fix:`), lặp lại Step 2.

---

### Task 3: Tạo nhánh `deploy` và cho `npm start` chạy bản standalone an toàn trên Hostinger

**Files:**
- Modify: `scripts/start-standalone.mjs`
- Modify: `package.json` (scripts `start`, `postbuild`)
- Create: `scripts/install-pdf-browser.mjs`

**Interfaces:**
- Consumes: `main` đã được duyệt ở Task 2.
- Produces: trên nhánh `deploy`: `npm run build` (tự cài Chromium best-effort, không bao giờ fail vì Chromium) và `npm start` (= standalone, bind `0.0.0.0:$PORT`).

- [ ] **Step 1: Tạo nhánh**

```bash
git switch main && git switch -c deploy
```

- [ ] **Step 2: Test thất bại — Review Focus #2 (HOSTNAME do hosting đặt)**

```bash
export PATH="/c/nvm4w/nodejs:$PATH"
export DATABASE_URL="postgresql://postgres:$(cat .local-db/pg-password)@127.0.0.1:5433/toanvui?schema=public"
SESSION_SECRET=0123456789abcdef0123456789abcdef01 PORT=3210 HOSTNAME=srv-hostinger-xyz node scripts/start-standalone.mjs &
# đợi tối đa 20s
curl -fsS --retry 10 --retry-delay 2 --retry-all-errors http://127.0.0.1:3210/api/health
```
Expected: FAIL — server cố bind `srv-hostinger-xyz` (lỗi `ENOTFOUND`/`EADDRNOTAVAIL` trong log) và curl không kết nối được. Dừng tiến trình.

- [ ] **Step 3: Sửa `scripts/start-standalone.mjs`**

Thay dòng `const child = spawn(...)` bằng:
```js
// Hosting platforms (e.g. Hostinger) often export HOSTNAME=<machine name>, which the standalone
// server would bind to. Listen on all interfaces unless BIND_HOST says otherwise.
const childEnv = { ...process.env, HOSTNAME: process.env.BIND_HOST || "0.0.0.0" };
const child = spawn(process.execPath, ["server.js"], { cwd: `${root}/.next/standalone`, stdio: "inherit", env: childEnv });
```
Và trong `playwright.config.ts`, đổi `HOSTNAME: "127.0.0.1"` thành `BIND_HOST: "127.0.0.1"` để E2E giữ hành vi cũ.

- [ ] **Step 4: Chạy lại test Step 2**

Expected: PASS — `{"status":"ok","db":"ok",...}`. Dừng tiến trình.

- [ ] **Step 5: `npm start` → standalone; postbuild cài Chromium best-effort**

`scripts/install-pdf-browser.mjs`:
```js
// Best-effort install of the headless Chromium used for PDF export. Never fails the build:
// on hosts without the needed system libraries, PDFs answer 503 PDF_UNAVAILABLE and the rest of the site works.
import { spawnSync } from "node:child_process";

if (process.env.CHROMIUM_PATH || process.env.SKIP_PDF_BROWSER_INSTALL === "1") process.exit(0);
const r = spawnSync("npx", ["playwright", "install", "chromium-headless-shell"], { stdio: "inherit", shell: true });
if (r.status !== 0) console.warn("[toanvui] ⚠ Không cài được Chromium — xuất PDF sẽ trả 503 PDF_UNAVAILABLE.");
```

`package.json` scripts:
```json
"start": "node scripts/start-standalone.mjs",
"postbuild": "node scripts/install-pdf-browser.mjs",
```
(Xóa `"start": "next start"`; giữ `start:standalone`.)

- [ ] **Step 6: Review Focus #3 — build không cần DB**

```bash
export PATH="/c/nvm4w/nodejs:$PATH"
env -u DATABASE_URL -u SESSION_SECRET SKIP_PDF_BROWSER_INSTALL=1 npm run build
```
Expected: exit 0. Nếu fail vì `env()`/Prisma bị gọi lúc build (lỗi `Invalid environment configuration`), tìm trang bị prerender gọi DB và thêm `export const dynamic = "force-dynamic";` như `src/app/(public)/page.tsx` đang làm; chạy lại tới khi pass.

- [ ] **Step 7: Review Focus #4 — không có Chromium**

```bash
export DATABASE_URL="postgresql://postgres:$(cat .local-db/pg-password)@127.0.0.1:5433/toanvui?schema=public"
SESSION_SECRET=0123456789abcdef0123456789abcdef01 PORT=3211 CHROMIUM_PATH=/khong/ton/tai npm start &
curl -fsS --retry 10 --retry-delay 2 --retry-all-errors -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3211/lop-6
curl -s -o /dev/null -w "%{http_code}\n" "http://127.0.0.1:3211/api/worksheets/$SLUG/pdf"   # SLUG từ Task 2 Step 2
```
Expected: `/lop-6` → `200`; PDF → `503` và body chứa `PDF_UNAVAILABLE`; tiến trình vẫn sống. Dừng tiến trình.

- [ ] **Step 8: Chạy lại toàn bộ cổng**

```bash
npm run typecheck && npm run lint && npm test && npm run build && npm run test:e2e
```
Expected: tất cả pass (cần `TEST_DATABASE_URL` như Task 2).

- [ ] **Step 9: Commit**

```bash
git add scripts/start-standalone.mjs scripts/install-pdf-browser.mjs package.json playwright.config.ts
git commit -m "build(deploy): npm start runs standalone on 0.0.0.0; best-effort Chromium install after build"
```

---

### Task 4: Checklist triển khai Hostinger (Mode A) trên nhánh `deploy`

**Files:**
- Create: `HOSTINGER.md`
- Modify: `DEPLOYMENT.md` (§10: thêm 1 dòng trỏ sang `HOSTINGER.md`)

**Interfaces:**
- Consumes: nhánh `deploy` từ Task 3.
- Produces: tài liệu người dùng làm theo trên hPanel.

- [ ] **Step 1: Viết `HOSTINGER.md`**

```markdown
# Đưa Toán Vui lên Hostinger (Node.js Web App) — nhánh `deploy`

## 1. Tạo PostgreSQL (một lần)
1. Tạo project ở neon.tech (hoặc supabase.com), region **Singapore**, PostgreSQL 16.
2. Copy connection string dạng `postgresql://USER:PASS@HOST/DBNAME?sslmode=require` → dán vào `DATABASE_URL` trong `.env.production` (file local, không commit).

## 2. Khởi tạo DB từ máy local (một lần, và mỗi khi có migration mới)
```bash
# Node 22
export $(grep -E '^DATABASE_URL=' .env.production | xargs)
npx prisma migrate deploy
npx tsx prisma/seed.ts
ADMIN_EMAIL=ban@example.com ADMIN_PASSWORD='MatKhauRatManh2026' ADMIN_NAME='Quản trị viên' npx tsx scripts/create-admin.ts
```

## 3. hPanel → Websites → violet-ram-565010.hostingersite.com → Node.js
| Mục | Giá trị |
| --- | --- |
| Nguồn | GitHub `hainc08/toanvuiformon`, nhánh **`deploy`** |
| Framework | Next.js |
| Node version | **22** |
| Build command | `npm run build` |
| Start command | `npm start` |
| Environment variables | toàn bộ các dòng trong `.env.production` (NODE_ENV, SITE_URL, DATABASE_URL, DATABASE_POOL_MAX, SESSION_SECRET, TRUST_PROXY, PDF_MAX_CONCURRENCY, NEXT_TELEMETRY_DISABLED) |

## 4. Kiểm tra sau deploy
- `https://violet-ram-565010.hostingersite.com/api/health` → `"status":"ok","db":"ok"`
- Trang chủ, `/lop-6`, `/thu-vien` mở được
- Tải PDF một bộ đề. Nếu trả **503 `PDF_UNAVAILABLE`**: Hostinger không chạy được Chromium → xem DEPLOYMENT.md §10 (chuyển VPS hoặc tách dịch vụ PDF).
- `/admin` đăng nhập bằng tài khoản ở bước 2, đổi mật khẩu.

## 5. Cập nhật về sau
Sửa trên `main` → kiểm tra local → `git switch deploy && git merge main && git push` → Hostinger tự build lại. Có migration mới → chạy lại bước 2 (`migrate deploy`) **trước** khi push.
```

- [ ] **Step 2: Trỏ từ DEPLOYMENT.md**

Thêm vào đầu §10 của `DEPLOYMENT.md`:
```markdown
> Hướng dẫn từng bước cho site `violet-ram-565010.hostingersite.com`: xem [HOSTINGER.md](HOSTINGER.md) (nhánh `deploy`).
```

- [ ] **Step 3: Kiểm tra không lộ bí mật**

Run: `git diff main --stat && git ls-files | grep -E '\.env($|\.)|tar\.gz|local-db'`
Expected: chỉ có `.env.example` trong kết quả grep.

- [ ] **Step 4: Commit**

```bash
git add HOSTINGER.md DEPLOYMENT.md
git commit -m "docs(deploy): Hostinger Node.js Web App checklist"
```

- [ ] **Step 5: ĐIỂM DỪNG — hỏi trước khi push**

Hỏi người dùng có push không. Chỉ khi đồng ý: `git push -u origin main deploy`. Báo lại: tên nhánh, các commit, và các bước người dùng tự làm (tạo Neon DB, bước 2–4 trong HOSTINGER.md).

---

## Ghi chú review

(Người thực hiện ghi tại đây các lỗi tìm thấy khi chạy Task 1–2 và cách sửa.)
