import { NavLink, Outlet, useLocation } from "react-router-dom";
import {
  FileText,
  Tag,
  Home as HomeIcon,
  Megaphone,
  Image as ImageIcon,
  LogOut,
  LayoutDashboard,
  Users2,
  Briefcase,
  UsersRound,
  Building2,
  Library,
  LayoutGrid,
} from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";
import { WORKSPACES, workspaceForPath, type Workspace } from "@/lib/workspaces";
import { Avatar } from "@/components/ui/Avatar";

type NavItem = { to: string; label: string; icon: typeof FileText; end?: boolean };

const NAV: { ws: Workspace; items: NavItem[] }[] = [
  {
    ws: WORKSPACES.crm,
    items: [
      { to: "/crm", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/crm/relationships", label: "Relationships", icon: Users2 },
      { to: "/crm/jobs", label: "Jobs", icon: Briefcase },
      { to: "/crm/team", label: "Team", icon: UsersRound },
    ],
  },
  {
    ws: WORKSPACES.recruiter,
    items: [
      { to: "/recruiter", label: "Dashboard", icon: LayoutDashboard, end: true },
      { to: "/recruiter/relationships", label: "Relationships", icon: Building2 },
      { to: "/recruiter/team", label: "Team", icon: UsersRound },
      { to: "/recruiter/library", label: "Library", icon: Library },
    ],
  },
  {
    ws: WORKSPACES.cms,
    items: [
      { to: "/pages", label: "Pages", icon: FileText },
      { to: "/sectors", label: "Sectors", icon: Tag },
      { to: "/homepage", label: "Homepage", icon: HomeIcon },
      { to: "/banners", label: "Banners", icon: Megaphone },
      { to: "/media", label: "Media library", icon: ImageIcon },
    ],
  },
];

const navItemBase =
  "relative flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors";

function ActiveBar({ color }: { color: string }) {
  return <span className={cn("absolute left-0 top-1.5 bottom-1.5 w-1 rounded-full", color)} />;
}

export function AppLayout() {
  const { user, logout, demo } = useAuth();
  const { pathname } = useLocation();
  const active = workspaceForPath(pathname);
  const name = user ? `${user.first_name} ${user.last_name}` : "User";

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      <aside className="relative flex h-full w-64 shrink-0 flex-col overflow-hidden border-r border-slate-800 bg-slate-900 text-slate-300">
        {/* rich ambient glow */}
        <div className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-1/3 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/40 to-transparent" />

        <div className="relative flex items-center gap-2.5 border-b border-white/10 px-5 py-4">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white ring-1 ring-white/15">
            <LayoutGrid className="h-5 w-5" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-white">Recruitment Platform</div>
            <div className="text-[11px] text-slate-500">
              Internal Console
              {demo && <span className="ml-1 rounded bg-amber-400/20 px-1 text-amber-300">demo</span>}
            </div>
          </div>
        </div>

        <nav className="relative flex-1 space-y-6 overflow-y-auto overscroll-contain px-3 py-4">
          <NavLink
            to="/"
            end
            className={({ isActive }) => cn(navItemBase, isActive ? "bg-white/10" : "hover:bg-white/5")}
          >
            {({ isActive }) => (
              <>
                {isActive && <ActiveBar color="bg-slate-300" />}
                <LayoutGrid className={cn("h-4 w-4", isActive ? "text-white" : "text-slate-500")} />
                <span className={isActive ? "text-white" : "text-slate-400"}>Console home</span>
              </>
            )}
          </NavLink>

          {NAV.map(({ ws, items }) => {
            const locked = ws.needsBackend && demo;
            return (
              <div key={ws.key}>
                <div className="flex items-center gap-1.5 px-3 pb-1.5">
                  <span className={cn("h-2 w-2 rounded-full ring-2 ring-white/10", ws.dot)} />
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">{ws.label}</span>
                  {locked && <span className="text-[10px] font-normal normal-case text-slate-600">· needs login</span>}
                </div>
                <div className="space-y-0.5">
                  {items.map(({ to, label, icon: Icon, end }) => (
                    <NavLink
                      key={to}
                      to={to}
                      end={end}
                      className={({ isActive }) =>
                        cn(navItemBase, locked && "opacity-40", isActive ? "bg-white/10" : "hover:bg-white/5")
                      }
                    >
                      {({ isActive }) => (
                        <>
                          {isActive && <ActiveBar color={ws.dot} />}
                          <Icon className={cn("h-4 w-4", isActive ? ws.navDark : "text-slate-500")} />
                          <span className={isActive ? ws.navDark : "text-slate-400"}>{label}</span>
                        </>
                      )}
                    </NavLink>
                  ))}
                </div>
              </div>
            );
          })}
        </nav>

        <div className="relative border-t border-white/10 px-3 py-3">
          <div className="flex items-center gap-2.5 px-2 py-1.5">
            <Avatar name={name} size="sm" className="ring-2 ring-white/10" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-xs font-medium text-slate-200">{name}</div>
              <div className="truncate text-[11px] text-slate-500">{user?.email}</div>
            </div>
          </div>
          <button
            onClick={logout}
            className="mt-1 flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-slate-400 transition-colors hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-4 w-4" /> {demo ? "Exit demo" : "Log out"}
          </button>
        </div>
      </aside>

      <div className="flex h-full min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-gray-200 bg-white/80 px-6 backdrop-blur">
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold",
                active.bg,
                active.text
              )}
            >
              <active.icon className="h-3.5 w-3.5" />
              {active.label}
            </span>
            <span className="hidden text-xs text-gray-400 sm:inline">{active.tagline}</span>
          </div>
          <Avatar name={name} size="xs" />
        </header>
        <main className="flex-1 overflow-y-auto overscroll-contain">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
