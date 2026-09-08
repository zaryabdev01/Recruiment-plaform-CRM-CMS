# Internal Console prototype

One login, three workspaces, each with its own accent colour so the current context is always obvious:

| Workspace | Colour | What it is |
|---|---|---|
| **CRM** | blue | Support desk over the whole platform — every recruiter + candidate, all jobs, CRM's own team |
| **Recruiter portal** | emerald | An agency's own view — relationships, team, allocated jobs, library |
| **CMS** | violet | Content tool — Pages, Sectors, Homepage, Banners, Media library |

**Everything runs on in-memory sample data — no backend.** This is a functionality/UX prototype for client review before the real design, frontend and backend build. Nothing persists (a refresh resets it) and nothing actually sends.

After login you land on **Console home** (`/`) — a card per workspace with counts and quick links, a merged "next alerts" list, and a colour key. The left sidebar groups nav by workspace; a slim top bar shows which workspace you're in.

## Signing in

One account unlocks the whole console (it's pre-filled on the login screen):

```
admin@recruitmentplatform.com
demo1234
```

## Running it

```bash
npm install
npm run dev            # http://localhost:5174
npm run build          # static site in dist/ (deployed to Netlify)
```

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

### CMS (`/pages`, `/sectors`, `/homepage`, `/banners`, `/media`)
Full create / edit / delete on Pages (with a rich-text editor + image insert), Sector→page links, the fixed-section Homepage editor, Dashboard Banners, and the Media library. All of it reads and writes an in-memory store (`src/lib/cms/mock.ts`) installed as the axios adapter, so the existing page components are unchanged — they just never reach a network.

### Global
`ConfirmDialog` is the one component behind every delete in the prototype — nothing is removed on the first click anywhere.

## Deliberately not included

- No persistence — a refresh resets everything to seed data.
- Nothing actually sends (emails/texts are logged to the mock history only); uploaded images live only for the session.
- No real `recruit-be` integration. Field/entity names in the mock are indicative, not final.
