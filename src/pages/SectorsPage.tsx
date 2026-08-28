import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { cmsAdminApi, type SectorAdmin } from "@/lib/cms-api";
import { getApiErrorMessage } from "@/lib/api";
import toast from "react-hot-toast";

export function SectorsPage() {
  const qc = useQueryClient();

  const { data: sectors = [], isLoading } = useQuery({
    queryKey: ["admin-sectors"],
    queryFn: () => cmsAdminApi.listSectors().then((r) => r.data),
  });

  const { data: pages = [] } = useQuery({
    queryKey: ["admin-pages"],
    queryFn: () => cmsAdminApi.listPages({ page_size: 200 }).then((r) => r.data),
  });

  const linkMut = useMutation({
    mutationFn: async ({ sector, pageId }: { sector: SectorAdmin; pageId: string | null }) => {
      if (sector.sector_page_id) {
        await cmsAdminApi.unlinkSectorPage(sector.sector_page_id);
      }
      if (pageId) {
        await cmsAdminApi.linkSectorPage({ category_id: sector.id, page_id: pageId });
      }
    },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["admin-sectors"] }); toast.success("Landing page updated"); },
    onError: (e) => toast.error(getApiErrorMessage(e)),
  });

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sectors</h1>
        <p className="text-sm text-gray-500 mt-1">
          Link each job sector to a landing page (create the page first under Pages, then attach it here).
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-12 bg-gray-100 rounded-lg animate-pulse" />)}</div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-gray-600">Landing page</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sectors.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{s.slug}</td>
                  <td className="px-4 py-3">
                    <select
                      className="rounded-md border border-gray-300 px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500 max-w-[220px]"
                      value={s.page_id ?? ""}
                      disabled={linkMut.isPending}
                      onChange={(e) => linkMut.mutate({ sector: s, pageId: e.target.value || null })}
                    >
                      <option value="">— none —</option>
                      {pages.map((p) => (
                        <option key={p.id} value={p.id}>{p.title}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
              {sectors.length === 0 && (
                <tr><td colSpan={3} className="px-4 py-12 text-center text-gray-400">No sectors yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
