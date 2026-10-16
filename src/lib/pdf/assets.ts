import "server-only";
import { readFileSync } from "node:fs";
import path from "node:path";

/**
 * Builds a self-contained stylesheet (KaTeX + Be Vietnam Pro) with fonts inlined as
 * data URIs, so the PDF renderer never needs network or filesystem access.
 */
let cachedCss: string | null = null;

function moduleDir(...segments: string[]): string {
  return path.join(process.cwd(), "node_modules", ...segments);
}

function inlineFontUrls(css: string, baseDir: string): string {
  // Keep only woff2 sources (supported by Chromium) and inline them.
  const stripped = css.replace(/,\s*url\([^)]+\.(?:woff|ttf)\)\s*format\(["'][a-z]+["']\)/g, "");
  return stripped.replace(/url\((?:\.\/)?([^)]+\.woff2)\)/g, (_m, rel: string) => {
    const data = readFileSync(path.join(baseDir, rel)).toString("base64");
    return `url(data:font/woff2;base64,${data})`;
  });
}

export function pdfStylesheet(): string {
  if (cachedCss) return cachedCss;
  const katexDir = moduleDir("katex", "dist");
  const katexCss = inlineFontUrls(readFileSync(path.join(katexDir, "katex.min.css"), "utf8"), katexDir);
  const fontDir = moduleDir("@fontsource", "be-vietnam-pro");
  const fontCss = ["400", "600", "700"]
    .map((w) => inlineFontUrls(readFileSync(path.join(fontDir, `${w}.css`), "utf8"), fontDir))
    .join("\n");
  cachedCss = `${fontCss}\n${katexCss}`;
  return cachedCss;
}
