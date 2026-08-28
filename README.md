# Login  Credentials 
Email: admin@recruitplatform.dev
Password: ChangeMe123!

# CMS prototype

A standalone SUPERADMIN tool for managing CMS content — separate from the production frontend (`../frontend`), but talking to the same `recruit-be` backend. Built to demo/validate the CMS editing experience per `../docs/CMS_Scope_Plan.md`.

Covers, per the approved MVP scope:

- **Pages** — flat content pages (About, Contact, Legal, etc.) with a rich-text editor and image insert.
- **Sectors** — link a job sector to its landing page. (Sector creation/deletion itself stays in the main admin panel — this only manages the CMS link.)
- **Homepage** — fixed-section editor (hero, stats, features, closing CTA). Layout is fixed in code; only copy/links are editable.
- **Banners** — dashboard announcements targeted by audience (candidate/client/recruiter/all).
- **Media library** — the shared image pool used across all of the above.

## Running it

Needs the `recruit-be` backend running with a migrated + seeded database (see the main repo's `README.md` — `alembic upgrade head` then `python -m scripts.seed` gives you a SUPERADMIN login).

```bash
npm install
cp .env.example .env   # only needed if the backend isn't on localhost:3000
npm run dev            # http://localhost:5174
```

The dev server proxies `/api/*` to the backend (see `vite.config.ts`), so there's no CORS configuration needed — same approach the main frontend uses via its Next.js rewrite.

Log in with the seeded SUPERADMIN (`admin@recruitment.local` / `ChangeMe123!` unless overridden via `SEED_SUPERADMIN_*` env vars on the backend). Anyone who logs in successfully reaches the tool regardless of role, but every write goes through SUPERADMIN-gated endpoints, so a non-SUPERADMIN account will hit 403s on every action.

## What this deliberately doesn't include

- No refresh-token rotation — a 401 just clears the session and bounces to `/login`. Fine for a single-operator prototype; would need the main frontend's refresh-queue pattern to go to production.
- No Cloudflare Turnstile widget on login — the local `.env` has `CAPTCHA_ENABLED=false`, so this isn't exercised. An environment with CAPTCHA on would need that added.
- Everything tagged "Phase 2" or "Exclude" in `../docs/CMS_Scope_Plan.md` (Help Articles, testimonials, footer, email templates, nav menu, blog).
