/**
 * One-command local run (Windows / macOS / Linux) — needs MariaDB installed (https://mariadb.org/download/),
 * but no database setup, root password or running service.
 *
 *   npm install
 *   npm run local
 *
 * Starts a private MariaDB server (data kept in ./.local-db/mariadb, port 3307), applies migrations,
 * seeds Toán 6, creates a local admin account on first run, installs the PDF browser if missing, then runs
 * `next dev` on http://localhost:3000. Press Ctrl+C to stop everything.
 */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import mariadb from "mariadb";

const ROOT = process.cwd();
const STATE = path.join(ROOT, ".local-db");
const DATA_DIR = path.join(STATE, "mariadb");
const DB_PORT = Number(process.env.LOCAL_DB_PORT ?? 3307);
const APP_PORT = Number(process.env.PORT ?? 3000);
const DB_NAME = "toanvui";
const DB_USER = "toanvui";
const IS_WIN = process.platform === "win32";
const EXE = IS_WIN ? ".exe" : "";

mkdirSync(STATE, { recursive: true });

function persisted(file, create) {
  const p = path.join(STATE, file);
  if (existsSync(p)) return readFileSync(p, "utf8").trim();
  const value = create();
  writeFileSync(p, value);
  return value;
}

const rootPassword = persisted("db-root-password", () => randomBytes(18).toString("base64url"));
const dbPassword = persisted("db-password", () => randomBytes(18).toString("base64url"));
const sessionSecret = persisted("session-secret", () => randomBytes(48).toString("base64url"));
const DATABASE_URL = `mysql://${DB_USER}:${dbPassword}@127.0.0.1:${DB_PORT}/${DB_NAME}`;

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

function runFile(file, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(file, args, { stdio: ["ignore", "ignore", "pipe"] });
    let err = "";
    child.stderr.on("data", (d) => (err += d));
    child.on("error", reject);
    child.on("exit", (code) => (code === 0 ? resolve() : reject(new Error(`${path.basename(file)} exited with code ${code}\n${err}`))));
  });
}

const log = (msg) => console.log(`\x1b[36m[toanvui]\x1b[0m ${msg}`);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/** Directory holding mariadbd: MARIADB_BIN, then C:\Program Files\MariaDB *\bin (newest), then PATH. */
function findMariadbBin() {
  const candidates = [];
  if (process.env.MARIADB_BIN) candidates.push(process.env.MARIADB_BIN);
  if (IS_WIN) {
    for (const base of [process.env.ProgramFiles, process.env["ProgramFiles(x86)"]].filter(Boolean)) {
      if (!existsSync(base)) continue;
      const dirs = readdirSync(base).filter((d) => /^MariaDB \d/.test(d));
      dirs.sort((a, b) => b.localeCompare(a, undefined, { numeric: true }));
      candidates.push(...dirs.map((d) => path.join(base, d, "bin")));
    }
  }
  candidates.push(...(process.env.PATH ?? "").split(path.delimiter), "/usr/sbin", "/usr/local/sbin", "/opt/homebrew/bin");
  return candidates.find((dir) => dir && existsSync(path.join(dir, `mariadbd${EXE}`)));
}

async function connect(user, password, database) {
  return mariadb.createConnection({ host: "127.0.0.1", port: DB_PORT, user, password, database, connectTimeout: 2000 });
}

async function canConnectAsApp() {
  try {
    const c = await connect(DB_USER, dbPassword);
    await c.end();
    return true;
  } catch {
    return false;
  }
}

let server = null; // the mariadbd we started (null when reusing one that was already running)
let bin = null;
let stopping = false;
async function shutdown(code = 0) {
  if (stopping) return;
  stopping = true;
  if (server) {
    log("Đang dừng MariaDB…");
    await runFile(path.join(bin, `mariadb-admin${EXE}`), ["-h127.0.0.1", `-P${DB_PORT}`, "-uroot", `-p${rootPassword}`, "shutdown"]).catch(() => server.kill());
  }
  process.exit(code);
}
process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

try {
  const firstRun = !existsSync(DATA_DIR);
  if (await canConnectAsApp()) {
    log(`MariaDB đã chạy sẵn ở cổng ${DB_PORT} — dùng lại`);
  } else {
    bin = findMariadbBin();
    if (!bin) {
      throw new Error("Không tìm thấy MariaDB. Cài MariaDB (https://mariadb.org/download/) rồi chạy lại, hoặc đặt MARIADB_BIN=<thư mục chứa mariadbd>.");
    }
    if (firstRun) {
      log(`Khởi tạo MariaDB lần đầu (${bin})…`);
      const installDb = path.join(bin, `mariadb-install-db${EXE}`);
      const args = IS_WIN
        ? [`--datadir=${DATA_DIR}`, `--password=${rootPassword}`]
        : [`--datadir=${DATA_DIR}`, "--auth-root-authentication-method=normal", "--skip-test-db"];
      await runFile(installDb, args);
    }
    server = spawn(
      path.join(bin, `mariadbd${EXE}`),
      [
        ...(IS_WIN ? [] : ["--no-defaults"]),
        `--datadir=${DATA_DIR}`,
        `--port=${DB_PORT}`,
        "--bind-address=127.0.0.1",
        "--character-set-server=utf8mb4",
        "--collation-server=utf8mb4_unicode_ci",
        ...(IS_WIN ? [] : [`--socket=${path.join(STATE, "mariadb.sock")}`]),
      ],
      { stdio: ["ignore", "ignore", "pipe"] },
    );
    let serverLog = "";
    server.stderr.on("data", (d) => (serverLog = (serverLog + d).slice(-4000)));
    server.on("exit", (code) => {
      if (!stopping) {
        console.error(serverLog);
        console.error(`[toanvui] MariaDB dừng bất ngờ (code ${code}).`);
        shutdown(1);
      }
    });

    // Wait until it accepts root connections, then make sure the app user and database exist.
    let root = null;
    for (let i = 0; i < 60 && !root; i++) {
      root = await connect("root", rootPassword).catch(() => (IS_WIN ? null : connect("root", "").catch(() => null)));
      if (!root) await sleep(1000);
    }
    if (!root) throw new Error(`MariaDB không khởi động được ở cổng ${DB_PORT}.\n${serverLog}`);
    if (!IS_WIN && firstRun) await root.query("ALTER USER 'root'@'localhost' IDENTIFIED BY ?", [rootPassword]).catch(() => undefined);
    await root.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    for (const host of ["localhost", "127.0.0.1"]) {
      await root.query(`CREATE USER IF NOT EXISTS '${DB_USER}'@'${host}' IDENTIFIED BY ?`, [dbPassword]);
      // Local only: ALL lets tests create/drop toanvui_test and `prisma migrate dev` use a shadow database.
      await root.query(`GRANT ALL PRIVILEGES ON *.* TO '${DB_USER}'@'${host}'`);
    }
    await root.end();
    log(`MariaDB đang chạy ở cổng ${DB_PORT}`);
  }

  log("Áp dụng migrations…");
  await run(process.env.LOCAL_MIGRATE_CMD ?? "npx prisma migrate deploy");
  log("Nạp dữ liệu Toán 6 (bỏ qua nếu đã có)…");
  await run("npx tsx prisma/seed.ts");

  const client = await connect(DB_USER, dbPassword, DB_NAME);
  const [{ n }] = await client.query("SELECT COUNT(*) AS n FROM users");
  await client.end();
  const credsFile = path.join(STATE, "admin-login.txt");
  if (Number(n) === 0) {
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
