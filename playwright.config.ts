import { defineConfig, devices } from "@playwright/test";

const PORT = Number(process.env.E2E_PORT ?? 3100);
const baseURL = `http://127.0.0.1:${PORT}`;
const dbUrl = process.env.TEST_DATABASE_URL ?? "";
const executablePath = process.env.CHROMIUM_PATH || undefined;

export default defineConfig({
  testDir: "tests/e2e",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [["list"], ["html", { open: "never" }]] : "list",
  timeout: 60_000,
  globalSetup: "./tests/e2e/global-setup.ts",
  use: { baseURL, trace: "retain-on-failure", locale: "vi-VN", launchOptions: { executablePath } },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], launchOptions: { executablePath } } },
    { name: "mobile", use: { ...devices["Pixel 7"], launchOptions: { executablePath } }, testMatch: /student\.spec\.ts/ },
  ],
  webServer: {
    // Requires `npm run build` first (standalone output).
    command: "node scripts/start-standalone.mjs",
    url: `${baseURL}/api/health`,
    reuseExistingServer: false,
    timeout: 60_000,
    env: {
      PORT: String(PORT),
      BIND_HOST: "127.0.0.1",
      DATABASE_URL: dbUrl,
      SITE_URL: baseURL,
      SESSION_SECRET: "e2e-secret-0123456789abcdef0123456789",
      TRUST_PROXY: "true",
      NODE_ENV: "production",
      ...(executablePath ? { CHROMIUM_PATH: executablePath } : {}),
    },
  },
});
