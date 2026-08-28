/**
 * Axios client for the recruit-be backend.
 *
 * Deliberately simpler than the main frontend's client: this is a prototype
 * tool used by one SUPERADMIN at a time, so there's no refresh-token
 * rotation — a 401 just clears the session and sends the user back to
 * /login. Good enough for a demo/editing tool; would need the main
 * frontend's refresh-queue pattern if this graduates to production.
 */
import axios, { type InternalAxiosRequestConfig } from "axios";

export const api = axios.create({
  baseURL: "/api/v1",
  headers: { "Content-Type": "application/json" },
});

const TOKEN_KEY = "cms_access_token";

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401 && !error.config?.url?.startsWith("/auth/")) {
      clearToken();
      if (location.pathname !== "/login") {
        location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const detail = err.response?.data?.detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail) && detail[0]?.msg) return detail[0].msg;
  }
  return "Something went wrong. Please try again.";
}
