import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-brand-deep text-white",
        secondary:
          "border-transparent bg-slate-200 text-brand-text",
        outline: "border-slate-300 text-brand-text",
        accent:
          "border-transparent bg-brand-accent text-brand-text",
        destructive:
          "border-transparent bg-brand-red text-white",
        success:
          "border-transparent bg-emerald-100 text-emerald-800",
        muted:
          "border-transparent bg-slate-100 text-brand-muted",
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
