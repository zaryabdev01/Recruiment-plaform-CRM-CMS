import { useState } from "react";
import toast from "react-hot-toast";
import { Plus, Copy, Link2, UserCheck, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Modal } from "@/components/ui/Modal";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import {
  useCrmStore,
  inviteTeamMember,
  simulateTeamRegistration,
  revokeTeamMember,
} from "@/lib/crm/store";
import { fmtDate } from "@/lib/crm/format";

const CANDIDATE_PROFILE_FIELDS = [
  "Full name & photo",
  "Contact details (email, mobile)",
  "Location & right-to-work status",
  "Headline / current job title",
  "Work history",
  "Education & qualifications",
  "Skills",
  "CV upload",
];

export function TeamManager({
  scope,
  heading,
  intro,
  roles,
}: {
  scope: "crm" | "recruiter";
  heading: string;
  intro: string;
  roles: string[];
}) {
  const store = useCrmStore();
  const members = store.teamMembers.filter((m) => m.scope === scope);

  const [inviteOpen, setInviteOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState(roles[0]);
  const [lastLink, setLastLink] = useState<string | null>(null);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [showProfileFields, setShowProfileFields] = useState(false);

  const sendInvite = () => {
    if (!email.trim()) {
      toast.error("Enter an email address");
      return;
    }
    const m = inviteTeamMember({ scope, email: email.trim(), role });
    setLastLink(m.magicLink);
    setEmail("");
    toast.success("Invite created");
  };

  const copy = (text: string) => {
    navigator.clipboard?.writeText(text);
    toast.success("Magic link copied");
  };

  return (
    <div className="mx-auto max-w-4xl p-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{heading}</h1>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">{intro}</p>
        </div>
        <Button
          size="sm"
          className="gap-2"
          onClick={() => {
            setInviteOpen(true);
            setLastLink(null);
          }}
        >
          <Plus className="h-4 w-4" /> Invite member
        </Button>
      </div>

      {scope === "recruiter" && (
        <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4">
          <button
            onClick={() => setShowProfileFields((s) => !s)}
            className="flex w-full items-center justify-between text-left text-sm font-medium text-gray-800"
          >
            Profile the invitee completes
            <span className="text-xs text-brand-600">{showProfileFields ? "Hide" : "Show"}</span>
          </button>
          {showProfileFields && (
            <>
              <p className="mt-1 text-xs text-gray-500">
                Same profile we ask candidates to fill out. On completion they're connected as an employee in the recruiter
                team.
              </p>
              <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600">
                {CANDIDATE_PROFILE_FIELDS.map((f) => (
                  <li key={f} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gray-300" /> {f}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
            <tr>
              <th className="px-4 py-3 font-medium">Member</th>
              <th className="px-4 py-3 font-medium">Role</th>
              <th className="px-4 py-3 font-medium">Invited</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {members.map((m) => (
              <tr key={m.id} className="align-top hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <Avatar name={`${m.firstName} ${m.lastName}`.trim() || m.email} size="sm" />
                    <div>
                      <div className="font-medium text-gray-900">
                        {m.firstName || m.lastName ? `${m.firstName} ${m.lastName}`.trim() : <span className="text-gray-400">Awaiting registration</span>}
                      </div>
                      <div className="text-xs text-gray-500">{m.email}</div>
                    </div>
                  </div>
                  {m.status === "PENDING" && m.magicLink && (
                    <button
                      onClick={() => copy(m.magicLink)}
                      className="mt-1 inline-flex items-center gap-1 text-xs text-brand-600 hover:underline"
                    >
                      <Link2 className="h-3 w-3" /> Copy magic link
                    </button>
                  )}
                </td>
                <td className="px-4 py-3 text-gray-600">{m.role}</td>
                <td className="px-4 py-3 text-gray-600">{fmtDate(m.invitedAt)}</td>
                <td className="px-4 py-3">
                  {m.status === "REGISTERED" ? (
                    <Badge variant="success">
                      <UserCheck className="mr-1 h-3 w-3" /> {m.profileComplete ? "Registered" : "Profile incomplete"}
                    </Badge>
                  ) : (
                    <Badge variant="warning">
                      <Clock className="mr-1 h-3 w-3" /> Pending
                    </Badge>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-2">
                    {m.status === "PENDING" && (
                      <button
                        onClick={() => simulateTeamRegistration(m.id)}
                        className="text-xs text-brand-600 hover:underline"
                        title="Prototype: simulate the invitee opening the link and completing their profile"
                      >
                        Simulate registration
                      </button>
                    )}
                    <button onClick={() => setRevokeId(m.id)} className="text-gray-300 hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        title="Invite a team member"
        description="They get a magic link to register and set up their profile."
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setInviteOpen(false)}>
              Close
            </Button>
            <Button size="sm" onClick={sendInvite}>
              Create invite
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <Input label="Email address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@example.com" />
          <div>
            <label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              {roles.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          {lastLink && (
            <div className="rounded-lg border border-brand-200 bg-brand-50 p-3">
              <p className="text-xs font-medium text-brand-800">Magic link (prototype)</p>
              <div className="mt-1 flex items-center gap-2">
                <code className="flex-1 truncate rounded bg-white px-2 py-1 text-xs text-gray-600">{lastLink}</code>
                <button onClick={() => copy(lastLink)} className="text-brand-600 hover:text-brand-800">
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      </Modal>

      <ConfirmDialog
        open={revokeId !== null}
        onClose={() => setRevokeId(null)}
        onConfirm={() => revokeId && revokeTeamMember(revokeId)}
        title="Remove team member"
        message="They will lose access and any pending invite link stops working."
        confirmLabel="Remove"
      />
    </div>
  );
}
