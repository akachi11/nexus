"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, ArrowLeftRight, Coins, ArrowLeft, Users, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";

const IS_ADMIN_MODE = process.env.NEXT_PUBLIC_APP_MODE === "admin";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/transactions", label: "Transactions", icon: ArrowLeftRight },
  { href: "/admin/tokens", label: "Tokens", icon: Coins },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <div className={cn("flex min-h-screen flex-col", IS_ADMIN_MODE && "mx-auto max-w-4xl")}>
      {/* Admin Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <div className="flex items-center gap-3 px-4 py-3">
          {!IS_ADMIN_MODE && (
            <Link href="/" className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          )}
          <div className="flex-1">
            <h1 className="text-lg font-bold">Admin Panel</h1>
            <p className="text-xs text-muted-foreground">Numirelics Management</p>
          </div>
          {IS_ADMIN_MODE ? (
            <button
              onClick={() => logout()}
              className="flex h-8 items-center gap-1.5 rounded-full bg-destructive/10 px-3 transition-colors hover:bg-destructive/20"
            >
              <LogOut className="h-3.5 w-3.5 text-destructive" />
              <span className="text-xs font-medium text-destructive">Logout</span>
            </button>
          ) : (
            <div className="flex h-8 items-center rounded-full bg-primary/10 px-3">
              <span className="text-xs font-medium text-primary">Admin</span>
            </div>
          )}
        </div>

        {/* Nav Tabs */}
        <div className="flex gap-1 px-4 pb-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            );
          })}
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 pb-8">
        {children}
      </main>
    </div>
  );
}
