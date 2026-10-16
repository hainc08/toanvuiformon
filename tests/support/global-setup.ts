import { execSync } from "node:child_process";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import pg from "pg";

/**
 * Integration test DB: recreate the public schema, apply every migration.sql in order
 * (plain SQL, no Prisma engine needed) and run the idempotent seed.
 */
export default async function setup() {
  const url = process.env.TEST_DATABASE_URL ?? process.env.DATABASE_URL;
  if (!url) throw new Error("TEST_DATABASE_URL is required for integration tests");
  if (!/test/i.test(url)) throw new Error("Refusing to reset a database whose URL does not contain 'test'");
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  await client.query("DROP SCHEMA IF EXISTS public CASCADE; CREATE SCHEMA public;");
  const dir = path.join(process.cwd(), "prisma", "migrations");
  for (const m of readdirSync(dir).filter((d) => !d.endsWith(".toml")).sort()) {
    await client.query(readFileSync(path.join(dir, m, "migration.sql"), "utf8"));
  }
  await client.end();
  execSync("npx tsx prisma/seed.ts", { env: { ...process.env, DATABASE_URL: url }, stdio: "inherit" });
}
