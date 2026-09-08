import { Link } from "react-router-dom";
import { Briefcase, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Badge } from "@/components/ui/Badge";
import { AlertsBox } from "@/components/crm/AlertsBox";
import { SpotArt } from "@/components/ui/Decor";
import { useCrmStore, orgName } from "@/lib/crm/store";
import { fmtDate } from "@/lib/crm/format";

export function RecruiterDashboardPage() {
  const store = useCrmStore();
  const allocated = store.jobs
    .filter((j) => j.allocatedToRecruiterId)
    .sort((a, b) => (b.allocatedAt ?? "").localeCompare(a.allocatedAt ?? ""));
  const myAlerts = store.alerts.filter((a) => a.scope === "recruiter" && !a.done).length;

  return (
    <div className="mx-auto max-w-5xl p-8">
      <PageHeader
        title="My dashboard"
        subtitle="Recruiter team member view — your alerts and the jobs allocated to you."
        chips={[
          { label: "alerts due", value: myAlerts },
          { label: "allocated jobs", value: allocated.length },
        ]}
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <AlertsBox scope="recruiter" title="Alerts — set by you" />

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="flex items-center justify-between border-b border-gray-100 px-4 py-3">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Briefcase className="h-4 w-4 text-emerald-600" /> Allocated jobs
            </h2>
            <Badge>{allocated.length}</Badge>
          </div>
          <ul className="divide-y divide-gray-100">
            {allocated.length === 0 && (
              <li className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-gray-400">
                <SpotArt name="docs" className="h-16 w-20 text-gray-300" />
                No jobs allocated to you yet
              </li>
            )}
            {allocated.map((j) => (
              <li key={j.id} className="px-4 py-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-900">{j.title}</span>
                  <Badge variant={j.status === "LIVE" ? "success" : "default"}>{j.status}</Badge>
                </div>
                <p className="text-sm text-gray-600">{orgName(store, j.organisationId)}</p>
                <p className="text-xs text-gray-400">
                  Allocated by {j.allocatedBy} · {fmtDate(j.allocatedAt)} · {j.applicants} applicants
                </p>
              </li>
            ))}
          </ul>
          <Link
            to="/recruiter/relationships"
            className="flex items-center justify-center gap-1 border-t border-gray-100 px-4 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
          >
            Open relationships <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
