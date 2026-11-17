"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import { useRouter, usePathname } from "next/navigation";
import { setAccessToken, apiFetch, apiPost } from "@/lib/api-client";

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
}

interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

const IS_ADMIN_MODE = process.env.NEXT_PUBLIC_APP_MODE === "admin";
const PUBLIC_PATHS = IS_ADMIN_MODE ? ["/login", "/admin"] : ["/", "/login", "/register"];
const HOME_PATH = IS_ADMIN_MODE ? "/admin" : "/";
const LOGIN_PATH = "/login";

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function init() {
      try {
        const res = await apiFetch<{ user: AuthUser }>("/api/auth/me");
        if (res.success) {
          if (IS_ADMIN_MODE && res.data.user.role !== "admin") {
            router.replace(LOGIN_PATH);
            return;
          }
          setUser(res.data.user);
        } else if (!PUBLIC_PATHS.includes(pathname)) {
          router.replace(LOGIN_PATH);
        }
      } catch {
        if (!PUBLIC_PATHS.includes(pathname)) {
          router.replace(LOGIN_PATH);
        }
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!isLoading && !user && !PUBLIC_PATHS.includes(pathname)) {
      router.replace(LOGIN_PATH);
    }
  }, [pathname, user, isLoading, router]);

  const login = useCallback(async (email: string, password: string) => {
    const res = await apiPost<{ user: AuthUser; accessToken: string }>("/api/auth/login", { email, password });
    if (res.success) {
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, error: res.error || "Login failed" };
  }, []);

  const register = useCallback(async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const res = await apiPost<{ user: AuthUser; accessToken: string }>("/api/auth/register", data);
    if (res.success) {
      setAccessToken(res.data.accessToken);
      setUser(res.data.user);
      return { success: true };
    }
    return { success: false, error: res.error || "Registration failed" };
  }, []);

  const logout = useCallback(async () => {
    await apiPost("/api/auth/logout", {});
    setAccessToken(null);
    setUser(null);
    router.replace(IS_ADMIN_MODE ? LOGIN_PATH : "/");
  }, [router]);

  if (isLoading) {
    return (
      <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
        <div className="flex min-h-screen items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      </AuthContext.Provider>
    );
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
