/** Best-effort client IP for rate limiting. Never stored in the database. */
export function clientIp(req: Request): string {
  if (process.env.TRUST_PROXY === "true") {
    const forwarded = req.headers.get("x-forwarded-for");
    const first = forwarded?.split(",")[0]?.trim();
    if (first) return first;
    const real = req.headers.get("x-real-ip");
    if (real) return real.trim();
  }
  return "local";
}
