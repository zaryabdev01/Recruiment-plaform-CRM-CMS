import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { ContactHoverCard } from "@/components/ui/HoverCard";
import { Pagination } from "@/components/ui/Pagination";
import { CommsCell, AlertCell } from "@/components/crm/Cells";
import { useCrmStore, jobsPostedForOrg, type Target } from "@/lib/crm/store";

const PAGE_SIZE = 20;

export function DecisionMakersListPage() {
  const store = useCrmStore();
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const orgById = useMemo(() => new Map(store.organisations.map((o) => [o.id, o])), [store.organisations]);

  const rows = useMemo(
    () =>
      store.decisionMakers.filter((d) => {
        const org = orgById.get(d.organisationId);
        return `${d.firstName} ${d.lastName} ${d.jobTitle} ${org?.name ?? ""} ${org?.sector ?? ""}`
          .toLowerCase()
          .includes(q.trim().toLowerCase());
      }),
    [store.decisionMakers, orgById, q]
  );
  const total = rows.length;
  const paged = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-6xl p-8">
      <Link to="/recruiter/relationships" className="mb-3 inline-flex items-center gap-1 text-sm text-gray-500 hover:text-brand-700">
        <ArrowLeft className="h-4 w-4" /> Relationships
      </Link>
      <h1 className="text-2xl font-bold text-gray-900">Decision makers</h1>
      <p className="mb-4 mt-1 text-sm text-gray-500">Named contacts across your organisations. Add more from an organisation's page.</p>

      <div className="mb-3 max-w-md">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="Search decision makers…"
            className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-gray-200 bg-gray-50 text-left text-gray-600">
              <tr>
                <th className="px-4 py-3 font-medium">Organisation</th>
                <th className="px-4 py-3 font-medium">Sector</th>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Job title</th>
                <th className="px-4 py-3 font-medium">Jobs posted</th>
                <th className="px-4 py-3 font-medium">Contact details</th>
                <th className="px-4 py-3 font-medium">Comms</th>
                <th className="px-4 py-3 font-medium">Alert</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paged.map((d) => {
                const org = orgById.get(d.organisationId);
                const target: Target = { kind: "decision_maker", id: d.id, name: `${d.firstName} ${d.lastName}` };
                return (
                  <tr key={d.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      {org ? (
                        <Link to={`/recruiter/relationships/organisations/${org.id}`} className="text-gray-700 hover:text-brand-700">
                          {org.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-600">{org?.sector ?? "—"}</td>
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-2.5 font-medium text-gray-900">
                        <Avatar name={`${d.firstName} ${d.lastName}`} size="sm" />
                        {d.firstName} {d.lastName}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{d.jobTitle}</td>
                    <td className="px-4 py-3 text-gray-600">{org ? jobsPostedForOrg(store, org.id) : 0}</td>
                    <td className="px-4 py-3">
                      <ContactHoverCard contact={d.contact} />
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
                  <td colSpan={8} className="px-4 py-12 text-center text-gray-400">
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
