import { useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2, Upload, X } from "lucide-react";
import { bannersAdminApi, type DashboardBanner, type BannerAudience } from "@/lib/banners-api";
import { getApiErrorMessage } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import toast from "react-hot-toast";

const AUDIENCES: BannerAudience[] = ["ALL", "CANDIDATE", "CLIENT", "RECRUITER"];

interface FormState {
  title: string;
  body: string;
  link_url: string;
  audience: BannerAudience;
  display_order: number;
  is_active: boolean;
  starts_at: string;
  ends_at: string;
}

const EMPTY: FormState = {
  title: "", body: "", link_url: "", audience: "ALL", display_order: 0, is_active: true, starts_at: "", ends_at: "",
};

export function BannersPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<DashboardBanner | "new" | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin-banners"],
    queryFn: () => bannersAdminApi.list().then((r) => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => bannersAdminApi.delete(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-banners"] }); toast.success("Banner deleted"); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const banners = data?.items ?? [];

  if (editing) {
    return <BannerEditor banner={editing === "new" ? null : editing} onDone={() => setEditing(null)} />;
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard banners</h1>
          <p className="text-sm text-gray-500 mt-1">Announcements shown inside the logged-in dashboard, targeted by audience.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> New banner
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="space-y-3">
          {banners.map((b) => (
            <div key={b.id} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4">
              {b.image_url ? (
                <img src={b.image_url} alt="" className="h-14 w-24 object-cover rounded-lg shrink-0" />
              ) : (
                <div className="h-14 w-24 rounded-lg bg-gray-100 shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 truncate">{b.title}</h3>
                  <Badge variant={b.is_active ? "success" : "default"}>{b.is_active ? "Active" : "Inactive"}</Badge>
                  <Badge>{b.audience}</Badge>
                </div>
                {b.body && <p className="text-sm text-gray-500 truncate mt-0.5">{b.body}</p>}
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setEditing(b)} className="text-gray-400 hover:text-brand-600"><Edit2 className="h-4 w-4" /></button>
                <button
                  onClick={() => { if (confirm("Delete this banner?")) deleteMut.mutate(b.id); }}
                  className="text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
          {banners.length === 0 && (
            <div className="text-center py-12 text-gray-400 bg-white rounded-xl border border-gray-200">No banners yet</div>
          )}
        </div>
      )}
    </div>
  );
}

function BannerEditor({ banner, onDone }: { banner: DashboardBanner | null; onDone: () => void }) {
  const qc = useQueryClient();
  const isNew = banner === null;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState<FormState>(
    banner
      ? {
          title: banner.title,
          body: banner.body ?? "",
          link_url: banner.link_url ?? "",
          audience: banner.audience,
          display_order: banner.display_order,
          is_active: banner.is_active,
          starts_at: banner.starts_at ? banner.starts_at.slice(0, 16) : "",
          ends_at: banner.ends_at ? banner.ends_at.slice(0, 16) : "",
        }
      : EMPTY
  );
  const [imageUrl, setImageUrl] = useState(banner?.image_url ?? null);
  const [pendingImage, setPendingImage] = useState<File | null>(null);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const uploadMut = useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => bannersAdminApi.uploadImage(id, file),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success("Image uploaded");
      onDone();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const saveMut = useMutation({
    mutationFn: () => {
      const data = {
        title: form.title,
        body: form.body || undefined,
        link_url: form.link_url || undefined,
        audience: form.audience,
        display_order: form.display_order,
        is_active: form.is_active,
        starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
        ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      };
      return isNew ? bannersAdminApi.create(data) : bannersAdminApi.update(banner.id, data);
    },
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ["admin-banners"] });
      toast.success(isNew ? "Banner created" : "Banner saved");
      if (isNew && pendingImage) {
        uploadMut.mutate({ id: res.data.id, file: pendingImage });
      } else {
        onDone();
      }
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const handleFile = (file: File | undefined | null) => {
    if (!file) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      toast.error("Only JPEG, PNG and WEBP images are accepted");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image must be 2 MB or smaller");
      return;
    }
    setImageUrl(URL.createObjectURL(file));
    if (isNew) {
      setPendingImage(file);
    } else {
      uploadMut.mutate({ id: banner.id, file });
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <button onClick={onDone} className="text-sm text-gray-500 hover:text-brand-700 mb-6">&larr; Back to banners</button>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">{isNew ? "New banner" : "Edit banner"}</h1>

      <form
        onSubmit={(e) => { e.preventDefault(); saveMut.mutate(); }}
        className="bg-white rounded-xl border border-gray-200 p-6 space-y-5"
      >
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Image</label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="cursor-pointer rounded-lg border-2 border-dashed border-gray-300 hover:border-brand-400 p-4 flex items-center gap-4"
          >
            {imageUrl ? (
              <img src={imageUrl} alt="" className="h-16 w-28 object-cover rounded-lg" />
            ) : (
              <div className="h-16 w-28 rounded-lg bg-gray-100 flex items-center justify-center"><Upload className="h-5 w-5 text-gray-400" /></div>
            )}
            <span className="text-sm text-gray-500">Click to upload (JPEG/PNG/WEBP, max 2 MB)</span>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => handleFile(e.target.files?.[0])} />
          </div>
        </div>

        <Input label="Title" value={form.title} onChange={(e) => set("title", e.target.value)} required />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={form.body}
            onChange={(e) => set("body", e.target.value)}
          />
        </div>

        <Input label="Link URL" value={form.link_url} onChange={(e) => set("link_url", e.target.value)} placeholder="/jobs" />

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Audience</label>
            <select
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              value={form.audience}
              onChange={(e) => set("audience", e.target.value as BannerAudience)}
            >
              {AUDIENCES.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
          <Input
            label="Display order"
            type="number"
            value={form.display_order}
            onChange={(e) => set("display_order", Number(e.target.value))}
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Starts at (optional)</label>
            <input type="datetime-local" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value={form.starts_at} onChange={(e) => set("starts_at", e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ends at (optional)</label>
            <input type="datetime-local" className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" value={form.ends_at} onChange={(e) => set("ends_at", e.target.value)} />
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={form.is_active} onChange={(e) => set("is_active", e.target.checked)} className="rounded border-gray-300" />
          Active
        </label>

        <div className="flex items-center gap-3 pt-2">
          <Button type="submit" loading={saveMut.isPending || uploadMut.isPending}>{isNew ? "Create banner" : "Save changes"}</Button>
          {imageUrl && !isNew && (
            <button type="button" onClick={() => setImageUrl(null)} className="text-sm text-gray-400 hover:text-red-600 inline-flex items-center gap-1">
              <X className="h-3.5 w-3.5" /> Remove image preview
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
