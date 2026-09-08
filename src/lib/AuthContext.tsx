import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CurrentUserResponse } from "./auth-api";

/**
 * Prototype auth — fully client-side, no backend. One credential unlocks the
 * whole console (CMS + CRM + Recruiter portal). See PROTOTYPE_CREDENTIALS.
 */
export const PROTOTYPE_CREDENTIALS = {
  email: "admin@recruitmentplatform.com",
  password: "demo1234",
};

const SESSION_KEY = "console_session";

const DEMO_USER: CurrentUserResponse = {
  id: "demo",
  email: PROTOTYPE_CREDENTIALS.email,
  first_name: "Demo",
  last_name: "Admin",
  system_role: "SUPERADMIN",
};

interface AuthContextValue {
  user: CurrentUserResponse | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(SESSION_KEY) === "1") setUser(DEMO_USER);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    await new Promise((r) => setTimeout(r, 250)); // feel like a real request
    const ok =
      email.trim().toLowerCase() === PROTOTYPE_CREDENTIALS.email &&
      password === PROTOTYPE_CREDENTIALS.password;
    if (!ok) throw new Error("Incorrect email or password.");
    try {
      localStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* ignore */
    }
    setUser(DEMO_USER);
  };

  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY);
    } catch {
      /* ignore */
    }
    setUser(null);
    window.location.href = "/login";
  };

  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
