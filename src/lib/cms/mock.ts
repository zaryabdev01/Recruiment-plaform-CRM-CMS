/**
 * In-memory mock backend for the CMS section.
 *
 * Installed as the axios adapter (see lib/api.ts) so every `cmsAdminApi` /
 * `bannersAdminApi` / `homepageAdminApi` call resolves against this store
 * instead of hitting recruit-be. Nothing here persists — a refresh resets to
 * the seed. This makes the whole console (CMS + CRM + Recruiter portal) work
 * as a static Netlify site with no backend, for client review.
 */
import type { AxiosResponse, InternalAxiosRequestConfig } from "axios";
import type { CmsImage, CmsPage, SectorAdmin } from "@/lib/cms-api";
import type { DashboardBanner } from "@/lib/banners-api";
import type { HomepageContent } from "@/lib/homepage-api";

const uid = () =>
  typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `id-${Math.random().toString(36).slice(2)}`;
const now = () => new Date().toISOString();
const daysAgo = (n: number) => new Date(Date.now() - n * 86_400_000).toISOString();

const svg = (bg: string, label: string) =>
  "data:image/svg+xml;charset=utf-8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="480"><rect width="480" height="480" fill="${bg}"/><text x="50%" y="50%" fill="#ffffff" font-family="system-ui" font-size="34" font-weight="700" text-anchor="middle" dominant-baseline="middle">${label}</text></svg>`
  );

interface CmsState {
  pages: CmsPage[];
  sectors: SectorAdmin[];
  /** sector_page_id -> { category_id, page_id } */
  sectorPages: Record<string, { category_id: string; page_id: string }>;
  images: CmsImage[];
  banners: DashboardBanner[];
  homepage: HomepageContent;
}

function seed(): CmsState {
  const pages: CmsPage[] = [
    {
      id: uid(),
      slug: "about-us",
      title: "About Us",
      body: "<h2>Who we are</h2><p>A UK recruitment platform connecting candidates, employers and agencies.</p>",
      meta_title: "About Us | Recruitment Platform",
      meta_description: "Learn about our mission and team.",
      published_at: daysAgo(30),
      created_at: daysAgo(60),
      updated_at: daysAgo(30),
    },
    {
      id: uid(),
      slug: "contact",
      title: "Contact",
      body: "<p>Get in touch at <a href='mailto:hello@example.com'>hello@example.com</a>.</p>",
      meta_title: "Contact us",
      meta_description: "How to reach the team.",
      published_at: daysAgo(20),
      created_at: daysAgo(55),
      updated_at: daysAgo(20),
    },
    {
      id: uid(),
      slug: "privacy-policy",
      title: "Privacy Policy",
      body: "<p>This policy explains how we handle your data…</p>",
      meta_title: null,
      meta_description: null,
      published_at: daysAgo(10),
      created_at: daysAgo(40),
      updated_at: daysAgo(10),
    },
    {
      id: uid(),
      slug: "terms",
      title: "Terms of Service",
      body: "<p>Draft — not published yet.</p>",
      meta_title: null,
      meta_description: null,
      published_at: null,
      created_at: daysAgo(5),
      updated_at: daysAgo(2),
    },
  ];

  const sectorNames = ["Construction", "Healthcare", "IT & Digital", "Logistics", "Hospitality", "Finance"];
  const sectors: SectorAdmin[] = sectorNames.map((name) => ({
    id: uid(),
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    created_at: daysAgo(80),
    updated_at: daysAgo(80),
    sector_page_id: null,
    page_id: null,
    page_slug: null,
    page_title: null,
  }));

  const images: CmsImage[] = [
    { id: uid(), filename: "hero-banner.png", content_type: "image/png", size_bytes: 184_320, alt_text: "Team at work", created_at: daysAgo(25), url: svg("#2563eb", "hero-banner") },
    { id: uid(), filename: "office.jpg", content_type: "image/jpeg", size_bytes: 240_128, alt_text: "Office", created_at: daysAgo(18), url: svg("#059669", "office") },
    { id: uid(), filename: "candidates.jpg", content_type: "image/jpeg", size_bytes: 210_944, alt_text: "Candidates", created_at: daysAgo(9), url: svg("#7c3aed", "candidates") },
  ];

  const banners: DashboardBanner[] = [
    {
      id: uid(),
      title: "New: book interviews in one click",
      body: "Candidates can now self-book from a slot pool.",
      image_key: null,
      link_url: "/interviews",
      audience: "CANDIDATE",
      display_order: 0,
      is_active: true,
      starts_at: null,
      ends_at: null,
      created_at: daysAgo(12),
      updated_at: daysAgo(12),
      image_url: svg("#1d4ed8", "banner"),
    },
    {
      id: uid(),
      title: "Timesheet reminders are live",
      body: "Weekly nudge to submit hours by Monday 10am.",
      image_key: null,
      link_url: null,
      audience: "ALL",
      display_order: 1,
      is_active: false,
      starts_at: null,
      ends_at: null,
      created_at: daysAgo(6),
      updated_at: daysAgo(6),
      image_url: null,
    },
  ];

  const homepage: HomepageContent = {
    hero_headline: "Hire faster. Work smarter.",
    hero_subheadline: "The recruitment platform for candidates, employers and agencies.",
    hero_primary_cta_text: "Browse jobs",
    hero_primary_cta_url: "/jobs",
    hero_secondary_cta_text: "Post a job",
    hero_secondary_cta_url: "/register",
    stats: [
      { label: "Live jobs", value: "1,200+" },
      { label: "Placements this year", value: "3,400" },
      { label: "Client companies", value: "260" },
    ],
    features: [
      { title: "One pipeline", desc: "Applications, interviews and placements in a single view." },
      { title: "Built-in messaging", desc: "Talk to candidates and clients without leaving the platform." },
      { title: "Timesheets & pay", desc: "Digital approval and on-site QR sign-off." },
    ],
    cta_headline: "Ready to get started?",
    cta_subheadline: "Set up your account in minutes.",
    cta_primary_text: "Create account",
    cta_primary_url: "/register",
    cta_secondary_text: "Talk to sales",
    cta_secondary_url: "/contact",
    updated_at: daysAgo(4),
  };

  return { pages, sectors, sectorPages: {}, images, banners, homepage };
}

const state: CmsState = seed();

export const getCmsCounts = () => ({
  pages: state.pages.length,
  sectors: state.sectors.length,
  images: state.images.length,
  banners: state.banners.length,
});

// ── helpers ────────────────────────────────────────────────────────────────

const ok = <T>(data: T, config: InternalAxiosRequestConfig, status = 200): AxiosResponse<T> =>
  ({
    data,
    status,
    statusText: status === 200 ? "OK" : status === 201 ? "Created" : "Error",
    headers: {},
    config,
    request: {},
  }) as AxiosResponse<T>;

function body<T>(config: InternalAxiosRequestConfig): T {
  const d = config.data;
  if (typeof d === "string") return JSON.parse(d) as T;
  return (d ?? {}) as T;
}

function pageResponse(p: CmsPage): CmsPage {
  return { ...p };
}

// ── adapter ────────────────────────────────────────────────────────────────

export async function cmsMockAdapter(config: InternalAxiosRequestConfig): Promise<AxiosResponse> {
  const method = (config.method ?? "get").toLowerCase();
  let url = config.url ?? "";
  if (url.startsWith("/api/v1")) url = url.slice("/api/v1".length);
  // small, human-perceptible latency so loading states show
  await new Promise((r) => setTimeout(r, 120));

  const match = (re: RegExp) => re.exec(url);

  // --- auth insurance (not normally hit — auth is fully client-side now) ---
  if (url === "/users/me") {
    return ok({ id: "demo", email: "admin@recruitmentplatform.com", first_name: "Demo", last_name: "Admin", system_role: "SUPERADMIN" }, config);
  }

  // --- Pages ---
  if (url === "/admin/pages" && method === "get") return ok(state.pages.map(pageResponse), config);
  if (url === "/admin/pages" && method === "post") {
    const b = body<Partial<CmsPage>>(config);
    const p: CmsPage = {
      id: uid(),
      slug: b.slug ?? `page-${state.pages.length + 1}`,
      title: b.title ?? "Untitled",
      body: b.body ?? "",
      meta_title: b.meta_title ?? null,
      meta_description: b.meta_description ?? null,
      published_at: b.published_at ?? null,
      created_at: now(),
      updated_at: now(),
    };
    state.pages.unshift(p);
    return ok(pageResponse(p), config, 201);
  }
  {
    const m = match(/^\/admin\/pages\/([^/]+)$/);
    if (m) {
      const id = m[1];
      const idx = state.pages.findIndex((p) => p.id === id);
      if (method === "put" && idx >= 0) {
        state.pages[idx] = { ...state.pages[idx], ...body<Partial<CmsPage>>(config), updated_at: now() };
        return ok(pageResponse(state.pages[idx]), config);
      }
      if (method === "delete" && idx >= 0) {
        state.pages.splice(idx, 1);
        // also unlink any sector pointing at this page
        state.sectors.forEach((s) => {
          if (s.page_id === id) {
            s.page_id = s.sector_page_id = s.page_slug = s.page_title = null;
          }
        });
        return ok({}, config);
      }
    }
  }

  // --- Sectors ---
  if (url === "/admin/sectors" && method === "get") return ok(state.sectors.map((s) => ({ ...s })), config);
  if (url === "/admin/sector-pages" && method === "post") {
    const b = body<{ category_id: string; page_id: string }>(config);
    const sector = state.sectors.find((s) => s.id === b.category_id);
    const page = state.pages.find((p) => p.id === b.page_id);
    const linkId = uid();
    state.sectorPages[linkId] = { category_id: b.category_id, page_id: b.page_id };
    if (sector && page) {
      sector.sector_page_id = linkId;
      sector.page_id = page.id;
      sector.page_slug = page.slug;
      sector.page_title = page.title;
    }
    return ok({ id: linkId }, config, 201);
  }
  {
    const m = match(/^\/admin\/sector-pages\/([^/]+)$/);
    if (m && method === "delete") {
      const linkId = m[1];
      delete state.sectorPages[linkId];
      const sector = state.sectors.find((s) => s.sector_page_id === linkId);
      if (sector) sector.page_id = sector.sector_page_id = sector.page_slug = sector.page_title = null;
      return ok({}, config);
    }
  }

  // --- Media library ---
  if (url === "/admin/cms/images" && method === "get")
    return ok({ items: state.images.map((i) => ({ ...i })), total: state.images.length }, config);
  if (url === "/admin/cms/images" && method === "post") {
    const file = config.data instanceof FormData ? (config.data.get("file") as File | null) : null;
    const img: CmsImage = {
      id: uid(),
      filename: file?.name ?? "upload.png",
      content_type: file?.type ?? "image/png",
      size_bytes: file?.size ?? 0,
      alt_text: null,
      created_at: now(),
      url: file ? URL.createObjectURL(file) : svg("#64748b", "image"),
    };
    state.images.unshift(img);
    return ok({ ...img }, config, 201);
  }
  {
    const m = match(/^\/admin\/cms\/images\/([^/]+)$/);
    if (m && method === "delete") {
      state.images = state.images.filter((i) => i.id !== m[1]);
      return ok({}, config);
    }
  }

  // --- Dashboard banners ---
  if (url === "/admin/dashboard-banners" && method === "get")
    return ok({ items: state.banners.map((b) => ({ ...b })), total: state.banners.length }, config);
  if (url === "/admin/dashboard-banners" && method === "post") {
    const b = body<Partial<DashboardBanner>>(config);
    const banner: DashboardBanner = {
      id: uid(),
      title: b.title ?? "Untitled banner",
      body: b.body ?? null,
      image_key: null,
      link_url: b.link_url ?? null,
      audience: b.audience ?? "ALL",
      display_order: b.display_order ?? 0,
      is_active: b.is_active ?? true,
      starts_at: b.starts_at ?? null,
      ends_at: b.ends_at ?? null,
      created_at: now(),
      updated_at: now(),
      image_url: null,
    };
    state.banners.unshift(banner);
    return ok({ ...banner }, config, 201);
  }
  {
    const m = match(/^\/admin\/dashboard-banners\/([^/]+)\/image$/);
    if (m && method === "post") {
      const banner = state.banners.find((x) => x.id === m[1]);
      const file = config.data instanceof FormData ? (config.data.get("file") as File | null) : null;
      if (banner && file) banner.image_url = URL.createObjectURL(file);
      if (banner) banner.updated_at = now();
      return ok(banner ? { ...banner } : {}, config);
    }
  }
  {
    const m = match(/^\/admin\/dashboard-banners\/([^/]+)$/);
    if (m) {
      const idx = state.banners.findIndex((x) => x.id === m[1]);
      if (method === "put" && idx >= 0) {
        state.banners[idx] = { ...state.banners[idx], ...body<Partial<DashboardBanner>>(config), updated_at: now() };
        return ok({ ...state.banners[idx] }, config);
      }
      if (method === "delete" && idx >= 0) {
        state.banners.splice(idx, 1);
        return ok({}, config);
      }
    }
  }

  // --- Homepage ---
  if (url === "/admin/homepage" && method === "get") return ok({ ...state.homepage }, config);
  if (url === "/admin/homepage" && method === "put") {
    state.homepage = { ...state.homepage, ...body<Partial<HomepageContent>>(config), updated_at: now() };
    return ok({ ...state.homepage }, config);
  }

  // Unknown route — behave like a 404 so getApiErrorMessage has something to show.
  return ok({ detail: `No mock route for ${method.toUpperCase()} ${url}` }, config, 404);
}
