import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2 } from "lucide-react";
import { homepageAdminApi, type HomepageContentUpdate, type HomepageStat, type HomepageFeature } from "@/lib/homepage-api";
import { getApiErrorMessage } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

const EMPTY: HomepageContentUpdate = {
  hero_headline: "",
  hero_subheadline: "",
  hero_primary_cta_text: "",
  hero_primary_cta_url: "",
  hero_secondary_cta_text: "",
  hero_secondary_cta_url: "",
  stats: [],
  features: [],
  cta_headline: "",
  cta_subheadline: "",
  cta_primary_text: "",
  cta_primary_url: "",
  cta_secondary_text: "",
  cta_secondary_url: "",
};

export function HomepagePage() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["admin-homepage"],
    queryFn: () => homepageAdminApi.get().then((r) => r.data),
  });

  const [form, setForm] = useState<HomepageContentUpdate>(EMPTY);

  useEffect(() => {
    if (data) {
      const { updated_at, ...rest } = data;
      setForm(rest);
    }
  }, [data]);

  const saveMut = useMutation({
    mutationFn: () => homepageAdminApi.update(form),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-homepage"] }); toast.success("Homepage saved"); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const set = <K extends keyof HomepageContentUpdate>(key: K, value: HomepageContentUpdate[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const updateStat = (i: number, patch: Partial<HomepageStat>) =>
    set("stats", form.stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  const addStat = () => {
    if (form.stats.length >= 6) return;
    set("stats", [...form.stats, { label: "", value: "" }]);
  };
  const removeStat = (i: number) => set("stats", form.stats.filter((_, idx) => idx !== i));

  const updateFeature = (i: number, patch: Partial<HomepageFeature>) =>
    set("features", form.features.map((f, idx) => (idx === i ? { ...f, ...patch } : f)));
  const addFeature = () => {
    if (form.features.length >= 6) return;
    set("features", [...form.features, { title: "", desc: "" }]);
  };
  const removeFeature = (i: number) => set("features", form.features.filter((_, idx) => idx !== i));

  if (isLoading) {
    return <div className="p-8 max-w-3xl mx-auto animate-pulse space-y-4">{[...Array(6)].map((_, i) => <div key={i} className="h-16 bg-gray-100 rounded-lg" />)}</div>;
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Homepage</h1>
        <p className="text-sm text-gray-500 mt-1">
          Fixed sections — hero, stats, features, closing CTA. Layout is fixed in code; only copy and links are editable here.
        </p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); saveMut.mutate(); }} className="space-y-8">
        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Hero</h2>
          <Input label="Headline" value={form.hero_headline} onChange={(e) => set("hero_headline", e.target.value)} required />
          <Input label="Subheadline" value={form.hero_subheadline ?? ""} onChange={(e) => set("hero_subheadline", e.target.value)} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Primary button text" value={form.hero_primary_cta_text ?? ""} onChange={(e) => set("hero_primary_cta_text", e.target.value)} />
            <Input label="Primary button link" value={form.hero_primary_cta_url ?? ""} onChange={(e) => set("hero_primary_cta_url", e.target.value)} placeholder="/jobs" />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Secondary button text" value={form.hero_secondary_cta_text ?? ""} onChange={(e) => set("hero_secondary_cta_text", e.target.value)} />
            <Input label="Secondary button link" value={form.hero_secondary_cta_url ?? ""} onChange={(e) => set("hero_secondary_cta_url", e.target.value)} placeholder="/register" />
          </div>
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">Stats strip</h2>
            <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={addStat} disabled={form.stats.length >= 6}>
              <Plus className="h-3.5 w-3.5" /> Add stat
            </Button>
          </div>
          {form.stats.map((stat, i) => (
            <div key={i} className="flex items-end gap-3">
              <Input label="Value" className="flex-1" value={stat.value} onChange={(e) => updateStat(i, { value: e.target.value })} placeholder="1,200+" />
              <Input label="Label" className="flex-1" value={stat.label} onChange={(e) => updateStat(i, { label: e.target.value })} placeholder="Live Jobs" />
              <button type="button" onClick={() => removeStat(i)} className="mb-2 text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {form.stats.length === 0 && <p className="text-sm text-gray-400">No stats yet.</p>}
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-gray-900">"Why choose us" features</h2>
            <Button type="button" size="sm" variant="outline" className="gap-1.5" onClick={addFeature} disabled={form.features.length >= 6}>
              <Plus className="h-3.5 w-3.5" /> Add feature
            </Button>
          </div>
          <p className="text-xs text-gray-400 -mt-2">Icons are fixed in code and assigned by position — only title/description are editable.</p>
          {form.features.map((feature, i) => (
            <div key={i} className="flex items-start gap-3 border-t border-gray-100 pt-4 first:border-0 first:pt-0">
              <div className="flex-1 space-y-2">
                <Input label="Title" value={feature.title} onChange={(e) => updateFeature(i, { title: e.target.value })} />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    rows={2}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    value={feature.desc}
                    onChange={(e) => updateFeature(i, { desc: e.target.value })}
                  />
                </div>
              </div>
              <button type="button" onClick={() => removeFeature(i)} className="mt-7 text-gray-400 hover:text-red-600">
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
          {form.features.length === 0 && <p className="text-sm text-gray-400">No features yet.</p>}
        </section>

        <section className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          <h2 className="font-semibold text-gray-900">Closing CTA</h2>
          <Input label="Headline" value={form.cta_headline ?? ""} onChange={(e) => set("cta_headline", e.target.value)} />
          <Input label="Subheadline" value={form.cta_subheadline ?? ""} onChange={(e) => set("cta_subheadline", e.target.value)} />
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Primary button text" value={form.cta_primary_text ?? ""} onChange={(e) => set("cta_primary_text", e.target.value)} />
            <Input label="Primary button link" value={form.cta_primary_url ?? ""} onChange={(e) => set("cta_primary_url", e.target.value)} />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Secondary button text" value={form.cta_secondary_text ?? ""} onChange={(e) => set("cta_secondary_text", e.target.value)} />
            <Input label="Secondary button link" value={form.cta_secondary_url ?? ""} onChange={(e) => set("cta_secondary_url", e.target.value)} />
          </div>
        </section>

        <Button type="submit" loading={saveMut.isPending}>Save homepage</Button>
      </form>
    </div>
  );
}
