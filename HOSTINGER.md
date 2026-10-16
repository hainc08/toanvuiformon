# Đưa Toán Vui lên Hostinger (Node.js Web App + MySQL) — nhánh `deploy`

Site: **https://toanvui.manabihub.me** · DB: `u774510961_toanvuidb` · user: `u774510961_toanvuiusr`

Mỗi lần khởi động (`npm start` → `scripts/start-production.mjs`) ứng dụng tự áp dụng migrations mới. Dữ liệu mẫu Toán 6 **chỉ được nạp khi DB còn trống** (lần deploy đầu) và tài khoản admin từ `SEED_ADMIN_*` **chỉ được tạo khi chưa có tài khoản nào** — nội dung hay tài khoản bạn xóa/sửa trong trang quản trị không bao giờ bị khôi phục lại. Không cần Remote MySQL hay chạy lệnh gì từ máy local.

## 1. Mật khẩu MySQL

hPanel → Websites → toanvui.manabihub.me → **Databases → MySQL Databases**: dùng mật khẩu của user `u774510961_toanvuiusr` (quên thì đổi ở đó).
Mật khẩu có ký tự đặc biệt `@ : / # ? % &` phải **mã hóa URL** khi đưa vào `DATABASE_URL` (`@`→`%40`, `#`→`%23`, `%`→`%25`, `:`→`%3A`, `/`→`%2F`, `?`→`%3F`, `&`→`%26`) — đơn giản nhất là đặt mật khẩu chỉ gồm chữ và số (≥ 16 ký tự).

## 2. Cấu hình Node.js app

hPanel → Websites → toanvui.manabihub.me → **Node.js** (Add/Deploy Node.js app):

| Mục | Giá trị |
| --- | --- |
| Nguồn | GitHub `hainc08/toanvuiformon`, nhánh **`deploy`** |
| Framework preset | Next.js (hoặc Other/Express nếu cần nhập lệnh tay) |
| Node version | **22.x** |
| Build command | `npm run build` |
| Start command / Entry | `npm start` |

## 3. Environment variables

| Biến | Giá trị |
| --- | --- |
| `DATABASE_URL` | `mysql://u774510961_toanvuiusr:<MẬT_KHẨU>@localhost:3306/u774510961_toanvuidb` |
| `SITE_URL` | `https://toanvui.manabihub.me` |
| `SESSION_SECRET` | chuỗi ngẫu nhiên ≥ 32 ký tự (ví dụ chạy `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`) |
| `TRUST_PROXY` | `true` |
| `DATABASE_POOL_MAX` | `5` |
| `PDF_MAX_CONCURRENCY` | `1` |
| `NEXT_TELEMETRY_DISABLED` | `1` |
| `SEED_ADMIN_EMAIL` | email admin của bạn |
| `SEED_ADMIN_PASSWORD` | mật khẩu admin ≥ 12 ký tự, có chữ và số |

- **Không** thêm `NODE_ENV` — nếu Hostinger dùng nó lúc `npm install`, các gói cần cho build (TypeScript, Tailwind, Prisma CLI) sẽ bị bỏ qua và build lỗi. Next.js tự chạy ở chế độ production.
- Host `localhost` đúng khi app và DB cùng tài khoản Hostinger. Nếu kết nối lỗi, xem hostname MySQL trong hPanel (trang MySQL Databases) và thay vào.
- `SEED_ADMIN_*` chỉ dùng ở lần deploy đầu (khi DB chưa có tài khoản nào). **Sau khi đăng nhập được, xóa 2 biến này** khỏi hPanel để mật khẩu không nằm lại trong cấu hình.

## 4. Deploy & kiểm tra

Bấm Deploy, xem log build và log ứng dụng. Log khởi động đúng có các dòng:
```
[toanvui] Áp dụng migrations…
[toanvui] Nạp dữ liệu mẫu…
  ✓ Questions: 134 created …
  ✓ Admin account created: <email>
```

Kiểm tra:
- https://toanvui.manabihub.me/api/health → `"status":"ok","db":"ok"`
- Trang chủ, `/lop-6`, `/thu-vien`, `/tao-de`
- Tải PDF một bộ đề. Nếu trả **503 `PDF_UNAVAILABLE`**: Hostinger không chạy được Chromium — phần còn lại của site vẫn hoạt động; xem DEPLOYMENT.md §10 về phương án PDF.
- https://toanvui.manabihub.me/admin → đăng nhập bằng `SEED_ADMIN_EMAIL`, đổi mật khẩu ở **Cài đặt**, rồi xóa `SEED_ADMIN_EMAIL`/`SEED_ADMIN_PASSWORD` trên hPanel.

Lỗi thường gặp:

| Triệu chứng | Nguyên nhân / cách xử lý |
| --- | --- |
| Log: `Áp dụng migrations thất bại` | Sai `DATABASE_URL` (mật khẩu chưa mã hóa URL, sai host/user/DB) |
| Log: `DATABASE_URL is not a valid URL` | Mật khẩu có ký tự đặc biệt chưa mã hóa URL (xem §1) |
| Log: `npx: … not found` / `could not determine executable` | Thiếu devDependencies lúc cài — xóa biến `NODE_ENV`, deploy lại |
| `/api/health` → `db: unreachable` | Như trên, hoặc DB chưa gán quyền cho user |
| Build lỗi thiếu module (`typescript`, `@tailwindcss/postcss`, `prisma`) | Xóa biến `NODE_ENV`, deploy lại |
| 503 toàn site | Xem log ứng dụng; app phải lắng nghe `PORT` do Hostinger cấp (đã xử lý trong `scripts/start-standalone.mjs`) |

## 5. Cập nhật về sau

Sửa trên `main` → kiểm tra local (`npm run local`) → `git switch deploy && git merge main && git push` → Hostinger build lại; migration mới tự chạy khi app khởi động.
