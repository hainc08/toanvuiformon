/**
 * One-command local run (Windows / macOS / Linux) — no PostgreSQL or Docker install needed.
 *
 *   npm install
 *   npm run local
 *
 * Starts an embedded PostgreSQL 16 (data kept in ./.local-db), applies migrations, seeds Toán 6,
 * creates a local admin account on first run, installs the PDF browser if missing, then runs
 * `next dev` on http://localhost:3000. Press Ctrl+C to stop everything.
 */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import EmbeddedPostgres from "embedded-postgres";
import pg from "pg";

const ROOT = process.cwd();
const STATE = path.join(ROOT, ".local-db");
const DATA_DIR = path.join(STATE, "data");
const PG_PORT = Number(process.env.LOCAL_PG_PORT ?? 5433);
const APP_PORT = Number(process.env.PORT ?? 3000);
const DB_NAME = "toanvui";
const PG_USER = "postgres";

mkdirSync(STATE, { recursive: true });

function persisted(file, create) {
  const p = path.join(STATE, file);
  if (existsSync(p)) return readFileSync(p, "utf8").trim();
  const value = create();
  writeFileSync(p, value);
  return value;
}

const pgPassword = persisted("pg-password", () => randomBytes(18).toString("base64url"));
const sessionSecret = persisted("session-secret", () => randomBytes(48).toString("base64url"));
const DATABASE_URL = `postgresql://${PG_USER}:${pgPassword}@127.0.0.1:${PG_PORT}/${DB_NAME}?schema=public`;

const env = {
  ...process.env,
  DATABASE_URL,
  SESSION_SECRET: sessionSecret,
  SITE_URL: `http://localhost:${APP_PORT}`,
  PORT: String(APP_PORT),
  NEXT_TELEMETRY_DISABLED: "1",
};

function run(cmd, extraEnv = {}) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, { stdio: "inherit", shell: true, env: { ...env, ...extraEnv } });
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`"${cmd}" exited with code ${code}`))));
  });
}

const log = (msg) => console.log(`\x1b[36m[toanvui]\x1b[0m ${msg}`);

const db = new EmbeddedPostgres({
  databaseDir: DATA_DIR,
  user: PG_USER,
  password: pgPassword,
  port: PG_PORT,
  persistent: true,
  onLog: () => {},
});

let stopping = false;
async function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  log("Đang dừng PostgreSQL…");
  await db.stop().catch(() => undefined);
  process.exit(code);
}
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

try {
  if (!existsSync(path.join(DATA_DIR, "PG_VERSION"))) {
    log("Khởi tạo PostgreSQL nhúng lần đầu…");
    await db.initialise();
  }
  await db.start();
  log(`PostgreSQL đang chạy ở cổng ${PG_PORT}`);

  const admin = new pg.Client({ connectionString: DATABASE_URL.replace(`/${DB_NAME}?`, "/postgres?") });
  await admin.connect();
  const exists = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [DB_NAME]);
  if (exists.rowCount === 0) await admin.query(`CREATE DATABASE ${DB_NAME}`);
  await admin.end();

  log("Áp dụng migrations…");
  await run(process.env.LOCAL_MIGRATE_CMD ?? "npx prisma migrate deploy");
  log("Nạp dữ liệu Toán 6 (bỏ qua nếu đã có)…");
  await run("npx tsx prisma/seed.ts");

  const client = new pg.Client({ connectionString: DATABASE_URL });
  await client.connect();
  const users = await client.query("SELECT count(*)::int AS n FROM users");
  await client.end();
  const credsFile = path.join(STATE, "admin-login.txt");
  if (users.rows[0].n === 0) {
    const password = `Local${randomBytes(6).toString("hex")}9`;
    await run("npx tsx scripts/create-admin.ts", { ADMIN_EMAIL: "admin@toanvui.local", ADMIN_PASSWORD: password, ADMIN_NAME: "Quản trị viên (local)" });
    writeFileSync(credsFile, `Email: admin@toanvui.local\nMật khẩu: ${password}\n`);
  }

  if (process.env.LOCAL_SKIP_BROWSER_INSTALL !== "1") {
    log("Kiểm tra trình duyệt dùng để xuất PDF…");
    await run("npx playwright install chromium-headless-shell").catch(() => log("⚠ Không cài được Chromium — xem/tải đề vẫn chạy, riêng xuất PDF sẽ báo lỗi."));
  }

  console.log("\n────────────────────────────────────────────────────────");
  console.log(`  Toán Vui:   http://localhost:${APP_PORT}`);
  console.log(`  Quản trị:   http://localhost:${APP_PORT}/admin`);
  if (existsSync(credsFile)) console.log(readFileSync(credsFile, "utf8").replace(/^/gm, "  "));
  console.log("  Dừng: Ctrl+C");
  console.log("────────────────────────────────────────────────────────\n");

  const web = spawn(process.env.LOCAL_WEB_CMD ?? `npx next dev -p ${APP_PORT}`, { stdio: "inherit", shell: true, env });
  web.on("exit", (code) => shutdown(code ?? 0));
} catch (err) {
  console.error(`\n[toanvui] Lỗi: ${err instanceof Error ? err.message : err}`);
  await shutdown(1);
}
