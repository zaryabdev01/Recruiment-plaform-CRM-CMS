import { useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { ArrowLeft, Plus, Bell, Mail } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { ContactHoverCard } from "@/components/ui/HoverCard";
import { CommsCell, AlertCell, ServiceStatusBadge } from "@/components/crm/Cells";
import { AlertModal } from "@/components/crm/AlertModal";
import { CommsPopout } from "@/components/crm/CommsPopout";
import { useCrmStore, addDecisionMaker, commsFor, alertsFor, jobsPostedForOrg, type Target } from "@/lib/crm/store";
import { fmtDate, fmtDateTime, isOverdue } from "@/lib/crm/format";
import { cn } from "@/lib/utils";

export function OrganisationDetailPage() {
  const { id = "" } = useParams();
  const store = useCrmStore();
  const org = store.organisations.find((o) => o.id === id);
  const dms = useMemo(() => store.decisionMakers.filter((d) => d.organisationId === id), [store.decisionMakers, id]);
  const [addOpen, setAddOpen] = useState(false);
  const [alertOpen, setAlertOpen] = useState(false);
  const [commsOpen, setCommsOpen] = useState(false);

  if (!org) {
    return (
      <div className="p-8">
        <Link to="/recruiter/relationships/organisations" className="text-sm text-brand-700">
          &larr; Back to organisations
        </Link>
        <p className="mt-4 text-gray-500">Organisation not found.</p>
      </div>
    );
  }

  const target: Target = { kind: "organisation", id: org.id, name: org.name };
  const history = commsFor(store, "organisation", org.id);
  const orgAlerts = alertsFor(store, "organisation", org.id);

  return (
    <div className="mx-auto max-w-5xl p-8">
      <Link
        to="/recruiter/relationships/organisations"
        className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700"
      >
        <ArrowLeft className="h-4 w-4" /> Organisations
      </Link>

      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{org.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-gray-500">
            <span>{org.sector}</span> · <ServiceStatusBadge status={org.serviceStatus} /> ·
            <span>{jobsPostedForOrg(store, org.id)} jobs posted</span> · <span>added {fmtDate(org.addedAt)}</span>
            <Badge className="capitalize">{org.addedVia.toLowerCase()}</Badge>
          </div>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setCommsOpen(true)}>
            <Mail className="h-4 w-4" /> Quick message
          </Button>
          <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setAlertOpen(true)}>
            <Bell className="h-4 w-4" /> Set alert
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Contact</h2>
          <dl className="space-y-1.5 text-sm">
            <div className="flex justify-between">
              <dt className="text-gray-400">Email</dt>
              <dd className="text-gray-800">{org.contact.email}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Mobile</dt>
              <dd className="text-gray-800">{org.contact.mobile}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-gray-400">Landline</dt>
              <dd className="text-gray-800">{org.contact.landline}</dd>
            </div>
          </dl>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="mb-3 text-sm font-semibold text-gray-900">Alerts ({orgAlerts.length})</h2>
          <ul className="space-y-2 text-sm">
            {orgAlerts.length === 0 && <li className="text-gray-400">No alerts set.</li>}
            {orgAlerts.map((a) => (
              <li key={a.id} className="rounded-lg border border-gray-200 p-2">
                <span className={cn("font-medium", isOverdue(a.dueAt) && !a.done ? "text-red-600" : "text-gray-800")}>
                  {fmtDateTime(a.dueAt)}
                </span>
                <p className="text-gray-600">{a.reason}</p>
                <p className="text-xs text-gray-400">Set by {a.setByName}</p>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <section className="mt-6 overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Decision makers ({dms.length})</h2>
          <Button size="sm" className="gap-1.5" onClick={() => setAddOpen(true)}>
            <Plus className="h-4 w-4" /> Add contact manually
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Job title</th>
                <th className="px-5 py-3 font-medium">Contact details</th>
                <th className="px-5 py-3 font-medium">Comms</th>
                <th className="px-5 py-3 font-medium">Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {dms.map((d) => {
                const dmTarget: Target = { kind: "decision_maker", id: d.id, name: `${d.firstName} ${d.lastName}` };
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-5 py-3">
                      <span className="font-medium text-gray-900">
                        {d.firstName} {d.lastName}
                      </span>
                      <Badge className="ml-1 capitalize">{d.addedVia.toLowerCase()}</Badge>
                    </td>
                    <td className="px-5 py-3 text-gray-600">{d.jobTitle}</td>
                    <td className="px-5 py-3">
                      <ContactHoverCard contact={d.contact} />
                    </td>
                    <td className="px-5 py-3">
                      <CommsCell target={dmTarget} />
                    </td>
                    <td className="px-5 py-3">
                      <AlertCell target={dmTarget} scope="recruiter" />
                    </td>
                  </tr>
                );
              })}
              {dms.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-10 text-center text-gray-400">
                    No decision makers yet — add one manually.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-6 rounded-xl border border-gray-200 bg-white p-5">
        <h2 className="mb-3 text-sm font-semibold text-gray-900">Communication history ({history.length})</h2>
        <ol className="space-y-3">
          {history.length === 0 && <p className="text-sm text-gray-400">Nothing logged yet.</p>}
          {history.map((c) => (
            <li key={c.id} className="border-l-2 border-gray-200 pl-3 text-sm">
              <div className="text-xs text-gray-400">
                {c.channel} · {c.direction === "out" ? "Sent" : "Received"} · {fmtDateTime(c.at)}
              </div>
              {c.subject && c.subject !== "(no subject)" && <p className="font-medium text-gray-800">{c.subject}</p>}
              <p className="text-gray-600">{c.body}</p>
              <p className="text-xs text-gray-400">— {c.byName}</p>
            </li>
          ))}
        </ol>
      </section>

      <AddDmModal open={addOpen} onClose={() => setAddOpen(false)} organisationId={org.id} />
      <AlertModal open={alertOpen} onClose={() => setAlertOpen(false)} target={target} scope="recruiter" setByName="You" />
      <CommsPopout open={commsOpen} onClose={() => setCommsOpen(false)} target={target} actorName="You" />
    </div>
  );
}

function AddDmModal({ open, onClose, organisationId }: { open: boolean; onClose: () => void; organisationId: string }) {
  const [f, setF] = useState({ firstName: "", lastName: "", jobTitle: "", email: "", mobile: "", landline: "" });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    if (!f.firstName.trim() || !f.lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    addDecisionMaker({ organisationId, ...f });
    toast.success("Decision maker added");
    setF({ firstName: "", lastName: "", jobTitle: "", email: "", mobile: "", landline: "" });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add decision maker"
      description="A named contact you manage manually on this organisation."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit}>
            Add contact
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Input label="First name" value={f.firstName} onChange={(e) => set("firstName", e.target.value)} />
          <Input label="Last name" value={f.lastName} onChange={(e) => set("lastName", e.target.value)} />
        </div>
        <Input label="Job title" value={f.jobTitle} onChange={(e) => set("jobTitle", e.target.value)} />
        <Input label="Email" value={f.email} onChange={(e) => set("email", e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Mobile" value={f.mobile} onChange={(e) => set("mobile", e.target.value)} />
          <Input label="Landline" value={f.landline} onChange={(e) => set("landline", e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
