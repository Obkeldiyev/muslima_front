import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { api, getToken, setToken } from "./api";

interface AuthUser {
  id: string;
  email: string;
  role: string;
}

interface AuthCtx {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const Ctx = createContext<AuthCtx | null>(null);

const USER_KEY = "muslima_admin_user";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const t = getToken();
    setTokenState(t);
    const raw = typeof window !== "undefined" ? window.localStorage.getItem(USER_KEY) : null;
    if (raw) {
      try {
        setUser(JSON.parse(raw));
      } catch {
        /* ignore */
      }
    }
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.auth.login(email, password);
    setToken(res.token);
    setTokenState(res.token);
    setUser(res.user);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(USER_KEY, JSON.stringify(res.user));
    }
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setTokenState(null);
    setUser(null);
    if (typeof window !== "undefined") window.localStorage.removeItem(USER_KEY);
  }, []);

  return (
    <Ctx.Provider value={{ token, user, isAuthenticated: !!token, login, logout }}>
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
