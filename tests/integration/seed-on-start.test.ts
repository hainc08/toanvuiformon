import { execSync } from "node:child_process";
import { describe, expect, it } from "vitest";
import { prisma } from "@/lib/db/prisma";
import { makeUser } from "../support/fixtures";

// Production runs the seed on every start (scripts/start-production.mjs) with SEED_ONLY_EMPTY_DB=true.
// It must never bring back content an admin deleted, nor re-create the seed admin once accounts exist.
const SLUG = "so-nguyen-to-va-phan-tich-thua-so-nguyen-to";
const INTRUDER = "seed-admin-again@toanvui.test";

function seed(extraEnv: Record<string, string>) {
  execSync("npx tsx prisma/seed.ts", { env: { ...process.env, ...extraEnv }, stdio: "pipe" });
}

describe("seed on production start", () => {
  it("does not restore deleted seed content or re-create the seed admin on a non-empty DB", async () => {
    await makeUser("ADMIN");
    await prisma.worksheet.delete({ where: { slug: SLUG } });

    seed({ SEED_ONLY_EMPTY_DB: "true", SEED_ADMIN_EMAIL: INTRUDER, SEED_ADMIN_PASSWORD: "IntruderPassword2026" });

    expect(await prisma.worksheet.findUnique({ where: { slug: SLUG } })).toBeNull();
    expect(await prisma.user.findUnique({ where: { email: INTRUDER } })).toBeNull();

    // A manual `npm run db:seed` (no flag) still restores missing seed content.
    seed({ SEED_ONLY_EMPTY_DB: "", SEED_ADMIN_EMAIL: "", SEED_ADMIN_PASSWORD: "" });
    expect(await prisma.worksheet.findUnique({ where: { slug: SLUG } })).not.toBeNull();
  });
});
