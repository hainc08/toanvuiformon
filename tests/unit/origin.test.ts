import { describe, expect, it } from "vitest";
import { assertSameOrigin } from "@/lib/security/origin";

const req = (headers: Record<string, string>, method = "POST") => new Request("http://localhost:3000/api/x", { method, headers });

describe("CSRF origin check", () => {
  it("allows same-origin requests", () => {
    expect(() => assertSameOrigin(req({ host: "localhost:3000", origin: "http://localhost:3000" }))).not.toThrow();
    expect(() => assertSameOrigin(req({ host: "localhost:3000", "sec-fetch-site": "same-origin" }))).not.toThrow();
  });

  it("rejects cross-origin and origin-less mutations", () => {
    expect(() => assertSameOrigin(req({ host: "localhost:3000", origin: "https://evil.example" }))).toThrow();
    expect(() => assertSameOrigin(req({ host: "localhost:3000" }))).toThrow();
    expect(() => assertSameOrigin(req({ host: "localhost:3000", "sec-fetch-site": "cross-site" }))).toThrow();
  });

  it("ignores safe methods", () => {
    expect(() => assertSameOrigin(req({ origin: "https://evil.example" }, "GET"))).not.toThrow();
  });
});
