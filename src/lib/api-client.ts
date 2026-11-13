"use client";

let accessToken: string | null = null;
let refreshPromise: Promise<string | null> | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
}

export function getAccessToken(): string | null {
  return accessToken;
}

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch("/api/auth/refresh", { method: "POST", credentials: "include" });
    if (!res.ok) {
      accessToken = null;
      return null;
    }
    const data = await res.json();
    accessToken = data.data.accessToken;
    return accessToken;
  } catch {
    accessToken = null;
    return null;
  }
}

async function getValidToken(): Promise<string | null> {
  if (accessToken) return accessToken;
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}

export async function apiFetch<T = unknown>(
  url: string,
  options: RequestInit = {}
): Promise<{ success: boolean; data: T; error?: string }> {
  let token = await getValidToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) headers["Authorization"] = `Bearer ${token}`;

  let res = await fetch(url, { ...options, headers, credentials: "include" });

  if (res.status === 401 && token) {
    refreshPromise = null;
    accessToken = null;
    token = await refreshAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
      res = await fetch(url, { ...options, headers, credentials: "include" });
    }
  }

  const json = await res.json();
  return json;
}

export async function apiPost<T = unknown>(url: string, body: unknown): Promise<{ success: boolean; data: T; error?: string }> {
  return apiFetch<T>(url, { method: "POST", body: JSON.stringify(body) });
}

export async function apiPatch<T = unknown>(url: string, body: unknown): Promise<{ success: boolean; data: T; error?: string }> {
  return apiFetch<T>(url, { method: "PATCH", body: JSON.stringify(body) });
}
