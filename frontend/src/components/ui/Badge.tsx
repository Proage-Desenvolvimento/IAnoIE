import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

type Variant = "default" | "secondary" | "success" | "warning" | "danger" | "info";

const variantStyles: Record<Variant, string> = {
  default: "bg-zinc-100 text-zinc-700 border-zinc-200",
  secondary: "bg-zinc-50 text-zinc-600 border-zinc-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50 text-amber-700 border-amber-200",
  danger: "bg-red-50 text-red-700 border-red-200",
  info: "bg-blue-50 text-blue-700 border-blue-200",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: Variant;
  dot?: boolean;
  children: ReactNode;
}

export function Badge({ className, variant = "default", dot, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className,
      )}
      {...props}
    >
      {dot && (
        <span className={cn("h-1.5 w-1.5 rounded-full", {
          "bg-zinc-500": variant === "default" || variant === "secondary",
          "bg-emerald-500": variant === "success",
          "bg-amber-500": variant === "warning",
          "bg-red-500": variant === "danger",
          "bg-blue-500": variant === "info",
        })} />
      )}
      {children}
    </span>
  );
}
