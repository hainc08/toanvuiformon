import { describe, expect, it } from "vitest";
import { can, PERMISSIONS } from "@/lib/auth/permissions";
import { QUESTION_TRANSITIONS } from "@/features/questions/transitions";

describe("RBAC", () => {
  it("admins have every permission", () => {
    for (const p of PERMISSIONS) expect(can("ADMIN", p)).toBe(true);
  });

  it("editors cannot review, publish, delete, manage users or catalog", () => {
    for (const p of ["question:review", "question:publish", "question:delete", "user:manage", "catalog:manage", "worksheet:publish"] as const) {
      expect(can("EDITOR", p)).toBe(false);
    }
    for (const p of ["question:read", "question:write", "question:submit", "question:import"] as const) {
      expect(can("EDITOR", p)).toBe(true);
    }
  });

  it("publishing requires prior approval", () => {
    expect(QUESTION_TRANSITIONS.publish.from).toEqual(["APPROVED"]);
    expect(QUESTION_TRANSITIONS.approve.from).toEqual(["PENDING_REVIEW"]);
    expect(can("EDITOR", QUESTION_TRANSITIONS.submit.permission)).toBe(true);
    expect(can("EDITOR", QUESTION_TRANSITIONS.publish.permission)).toBe(false);
  });
});
