// Starts the Next.js standalone server after copying static assets next to it
// (the standalone output does not include .next/static and public/ by design).
import { cpSync, existsSync } from "node:fs";
import { spawn } from "node:child_process";

const root = process.cwd();
if (!existsSync(".next/standalone/server.js")) {
  console.error("Missing .next/standalone/server.js — run `npm run build` first.");
  process.exit(1);
}
cpSync(".next/static", ".next/standalone/.next/static", { recursive: true });
if (existsSync("public")) cpSync("public", ".next/standalone/public", { recursive: true });
// Hosting platforms (e.g. Hostinger) often export HOSTNAME=<machine name>, which the standalone
// server would bind to. Listen on all interfaces unless BIND_HOST says otherwise.
const childEnv = { ...process.env, HOSTNAME: process.env.BIND_HOST || "0.0.0.0" };
const child = spawn(process.execPath, ["server.js"], { cwd: `${root}/.next/standalone`, stdio: "inherit", env: childEnv });
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => child.kill(sig));
child.on("exit", (code) => process.exit(code ?? 0));
