import { cn } from "@/lib/utils";
import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div className={cn("rounded-xl border border-zinc-200 bg-white shadow-sm", className)} {...props}>
      {children}
    </div>
  );
}

export function CardHeader({ className, children, ...props }: CardProps) {
  return <div className={cn("px-5 py-4 border-b border-zinc-100", className)} {...props}>{children}</div>;
}

export function CardTitle({ className, children, ...props }: CardProps) {
  return <h3 className={cn("text-sm font-semibold text-zinc-900", className)} {...props}>{children}</h3>;
}

export function CardDescription({ className, children, ...props }: CardProps) {
  return <p className={cn("text-xs text-zinc-500 mt-0.5", className)} {...props}>{children}</p>;
}

export function CardContent({ className, children, ...props }: CardProps) {
  return <div className={cn("px-5 py-4", className)} {...props}>{children}</div>;
}

export function CardFooter({ className, children, ...props }: CardProps) {
  return <div className={cn("px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 rounded-b-xl", className)} {...props}>{children}</div>;
}
