import { describe, expect, it } from "vitest";
import { createAdapter, mariadbUrl } from "@/lib/db/adapter";

describe("createAdapter", () => {
  it("maps mysql:// to the mariadb driver scheme", () => {
    expect(mariadbUrl("mysql://u:p@localhost:3306/db")).toBe("mariadb://u:p@localhost:3306/db");
  });

  it("never echoes the password when DATABASE_URL is malformed", () => {
    // An unencoded '#' in the password breaks URL parsing.
    const bad = "mysql://user:Sup3r#Secret@localhost:3306/db";
    let message = "";
    try {
      createAdapter(bad);
    } catch (err) {
      message = `${(err as Error).message} ${JSON.stringify(err)}`;
    }
    expect(message).toMatch(/DATABASE_URL/);
    expect(message).not.toContain("Secret");
  });
});
