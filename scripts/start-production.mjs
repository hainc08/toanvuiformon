// Production entry (`npm start`, used by Hostinger): bring the database schema up to date, load the
// Toán 6 sample content only into an empty database (and the first admin from SEED_ADMIN_EMAIL/
// SEED_ADMIN_PASSWORD only while no account exists), then start the standalone server.
// Set DB_SETUP_ON_START=false to skip the database steps.
import { spawnSync } from "node:child_process";

function step(label, cmd, { fatal, env = {} }) {
  console.log(`[toanvui] ${label}…`);
  const r = spawnSync(cmd, { stdio: "inherit", shell: true, env: { ...process.env, ...env } });
  if (r.status === 0) return;
  if (fatal) {
    console.error(`[toanvui] ${label} thất bại — không khởi động ứng dụng. Kiểm tra DATABASE_URL.`);
    process.exit(1);
  }
  console.warn(`[toanvui] ⚠ ${label} thất bại — vẫn khởi động ứng dụng.`);
}

if (process.env.DB_SETUP_ON_START !== "false") {
  // --no-install: never fetch a different prisma/tsx from the registry if devDependencies are missing.
  step("Áp dụng migrations", "npx --no-install prisma migrate deploy", { fatal: true });
  step("Nạp dữ liệu mẫu", "npx --no-install tsx prisma/seed.ts", { fatal: false, env: { SEED_ONLY_EMPTY_DB: "true" } });
}
await import("./start-standalone.mjs");
