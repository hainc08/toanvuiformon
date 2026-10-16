import katex from "katex";

/**
 * MathText — the only rich-text format stored in the database.
 *
 *  - Inline math:   $x^2 + 1$
 *  - Display math:  $$\frac{a}{b}$$
 *  - Literal dollar: \$
 *  - Bold:          **text**
 *  - Paragraphs:    blank line; single newline = line break
 *  - Bullet list:   lines starting with "- "
 *
 * No raw HTML is ever stored or rendered: all text is escaped and math is rendered
 * by KaTeX with `trust: false`, so the output is safe to inject with dangerouslySetInnerHTML.
 */

type Segment = { kind: "text"; value: string } | { kind: "math"; value: string; display: boolean };

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(input: string): string {
  return input.replace(/[&<>"']/g, (c) => HTML_ESCAPES[c] ?? c);
}

const DOLLAR_PLACEHOLDER = "\u0000DOLLAR\u0000";

export function tokenize(source: string): Segment[] {
  const input = source.replace(/\\\$/g, DOLLAR_PLACEHOLDER);
  const segments: Segment[] = [];
  let i = 0;
  let buffer = "";
  const restore = (s: string) => s.split(DOLLAR_PLACEHOLDER).join("$");

  while (i < input.length) {
    if (input[i] === "$") {
      const display = input[i + 1] === "$";
      const delim = display ? "$$" : "$";
      const end = input.indexOf(delim, i + delim.length);
      if (end === -1) {
        buffer += input.slice(i);
        break;
      }
      const math = input.slice(i + delim.length, end);
      if (math.trim().length === 0) {
        buffer += input.slice(i, end + delim.length);
        i = end + delim.length;
        continue;
      }
      if (buffer) segments.push({ kind: "text", value: restore(buffer) });
      buffer = "";
      segments.push({ kind: "math", value: restore(math), display });
      i = end + delim.length;
    } else {
      buffer += input[i];
      i += 1;
    }
  }
  if (buffer) segments.push({ kind: "text", value: restore(buffer) });
  return segments;
}

export function renderMath(tex: string, display: boolean): string {
  return katex.renderToString(tex, {
    displayMode: display,
    throwOnError: false,
    trust: false,
    strict: "ignore",
    output: "html",
    maxSize: 20,
    maxExpand: 200,
  });
}

function renderInlineText(text: string): string {
  const escaped = escapeHtml(text);
  return escaped.replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>").replace(/\n/g, "<br>");
}

function renderSegments(source: string): string {
  return tokenize(source)
    .map((s) => (s.kind === "math" ? renderMath(s.value, s.display) : renderInlineText(s.value)))
    .join("");
}

/** Render MathText to safe HTML. */
export function renderMathText(source: string | null | undefined): string {
  if (!source) return "";
  const blocks = source.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return blocks
    .map((block) => {
      const lines = block.split("\n");
      if (lines.every((l) => l.trimStart().startsWith("- "))) {
        const items = lines.map((l) => `<li>${renderSegments(l.trimStart().slice(2))}</li>`).join("");
        return `<ul>${items}</ul>`;
      }
      return `<p>${renderSegments(block)}</p>`;
    })
    .join("");
}

/** Plain-text approximation (for meta descriptions, search snippets). */
export function mathTextToPlain(source: string | null | undefined, maxLength = 160): string {
  if (!source) return "";
  const plain = tokenize(source)
    .map((s) =>
      s.kind === "math"
        ? s.value
            .replace(/\\(dfrac|frac)\{([^}]*)\}\{([^}]*)\}/g, "$2/$3")
            .replace(/\\(cdot|times)/g, "×")
            .replace(/\\div/g, ":")
            .replace(/\\[a-zA-Z]+/g, "")
            .replace(/[{}]/g, "")
        : s.value.replace(/\*\*/g, ""),
    )
    .join("")
    .replace(/\s+/g, " ")
    .trim();
  return plain.length > maxLength ? `${plain.slice(0, maxLength - 1).trimEnd()}…` : plain;
}
