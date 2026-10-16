// Production entry (`npm start`, used by Hostinger): bring the database schema up to date, load the
// idempotent Toán 6 seed (plus the first admin from SEED_ADMIN_EMAIL/SEED_ADMIN_PASSWORD), then start
// the standalone server. Set DB_SETUP_ON_START=false to skip the database steps.
import { spawnSync } from "node:child_process";

function step(label, cmd, { fatal }) {
  console.log(`[toanvui] ${label}…`);
  const r = spawnSync(cmd, { stdio: "inherit", shell: true, env: process.env });
  if (r.status === 0) return;
  if (fatal) {
    console.error(`[toanvui] ${label} thất bại — không khởi động ứng dụng. Kiểm tra DATABASE_URL.`);
    process.exit(1);
  }
  console.warn(`[toanvui] ⚠ ${label} thất bại — vẫn khởi động ứng dụng.`);
}

if (process.env.DB_SETUP_ON_START !== "false") {
  step("Áp dụng migrations", "npx prisma migrate deploy", { fatal: true });
  step("Nạp dữ liệu mẫu", "npx tsx prisma/seed.ts", { fatal: false });
}
await import("./start-standalone.mjs");
