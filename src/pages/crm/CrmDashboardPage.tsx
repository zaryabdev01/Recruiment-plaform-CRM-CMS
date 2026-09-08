import { Link } from "react-router-dom";
import { Users, Briefcase, Building2, ShieldCheck, ArrowRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { AlertsBox } from "@/components/crm/AlertsBox";
import { SpotArt } from "@/components/ui/Decor";
import { Avatar } from "@/components/ui/Avatar";
import { useCrmStore } from "@/lib/crm/store";
import { fmtDateTime } from "@/lib/crm/format";
import { cn } from "@/lib/utils";

export function CrmDashboardPage() {
  const store = useCrmStore();
  const liveJobs = store.jobs.filter((j) => j.status === "LIVE").length;
  const openAlerts = store.alerts.filter((a) => a.scope === "crm" && !a.done).length;

  const recentComms = [...store.comms]
    .filter((c) => c.targetKind === "recruiter" || c.targetKind === "candidate")
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 6);

  const stats = [
    { label: "Recruiters", value: store.recruiters.length, icon: ShieldCheck, to: "/crm/relationships", tint: "bg-blue-50 text-blue-700" },
    { label: "Candidates", value: store.candidates.length, icon: Users, to: "/crm/relationships", tint: "bg-indigo-50 text-indigo-700" },
    { label: "Organisations", value: store.organisations.length, icon: Building2, to: "/crm/jobs", tint: "bg-cyan-50 text-cyan-700" },
    { label: "Live jobs", value: liveJobs, icon: Briefcase, to: "/crm/jobs", tint: "bg-teal-50 text-teal-700" },
  ];

  return (
    <div className="mx-auto max-w-5xl p-8">
      <PageHeader
        title="CRM dashboard"
        subtitle="The agency support desk — for helping recruiters and candidates use the platform."
        chips={[
          { label: "open alerts", value: openAlerts },
          { label: "recruiters", value: store.recruiters.length },
          { label: "candidates", value: store.candidates.length },
        ]}
      />

      <div className="mb-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((s) => (
          <Link
            key={s.label}
            to={s.to}
            className="group rounded-xl border border-gray-200 bg-white p-4 transition-shadow hover:shadow-md"
          >
            <span className={cn("inline-flex h-9 w-9 items-center justify-center rounded-lg", s.tint)}>
              <s.icon className="h-4 w-4" />
            </span>
            <div className="mt-2 text-2xl font-bold text-gray-900">{s.value}</div>
            <div className="text-sm text-gray-500">{s.label}</div>
          </Link>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AlertsBox scope="crm" title="Alerts — set by CRM on any end user" />
        </div>

        <div className="rounded-xl border border-gray-200 bg-white">
          <div className="border-b border-gray-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-gray-900">Recent communication</h2>
          </div>
          <ul className="divide-y divide-gray-100">
            {recentComms.length === 0 && (
              <li className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-gray-400">
                <SpotArt name="inbox" className="h-16 w-20 text-gray-300" />
                Nothing logged yet
              </li>
            )}
            {recentComms.map((c) => (
              <li key={c.id} className="flex items-start gap-2.5 px-4 py-3">
                <Avatar name={c.targetName} size="xs" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium text-gray-800">{c.targetName}</div>
                  <p className="truncate text-xs text-gray-500">
                    {c.channel} · {c.subject}
                  </p>
                  <p className="text-[11px] text-gray-400">{fmtDateTime(c.at)}</p>
                </div>
              </li>
            ))}
          </ul>
          <Link
            to="/crm/relationships"
            className="flex items-center justify-center gap-1 border-t border-gray-100 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-50"
          >
            Open relationships <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
