import { cva, type VariantProps } from "class-variance-authority";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold", {
  variants: {
    tone: {
      blue: "bg-primary-soft text-primary-dark",
      teal: "bg-secondary-soft text-secondary-dark",
      amber: "bg-accent-soft text-amber-800",
      gray: "bg-slate-100 text-slate-700",
      green: "bg-green-100 text-green-800",
      red: "bg-red-100 text-red-800",
    },
  },
  defaultVariants: { tone: "gray" },
});

export function Badge({ className, tone, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ tone }), className)} {...props} />;
}
