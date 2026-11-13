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

const PUBLIC_PATHS = ["/", "/login", "/register"];

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
          setUser(res.data.user);
        } else if (!PUBLIC_PATHS.includes(pathname)) {
          router.replace("/login");
        }
      } catch {
        if (!PUBLIC_PATHS.includes(pathname)) {
          router.replace("/login");
        }
      } finally {
        setIsLoading(false);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if (!isLoading && !user && !PUBLIC_PATHS.includes(pathname)) {
      router.replace("/login");
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
    router.replace("/");
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
