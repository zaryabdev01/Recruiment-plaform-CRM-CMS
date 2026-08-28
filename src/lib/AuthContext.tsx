import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authApi, type CurrentUserResponse } from "./auth-api";
import { clearToken, getToken } from "./api";

interface AuthContextValue {
  user: CurrentUserResponse | null;
  loading: boolean;
  setUser: (u: CurrentUserResponse | null) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CurrentUserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  const logout = () => {
    clearToken();
    setUser(null);
    window.location.href = "/login";
  };

  return (
    <AuthContext.Provider value={{ user, loading, setUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
