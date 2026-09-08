import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ContactHoverCard } from "@/components/ui/HoverCard";
import { Pagination } from "@/components/ui/Pagination";
import { CommsCell, AlertCell, ServiceStatusBadge } from "@/components/crm/Cells";
import { useCrmStore, type Target } from "@/lib/crm/store";
import type { ServiceStatus } from "@/lib/crm/types";

const PAGE_SIZE = 20;

export function CandidatesListPage() {
  const store = useCrmStore();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"ALL" | ServiceStatus>("ALL");
  const [page, setPage] = useState(1);

  const rows = useMemo(
    () =>
      store.candidates
        .filter((c) => `${c.firstName} ${c.lastName} ${c.jobTitle} ${c.contact.email}`.toLowerCase().includes(q.trim().toLowerCase()))
        .filter((c) => status === "ALL" || c.serviceStatus === status),
    [store.candidates, q, status]
  );
  const total = rows.length;
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
  const resetPage = () => setPage(1);

  return (
    <div className="mx-auto max-w-6xl p-8">
      <Link to="/recruiter/relationships" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Relationships
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Candidates</h1>
      <p className="mb-4 mt-1 text-sm text-gray-500">All candidates on your account.</p>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative min-w-[220px] flex-1">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              resetPage();
            }}
            placeholder="Search candidates…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as "ALL" | ServiceStatus);
            resetPage();
          }}
          className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
        >
          <option value="ALL">All statuses</option>
          <option value="ACCESSED">Accessed services</option>
          <option value="NOT_ACCESSED">Not accessed services</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Job title</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Contact details</th>
                <th className="px-4 py-3 font-medium">Comms</th>
                <th className="px-4 py-3 font-medium">Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.map((c) => {
                const target: Target = { kind: "candidate", id: c.id, name: `${c.firstName} ${c.lastName}` };
                return (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5 font-medium text-gray-900">
                        <Avatar name={`${c.firstName} ${c.lastName}`} size="sm" />
                        {c.firstName} {c.lastName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{c.jobTitle}</td>
                    <td className="px-4 py-3">
                      <ServiceStatusBadge status={c.serviceStatus} />
                    </td>
                    <td className="px-4 py-3">
                      <ContactHoverCard contact={c.contact} />
                    </td>
                    <td className="px-4 py-3">
                      <CommsCell target={target} />
                    </td>
                    <td className="px-4 py-3">
                      <AlertCell target={target} scope="recruiter" />
                    </td>
                  </tr>
                );
              })}
              {total === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-gray-400">
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
