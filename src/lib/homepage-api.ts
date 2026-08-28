import { api } from "./api";

export interface HomepageStat {
  label: string;
  value: string;
}

export interface HomepageFeature {
  title: string;
  desc: string;
}

export interface HomepageContent {
  hero_headline: string;
  hero_subheadline: string | null;
  hero_primary_cta_text: string | null;
  hero_primary_cta_url: string | null;
  hero_secondary_cta_text: string | null;
  hero_secondary_cta_url: string | null;
  stats: HomepageStat[];
  features: HomepageFeature[];
  cta_headline: string | null;
  cta_subheadline: string | null;
  cta_primary_text: string | null;
  cta_primary_url: string | null;
  cta_secondary_text: string | null;
  cta_secondary_url: string | null;
  updated_at: string;
}

export type HomepageContentUpdate = Omit<HomepageContent, "updated_at">;

export const homepageAdminApi = {
  get: () => api.get<HomepageContent>("/admin/homepage"),
  update: (data: HomepageContentUpdate) => api.put<HomepageContent>("/admin/homepage", data),
};
