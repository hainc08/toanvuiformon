import "server-only";
import { chromium, type Browser } from "playwright-core";
import { ApiError } from "@/lib/http";
import { FOOTER_TEMPLATE } from "./template";

/**
 * Headless Chromium PDF renderer (single shared browser, bounded concurrency).
 * Requires a Chromium binary: CHROMIUM_PATH (Docker image installs Debian's `chromium`).
 */
let browserPromise: Promise<Browser> | null = null;
let idleTimer: NodeJS.Timeout | null = null;
let active = 0;
const waiters: (() => void)[] = [];
const IDLE_CLOSE_MS = 120_000;
const RENDER_TIMEOUT_MS = 30_000;

function maxConcurrency(): number {
  const n = Number(process.env.PDF_MAX_CONCURRENCY ?? 2);
  return Number.isFinite(n) && n >= 1 ? Math.min(8, Math.floor(n)) : 2;
}

async function acquire(): Promise<void> {
  if (active < maxConcurrency()) {
    active += 1;
    return;
  }
  await new Promise<void>((resolve) => waiters.push(resolve));
  active += 1;
}

function release(): void {
  active -= 1;
  waiters.shift()?.();
}

function getBrowser(): Promise<Browser> {
  if (!browserPromise) {
    const executablePath = process.env.CHROMIUM_PATH || undefined;
    browserPromise = chromium
      .launch({
        executablePath,
        headless: true,
        args: ["--disable-dev-shm-usage", "--no-sandbox", "--disable-gpu", "--font-render-hinting=none"],
      })
      .then((b) => {
        b.on("disconnected", () => {
          browserPromise = null;
        });
        return b;
      })
      .catch((err: unknown) => {
        browserPromise = null;
        console.error("[pdf] failed to launch Chromium:", err instanceof Error ? err.message : err);
        throw new ApiError(503, "PDF_UNAVAILABLE", "Chức năng tạo PDF tạm thời không khả dụng. Vui lòng thử lại sau.");
      });
  }
  return browserPromise;
}

function scheduleIdleClose(): void {
  if (idleTimer) clearTimeout(idleTimer);
  idleTimer = setTimeout(async () => {
    if (active > 0 || !browserPromise) return;
    const b = await browserPromise.catch(() => null);
    browserPromise = null;
    await b?.close().catch(() => undefined);
  }, IDLE_CLOSE_MS);
  idleTimer.unref?.();
}

export async function renderPdf(html: string): Promise<Buffer> {
  await acquire();
  try {
    const browser = await getBrowser();
    const context = await browser.newContext({ offline: true });
    try {
      const page = await context.newPage();
      page.setDefaultTimeout(RENDER_TIMEOUT_MS);
      // Defence in depth: block every non-inline resource.
      await page.route("**/*", (r) => (r.request().url().startsWith("data:") ? r.continue() : r.abort()));
      await page.setContent(html, { waitUntil: "load" });
      await page.evaluate(() => document.fonts.ready.then(() => undefined));
      const pdf = await page.pdf({
        format: "A4",
        printBackground: true,
        preferCSSPageSize: true,
        displayHeaderFooter: true,
        headerTemplate: "<div></div>",
        footerTemplate: FOOTER_TEMPLATE,
        margin: { top: "16mm", bottom: "18mm", left: "15mm", right: "15mm" },
      });
      return Buffer.from(pdf);
    } finally {
      await context.close().catch(() => undefined);
    }
  } finally {
    release();
    scheduleIdleClose();
  }
}

export async function closePdfBrowser(): Promise<void> {
  const b = await browserPromise?.catch(() => null);
  browserPromise = null;
  await b?.close().catch(() => undefined);
}
