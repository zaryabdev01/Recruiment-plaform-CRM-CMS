import { NavLink, Outlet } from "react-router-dom";
import { FileText, Tag, Home, Megaphone, Image as ImageIcon, LogOut } from "lucide-react";
import { useAuth } from "@/lib/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/pages", label: "Pages", icon: FileText },
  { to: "/sectors", label: "Sectors", icon: Tag },
  { to: "/homepage", label: "Homepage", icon: Home },
  { to: "/banners", label: "Banners", icon: Megaphone },
  { to: "/media", label: "Media library", icon: ImageIcon },
];

export function AppLayout() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen bg-gray-50">
      <aside className="w-60 shrink-0 border-r border-gray-200 bg-white flex flex-col">
        <div className="px-5 py-5 border-b border-gray-100">
          <div className="font-bold text-gray-900">Recruitment Platform</div>
          <div className="text-xs text-gray-400 mt-0.5">CMS prototype</div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive ? "bg-brand-50 text-brand-700" : "text-gray-600 hover:bg-gray-100"
                )
              }
            >
              <Icon className="h-4 w-4" />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-3 py-4 border-t border-gray-100">
          <div className="px-3 mb-2 text-xs text-gray-400 truncate">{user?.email}</div>
          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            <LogOut className="h-4 w-4" /> Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
