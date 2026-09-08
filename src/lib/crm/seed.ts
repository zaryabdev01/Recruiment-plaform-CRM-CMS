/** Deterministic mock dataset for the CRM / recruiter-portal prototype. */
import type {
  AlertItem,
  Candidate,
  CommsEntry,
  DecisionMaker,
  Job,
  LibraryItem,
  Organisation,
  Recruiter,
  RelationshipInvite,
  TeamMember,
} from "./types";

let counter = 0;
export const uid = (prefix: string) => `${prefix}_${(++counter).toString(36)}${Date.now().toString(36).slice(-3)}`;

const FIRST = ["Amelia", "James", "Priya", "Marcus", "Sofia", "Daniel", "Chloe", "Omar", "Grace", "Liam", "Nina", "Ethan", "Aisha", "Ben", "Hannah", "Tomasz", "Ruby", "Kai", "Fatima", "Noah", "Elena", "Josh", "Maya", "Sam", "Leah", "Ryan", "Zara", "Adam", "Isla", "Callum", "Yusuf", "Freya"];
const LAST = ["Bennett", "Okafor", "Sharma", "Reid", "Nowak", "Clarke", "Hughes", "Farah", "Patel", "Murphy", "Kaur", "Doyle", "Khan", "Wallace", "Lynch", "Brooks", "Ellis", "Nguyen", "Foster", "Ahmed", "Barnes", "Cole", "Dixon", "Hayes"];
const SECTORS = ["Construction", "Healthcare", "Logistics", "Hospitality", "IT & Digital", "Manufacturing", "Finance", "Education", "Engineering", "Retail"];
const ORG_SUFFIX = ["Group", "Ltd", "Partners", "Services", "Holdings", "Solutions", "& Co", "UK"];
const ORG_STEM = ["Northgate", "Brightwater", "Meridian", "Kingsway", "Oakfield", "Sterling", "Harbour", "Vantage", "Crestline", "Ironbridge", "Fairholme", "Redwood", "Pinnacle", "Camden", "Aldgate", "Whitfield", "Blackthorn", "Greenacre", "Larkspur", "Thornbury", "Maple Court", "Cedarpark"];
const JOB_TITLES = ["Site Manager", "Registered Nurse", "HGV Driver", "Sous Chef", "Software Engineer", "CNC Operator", "Management Accountant", "Teaching Assistant", "Project Engineer", "Store Supervisor", "Electrician", "Care Assistant", "Warehouse Operative", "Bid Coordinator", "QA Analyst", "Payroll Officer"];

const pick = <T,>(arr: T[], i: number) => arr[i % arr.length];
const phone = (i: number) => `07${(700000000 + i * 137171).toString().slice(0, 9)}`;
const landline = (i: number) => `020 7${(946000 + i * 71).toString().slice(0, 6)}`;
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();
const inDays = (n: number, hour = 10) => {
  const d = new Date(Date.now() + n * 86_400_000);
  d.setHours(hour, 0, 0, 0);
  return d.toISOString();
};

// ── Recruiters ──────────────────────────────────────────────────────────────
export const recruiters: Recruiter[] = Array.from({ length: 10 }, (_, i) => {
  const firstName = pick(FIRST, i * 3);
  const lastName = pick(LAST, i * 5 + 1);
  return {
    id: `rec_${i + 1}`,
    firstName,
    lastName,
    agencyName: `${pick(ORG_STEM, i)} Recruitment`,
    contact: {
      email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${pick(ORG_STEM, i).toLowerCase().replace(/\s/g, "")}rec.co.uk`,
      mobile: phone(i + 2),
      landline: landline(i + 4),
    },
    serviceStatus: i % 4 === 0 ? "NOT_ACCESSED" : "ACCESSED",
    jobsPosted: 3 + ((i * 7) % 14),
    joinedAt: daysAgo(20 + i * 11),
  };
});

// ── Organisations ───────────────────────────────────────────────────────────
export const organisations: Organisation[] = Array.from({ length: 22 }, (_, i) => ({
  id: `org_${i + 1}`,
  name: `${pick(ORG_STEM, i)} ${pick(ORG_SUFFIX, i)}`,
  sector: pick(SECTORS, i),
  contact: {
    email: `contact@${pick(ORG_STEM, i).toLowerCase().replace(/\s/g, "")}.co.uk`,
    mobile: phone(i + 20),
    landline: landline(i + 12),
  },
  serviceStatus: i % 3 === 0 ? "NOT_ACCESSED" : "ACCESSED",
  recruiterId: pick(recruiters, i).id,
  addedVia: i % 5 === 0 ? "MANUAL" : "INVITE",
  addedAt: daysAgo(2 + i * 4),
}));

// ── Decision makers (contacts on an organisation) ───────────────────────────
export const decisionMakers: DecisionMaker[] = Array.from({ length: 28 }, (_, i) => {
  const org = pick(organisations, i * 3);
  return {
    id: `dm_${i + 1}`,
    organisationId: org.id,
    firstName: pick(FIRST, i * 2 + 4),
    lastName: pick(LAST, i * 3 + 2),
    jobTitle: pick(["Operations Director", "HR Manager", "Managing Director", "Head of Talent", "Site Director", "Finance Director"], i),
    contact: { email: `dm${i + 1}@${org.name.toLowerCase().split(" ")[0]}.co.uk`, mobile: phone(i + 40), landline: landline(i + 30) },
    addedVia: i % 4 === 0 ? "MANUAL" : "INVITE",
    addedAt: daysAgo(1 + i * 3),
  };
});

// ── Candidates ─────────────────────────────────────────────────────────────
export const candidates: Candidate[] = Array.from({ length: 34 }, (_, i) => ({
  id: `cand_${i + 1}`,
  firstName: pick(FIRST, i + 1),
  lastName: pick(LAST, i * 2 + 3),
  jobTitle: pick(JOB_TITLES, i),
  contact: { email: `${pick(FIRST, i + 1).toLowerCase()}${i + 1}@mail.com`, mobile: phone(i + 60), landline: landline(i + 50) },
  location: pick(["London", "Manchester", "Birmingham", "Leeds", "Bristol", "Glasgow", "Cardiff", "Liverpool"], i),
  serviceStatus: i % 3 === 1 ? "NOT_ACCESSED" : "ACCESSED",
  recruiterId: pick(recruiters, i).id,
  addedVia: i % 6 === 0 ? "MANUAL" : "INVITE",
  addedAt: daysAgo(i * 2),
}));

// ── Jobs ───────────────────────────────────────────────────────────────────
export const jobs: Job[] = Array.from({ length: 26 }, (_, i) => {
  const org = pick(organisations, i);
  const allocated = i % 3 === 0;
  return {
    id: `job_${i + 1}`,
    title: pick(JOB_TITLES, i),
    organisationId: org.id,
    sector: org.sector,
    recruiterId: pick(recruiters, i).id,
    status: (["LIVE", "LIVE", "DRAFT", "CLOSED", "FILLED"] as const)[i % 5],
    applicants: (i * 5) % 41,
    postedAt: daysAgo(i * 3 + 1),
    allocatedToRecruiterId: allocated ? pick(recruiters, i + 1).id : null,
    allocatedBy: allocated ? "Recruiter Admin" : null,
    allocatedAt: allocated ? daysAgo(i) : null,
  };
});

// ── Alerts ─────────────────────────────────────────────────────────────────
export const alerts: AlertItem[] = [
  { id: uid("alert"), scope: "crm", targetKind: "recruiter", targetId: "rec_2", targetName: `${recruiters[1].firstName} ${recruiters[1].lastName}`, dueAt: inDays(-1, 9), reason: "Chase overdue onboarding docs", setByName: "CRM · Dana", createdAt: daysAgo(3), done: false },
  { id: uid("alert"), scope: "crm", targetKind: "candidate", targetId: "cand_4", targetName: `${candidates[3].firstName} ${candidates[3].lastName}`, dueAt: inDays(0, 15), reason: "Support call — struggled with profile upload", setByName: "CRM · Dana", createdAt: daysAgo(1), done: false },
  { id: uid("alert"), scope: "crm", targetKind: "recruiter", targetId: "rec_5", targetName: `${recruiters[4].firstName} ${recruiters[4].lastName}`, dueAt: inDays(2, 11), reason: "Walk through new pipeline board", setByName: "CRM · Priya", createdAt: daysAgo(2), done: false },
  { id: uid("alert"), scope: "crm", targetKind: "organisation", targetId: "org_3", targetName: organisations[2].name, dueAt: inDays(5, 10), reason: "Quarterly account review", setByName: "CRM · Dana", createdAt: daysAgo(4), done: false },
  { id: uid("alert"), scope: "recruiter", targetKind: "organisation", targetId: "org_1", targetName: organisations[0].name, dueAt: inDays(-2, 14), reason: "Call back re: 3 open vacancies", setByName: "You", createdAt: daysAgo(5), done: false },
  { id: uid("alert"), scope: "recruiter", targetKind: "candidate", targetId: "cand_1", targetName: `${candidates[0].firstName} ${candidates[0].lastName}`, dueAt: inDays(0, 12), reason: "Confirm availability for interview", setByName: "You", createdAt: daysAgo(1), done: false },
  { id: uid("alert"), scope: "recruiter", targetKind: "decision_maker", targetId: "dm_2", targetName: `${decisionMakers[1].firstName} ${decisionMakers[1].lastName}`, dueAt: inDays(1, 9), reason: "Send shortlist for Site Manager role", setByName: "You", createdAt: daysAgo(2), done: false },
  { id: uid("alert"), scope: "recruiter", targetKind: "organisation", targetId: "org_4", targetName: organisations[3].name, dueAt: inDays(3, 16), reason: "Contract renewal discussion", setByName: "You", createdAt: daysAgo(3), done: false },
];

// ── Comms history ──────────────────────────────────────────────────────────
export const comms: CommsEntry[] = [
  { id: uid("cm"), targetKind: "candidate", targetId: "cand_1", targetName: `${candidates[0].firstName} ${candidates[0].lastName}`, channel: "email", direction: "out", subject: "Your application update", body: "Hi — good news, the client would like to interview you.", byName: "You", at: daysAgo(2) },
  { id: uid("cm"), targetKind: "candidate", targetId: "cand_1", targetName: `${candidates[0].firstName} ${candidates[0].lastName}`, channel: "message", direction: "in", subject: "Re: Your application update", body: "Great, I'm free Tuesday or Wednesday afternoon.", byName: `${candidates[0].firstName}`, at: daysAgo(2) },
  { id: uid("cm"), targetKind: "candidate", targetId: "cand_1", targetName: `${candidates[0].firstName} ${candidates[0].lastName}`, channel: "call", direction: "out", subject: "Prep call", body: "15 min interview prep. Confident, sending CV to client.", byName: "You", at: daysAgo(1) },
  { id: uid("cm"), targetKind: "organisation", targetId: "org_1", targetName: organisations[0].name, channel: "email", direction: "out", subject: "3 candidates for your Site Manager role", body: "Please find attached three shortlisted CVs.", byName: "You", at: daysAgo(4) },
  { id: uid("cm"), targetKind: "organisation", targetId: "org_1", targetName: organisations[0].name, channel: "text", direction: "out", subject: "SMS", body: "Hi, quick chase on the shortlist I sent Thursday — any feedback?", byName: "You", at: daysAgo(1) },
  { id: uid("cm"), targetKind: "recruiter", targetId: "rec_2", targetName: `${recruiters[1].firstName} ${recruiters[1].lastName}`, channel: "email", direction: "out", subject: "Onboarding documents outstanding", body: "We still need your signed agency agreement and insurance certificate.", byName: "CRM · Dana", at: daysAgo(3) },
  { id: uid("cm"), targetKind: "recruiter", targetId: "rec_2", targetName: `${recruiters[1].firstName} ${recruiters[1].lastName}`, channel: "call", direction: "out", subject: "Support call", body: "Left voicemail about outstanding docs. Will retry tomorrow.", byName: "CRM · Dana", at: daysAgo(2) },
];

// ── Teams ──────────────────────────────────────────────────────────────────
export const teamMembers: TeamMember[] = [
  { id: uid("tm"), scope: "crm", firstName: "Dana", lastName: "Whitmore", email: "dana@recruit-crm.internal", role: "CRM Support Lead", status: "REGISTERED", profileComplete: true, magicLink: "", invitedAt: daysAgo(90) },
  { id: uid("tm"), scope: "crm", firstName: "Priya", lastName: "Raman", email: "priya@recruit-crm.internal", role: "CRM Support Agent", status: "REGISTERED", profileComplete: true, magicLink: "", invitedAt: daysAgo(45) },
  { id: uid("tm"), scope: "crm", firstName: "", lastName: "", email: "newagent@recruit-crm.internal", role: "CRM Support Agent", status: "PENDING", profileComplete: false, magicLink: "https://console.recruit.dev/join/crm/8f2a1c9d-demo", invitedAt: daysAgo(1) },
  { id: uid("tm"), scope: "recruiter", firstName: "Sofia", lastName: "Clarke", email: "sofia@northgaterec.co.uk", role: "Resourcer", status: "REGISTERED", profileComplete: true, magicLink: "", invitedAt: daysAgo(30) },
  { id: uid("tm"), scope: "recruiter", firstName: "Ben", lastName: "Wallace", email: "ben@northgaterec.co.uk", role: "Consultant", status: "REGISTERED", profileComplete: false, magicLink: "", invitedAt: daysAgo(12) },
  { id: uid("tm"), scope: "recruiter", firstName: "", lastName: "", email: "trainee@northgaterec.co.uk", role: "Trainee Consultant", status: "PENDING", profileComplete: false, magicLink: "https://app.recruit.dev/join/team/1b7e4a2f-demo", invitedAt: daysAgo(2) },
];

// ── Library ────────────────────────────────────────────────────────────────
export const libraryItems: LibraryItem[] = [
  { id: uid("lib"), name: "Right to Work checklist.pdf", kind: "PDF", sizeKb: 184, reviewDate: inDays(40), uploadedBy: "Dana Whitmore", uploadedAt: daysAgo(120), usedIn: ["Job: Site Manager (Northgate Group)", "Job: HGV Driver (Meridian Ltd)", "Onboarding pack template"] },
  { id: uid("lib"), name: "Agency terms of business.docx", kind: "DOCX", sizeKb: 96, reviewDate: inDays(-5), uploadedBy: "Priya Raman", uploadedAt: daysAgo(210), usedIn: ["Organisation profile: Brightwater Partners", "Organisation profile: Kingsway Holdings"] },
  { id: uid("lib"), name: "Company brochure 2025.pdf", kind: "PDF", sizeKb: 4210, reviewDate: null, uploadedBy: "Dana Whitmore", uploadedAt: daysAgo(60), usedIn: [] },
  { id: uid("lib"), name: "Interview scorecard.docx", kind: "DOCX", sizeKb: 55, reviewDate: inDays(15), uploadedBy: "Sofia Clarke", uploadedAt: daysAgo(80), usedIn: ["Job: Registered Nurse (Oakfield Services)"] },
  { id: uid("lib"), name: "Site induction slides.pdf", kind: "PDF", sizeKb: 2870, reviewDate: inDays(90), uploadedBy: "Ben Wallace", uploadedAt: daysAgo(30), usedIn: ["Job: Site Manager (Northgate Group)"] },
];

export const relationshipInvites: RelationshipInvite[] = [
  { id: uid("ri"), kind: "organisation", name: "Sterling Solutions", email: "hr@sterlingsolutions.co.uk", magicLink: "https://app.recruit.dev/onboard/org/c4d9-demo", status: "PENDING", invitedAt: daysAgo(2) },
  { id: uid("ri"), kind: "candidate", name: "Callum Hayes", email: "callum.hayes@mail.com", magicLink: "https://app.recruit.dev/onboard/candidate/a1f7-demo", status: "PENDING", invitedAt: daysAgo(1) },
];
