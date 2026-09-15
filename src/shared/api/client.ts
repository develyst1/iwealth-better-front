import { API_BASE } from "@/shared/config/env";
import { ApiError, type ApiErrorBody } from "@/shared/lib/types";
import { clearToken, getToken } from "@/shared/lib/auth-token";

export function apiBase(): string {
  return API_BASE;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
};

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & ApiErrorBody;
  if (!res.ok) {
    if (res.status === 401 && typeof window !== "undefined") {
      clearToken();
    }
    throw new ApiError(
      data.error || `HTTP ${res.status}`,
      res.status,
      data.code,
    );
  }
  return data;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<T> {
  const { method = "GET", body, auth = true, headers = {} } = options;
  const h: Record<string, string> = { ...headers };
  if (body !== undefined) {
    h["Content-Type"] = "application/json";
  }
  if (auth) {
    const token = getToken();
    if (token) h.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path.startsWith("/") ? path : `/${path}`}`, {
    method,
    headers: h,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  return parseJson<T>(res);
}
