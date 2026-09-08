/**
 * In-memory store for the CRM / recruiter-portal prototype.
 *
 * A single mutable module-level object exposed through useSyncExternalStore.
 * Every mutator replaces the changed slice and bumps `rev` so React re-renders.
 * There is no persistence — a refresh resets to the seed.
 */
import { useSyncExternalStore } from "react";
import * as seed from "./seed";
import { uid } from "./seed";
import type {
  AlertItem,
  Candidate,
  CommsChannel,
  CommsEntry,
  DecisionMaker,
  LibraryItem,
  Organisation,
  RelationshipInvite,
  RelationshipKind,
  TeamMember,
} from "./types";

interface State {
  rev: number;
  recruiters: typeof seed.recruiters;
  organisations: Organisation[];
  decisionMakers: DecisionMaker[];
  candidates: Candidate[];
  jobs: typeof seed.jobs;
  alerts: AlertItem[];
  comms: CommsEntry[];
  teamMembers: TeamMember[];
  libraryItems: LibraryItem[];
  relationshipInvites: RelationshipInvite[];
}

let state: State = {
  rev: 0,
  recruiters: seed.recruiters,
  organisations: [...seed.organisations],
  decisionMakers: [...seed.decisionMakers],
  candidates: [...seed.candidates],
  jobs: [...seed.jobs],
  alerts: [...seed.alerts],
  comms: [...seed.comms],
  teamMembers: [...seed.teamMembers],
  libraryItems: [...seed.libraryItems],
  relationshipInvites: [...seed.relationshipInvites],
};

const listeners = new Set<() => void>();
const emit = (next: Partial<State>) => {
  state = { ...state, ...next, rev: state.rev + 1 };
  listeners.forEach((l) => l());
};
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

export function useCrmStore(): State {
  return useSyncExternalStore(subscribe, () => state);
}

// ── Target helpers ─────────────────────────────────────────────────────────
export interface Target {
  kind: RelationshipKind;
  id: string;
  name: string;
}

// ── Mutators ───────────────────────────────────────────────────────────────

export function setAlert(input: {
  scope: "crm" | "recruiter";
  target: Target;
  date: string; // yyyy-mm-dd
  time: string; // hh:mm
  reason: string;
  setByName: string;
}) {
  const dueAt = new Date(`${input.date}T${input.time || "09:00"}:00`).toISOString();
  const alert: AlertItem = {
    id: uid("alert"),
    scope: input.scope,
    targetKind: input.target.kind,
    targetId: input.target.id,
    targetName: input.target.name,
    dueAt,
    reason: input.reason,
    setByName: input.setByName,
    createdAt: new Date().toISOString(),
    done: false,
  };
  emit({ alerts: [alert, ...state.alerts] });
  return alert;
}

export function toggleAlertDone(id: string) {
  emit({ alerts: state.alerts.map((a) => (a.id === id ? { ...a, done: !a.done } : a)) });
}

export function deleteAlert(id: string) {
  emit({ alerts: state.alerts.filter((a) => a.id !== id) });
}

export function logComms(input: {
  target: Target;
  channel: CommsChannel;
  subject: string;
  body: string;
  byName: string;
}) {
  const entry: CommsEntry = {
    id: uid("cm"),
    targetKind: input.target.kind,
    targetId: input.target.id,
    targetName: input.target.name,
    channel: input.channel,
    direction: "out",
    subject: input.subject || (input.channel === "text" ? "SMS" : "(no subject)"),
    body: input.body,
    byName: input.byName,
    at: new Date().toISOString(),
  };
  emit({ comms: [entry, ...state.comms] });
  return entry;
}

export function inviteTeamMember(input: {
  scope: "crm" | "recruiter";
  email: string;
  role: string;
}) {
  const slug = Math.random().toString(36).slice(2, 10);
  const base = input.scope === "crm" ? "https://console.recruit.dev/join/crm/" : "https://app.recruit.dev/join/team/";
  const member: TeamMember = {
    id: uid("tm"),
    scope: input.scope,
    firstName: "",
    lastName: "",
    email: input.email,
    role: input.role,
    status: "PENDING",
    profileComplete: false,
    magicLink: `${base}${slug}-demo`,
    invitedAt: new Date().toISOString(),
  };
  emit({ teamMembers: [member, ...state.teamMembers] });
  return member;
}

/** Simulate the invitee opening the magic link and completing their profile. */
export function simulateTeamRegistration(id: string) {
  emit({
    teamMembers: state.teamMembers.map((m) =>
      m.id === id
        ? {
            ...m,
            status: "REGISTERED",
            profileComplete: true,
            firstName: m.firstName || "New",
            lastName: m.lastName || "Member",
            magicLink: "",
          }
        : m
    ),
  });
}

export function revokeTeamMember(id: string) {
  emit({ teamMembers: state.teamMembers.filter((m) => m.id !== id) });
}

export function inviteRelationship(input: { kind: "organisation" | "candidate"; name: string; email: string }) {
  const slug = Math.random().toString(36).slice(2, 8);
  const invite: RelationshipInvite = {
    id: uid("ri"),
    kind: input.kind,
    name: input.name,
    email: input.email,
    magicLink: `https://app.recruit.dev/onboard/${input.kind === "organisation" ? "org" : "candidate"}/${slug}-demo`,
    status: "PENDING",
    invitedAt: new Date().toISOString(),
  };
  emit({ relationshipInvites: [invite, ...state.relationshipInvites] });
  return invite;
}

export function addOrganisation(input: { name: string; sector: string; email: string; mobile: string; landline: string; recruiterId: string }) {
  const org: Organisation = {
    id: uid("org"),
    name: input.name,
    sector: input.sector,
    contact: { email: input.email, mobile: input.mobile, landline: input.landline },
    serviceStatus: "NOT_ACCESSED",
    recruiterId: input.recruiterId,
    addedVia: "MANUAL",
    addedAt: new Date().toISOString(),
  };
  emit({ organisations: [org, ...state.organisations] });
  return org;
}

export function addCandidate(input: { firstName: string; lastName: string; jobTitle: string; email: string; mobile: string; landline: string; location: string; recruiterId: string }) {
  const cand: Candidate = {
    id: uid("cand"),
    firstName: input.firstName,
    lastName: input.lastName,
    jobTitle: input.jobTitle,
    contact: { email: input.email, mobile: input.mobile, landline: input.landline },
    location: input.location,
    serviceStatus: "NOT_ACCESSED",
    recruiterId: input.recruiterId,
    addedVia: "MANUAL",
    addedAt: new Date().toISOString(),
  };
  emit({ candidates: [cand, ...state.candidates] });
  return cand;
}

export function addDecisionMaker(input: { organisationId: string; firstName: string; lastName: string; jobTitle: string; email: string; mobile: string; landline: string }) {
  const dm: DecisionMaker = {
    id: uid("dm"),
    organisationId: input.organisationId,
    firstName: input.firstName,
    lastName: input.lastName,
    jobTitle: input.jobTitle,
    contact: { email: input.email, mobile: input.mobile, landline: input.landline },
    addedVia: "MANUAL",
    addedAt: new Date().toISOString(),
  };
  emit({ decisionMakers: [dm, ...state.decisionMakers] });
  return dm;
}

export function setLibraryReviewDate(id: string, date: string | null) {
  emit({ libraryItems: state.libraryItems.map((it) => (it.id === id ? { ...it, reviewDate: date } : it)) });
}

export function deleteLibraryItem(id: string) {
  emit({ libraryItems: state.libraryItems.filter((it) => it.id !== id) });
}

// ── Derived selectors (plain functions, call with store state) ──────────────

export const fullName = (p: { firstName: string; lastName: string }) =>
  `${p.firstName} ${p.lastName}`.trim() || "—";

export const orgName = (s: State, id: string) => s.organisations.find((o) => o.id === id)?.name ?? "—";
export const recruiterName = (s: State, id: string) => {
  const r = s.recruiters.find((x) => x.id === id);
  return r ? `${r.firstName} ${r.lastName}` : "—";
};

export const commsFor = (s: State, kind: RelationshipKind, id: string) =>
  s.comms.filter((c) => c.targetKind === kind && c.targetId === id).sort((a, b) => b.at.localeCompare(a.at));

export const alertsFor = (s: State, kind: RelationshipKind, id: string) =>
  s.alerts.filter((a) => a.targetKind === kind && a.targetId === id).sort((a, b) => a.dueAt.localeCompare(b.dueAt));

export const nextAlert = (s: State, kind: RelationshipKind, id: string) =>
  alertsFor(s, kind, id).find((a) => !a.done) ?? null;

export const jobsPostedForOrg = (s: State, orgId: string) => s.jobs.filter((j) => j.organisationId === orgId).length;
