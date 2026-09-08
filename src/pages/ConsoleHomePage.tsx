import { Link } from "react-router-dom";
import { ArrowRight, Bell, Clock } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { useCrmStore } from "@/lib/crm/store";
import { getCmsCounts } from "@/lib/cms/mock";
import { fmtDateTime, fmtRelative, isOverdue } from "@/lib/crm/format";
import { WORKSPACES, type Workspace } from "@/lib/workspaces";
import { GridPattern, BlobArt, SpotArt } from "@/components/ui/Decor";
import { Avatar } from "@/components/ui/Avatar";
import { cn } from "@/lib/utils";

export function ConsoleHomePage() {
  const { user } = useAuth();
  const store = useCrmStore();
  const cms = getCmsCounts();

  const crmAlerts = store.alerts.filter((a) => a.scope === "crm" && !a.done);
  const recAlerts = store.alerts.filter((a) => a.scope === "recruiter" && !a.done);
  const liveJobs = store.jobs.filter((j) => j.status === "LIVE").length;
  const allocated = store.jobs.filter((j) => j.allocatedToRecruiterId).length;

  const upcoming = [...store.alerts]
    .filter((a) => !a.done)
    .sort((a, b) => a.dueAt.localeCompare(b.dueAt))
    .slice(0, 6);

  const today = new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

  const cards: {
    ws: Workspace;
    art: "docs" | "inbox" | "team";
    stats: { label: string; value: number | string }[];
    links: { label: string; to: string }[];
  }[] = [
    {
      ws: WORKSPACES.crm,
      art: "inbox",
      stats: [
        { label: "Open alerts", value: crmAlerts.length },
        { label: "Recruiters", value: store.recruiters.length },
        { label: "Candidates", value: store.candidates.length },
        { label: "Live jobs", value: liveJobs },
      ],
      links: [
        { label: "Relationships", to: "/crm/relationships" },
        { label: "Jobs", to: "/crm/jobs" },
        { label: "Team", to: "/crm/team" },
      ],
    },
    {
      ws: WORKSPACES.recruiter,
      art: "team",
      stats: [
        { label: "My alerts", value: recAlerts.length },
        { label: "Allocated jobs", value: allocated },
        { label: "Organisations", value: store.organisations.length },
        { label: "Decision makers", value: store.decisionMakers.length },
      ],
      links: [
        { label: "Relationships", to: "/recruiter/relationships" },
        { label: "Team", to: "/recruiter/team" },
        { label: "Library", to: "/recruiter/library" },
      ],
    },
    {
      ws: WORKSPACES.cms,
      art: "docs",
      stats: [
        { label: "Pages", value: cms.pages },
        { label: "Sectors", value: cms.sectors },
        { label: "Banners", value: cms.banners },
        { label: "Media", value: cms.images },
      ],
      links: [
        { label: "Pages", to: "/pages" },
        { label: "Homepage", to: "/homepage" },
        { label: "Media library", to: "/media" },
      ],
    },
  ];

  return (
    <div className="mx-auto max-w-6xl p-8">
      {/* Greeting hero */}
      <div className="relative mb-8 overflow-hidden rounded-2xl bg-gradient-to-br from-slate-800 to-slate-950 p-7 text-white">
        <GridPattern className="text-white/15" />
        <BlobArt className="-right-8 -top-12 h-64 w-64 text-white" />
        <div className="relative">
          <p className="text-sm text-white/60">{today}</p>
          <h1 className="mt-1 text-3xl font-bold">
            Welcome back, {user?.first_name || "there"}
          </h1>
          <p className="mt-2 max-w-xl text-sm text-white/75">
            One login for all three internal tools. Pick a workspace below — each has its own colour so you always know
            where you are.
          </p>
          <span className="mt-4 inline-flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1 text-xs text-white/80">
            Prototype · sample data, resets on refresh · no backend
          </span>
        </div>
      </div>

      {/* Workspace cards */}
      <div className="grid gap-5 lg:grid-cols-3">
        {cards.map(({ ws, art, stats, links }) => {
          return (
            <div
              key={ws.key}
              className={cn(
                "flex flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-shadow hover:shadow-md",
                ws.border
              )}
            >
              <div className={cn("relative overflow-hidden bg-gradient-to-br p-5 text-white", ws.gradient)}>
                <BlobArt className="-right-4 -top-8 h-40 w-40 text-white" />
                <div className="relative flex items-start justify-between">
                  <div>
                    <ws.icon className="h-7 w-7" />
                    <h2 className="mt-2 text-lg font-bold">{ws.label}</h2>
                  </div>
                  <SpotArt name={art} className="h-16 w-20 text-white/70" />
                </div>
                <p className="relative mt-1 text-xs text-white/80">{ws.tagline}</p>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <div className="grid grid-cols-2 gap-2">
                  {stats.map((s) => (
                    <div key={s.label} className={cn("rounded-lg px-3 py-2", ws.bg)}>
                      <div className={cn("text-lg font-bold leading-none", ws.text)}>{s.value}</div>
                      <div className="mt-1 text-[11px] text-gray-500">{s.label}</div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 flex flex-wrap gap-1.5">
                  {links.map((l) => (
                    <Link
                      key={l.to}
                      to={l.to}
                      className="rounded-md border border-gray-200 px-2 py-1 text-xs text-gray-600 hover:border-gray-300 hover:bg-gray-50"
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>

                <Link
                  to={ws.home}
                  className={cn(
                    "mt-4 inline-flex items-center justify-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition-colors",
                    ws.solid,
                    ws.solidHover
                  )}
                >
                  Open {ws.short}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {/* Across your day */}
      <div className="mt-8 grid gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-gray-200 bg-white">
            <div className="flex items-center gap-2 border-b border-gray-100 px-5 py-3">
              <Bell className="h-4 w-4 text-gray-400" />
              <h3 className="text-sm font-semibold text-gray-900">Across your day — next alerts</h3>
            </div>
            <ul className="divide-y divide-gray-100">
              {upcoming.length === 0 && (
                <li className="px-5 py-10 text-center text-sm text-gray-400">Nothing scheduled.</li>
              )}
              {upcoming.map((a) => {
                const ws = a.scope === "crm" ? WORKSPACES.crm : WORKSPACES.recruiter;
                return (
                  <li key={a.id} className="flex items-center gap-3 px-5 py-3">
                    <Avatar name={a.targetName} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-gray-900">{a.targetName}</span>
                        <span
                          className={cn("rounded px-1.5 py-0.5 text-[10px] font-medium", ws.bg, ws.text)}
                        >
                          {ws.short}
                        </span>
                      </div>
                      <p className="truncate text-xs text-gray-500">{a.reason}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <div
                        className={cn(
                          "text-xs font-medium",
                          isOverdue(a.dueAt) ? "text-red-600" : "text-gray-500"
                        )}
                      >
                        {fmtRelative(a.dueAt)}
                      </div>
                      <div className="text-[11px] text-gray-400">{fmtDateTime(a.dueAt)}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-gray-400" />
            <h3 className="text-sm font-semibold text-gray-900">One login, three tools</h3>
          </div>
          <p className="mt-2 text-sm text-gray-500">
            Switch workspace any time from the sidebar. The header colour and the tag next to each item tell you which
            tool you're in.
          </p>
          <div className="mt-4 space-y-2">
            {Object.values(WORKSPACES).map((ws) => (
              <div key={ws.key} className="flex items-center gap-2 text-sm">
                <span className={cn("h-2.5 w-2.5 rounded-full", ws.dot)} />
                <span className="text-gray-700">{ws.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
