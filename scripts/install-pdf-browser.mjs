// Best-effort install of the headless Chromium used for PDF export. Never fails the build:
// on hosts without the needed system libraries, PDFs answer 503 PDF_UNAVAILABLE and the rest of the site works.
import { spawnSync } from "node:child_process";

if (process.env.CHROMIUM_PATH || process.env.SKIP_PDF_BROWSER_INSTALL === "1") process.exit(0);
const r = spawnSync("npx playwright install chromium-headless-shell", { stdio: "inherit", shell: true });
if (r.status !== 0) console.warn("[toanvui] ⚠ Không cài được Chromium — xuất PDF sẽ trả 503 PDF_UNAVAILABLE.");
