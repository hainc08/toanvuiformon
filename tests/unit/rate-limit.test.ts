import { beforeEach, describe, expect, it } from "vitest";
import { checkRateLimit, enforceRateLimit, resetRateLimits } from "@/lib/security/rate-limit";
import { ApiError } from "@/lib/http";

const rule = { name: "t", limit: 3, windowMs: 1_000 };

describe("rate limiter", () => {
  beforeEach(() => resetRateLimits());

  it("allows up to the limit then blocks", () => {
    const now = 1_000_000;
    expect(checkRateLimit(rule, "ip", now).ok).toBe(true);
    expect(checkRateLimit(rule, "ip", now).ok).toBe(true);
    expect(checkRateLimit(rule, "ip", now).ok).toBe(true);
    const blocked = checkRateLimit(rule, "ip", now + 10);
    expect(blocked.ok).toBe(false);
    expect(blocked.retryAfterSec).toBeGreaterThan(0);
  });

  it("resets after the window and isolates keys", () => {
    const now = 2_000_000;
    for (let i = 0; i < 3; i++) checkRateLimit(rule, "a", now);
    expect(checkRateLimit(rule, "b", now).ok).toBe(true);
    expect(checkRateLimit(rule, "a", now + 1_001).ok).toBe(true);
  });

  it("throws a 429 ApiError", () => {
    for (let i = 0; i < 3; i++) enforceRateLimit(rule, "x");
    try {
      enforceRateLimit(rule, "x");
      expect.unreachable();
    } catch (e) {
      expect(e).toBeInstanceOf(ApiError);
      expect((e as ApiError).status).toBe(429);
    }
  });
});
