import { apiFetch } from "@/shared/api/client";
import type { User } from "@/shared/lib/types";

export type AuthResponse = { user: User; token: string };

export function register(email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function login(email: string, password: string) {
  return apiFetch<AuthResponse>("/auth/login", {
    method: "POST",
    body: { email, password },
    auth: false,
  });
}

export function logout() {
  return apiFetch<{ ok: true }>("/auth/logout", { method: "POST" });
}

export function me() {
  return apiFetch<{ user: User }>("/auth/me");
}
