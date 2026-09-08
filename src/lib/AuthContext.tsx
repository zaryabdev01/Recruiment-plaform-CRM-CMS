import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, type CurrentUserResponse } from "./auth-api";
import { clearToken, getToken } from "./api";

interface AuthContextValue {
  user: CurrentUserResponse | null;
  loading: boolean;
  /** True when signed in via the no-backend "demo mode" button. */
  demo: boolean;
  setUser: (u: CurrentUserResponse | null) => void;
  enterDemoMode: () => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEMO_KEY = "console_demo_mode";
const DEMO_USER: CurrentUserResponse = {
  id: "demo",
  email: "demo@recruit.dev",
  first_name: "Demo",
  last_name: "Reviewer",
  system_role: "SUPERADMIN",
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [demo, setDemo] = useState(false);

  useEffect(() => {
    if (localStorage.getItem(DEMO_KEY) === "1") {
      setDemo(true);
      setUser(DEMO_USER);
      setLoading(false);
      return;
    }
    if (!getToken()) {
      setLoading(false);
      return;
    }
    authApi
      .me()
      .then((r) => setUser(r.data))
      .catch(() => clearToken())
      .finally(() => setLoading(false));
  }, []);

  const enterDemoMode = () => {
    localStorage.setItem(DEMO_KEY, "1");
    setDemo(true);
    setUser(DEMO_USER);
  };

  const logout = () => {
    clearToken();
    localStorage.removeItem(DEMO_KEY);
    setDemo(false);
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, demo, setUser, enterDemoMode, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
