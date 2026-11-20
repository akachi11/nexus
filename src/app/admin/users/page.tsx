"use client";

import Link from "next/link";
import { Search, ChevronRight, Shield, User as UserIcon, Loader2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/components/auth-provider";
import { apiFetch } from "@/lib/api-client";
import { cn } from "@/lib/utils";

interface UserRow {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

export default function AdminUsersPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!user || user.role !== "admin") return;
    apiFetch<UserRow[]>("/api/admin/users").then((res) => {
      if (res.success) setUsers(res.data);
      setLoading(false);
    });
  }, [user]);

  const filtered = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.email.toLowerCase().includes(q) ||
        u.firstName.toLowerCase().includes(q) ||
        u.lastName.toLowerCase().includes(q)
    );
  }, [users, search]);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Users ({users.length})</h2>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or email..."
          className="w-full rounded-xl bg-card py-2.5 pl-10 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((u) => (
          <Link
            key={u.id}
            href={`/admin/users/${u.id}`}
            className="flex items-center gap-3 rounded-xl bg-card p-4 transition-colors hover:bg-accent"
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full",
                u.role === "admin"
                  ? "bg-primary/15 text-primary"
                  : "bg-secondary text-muted-foreground"
              )}
            >
              {u.role === "admin" ? (
                <Shield className="h-5 w-5" />
              ) : (
                <UserIcon className="h-5 w-5" />
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <p className="font-medium">
                  {u.firstName} {u.lastName}
                </p>
                {!u.isActive && (
                  <span className="rounded-full bg-destructive/15 px-1.5 py-0.5 text-[10px] font-medium text-destructive">
                    Disabled
                  </span>
                )}
              </div>
              <p className="truncate text-sm text-muted-foreground">{u.email}</p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
          </Link>
        ))}
        {filtered.length === 0 && (
          <div className="rounded-xl bg-card p-8 text-center">
            <UserIcon className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">
              {search ? "No users match your search" : "No users found"}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
