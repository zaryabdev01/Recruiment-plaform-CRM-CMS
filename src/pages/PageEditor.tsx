import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowLeft } from "lucide-react";
import { cmsAdminApi, type CmsPage } from "@/lib/cms-api";
import { getApiErrorMessage } from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { RichTextEditor } from "@/components/cms/RichTextEditor";
import toast from "react-hot-toast";

interface Props {
  page: CmsPage | null;
  onDone: () => void;
}

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export function PageEditor({ page, onDone }: Props) {
  const qc = useQueryClient();
  const isNew = page === null;

  const [slug, setSlug] = useState(page?.slug ?? "");
  const [title, setTitle] = useState(page?.title ?? "");
  const [body, setBody] = useState(page?.body ?? "");
  const [metaTitle, setMetaTitle] = useState(page?.meta_title ?? "");
  const [metaDescription, setMetaDescription] = useState(page?.meta_description ?? "");
  const [publishedAt, setPublishedAt] = useState(page?.published_at ? page.published_at.slice(0, 16) : "");
  const [slugError, setSlugError] = useState<string | null>(null);

  const saveMut = useMutation({
    mutationFn: () => {
      const data = {
        title,
        body,
        meta_title: metaTitle || undefined,
        meta_description: metaDescription || undefined,
        published_at: publishedAt ? new Date(publishedAt).toISOString() : null,
      };
      return isNew
        ? cmsAdminApi.createPage({ ...data, slug })
        : cmsAdminApi.updatePage(page.id, data);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin-pages"] });
      toast.success(isNew ? "Page created" : "Page saved");
      onDone();
    },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isNew && !SLUG_RE.test(slug)) {
      setSlugError("Lowercase letters, numbers and hyphens only");
      return;
    }
    setSlugError(null);
    saveMut.mutate();
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <button onClick={onDone} className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-700 mb-6">
        <ArrowLeft className="h-4 w-4" /> Back to pages
      </button>
      <h1 className="text-2xl font-bold text-gray-900 mb-1">{isNew ? "New page" : "Edit page"}</h1>
      {!isNew && <p className="text-sm text-gray-400 font-mono mb-6">/{page!.slug}</p>}

      <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-5 mt-6">
        {isNew && (
          <Input
            label="Slug"
            placeholder="e.g. privacy-policy (lowercase, hyphens)"
            hint="Used in the URL: /pages/your-slug"
            error={slugError ?? undefined}
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
          />
        )}

        <Input label="Title" placeholder="Page title" value={title} onChange={(e) => setTitle(e.target.value)} required />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Body</label>
          <RichTextEditor value={body} onChange={setBody} />
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Meta title" placeholder="SEO title" value={metaTitle} onChange={(e) => setMetaTitle(e.target.value)} />
          <Input label="Meta description" placeholder="SEO description" value={metaDescription} onChange={(e) => setMetaDescription(e.target.value)} />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Publish at</label>
          <input
            type="datetime-local"
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            value={publishedAt}
            onChange={(e) => setPublishedAt(e.target.value)}
          />
          <p className="text-xs text-gray-400 mt-1">Leave empty to save as draft.</p>
        </div>

        <div className="pt-2">
          <Button type="submit" loading={saveMut.isPending}>{isNew ? "Create page" : "Save changes"}</Button>
        </div>
      </form>
    </div>
  );
}
