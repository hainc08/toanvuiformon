import { describe, expect, it } from "vitest";
import { randomSuffix, slugify } from "@/lib/slug";

describe("slugify", () => {
  it.each([
    ["Ước chung lớn nhất", "uoc-chung-lon-nhat"],
    ["Tính chia hết trong tập hợp số tự nhiên", "tinh-chia-het-trong-tap-hop-so-tu-nhien"],
    ["  Đề 20 câu — Phân số!! ", "de-20-cau-phan-so"],
  ])("%s → %s", (input, expected) => expect(slugify(input)).toBe(expected));

  it("generates url-safe random suffixes", () => {
    expect(randomSuffix(10)).toMatch(/^[a-z2-9]{10}$/);
  });
});
