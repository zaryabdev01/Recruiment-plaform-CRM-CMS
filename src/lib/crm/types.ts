/**
 * Mock domain types for the CRM / Recruiter-portal prototype.
 *
 * This whole subtree is an in-memory demo — nothing here talks to recruit-be.
 * It exists to let the client click through the reworked CRM concept and the
 * recruiter-side "Team / Relationships" feedback before we commit to real
 * design, frontend and backend work.
 */

export type RelationshipKind = "organisation" | "candidate" | "decision_maker" | "recruiter";

/** Has this end user actually logged in and used the platform yet? */
export type ServiceStatus = "ACCESSED" | "NOT_ACCESSED";

export type JobStatus = "LIVE" | "DRAFT" | "CLOSED" | "FILLED";

export type CommsChannel = "email" | "text";

export type InviteStatus = "PENDING" | "REGISTERED";

export interface Contact {
  email: string;
  mobile: string;
  landline: string;
}

export interface Recruiter {
  id: string;
  firstName: string;
  lastName: string;
  contact: Contact;
  agencyName: string;
  serviceStatus: ServiceStatus;
  jobsPosted: number;
  joinedAt: string;
}

export interface Candidate {
  id: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  contact: Contact;
  location: string;
  serviceStatus: ServiceStatus;
  /** Which recruiter account this candidate belongs to (recruiter portal view). */
  recruiterId: string;
  addedVia: "INVITE" | "MANUAL";
  addedAt: string;
}

export interface Organisation {
  id: string;
  name: string;
  sector: string;
  contact: Contact;
  serviceStatus: ServiceStatus;
  recruiterId: string;
  addedVia: "INVITE" | "MANUAL";
  addedAt: string;
}

export interface DecisionMaker {
  id: string;
  organisationId: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  contact: Contact;
  addedVia: "INVITE" | "MANUAL";
  addedAt: string;
}

export interface Job {
  id: string;
  title: string;
  organisationId: string;
  sector: string;
  recruiterId: string;
  status: JobStatus;
  applicants: number;
  postedAt: string;
  /** Recruiter-admin allocated this job to a specific team member. */
  allocatedToRecruiterId: string | null;
  allocatedBy: string | null;
  allocatedAt: string | null;
}

/** A call-back / follow-up reminder set against any end-user record. */
export interface AlertItem {
  id: string;
  scope: "crm" | "recruiter";
  targetKind: RelationshipKind;
  targetId: string;
  targetName: string;
  /** ISO datetime the alert is due. */
  dueAt: string;
  reason: string;
  setByName: string;
  createdAt: string;
  done: boolean;
}

export interface CommsEntry {
  id: string;
  targetKind: RelationshipKind;
  targetId: string;
  targetName: string;
  channel: CommsChannel | "call" | "message";
  direction: "out" | "in";
  subject: string;
  body: string;
  byName: string;
  at: string;
}

export interface TeamMember {
  id: string;
  /** "crm" = logs into the CRM only; "recruiter" = a recruiter-agency employee. */
  scope: "crm" | "recruiter";
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: InviteStatus;
  profileComplete: boolean;
  magicLink: string;
  invitedAt: string;
}

export interface LibraryItem {
  id: string;
  name: string;
  kind: "PDF" | "DOCX" | "IMAGE" | "LINK";
  sizeKb: number;
  reviewDate: string | null;
  uploadedBy: string;
  uploadedAt: string;
  /** Human-readable list of places this item is currently referenced. */
  usedIn: string[];
}

export interface RelationshipInvite {
  id: string;
  kind: "organisation" | "candidate";
  name: string;
  email: string;
  magicLink: string;
  status: InviteStatus;
  invitedAt: string;
}
