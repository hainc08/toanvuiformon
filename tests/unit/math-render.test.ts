import { describe, expect, it } from "vitest";
import { escapeHtml, mathTextToPlain, renderMathText, tokenize } from "@/lib/math/render";

describe("MathText renderer", () => {
  it("splits inline and display math", () => {
    expect(tokenize("Tính $2^5$ và $$\\frac{1}{2}$$")).toEqual([
      { kind: "text", value: "Tính " },
      { kind: "math", value: "2^5", display: false },
      { kind: "text", value: " và " },
      { kind: "math", value: "\\frac{1}{2}", display: true },
    ]);
  });

  it("supports escaped dollar signs", () => {
    expect(tokenize("Giá \\$5")).toEqual([{ kind: "text", value: "Giá $5" }]);
  });

  it("renders KaTeX markup", () => {
    const html = renderMathText("Tính $x^2$");
    expect(html).toContain("katex");
    expect(html.startsWith("<p>")).toBe(true);
  });

  it("escapes HTML / script injection in text", () => {
    const html = renderMathText('<script>alert(1)</script><img src=x onerror="alert(1)">');
    expect(html).not.toContain("<script");
    expect(html).not.toContain("<img");
    expect(html).toContain("&lt;script&gt;");
  });

  it("does not execute untrusted KaTeX commands", () => {
    const html = renderMathText("$\\href{javascript:alert(1)}{x}$ $\\url{javascript:alert(1)}$ $\\htmlId{a}{b}$");
    expect(html).not.toMatch(/href="javascript/i);
    expect(html).not.toContain('id="a"');
  });

  it("renders bold, lists and paragraphs", () => {
    const html = renderMathText("**Đáp án**\n\n- a\n- b");
    expect(html).toContain("<strong>Đáp án</strong>");
    expect(html).toContain("<ul><li>a</li><li>b</li></ul>");
  });

  it("keeps unbalanced dollars as text", () => {
    expect(renderMathText("chỉ có $ một dấu")).toContain("$ một dấu");
  });

  it("produces plain text for meta descriptions", () => {
    expect(mathTextToPlain("Tính $\\frac{3}{4} \\cdot 2$")).toBe("Tính 3/4 × 2");
    expect(escapeHtml(`"'&`)).toBe("&quot;&#39;&amp;");
  });
});
