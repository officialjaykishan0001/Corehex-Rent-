import { api, setAuthToken, ApiError } from "./api";
import type { AdminUser, UserRole } from "@/types/admin";

interface BackendUser {
  _id: string;
  name: string;
  email: string;
  role?: string;
  token?: string;
}

function toAdminUser(u: BackendUser): AdminUser {
  const initials = u.name
    .split(/\s+/)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("")
    .slice(0, 2) || u.email.slice(0, 2).toUpperCase();
  const role: UserRole = u.role === "admin" ? "admin" : "user";
  return {
    id: u._id,
    name: u.name,
    email: u.email,
    role,
    avatarInitials: initials,
  };
}

export const authService = {
  async login(email: string, password: string): Promise<AdminUser> {
    const { data } = await api.post<BackendUser & { success: boolean; token?: string }>(
      "/user/login",
      { email, password },
    );
    if (data.token) setAuthToken(data.token);
    return toAdminUser(data);
  },
  async register(
    name: string,
    email: string,
    password: string,
    role: UserRole = "user",
    phone?: string,
  ): Promise<AdminUser> {
    const { data } = await api.post<BackendUser>("/user/register", {
      name,
      email,
      password,
      role,
      ...(phone ? { phone } : {}),
    });
    return toAdminUser(data);
  },
  async logout(): Promise<void> {
    try {
      await api.get("/user/logout");
    } catch {
      /* ignore */
    } finally {
      setAuthToken(null);
    }
  },
  async me(): Promise<AdminUser | null> {
    try {
      const { data } = await api.get<{ success: boolean; user: BackendUser }>("/user/me");
      return toAdminUser(data.user);
    } catch (err) {
      if (err instanceof ApiError && err.status === 401) return null;
      throw err;
    }
  },
};