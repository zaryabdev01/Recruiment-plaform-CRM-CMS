import { api } from "./api";

export type BannerAudience = "CANDIDATE" | "RECRUITER" | "CLIENT" | "ALL";

export interface DashboardBanner {
  id: string;
  title: string;
  body: string | null;
  image_key: string | null;
  link_url: string | null;
  audience: BannerAudience;
  display_order: number;
  is_active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  created_at: string;
  updated_at: string;
  image_url: string | null;
}

export const bannersAdminApi = {
  list: () => api.get<{ items: DashboardBanner[]; total: number }>("/admin/dashboard-banners"),

  create: (data: {
    title: string;
    body?: string;
    link_url?: string;
    audience: BannerAudience;
    display_order?: number;
    is_active?: boolean;
    starts_at?: string | null;
    ends_at?: string | null;
  }) => api.post<DashboardBanner>("/admin/dashboard-banners", data),

  update: (id: string, data: Partial<{
    title: string;
    body: string;
    link_url: string;
    audience: BannerAudience;
    display_order: number;
    is_active: boolean;
    starts_at: string | null;
    ends_at: string | null;
  }>) => api.put<DashboardBanner>(`/admin/dashboard-banners/${id}`, data),

  uploadImage: (id: string, file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<DashboardBanner>(`/admin/dashboard-banners/${id}/image`, form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (id: string) => api.delete(`/admin/dashboard-banners/${id}`),
};
