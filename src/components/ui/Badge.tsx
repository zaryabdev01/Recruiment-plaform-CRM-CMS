import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "success" | "warning" | "danger";

const variantClasses: Record<Variant, string> = {
  default: "bg-gray-100 text-gray-600",
  success: "bg-green-100 text-green-700",
  warning: "bg-amber-100 text-amber-700",
  danger: "bg-red-100 text-red-700",
};

export function Badge({ variant = "default", className, children }: { variant?: Variant; className?: string; children: ReactNode }) {
  return (
    <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", variantClasses[variant], className)}>
      {children}
    </span>
  );
}
