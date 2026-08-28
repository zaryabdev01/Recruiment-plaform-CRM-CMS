import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { cmsAdminApi, type CmsPage } from "@/lib/cms-api";
import { getApiErrorMessage } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { PageEditor } from "./PageEditor";
import toast from "react-hot-toast";

export function PagesListPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<CmsPage | "new" | null>(null);

  const { data: pages = [], isLoading } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: () => cmsAdminApi.listPages({ page_size: 200 }).then((r) => r.data),
  });

  const deleteMut = useMutation({
    mutationFn: (id: string) => cmsAdminApi.deletePage(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-pages"] }); toast.success("Page deleted"); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  if (editing) {
    return <PageEditor page={editing === "new" ? null : editing} onDone={() => setEditing(null)} />;
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pages</h1>
          <p className="text-sm text-gray-500 mt-1">Flat content pages — About, Contact, Legal, and any other slug-addressed page.</p>
        </div>
        <Button size="sm" className="gap-2" onClick={() => setEditing("new")}>
          <Plus className="h-4 w-4" /> New page
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(4)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Title</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {pages.map((page) => (
                <tr key={page.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-mono text-xs text-gray-600">/{page.slug}</td>
                  <td className="px-4 py-3 font-medium text-gray-900">{page.title}</td>
                  <td className="px-4 py-3">
                    {page.published_at && new Date(page.published_at) <= new Date() ? (
                      <Badge variant="success">Published</Badge>
                    ) : (
                      <Badge>Draft</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button onClick={() => setEditing(page)} className="text-gray-400 hover:text-brand-600">
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => { if (confirm("Delete this page?")) deleteMut.mutate(page.id); }}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {pages.length === 0 && (
                <tr><td colSpan={4} className="px-4 py-12 text-center text-gray-400">No pages yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
