import { execSync } from "node:child_process";
import setupDb from "../support/global-setup";

export const E2E_ADMIN = { email: "e2e-admin@toanvui.test", password: "E2eAdminPassword123" };

export default async function globalSetup() {
  await setupDb();
  execSync("npx tsx scripts/create-admin.ts", {
    stdio: "inherit",
    env: { ...process.env, DATABASE_URL: process.env.TEST_DATABASE_URL, ADMIN_EMAIL: E2E_ADMIN.email, ADMIN_PASSWORD: E2E_ADMIN.password, ADMIN_NAME: "E2E Admin" },
  });
}
