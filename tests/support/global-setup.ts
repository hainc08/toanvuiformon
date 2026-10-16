import { execSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import mariadb from "mariadb";
import { mariadbUrl } from "../../src/lib/db/adapter";

/**
 * Integration test DB: drop and recreate the database, apply every migration.sql in order
 * (plain SQL, no Prisma engine needed) and run the idempotent seed.
 */
export default async function setup() {
  const url = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is required for integration tests");
  if (!/test/i.test(url)) throw new Error("Refusing to reset a database whose URL does not contain 'test'");
  const parsed = new URL(mariadbUrl(url));
  const dbName = decodeURIComponent(parsed.pathname.slice(1));
  if (!/^[\w-]+$/.test(dbName)) throw new Error(`Unexpected test database name: ${dbName}`);
  const conn = await mariadb.createConnection({
    host: parsed.hostname,
    port: Number(parsed.port || 3306),
    user: decodeURIComponent(parsed.username),
    password: decodeURIComponent(parsed.password),
    multipleStatements: true,
  });
  try {
    await conn.query(`DROP DATABASE IF EXISTS \`${dbName}\``);
    await conn.query(`CREATE DATABASE \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    await conn.query(`USE \`${dbName}\``);
    const dir = path.join(process.cwd(), "prisma", "migrations");
    for (const m of readdirSync(dir).filter((d) => !d.endsWith(".toml")).sort()) {
      await conn.query(readFileSync(path.join(dir, m, "migration.sql"), "utf8"));
    }
  } finally {
    await conn.end();
  }
  execSync("npx tsx prisma/seed.ts", { env: { ...process.env, DATABASE_URL: url }, stdio: "inherit" });
}
