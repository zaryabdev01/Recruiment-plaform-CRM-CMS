# Internal Console prototype

One login, three workspaces, each with its own accent colour so the current context is always obvious:

| Workspace | Colour | What it is | Backend |
|---|---|---|---|
| **CRM** | blue | Support desk over the whole platform — every recruiter + candidate, all jobs, CRM's own team | mock |
| **Recruiter portal** | emerald | An agency's own view — relationships, team, allocated jobs, library | mock |
| **CMS** | violet | The original SUPERADMIN content tool (Pages, Sectors, Homepage, Banners, Media) | live `recruit-be` |

After login you land on **Console home** (`/`) — a dashboard with a card per workspace (live counts, quick links, "Open"), a merged "next alerts" list across CRM + Recruiter, and a colour key. The left sidebar groups nav by workspace; a slim top bar shows which workspace you're in.

The CRM + Recruiter portal are a **mock, in-memory** prototype of the Sprint 8 "Internal CRM & Recruitment Pipeline" rework plus the client's recruiter-side feedback — **no backend**, so the client can click every flow before we commit to real design, frontend and backend work.

## Two ways in

| | For | Needs backend? |
|---|---|---|
| **Explore in demo mode** (button on the login screen) | Reviewing the CRM + Recruiter-portal prototype | No |
| SUPERADMIN sign-in (`admin@recruitment.local` / `ChangeMe123!`) | The CMS section | Yes — migrated + seeded `recruit-be` |

Both land on Console home. Demo mode stores a flag in `localStorage`; "Exit demo" on the sidebar clears it. The CMS nav items and home card are dimmed and marked "needs login" while in demo mode.

## Running it

```bash
npm install
npm run dev            # http://localhost:5174
```

For the CMS section you also need `recruit-be` running (see the main repo README — `alembic upgrade head` then `python -m scripts.seed`). The dev server proxies `/api/*` to it.

## What the CRM prototype covers

### CRM — internal support desk (`/crm`)
"CRM is for us — to support recruiters and candidates."

- **Dashboard** — an **Alerts** box showing every call-back/follow-up CRM staff have set on any end user, next-due first; overdue in red. Plus headline counts.
- **Relationships** — every **recruiter** and **candidate** on the platform (tabbed). Word search, filter by *Accessed services / Not accessed services*, 20 per page. Each row: contact details on hover, a **Comms** pop-out (quick email / quick text, logged to history), and an **Alert** cell showing the next alert set. Row opens a drawer with the full merged communication history and all alerts.
- **Jobs** — every job across the site (read-only oversight). Search + status + sector filters, 20 per page.
- **Team** — CRM operators who log into the CRM only. Invite by email → a **magic link** is generated → "Simulate registration" shows them landing with a completed profile. Remove goes through the irreversible-action confirm.

### Recruiter portal (preview) (`/recruiter`)
The recruiter-facing side of the same feedback.

- **Dashboard** — **Alerts** box (this team member's own alerts, next-due first) and an **Allocated jobs** box (jobs the recruiter-admin allocated to them, with who allocated it and when).
- **Team** — invite team members via magic link; on opening it they complete **the same profile we ask candidates to fill out** (fields listed inline) and are connected as an employee.
- **Relationships** — send an invite (organisation or candidate) or add either manually. Three sections — **Organisations**, **Decision makers**, **Candidates** — each showing the last 10 with activity and a **View all**.
  - **View all** pages: 20 per page, word search, *Accessed / Not accessed services* filter, the exact columns from the feedback, contact-on-hover, Comms pop-out, Alert cell.
  - **Organisation detail** — profile, alerts, communication history, and a **Decision makers** section with **Add contact manually**.
  - Alerts are set with **date, time and reason** on organisations, candidates and decision makers.
- **Library** — every item can be **viewed on screen** or **downloaded**, and carries an editable **review date** (overdue is flagged). **Delete** opens the site-wide guard, which first **lists everywhere the item is still used** and warns the action is irreversible.

### Global
`ConfirmDialog` is the one component behind every delete in the prototype — nothing is removed on the first click anywhere.

## Deliberately not included

- No persistence — a refresh resets the CRM prototype to its seed data.
- Nothing actually sends (emails/texts are logged to the mock history only).
- The CRM prototype does not touch `recruit-be`; the existing `/crm/*` API is not wired up here. Field/entity names in the mock are indicative, not final.
- Everything the CMS prototype already excluded (see git history) still applies to that section.
