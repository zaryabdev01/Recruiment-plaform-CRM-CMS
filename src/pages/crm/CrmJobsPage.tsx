import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { Pagination } from "@/components/ui/Pagination";
import { useCrmStore, orgName, recruiterName } from "@/lib/crm/store";
import { fmtDate } from "@/lib/crm/format";
import type { JobStatus } from "@/lib/crm/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 20;
const STATUS_STYLE: Record<JobStatus, string> = {
  LIVE: "bg-green-100 text-green-700",
  DRAFT: "bg-gray-100 text-gray-600",
  CLOSED: "bg-red-100 text-red-700",
  FILLED: "bg-brand-100 text-brand-700",
};

export function CrmJobsPage() {
  const store = useCrmStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | JobStatus>("ALL");
  const [sector, setSector] = useState("ALL");
  const [page, setPage] = useState(1);

  const sectors = useMemo(() => Array.from(new Set(store.jobs.map((j) => j.sector))).sort(), [store.jobs]);

  const rows = useMemo(() => {
    return store.jobs
      .filter((j) => `${j.title} ${orgName(store, j.organisationId)} ${recruiterName(store, j.recruiterId)}`.toLowerCase().includes(q.trim().toLowerCase()))
      .filter((j) => status === "ALL" || j.status === status)
      .filter((j) => sector === "ALL" || j.sector === sector)
      .sort((a, b) => b.postedAt.localeCompare(a.postedAt));
  }, [store, q, status, sector]);

  const total = rows.length;
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage = () => setPage(1);

  return (
    <div className="mx-auto max-w-6xl p-8">
      <PageHeader
        title="Jobs"
        subtitle="Every job across the platform — read-only oversight for the support desk."
        chips={[
          { label: "total", value: store.jobs.length },
          { label: "live", value: store.jobs.filter((j) => j.status === "LIVE").length },
        ]}
      />

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              resetPage();
            }}
            placeholder="Search by title, organisation, recruiter…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "ALL" | JobStatus);
            resetPage();
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          {["ALL", "LIVE", "DRAFT", "CLOSED", "FILLED"].map((s) => (
            <option key={s} value={s}>
              {s === "ALL" ? "All statuses" : s}
            </option>
          ))}
        </select>
        <select
          value={sector}
          onChange={(e) => {
            setSector(e.target.value);
            resetPage();
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="ALL">All sectors</option>
          {sectors.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Title</th>
                <th className="px-4 py-3 font-medium">Organisation</th>
                <th className="px-4 py-3 font-medium">Sector</th>
                <th className="px-4 py-3 font-medium">Recruiter</th>
                <th className="px-4 py-3 font-medium">Posted</th>
                <th className="px-4 py-3 font-medium">Applicants</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.map((j) => (
                <tr key={j.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{j.title}</td>
                  <td className="px-4 py-3 text-gray-600">{orgName(store, j.organisationId)}</td>
                  <td className="px-4 py-3 text-gray-600">{j.sector}</td>
                  <td className="px-4 py-3 text-gray-600">{recruiterName(store, j.recruiterId)}</td>
                  <td className="px-4 py-3 text-gray-600">{fmtDate(j.postedAt)}</td>
                  <td className="px-4 py-3 text-gray-600">{j.applicants}</td>
                  <td className="px-4 py-3">
                    <span className={cn("inline-flex rounded-full px-2 py-0.5 text-xs font-medium", STATUS_STYLE[j.status])}>
                      {j.status}
                    </span>
                    {j.allocatedToRecruiterId && (
                      <Badge className="ml-1">Allocated</Badge>
                    )}
                  </td>
                </tr>
              ))}
              {total === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-gray-400">
                    No matches
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination page={page} pageSize={PAGE_SIZE} total={total} onPage={setPage} />
      </div>
    </div>
  );
}
