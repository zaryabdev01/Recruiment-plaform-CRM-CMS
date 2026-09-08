import { useState, type ReactNode } from "react";
import { X, Bell, Mail, Phone, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { AlertModal } from "./AlertModal";
import { CommsPopout } from "./CommsPopout";
import { useCrmStore, commsFor, alertsFor, deleteAlert, toggleAlertDone, type Target } from "@/lib/crm/store";
import { fmtDateTime, fmtRelative, isOverdue } from "@/lib/crm/format";
import { cn } from "@/lib/utils";

const channelLabel: Record<string, string> = {
  email: "Email",
  text: "Text",
  call: "Call",
  message: "Platform message",
};

export function RecordDrawer({
  open,
  onClose,
  target,
  scope,
  actorName,
  headerRight,
  meta,
}: {
  open: boolean;
  onClose: () => void;
  target: Target | null;
  scope: "crm" | "recruiter";
  actorName: string;
  headerRight?: ReactNode;
  meta: { label: string; value: ReactNode }[];
}) {
  const store = useCrmStore();
  const [alertOpen, setAlertOpen] = useState(false);
  const [commsOpen, setCommsOpen] = useState(false);

  if (!open || !target) return null;

  const history = commsFor(store, target.kind, target.id);
  const recordAlerts = alertsFor(store, target.kind, target.id);

  return (
    <div className="fixed inset-0 z-40 flex justify-end bg-gray-900/30">
      <div className="flex h-full w-full max-w-md flex-col bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between border-b border-gray-100 px-5 py-4">
          <div className="flex items-center gap-3">
            <Avatar name={target.name} size="md" />
            <div>
              <h2 className="text-base font-semibold text-gray-900">{target.name}</h2>
              <p className="text-xs uppercase tracking-wide text-gray-400">{target.kind.replace("_", " ")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {headerRight}
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5">
          <section>
            <dl className="grid grid-cols-3 gap-x-3 gap-y-2 text-sm">
              {meta.map((m) => (
                <div key={m.label} className="contents">
                  <dt className="col-span-1 text-gray-400">{m.label}</dt>
                  <dd className="col-span-2 text-gray-800">{m.value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setCommsOpen(true)}>
              <Mail className="h-4 w-4" /> Quick message
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAlertOpen(true)}>
              <Bell className="h-4 w-4" /> Set alert
            </Button>
          </div>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Alerts ({recordAlerts.length})</h3>
            <div className="space-y-2">
              {recordAlerts.length === 0 && <p className="text-sm text-gray-400">No alerts on this record.</p>}
              {recordAlerts.map((a) => (
                <div key={a.id} className="rounded-lg border border-gray-200 p-2.5 text-sm">
                  <div className="flex items-center justify-between">
                    <span
                      className={cn(
                        "font-medium",
                        a.done ? "text-gray-400 line-through" : isOverdue(a.dueAt) ? "text-red-600" : "text-gray-800"
                      )}
                    >
                      {fmtDateTime(a.dueAt)} · {fmtRelative(a.dueAt)}
                    </span>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => toggleAlertDone(a.id)}
                        className="text-xs text-brand-600 hover:underline"
                      >
                        {a.done ? "Reopen" : "Done"}
                      </button>
                      <button onClick={() => deleteAlert(a.id)} className="text-gray-300 hover:text-red-500">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                  <p className="mt-0.5 text-gray-600">{a.reason}</p>
                  <p className="mt-0.5 text-xs text-gray-400">Set by {a.setByName}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="mb-2 text-sm font-semibold text-gray-900">Communication history ({history.length})</h3>
            <ol className="space-y-3">
              {history.length === 0 && <p className="text-sm text-gray-400">Nothing logged yet.</p>}
              {history.map((c) => (
                <li key={c.id} className="border-l-2 border-gray-200 pl-3">
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    {c.channel === "text" || c.channel === "message" ? (
                      <Phone className="h-3 w-3" />
                    ) : (
                      <Mail className="h-3 w-3" />
                    )}
                    <span>{channelLabel[c.channel] ?? c.channel}</span>
                    <Badge variant={c.direction === "out" ? "default" : "success"}>{c.direction === "out" ? "Sent" : "Received"}</Badge>
                    <span>· {fmtDateTime(c.at)}</span>
                  </div>
                  {c.subject && c.subject !== "(no subject)" && (
                    <p className="mt-0.5 text-sm font-medium text-gray-800">{c.subject}</p>
                  )}
                  <p className="text-sm text-gray-600">{c.body}</p>
                  <p className="text-xs text-gray-400">— {c.byName}</p>
                </li>
              ))}
            </ol>
          </section>
        </div>
      </div>

      <AlertModal open={alertOpen} onClose={() => setAlertOpen(false)} target={target} scope={scope} setByName={actorName} />
      <CommsPopout open={commsOpen} onClose={() => setCommsOpen(false)} target={target} actorName={actorName} />
    </div>
  );
}
