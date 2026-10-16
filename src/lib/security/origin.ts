import { ApiError } from "@/lib/http";

/**
 * CSRF defence for cookie-authenticated mutations.
 * Session cookies are SameSite=Lax; additionally require that state-changing
 * requests come from our own origin (Origin header, or Sec-Fetch-Site fallback).
 */
export function assertSameOrigin(req: Request): void {
  const method = req.method.toUpperCase();
  if (method === "GET" || method === "HEAD" || method === "OPTIONS") return;

  const origin = req.headers.get("origin");
  const host = req.headers.get("x-forwarded-host") ?? req.headers.get("host");
  const allowed = new Set<string>();
  if (host) allowed.add(host.toLowerCase());
  if (process.env.SITE_URL) {
    try {
      allowed.add(new URL(process.env.SITE_URL).host.toLowerCase());
    } catch {
      /* ignore malformed SITE_URL */
    }
  }

  if (origin) {
    let originHost: string;
    try {
      originHost = new URL(origin).host.toLowerCase();
    } catch {
      throw new ApiError(403, "FORBIDDEN", "Yêu cầu không hợp lệ.");
    }
    if (!allowed.has(originHost)) throw new ApiError(403, "FORBIDDEN", "Yêu cầu không hợp lệ.");
    return;
  }

  const fetchSite = req.headers.get("sec-fetch-site");
  if (fetchSite === "same-origin" || fetchSite === "none") return;
  throw new ApiError(403, "FORBIDDEN", "Yêu cầu không hợp lệ.");
}
