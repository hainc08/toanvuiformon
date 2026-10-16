import { expect, test } from "@playwright/test";
import { E2E_ADMIN } from "./global-setup";

const json = { "Content-Type": "application/json" };

test.describe("security", () => {
  test("admin APIs reject anonymous requests", async ({ request, baseURL }) => {
    const origin = { ...json, Origin: baseURL! };
    expect((await request.get("/api/admin/questions", { headers: origin })).status()).toBe(401);
    expect((await request.post("/api/admin/questions", { headers: origin, data: {} })).status()).toBe(401);
    expect((await request.get("/api/admin/users", { headers: origin })).status()).toBe(401);
    expect((await request.get("/api/admin/stats", { headers: origin })).status()).toBe(401);
  });

  test("cross-origin mutations are rejected (CSRF)", async ({ request }) => {
    const res = await request.post("/api/admin/auth/login", { headers: { ...json, Origin: "https://evil.example" }, data: E2E_ADMIN });
    expect(res.status()).toBe(403);
    const gen = await request.post("/api/worksheets/generate", { headers: { ...json, Origin: "https://evil.example" }, data: { count: 10 } });
    expect(gen.status()).toBe(403);
  });

  test("editors cannot escalate privileges or publish", async ({ playwright, baseURL }) => {
    const admin = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { Origin: baseURL!, "X-Forwarded-For": "10.1.0.1" } });
    expect((await admin.post("/api/admin/auth/login", { data: E2E_ADMIN })).ok()).toBe(true);
    const email = `editor-${Date.now()}@toanvui.test`;
    const created = await admin.post("/api/admin/users", { data: { email, name: "Biên tập", role: "EDITOR", password: "EditorPassword123" } });
    expect(created.status()).toBe(201);

    const editor = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { Origin: baseURL!, "X-Forwarded-For": "10.1.0.2" } });
    expect((await editor.post("/api/admin/auth/login", { data: { email, password: "EditorPassword123" } })).ok()).toBe(true);
    expect((await editor.get("/api/admin/users")).status()).toBe(403);
    expect((await editor.post("/api/admin/users", { data: { email: "x@y.vn", name: "X", role: "ADMIN", password: "Password123456" } })).status()).toBe(403);

    const list = await (await editor.get("/api/admin/questions?status=APPROVED&pageSize=1")).json();
    const published = await (await editor.get("/api/admin/questions?status=PUBLISHED&pageSize=1")).json();
    const qid = (list.items[0] ?? published.items[0]).id as string;
    expect((await editor.post(`/api/admin/questions/${qid}/status`, { data: { action: "unpublish" } })).status()).toBe(403);
    expect((await editor.delete(`/api/admin/questions/${qid}`)).status()).toBe(403);
    await admin.dispose();
    await editor.dispose();
  });

  test("XSS payloads are rejected or escaped", async ({ playwright, baseURL }) => {
    const admin = await playwright.request.newContext({ baseURL, extraHTTPHeaders: { Origin: baseURL!, "X-Forwarded-For": "10.1.0.3" } });
    await admin.post("/api/admin/auth/login", { data: E2E_ADMIN });
    const topics = await (await admin.get("/api/admin/topics")).json();
    const topicId = topics.items[0].id as string;
    const res = await admin.post("/api/admin/questions", {
      data: { topicId, difficulty: "BASIC", type: "ESSAY", content: '<img src=x onerror="alert(1)">', answer: "1", solution: "1" },
    });
    expect(res.status()).toBe(400);
    await admin.dispose();
  });

  test("worksheet HTML and public APIs do not leak answers", async ({ request }) => {
    const answers = await (await request.get("/api/worksheets/luy-thua-voi-so-mu-tu-nhien/answers")).json();
    const someSolution = (answers.items[0].solutionHtml as string).replace(/<[^>]+>/g, "").slice(0, 20);
    const html = await (await request.get("/de-bai/luy-thua-voi-so-mu-tu-nhien")).text();
    expect(html).not.toContain(someSolution);
    expect(html).not.toContain("isCorrect");
    const pub = await (await request.get("/api/worksheets/luy-thua-voi-so-mu-tu-nhien")).text();
    expect(pub).not.toMatch(/"(answer|solution|isCorrect)"/);
    const questions = await (await request.get("/api/questions?topic=luy-thua")).text();
    expect(questions).not.toMatch(/"(answer|solution|isCorrect)"/);
  });

  test("worksheet generation is rate limited", async ({ request, baseURL }) => {
    const headers = { ...json, Origin: baseURL!, "X-Forwarded-For": "10.9.9.9" };
    const statuses: number[] = [];
    for (let i = 0; i < 12; i++) {
      statuses.push((await request.post("/api/worksheets/generate", { headers, data: { count: 10, difficulty: "MIXED" } })).status());
    }
    expect(statuses.slice(0, 10).every((s) => s === 201)).toBe(true);
    expect(statuses.at(-1)).toBe(429);
  });

  test("invalid input is rejected with 400, unknown ids with 404", async ({ request, baseURL }) => {
    const headers = { ...json, Origin: baseURL! };
    expect((await request.post("/api/worksheets/generate", { headers: { ...headers, "X-Forwarded-For": "10.9.9.10" }, data: { count: 999 } })).status()).toBe(400);
    expect((await request.get("/api/worksheets/khong-ton-tai")).status()).toBe(404);
    expect((await request.get("/api/worksheets/'%20OR%201=1--/answers")).status()).toBe(400);
    expect((await request.post("/api/questions/abc/report", { headers, data: { reason: "HACK" } })).status()).toBe(400);
  });

  test("security headers and SEO files", async ({ request }) => {
    const home = await request.get("/");
    expect(home.headers()["x-frame-options"]).toBe("DENY");
    expect(home.headers()["content-security-policy"]).toContain("frame-ancestors 'none'");
    expect(home.headers()["content-security-policy"]).not.toContain("unsafe-eval");
    const robots = await (await request.get("/robots.txt")).text();
    expect(robots).toContain("Disallow: /admin");
    const sitemap = await (await request.get("/sitemap.xml")).text();
    expect(sitemap).toContain("/lop-6/tap-hop-cac-so-tu-nhien");
    expect(sitemap).toContain("/de-bai/luy-thua-voi-so-mu-tu-nhien");
    expect(sitemap).not.toContain("de-tu-tao");
    expect((await request.get("/api/health")).status()).toBe(200);
  });
});
