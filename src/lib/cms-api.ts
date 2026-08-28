import { api } from "./api";

export interface CmsPage {
  id: string;
  slug: string;
  title: string;
  body: string;
  meta_title: string | null;
  meta_description: string | null;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface SectorAdmin {
  id: string;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  sector_page_id: string | null;
  page_id: string | null;
  page_slug: string | null;
  page_title: string | null;
}

export interface CmsImage {
  id: string;
  filename: string;
  content_type: string;
  size_bytes: number;
  alt_text: string | null;
  created_at: string;
  url: string;
}

export const cmsAdminApi = {
  // No single-page GET exists on the backend — callers filter the list by id,
  // same pattern the main frontend's EditCmsPageClient uses.
  listPages: (params?: { page?: number; page_size?: number }) =>
    api.get<CmsPage[]>("/admin/pages", { params }),

  createPage: (data: {
    slug: string;
    title: string;
    body?: string;
    meta_title?: string;
    meta_description?: string;
    published_at?: string | null;
  }) => api.post<CmsPage>("/admin/pages", data),

  updatePage: (id: string, data: Partial<{
    title: string;
    body: string;
    meta_title: string;
    meta_description: string;
    published_at: string | null;
  }>) => api.put<CmsPage>(`/admin/pages/${id}`, data),

  deletePage: (id: string) => api.delete(`/admin/pages/${id}`),

  // Sectors
  listSectors: () => api.get<SectorAdmin[]>("/admin/sectors"),

  // Sector <-> page links
  linkSectorPage: (data: { category_id: string; page_id: string }) =>
    api.post("/admin/sector-pages", data),

  unlinkSectorPage: (id: string) => api.delete(`/admin/sector-pages/${id}`),

  // Media library
  listImages: (params?: { page?: number; page_size?: number }) =>
    api.get<{ items: CmsImage[]; total: number }>("/admin/cms/images", { params }),

  uploadImage: (file: File) => {
    const form = new FormData();
    form.append("file", file);
    return api.post<CmsImage>("/admin/cms/images", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  deleteImage: (id: string) => api.delete(`/admin/cms/images/${id}`),
};
