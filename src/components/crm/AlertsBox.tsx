import { Bell, Check } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { useCrmStore, toggleAlertDone } from "@/lib/crm/store";
import { fmtDateTime, fmtRelative, isOverdue } from "@/lib/crm/format";
import { cn } from "@/lib/utils";

/**
 * Dashboard "Alerts" box. On the CRM dashboard it shows every alert CRM staff
 * have set on any end user; on a recruiter dashboard it shows that team's own
 * alerts. Always ordered by the next one due.
 */
export function AlertsBox({ scope, title = "Alerts" }: { scope: "crm" | "recruiter"; title?: string }) {
  const store = useCrmStore();
  const items = store.alerts
    .filter((a) => a.scope === scope && !a.done)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt));

  return (
    <div className="rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Bell className="h-4 w-4 text-brand-600" /> {title}
        </h2>
        <Badge>{items.length} due</Badge>
      </div>
      <ul className="divide-y divide-gray-100">
        {items.length === 0 && <li className="px-4 py-8 text-center text-sm text-gray-400">Nothing due. You're clear.</li>}
        {items.slice(0, 12).map((a) => (
          <li key={a.id} className="flex items-start gap-3 px-4 py-3">
            <span className="relative mt-0.5 shrink-0">
              <Avatar name={a.targetName} size="sm" />
              <span
                className={cn(
                  "absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-white",
                  isOverdue(a.dueAt) ? "bg-red-500" : "bg-brand-500"
                )}
              />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="truncate text-sm font-medium text-gray-900">{a.targetName}</span>
                <span className="shrink-0 text-xs capitalize text-gray-400">{a.targetKind.replace("_", " ")}</span>
              </div>
              <p className="truncate text-sm text-gray-600">{a.reason}</p>
              <p className="text-xs text-gray-400">
                Set by {a.setByName} · due {fmtDateTime(a.dueAt)}
              </p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <span className={cn("text-xs font-medium", isOverdue(a.dueAt) ? "text-red-600" : "text-gray-500")}>
                {fmtRelative(a.dueAt)}
              </span>
              <button
                onClick={() => toggleAlertDone(a.id)}
                className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-brand-600"
              >
                <Check className="h-3 w-3" /> Done
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
