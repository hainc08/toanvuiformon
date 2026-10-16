import { cn } from "@/lib/utils";

/**
 * Renders HTML produced by renderMathText() (escaped text + KaTeX output).
 * Never pass untrusted HTML here.
 */
export function MathHtml({ html, className, inline }: { html: string; className?: string; inline?: boolean }) {
  return <div className={cn("math-content", inline && "math-inline", className)} dangerouslySetInnerHTML={{ __html: html }} />;
}
