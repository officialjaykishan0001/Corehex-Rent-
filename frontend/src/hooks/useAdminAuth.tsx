import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { AdminUser } from "@/types/admin";
import { authService } from "@/services/auth.service";
import { onUnauthorized } from "@/services/api";

interface AdminAuthContextValue {
  user: AdminUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string, remember?: boolean) => Promise<AdminUser>;
  register: (
    name: string,
    email: string,
    password: string,
    opts?: { phone?: string; role?: string },
  ) => Promise<AdminUser>;
  logout: () => Promise<void>;
  refresh: () => Promise<void>;
  hasRole: (role: AdminUser["role"]) => boolean;
}

const AdminAuthContext = createContext<AdminAuthContextValue | undefined>(undefined);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);
  const initialized = useRef(false);

  const refresh = useCallback(async () => {
    try {
      const me = await authService.me();
      setUser(me);
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    (async () => {
      await refresh();
      setLoading(false);
    })();
    onUnauthorized(() => setUser(null));
  }, [refresh]);

  const login = useCallback(async (email: string, password: string) => {
    const u = await authService.login(email, password);
    setUser(u);
    return u;
  }, []);

  const register = useCallback(async (
    name: string,
    email: string,
    password: string,
    opts?: { phone?: string; role?: string },
  ) => {
    const role = opts?.role ?? "user";
    const u = await authService.register(name, email, password, role, opts?.phone);
    // auto-login after register so session is established
    try {
      const logged = await authService.login(email, password);
      setUser(logged);
      return logged;
    } catch {
      setUser(u);
      return u;
    }
  }, []);

  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const value = useMemo<AdminAuthContextValue>(
    () => ({
      user,
      isAuthenticated: !!user,
      loading,
      login,
      register,
      logout,
      refresh,
      hasRole: (role) => user?.role === role,
    }),
    [user, loading, login, register, logout, refresh],
  );

  return <AdminAuthContext.Provider value={value}>{children}</AdminAuthContext.Provider>;
}

export function useAdminAuth() {
  const ctx = useContext(AdminAuthContext);
  if (!ctx) throw new Error("useAdminAuth must be used inside AdminAuthProvider");
  return ctx;
}

export const DEMO_ADMIN_CREDENTIALS = {
  email: "admin@corehex.com",
  password: "Admin@123",
};
