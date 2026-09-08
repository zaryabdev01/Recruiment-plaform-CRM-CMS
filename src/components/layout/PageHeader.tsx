import type { ReactNode } from "react";
import { useWorkspace } from "@/lib/workspaces";
import { GridPattern, BlobArt } from "@/components/ui/Decor";
import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  actions?: ReactNode;
  /** Small pills shown under the title, e.g. quick counts. */
  chips?: { label: string; value: ReactNode }[];
  /** Full coloured gradient hero vs. a plain light header. */
  variant?: "hero" | "plain";
}

export function PageHeader({ title, subtitle, icon, actions, chips, variant = "hero" }: PageHeaderProps) {
  const ws = useWorkspace();

  if (variant === "plain") {
    return (
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            {icon}
            {title}
          </h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-gray-500">{subtitle}</p>}
        </div>
        {actions}
      </div>
    );
  }

  return (
    <div className={cn("relative mb-6 overflow-hidden rounded-2xl bg-gradient-to-br p-6 text-white", ws.gradient)}>
      <GridPattern className="text-white/20" />
      <BlobArt className="-right-6 -top-10 h-56 w-56 text-white" />
      <div className="relative flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-white/70">
            <ws.icon className="h-4 w-4" />
            {ws.label}
          </div>
          <h1 className="mt-1.5 text-2xl font-bold">{title}</h1>
          {subtitle && <p className="mt-1 max-w-2xl text-sm text-white/80">{subtitle}</p>}
          {chips && chips.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {chips.map((c) => (
                <span
                  key={c.label}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white/15 px-2.5 py-1 text-xs backdrop-blur-sm"
                >
                  <span className="font-semibold">{c.value}</span>
                  <span className="text-white/75">{c.label}</span>
                </span>
              ))}
            </div>
          )}
        </div>
        {actions && <div className="relative flex shrink-0 gap-2">{actions}</div>}
      </div>
    </div>
  );
}
