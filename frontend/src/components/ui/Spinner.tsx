import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface SpinnerProps {
  className?: string;
  size?: "sm" | "default" | "lg";
}

const sizes = { sm: "h-3.5 w-3.5", default: "h-4 w-4", lg: "h-6 w-6" };

export function Spinner({ className, size = "default" }: SpinnerProps) {
  return <Loader2 className={cn("animate-spin text-zinc-400", sizes[size], className)} />;
}
