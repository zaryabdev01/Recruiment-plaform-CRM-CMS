import { useState } from "react";
import { Bell, MessageSquarePlus } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { CommsPopout } from "./CommsPopout";
import { AlertModal } from "./AlertModal";
import { useCrmStore, nextAlert, type Target } from "@/lib/crm/store";
import { fmtDateTime, isOverdue } from "@/lib/crm/format";
import { cn } from "@/lib/utils";
import type { ServiceStatus } from "@/lib/crm/types";

export function ServiceStatusBadge({ status }: { status: ServiceStatus }) {
  return (
    <Badge variant={status === "ACCESSED" ? "success" : "warning"}>
      {status === "ACCESSED" ? "Accessed services" : "Not accessed"}
    </Badge>
  );
}

/** "Comms" list cell — click pops the quick email / quick text composer. */
export function CommsCell({ target, actorName = "You" }: { target: Target; actorName?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:border-brand-300 hover:text-brand-700"
      >
        <MessageSquarePlus className="h-3.5 w-3.5" /> Comms
      </button>
      <CommsPopout open={open} onClose={() => setOpen(false)} target={target} actorName={actorName} />
    </>
  );
}

/** "Alert" list cell — shows the next alert set (date, time, reason) or a set button. */
export function AlertCell({
  target,
  scope,
  actorName = "You",
}: {
  target: Target;
  scope: "crm" | "recruiter";
  actorName?: string;
}) {
  const store = useCrmStore();
  const [open, setOpen] = useState(false);
  const alert = nextAlert(store, target.kind, target.id);

  return (
    <>
      <button onClick={() => setOpen(true)} className="group inline-flex max-w-[220px] items-start gap-1 text-left">
        <Bell
          className={cn(
            "mt-0.5 h-3.5 w-3.5 shrink-0",
            alert ? (isOverdue(alert.dueAt) ? "text-red-500" : "text-brand-500") : "text-gray-300 group-hover:text-gray-500"
          )}
        />
        {alert ? (
          <span className="text-xs">
            <span className={cn("font-medium", isOverdue(alert.dueAt) ? "text-red-600" : "text-gray-700")}>
              {fmtDateTime(alert.dueAt)}
            </span>
            <span className="block truncate text-gray-500">{alert.reason}</span>
          </span>
        ) : (
          <span className="text-xs text-gray-400 group-hover:text-gray-600">Set alert</span>
        )}
      </button>
      <AlertModal open={open} onClose={() => setOpen(false)} target={target} scope={scope} setByName={actorName} />
    </>
  );
}
