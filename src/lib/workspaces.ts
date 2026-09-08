/**
 * The console hosts three workspaces behind one login. Each gets its own
 * accent colour and icon so the current context is always obvious.
 */
import type { ComponentType } from "react";
import { Headset, Handshake, PanelsTopLeft, LayoutGrid } from "lucide-react";
import { useLocation } from "react-router-dom";

export type WorkspaceKey = "home" | "crm" | "recruiter" | "cms";

export interface Workspace {
  key: WorkspaceKey;
  label: string;
  short: string;
  tagline: string;
  home: string;
  icon: ComponentType<{ className?: string }>;
  /** Tailwind class fragments — written as literals so the JIT keeps them. */
  text: string;
  bg: string;
  border: string;
  solid: string;
  solidHover: string;
  ring: string;
  dot: string;
  gradient: string;
  navActive: string;
  /** Active nav text colour on the dark sidebar. */
  navDark: string;
}

export const WORKSPACES: Record<Exclude<WorkspaceKey, "home">, Workspace> = {
  crm: {
    key: "crm",
    label: "CRM",
    short: "CRM",
    tagline: "Support desk for recruiters & candidates across the whole platform",
    home: "/crm",
    icon: Headset,
    text: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
    solid: "bg-blue-600",
    solidHover: "hover:bg-blue-700",
    ring: "ring-blue-500",
    dot: "bg-blue-500",
    gradient: "from-blue-600 to-indigo-700",
    navActive: "bg-blue-50 text-blue-700",
    navDark: "text-blue-200",
  },
  recruiter: {
    key: "recruiter",
    label: "Recruiter portal",
    short: "Recruiter",
    tagline: "An agency's own view — relationships, team, allocated jobs, library",
    home: "/recruiter",
    icon: Handshake,
    text: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    solid: "bg-emerald-600",
    solidHover: "hover:bg-emerald-700",
    ring: "ring-emerald-500",
    dot: "bg-emerald-500",
    gradient: "from-emerald-600 to-teal-700",
    navActive: "bg-emerald-50 text-emerald-700",
    navDark: "text-emerald-200",
  },
  cms: {
    key: "cms",
    label: "CMS",
    short: "CMS",
    tagline: "Marketing site content — pages, sectors, homepage, banners, media",
    home: "/pages",
    icon: PanelsTopLeft,
    text: "text-violet-700",
    bg: "bg-violet-50",
    border: "border-violet-200",
    solid: "bg-violet-600",
    solidHover: "hover:bg-violet-700",
    ring: "ring-violet-500",
    dot: "bg-violet-500",
    gradient: "from-violet-600 to-purple-700",
    navActive: "bg-violet-50 text-violet-700",
    navDark: "text-violet-200",
  },
};

export const HOME_WORKSPACE: Workspace = {
  key: "home",
  label: "Console home",
  short: "Home",
  tagline: "One login — CMS, CRM and the Recruiter portal",
  home: "/",
  icon: LayoutGrid,
  text: "text-slate-700",
  bg: "bg-slate-100",
  border: "border-slate-200",
  solid: "bg-slate-800",
  solidHover: "hover:bg-slate-900",
  ring: "ring-slate-500",
  dot: "bg-slate-400",
  gradient: "from-slate-700 to-slate-900",
  navActive: "bg-slate-100 text-slate-800",
  navDark: "text-white",
};

export function workspaceForPath(pathname: string): Workspace {
  if (pathname.startsWith("/crm")) return WORKSPACES.crm;
  if (pathname.startsWith("/recruiter")) return WORKSPACES.recruiter;
  if (["/pages", "/sectors", "/homepage", "/banners", "/media"].some((p) => pathname.startsWith(p)))
    return WORKSPACES.cms;
  return HOME_WORKSPACE;
}

export function useWorkspace(): Workspace {
  const { pathname } = useLocation();
  return workspaceForPath(pathname);
}
