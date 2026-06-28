import axios, { AxiosError, type AxiosInstance } from "axios";
import { toast } from "sonner";

const baseURL =
  (typeof import.meta !== "undefined" && import.meta.env?.VITE_API_BASE_URL) ||
  "https://corehex-rent-production.up.railway.app/api";

export const api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
  timeout: 20000,
  headers: { "Content-Type": "application/json" },
});

// Best-effort bearer fallback (some browsers block 3rd-party cookies). We store
// the token if backend ever returns one; cookie is still primary.
const TOKEN_KEY = "corehex.auth.token";

export function setAuthToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }
  return config;
});

let unauthorizedHandler: (() => void) | null = null;
export function onUnauthorized(fn: () => void) {
  unauthorizedHandler = fn;
}

api.interceptors.response.use(
  (res) => res,
  (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status;
    const message =
      error.response?.data?.message ||
      error.message ||
      "Network error. Please try again.";

    if (status === 401) {
      unauthorizedHandler?.();
    } else if (status && status >= 500) {
      // surface server errors once
      try {
        toast.error(`Server error: ${message}`);
      } catch {
        /* noop */
      }
    }

    return Promise.reject(new ApiError(message, status, error));
  },
);

export class ApiError extends Error {
  status?: number;
  cause?: unknown;
  constructor(message: string, status?: number, cause?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.cause = cause;
  }
}

export function unwrap<T>(payload: unknown): T {
  if (payload && typeof payload === "object" && "data" in (payload as Record<string, unknown>)) {
    return (payload as { data: T }).data;
  }
  return payload as T;
}