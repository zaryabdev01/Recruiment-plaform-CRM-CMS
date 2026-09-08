import { useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Plus, Send, ArrowRight, Building2, Users, UserCog, Copy } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import {
  useCrmStore,
  addOrganisation,
  addCandidate,
  inviteRelationship,
  orgName,
  commsFor,
} from "@/lib/crm/store";
import { fmtDate } from "@/lib/crm/format";

const SECTORS = ["Construction", "Healthcare", "Logistics", "Hospitality", "IT & Digital", "Manufacturing", "Finance", "Education", "Engineering", "Retail"];
const RECRUITER_ID = "rec_1";

export function RecruiterRelationshipsPage() {
  const store = useCrmStore();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [addOrgOpen, setAddOrgOpen] = useState(false);
  const [addCandOpen, setAddCandOpen] = useState(false);

  const lastActivity = (kind: "organisation" | "candidate" | "decision_maker", id: string, fallback: string) => {
    const latest = commsFor(store, kind, id)[0];
    return latest ? latest.at : fallback;
  };

  const recentOrgs = [...store.organisations]
    .sort((a, b) => lastActivity("organisation", b.id, b.addedAt).localeCompare(lastActivity("organisation", a.id, a.addedAt)))
    .slice(0, 10);
  const recentDMs = [...store.decisionMakers]
    .sort((a, b) => lastActivity("decision_maker", b.id, b.addedAt).localeCompare(lastActivity("decision_maker", a.id, a.addedAt)))
    .slice(0, 10);
  const recentCands = [...store.candidates]
    .sort((a, b) => lastActivity("candidate", b.id, b.addedAt).localeCompare(lastActivity("candidate", a.id, a.addedAt)))
    .slice(0, 10);

  return (
    <div className="mx-auto max-w-6xl p-8">
      <PageHeader
        title="Relationships"
        subtitle="Your organisations, their decision makers, and your candidates. Invite them to complete their own profile, or add them manually."
        actions={
          <Button
            size="sm"
            className="gap-2 bg-white text-emerald-700 hover:bg-white/90"
            onClick={() => setInviteOpen(true)}
          >
            <Send className="h-4 w-4" /> Send invite
          </Button>
        }
      />

      {store.relationshipInvites.length > 0 && (
        <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Pending invites</h2>
          <ul className="divide-y divide-gray-100 text-sm">
            {store.relationshipInvites.map((i) => (
              <li key={i.id} className="flex items-center justify-between py-2">
                <span>
                  <span className="font-medium text-gray-800">{i.name}</span>{" "}
                  <span className="text-gray-400">· {i.email}</span> <Badge className="ml-1 capitalize">{i.kind}</Badge>
                </span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(i.magicLink);
                    toast.success("Invite link copied");
                  }}
                  className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                >
                  <Copy className="h-3 w-3" /> Copy link
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard
          title="Organisations"
          icon={Building2}
          viewAll="/recruiter/relationships/organisations"
          onAdd={() => setAddOrgOpen(true)}
          rows={recentOrgs.map((o) => ({ id: o.id, primary: o.name, secondary: `${o.sector} · added ${fmtDate(o.addedAt)}` }))}
        />
        <SectionCard
          title="Decision makers"
          icon={UserCog}
          viewAll="/recruiter/relationships/decision-makers"
          rows={recentDMs.map((d) => ({
            id: d.id,
            primary: `${d.firstName} ${d.lastName}`,
            secondary: `${d.jobTitle} · ${orgName(store, d.organisationId)}`,
          }))}
        />
        <SectionCard
          title="Candidates"
          icon={Users}
          viewAll="/recruiter/relationships/candidates"
          onAdd={() => setAddCandOpen(true)}
          rows={recentCands.map((c) => ({
            id: c.id,
            primary: `${c.firstName} ${c.lastName}`,
            secondary: `${c.jobTitle} · ${c.location}`,
          }))}
        />
      </div>

      <InviteModal open={inviteOpen} onClose={() => setInviteOpen(false)} />
      <AddOrgModal open={addOrgOpen} onClose={() => setAddOrgOpen(false)} />
      <AddCandidateModal open={addCandOpen} onClose={() => setAddCandOpen(false)} />
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  viewAll,
  onAdd,
  rows,
}: {
  title: string;
  icon: typeof Building2;
  viewAll: string;
  onAdd?: () => void;
  rows: { id: string; primary: string; secondary: string }[];
}) {
  return (
    <div className="flex flex-col rounded-xl border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
          <Icon className="h-4 w-4 text-brand-600" /> {title}
        </h2>
        {onAdd && (
          <button onClick={onAdd} className="inline-flex items-center gap-1 text-xs text-brand-600 hover:underline">
            <Plus className="h-3 w-3" /> Add
          </button>
        )}
      </div>
      <p className="px-4 pt-2 text-xs text-gray-400">Last 10 with activity</p>
      <ul className="flex-1 divide-y divide-gray-100">
        {rows.map((r) => (
          <li key={r.id} className="flex items-center gap-2.5 px-4 py-2.5">
            <Avatar name={r.primary} size="xs" />
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-gray-800">{r.primary}</div>
              <div className="truncate text-xs text-gray-500">{r.secondary}</div>
            </div>
          </li>
        ))}
      </ul>
      <Link
        to={viewAll}
        className="flex items-center justify-center gap-1 border-t border-gray-100 px-4 py-2.5 text-sm font-medium text-brand-700 hover:bg-brand-50"
      >
        View all <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

function InviteModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [kind, setKind] = useState<"organisation" | "candidate">("organisation");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [link, setLink] = useState<string | null>(null);

  const submit = () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }
    const inv = inviteRelationship({ kind, name: name.trim(), email: email.trim() });
    setLink(inv.magicLink);
    setName("");
    setEmail("");
    toast.success("Invite created");
  };

  return (
    <Modal
      open={open}
      onClose={() => {
        setLink(null);
        onClose();
      }}
      title="Send an invite"
      description="They click the link, complete their profile, and are added to your account."
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
          <Button size="sm" onClick={submit}>
            Create invite
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="flex gap-2">
          {(["organisation", "candidate"] as const).map((k) => (
            <button
              key={k}
              onClick={() => setKind(k)}
              className={`rounded-lg border px-3 py-1.5 text-sm capitalize ${
                kind === k ? "border-brand-600 bg-brand-50 text-brand-700" : "border-gray-300 text-gray-600 hover:bg-gray-50"
              }`}
            >
              {k}
            </button>
          ))}
        </div>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder={kind === "organisation" ? "Company name" : "Candidate name"} />
        <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        {link && (
          <div className="rounded-lg border border-brand-200 bg-brand-50 p-3">
            <p className="text-xs font-medium text-brand-800">Invite link (prototype)</p>
            <code className="mt-1 block truncate rounded bg-white px-2 py-1 text-xs text-gray-600">{link}</code>
          </div>
        )}
      </div>
    </Modal>
  );
}

function AddOrgModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [f, setF] = useState({ name: "", sector: SECTORS[0], email: "", mobile: "", landline: "" });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    if (!f.name.trim()) {
      toast.error("Company name is required");
      return;
    }
    addOrganisation({ ...f, recruiterId: RECRUITER_ID });
    toast.success("Organisation added");
    setF({ name: "", sector: SECTORS[0], email: "", mobile: "", landline: "" });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add organisation manually"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit}>
            Add organisation
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Input label="Company name" value={f.name} onChange={(e) => set("name", e.target.value)} />
        <div>
          <label className="mb-1 block text-sm font-medium text-gray-700">Sector</label>
          <select
            value={f.sector}
            onChange={(e) => set("sector", e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            {SECTORS.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>
        </div>
        <Input label="Contact email" value={f.email} onChange={(e) => set("email", e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Mobile" value={f.mobile} onChange={(e) => set("mobile", e.target.value)} />
          <Input label="Landline" value={f.landline} onChange={(e) => set("landline", e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}

function AddCandidateModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [f, setF] = useState({ firstName: "", lastName: "", jobTitle: "", email: "", mobile: "", landline: "", location: "" });
  const set = (k: keyof typeof f, v: string) => setF((s) => ({ ...s, [k]: v }));

  const submit = () => {
    if (!f.firstName.trim() || !f.lastName.trim()) {
      toast.error("First and last name are required");
      return;
    }
    addCandidate({ ...f, recruiterId: RECRUITER_ID });
    toast.success("Candidate added");
    setF({ firstName: "", lastName: "", jobTitle: "", email: "", mobile: "", landline: "", location: "" });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add candidate manually"
      footer={
        <>
          <Button variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button size="sm" onClick={submit}>
            Add candidate
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
        <Input label="Location" value={f.location} onChange={(e) => set("location", e.target.value)} />
        <Input label="Email" value={f.email} onChange={(e) => set("email", e.target.value)} />
        <div className="grid grid-cols-2 gap-3">
          <Input label="Mobile" value={f.mobile} onChange={(e) => set("mobile", e.target.value)} />
          <Input label="Landline" value={f.landline} onChange={(e) => set("landline", e.target.value)} />
        </div>
      </div>
    </Modal>
  );
}
