// Bring the database up to date: apply migrations, then load the Toán 6 sample content only into an empty
// database (and the first admin from SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD only while no account exists).
// Runs in `postbuild` (Hostinger starts the standalone server directly and never calls `npm start`)
// and again from `npm start`. Safe to repeat. DB_SETUP_ON_START=false skips it; so does a missing DATABASE_URL.
import { spawnSync } from "node:child_process";

function step(label, cmd, env = {}) {
  console.log(`[toanvui] ${label}…`);
  const r = spawnSync(cmd, { stdio: "inherit", shell: true, env: { ...process.env, ...env } });
  if (r.status === 0) return true;
  console.warn(`[toanvui] ⚠ ${label} thất bại — kiểm tra DATABASE_URL (mật khẩu có ký tự đặc biệt phải mã hóa URL) và quyền của user MySQL.`);
  return false;
}

if (process.env.DB_SETUP_ON_START === "false" || !process.env.DATABASE_URL) {
  console.log("[toanvui] Bỏ qua thiết lập DB (DB_SETUP_ON_START=false hoặc chưa có DATABASE_URL).");
} else if (step("Áp dụng migrations", "npx --no-install prisma migrate deploy")) {
  // --no-install: never fetch a different prisma/tsx from the registry if devDependencies are missing.
  step("Nạp dữ liệu mẫu", "npx --no-install tsx prisma/seed.ts", { SEED_ONLY_EMPTY_DB: "true" });
}
