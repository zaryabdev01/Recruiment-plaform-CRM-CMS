import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Tabs } from "@/components/ui/Tabs";
import { Avatar } from "@/components/ui/Avatar";
import { ContactHoverCard } from "@/components/ui/HoverCard";
import { Pagination } from "@/components/ui/Pagination";
import { CommsCell, AlertCell, ServiceStatusBadge } from "@/components/crm/Cells";
import { RecordDrawer } from "@/components/crm/RecordDrawer";
import { useCrmStore, recruiterName, type Target } from "@/lib/crm/store";
import { fmtDate } from "@/lib/crm/format";
import type { ServiceStatus } from "@/lib/crm/types";

type Tab = "recruiters" | "candidates";
type StatusFilter = "ALL" | ServiceStatus;
const PAGE_SIZE = 20;
const ACTOR = "CRM · Dana";

export function CrmRelationshipsPage() {
  const store = useCrmStore();
  const [tab, setTab] = useState<Tab>("recruiters");
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const [drawer, setDrawer] = useState<{ target: Target; meta: { label: string; value: ReactNode }[] } | null>(null);

  const ql = q.trim().toLowerCase();

  const recruiterRows = useMemo(() => {
    return store.recruiters
      .filter((r) => `${r.firstName} ${r.lastName} ${r.contact.email} ${r.agencyName}`.toLowerCase().includes(ql))
      .filter((r) => statusFilter === "ALL" || r.serviceStatus === statusFilter);
  }, [store.recruiters, ql, statusFilter]);

  const candidateRows = useMemo(() => {
    return store.candidates
      .filter((c) => `${c.firstName} ${c.lastName} ${c.contact.email} ${c.jobTitle}`.toLowerCase().includes(ql))
      .filter((c) => statusFilter === "ALL" || c.serviceStatus === statusFilter);
  }, [store.candidates, ql, statusFilter]);

  const total = tab === "recruiters" ? recruiterRows.length : candidateRows.length;
  const start = (page - 1) * PAGE_SIZE;
  const pagedRecruiters = recruiterRows.slice(start, start + PAGE_SIZE);
  const pagedCandidates = candidateRows.slice(start, start + PAGE_SIZE);

  const resetPage = () => setPage(1);

  return (
    <div className="mx-auto max-w-6xl p-8">
      <PageHeader
        title="Relationships"
        subtitle="Every recruiter and candidate on the platform — the people CRM supports."
      />

      <div className="mb-4">
        <Tabs
          tabs={[
            { value: "recruiters", label: "Recruiters", count: store.recruiters.length },
            { value: "candidates", label: "Candidates", count: store.candidates.length },
          ]}
          value={tab}
          onChange={(t) => {
            setTab(t);
            resetPage();
          }}
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              resetPage();
            }}
            placeholder="Search by name, email, job title…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value as StatusFilter);
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
              {tab === "recruiters" ? (
                <tr>
                  <th className="px-4 py-3 font-medium">Recruiter</th>
                  <th className="px-4 py-3 font-medium">Agency</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Jobs posted</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Comms</th>
                  <th className="px-4 py-3 font-medium">Alert</th>
                </tr>
              ) : (
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Job title</th>
                  <th className="px-4 py-3 font-medium">Recruiter</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Contact</th>
                  <th className="px-4 py-3 font-medium">Comms</th>
                  <th className="px-4 py-3 font-medium">Alert</th>
                </tr>
              )}
            </thead>
            <tbody className="divide-y divide-gray-100">
              {tab === "recruiters"
                ? pagedRecruiters.map((r) => {
                    const target: Target = { kind: "recruiter", id: r.id, name: `${r.firstName} ${r.lastName}` };
                    return (
                      <tr key={r.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <button
                            className="flex items-center gap-2.5 font-medium text-gray-900 hover:text-brand-700"
                            onClick={() =>
                              setDrawer({
                                target,
                                meta: [
                                  { label: "Agency", value: r.agencyName },
                                  { label: "Email", value: r.contact.email },
                                  { label: "Mobile", value: r.contact.mobile },
                                  { label: "Landline", value: r.contact.landline },
                                  { label: "Jobs", value: r.jobsPosted },
                                  { label: "Status", value: <ServiceStatusBadge status={r.serviceStatus} /> },
                                  { label: "Joined", value: fmtDate(r.joinedAt) },
                                ],
                              })
                            }
                          >
                            <Avatar name={`${r.firstName} ${r.lastName}`} size="sm" />
                            {r.firstName} {r.lastName}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{r.agencyName}</td>
                        <td className="px-4 py-3">
                          <ServiceStatusBadge status={r.serviceStatus} />
                        </td>
                        <td className="px-4 py-3 text-gray-600">{r.jobsPosted}</td>
                        <td className="px-4 py-3">
                          <ContactHoverCard contact={r.contact} />
                        </td>
                        <td className="px-4 py-3">
                          <CommsCell target={target} actorName={ACTOR} />
                        </td>
                        <td className="px-4 py-3">
                          <AlertCell target={target} scope="crm" actorName={ACTOR} />
                        </td>
                      </tr>
                    );
                  })
                : pagedCandidates.map((c) => {
                    const target: Target = { kind: "candidate", id: c.id, name: `${c.firstName} ${c.lastName}` };
                    return (
                      <tr key={c.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <button
                            className="flex items-center gap-2.5 font-medium text-gray-900 hover:text-brand-700"
                            onClick={() =>
                              setDrawer({
                                target,
                                meta: [
                                  { label: "Job title", value: c.jobTitle },
                                  { label: "Location", value: c.location },
                                  { label: "Recruiter", value: recruiterName(store, c.recruiterId) },
                                  { label: "Email", value: c.contact.email },
                                  { label: "Mobile", value: c.contact.mobile },
                                  { label: "Landline", value: c.contact.landline },
                                  { label: "Status", value: <ServiceStatusBadge status={c.serviceStatus} /> },
                                ],
                              })
                            }
                          >
                            <Avatar name={`${c.firstName} ${c.lastName}`} size="sm" />
                            {c.firstName} {c.lastName}
                          </button>
                        </td>
                        <td className="px-4 py-3 text-gray-600">{c.jobTitle}</td>
                        <td className="px-4 py-3 text-gray-600">{recruiterName(store, c.recruiterId)}</td>
                        <td className="px-4 py-3">
                          <ServiceStatusBadge status={c.serviceStatus} />
                        </td>
                        <td className="px-4 py-3">
                          <ContactHoverCard contact={c.contact} />
                        </td>
                        <td className="px-4 py-3">
                          <CommsCell target={target} actorName={ACTOR} />
                        </td>
                        <td className="px-4 py-3">
                          <AlertCell target={target} scope="crm" actorName={ACTOR} />
                        </td>
                      </tr>
                    );
                  })}
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

      <RecordDrawer
        open={drawer !== null}
        onClose={() => setDrawer(null)}
        target={drawer?.target ?? null}
        scope="crm"
        actorName={ACTOR}
        meta={drawer?.meta ?? []}
      />
    </div>
  );
}
