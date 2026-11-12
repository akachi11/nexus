"use client";

import Link from "next/link";
import { Clock, CheckCircle2, XCircle, ArrowLeftRight, Coins, Users, TrendingUp, ChevronRight } from "lucide-react";
import { useMemo } from "react";
import { useWalletStore } from "@/lib/store";
import { formatCurrency } from "@/components/format";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const { transactions, wallets } = useWalletStore();

  const stats = useMemo(() => {
    const pending = transactions.filter((t) => t.status === "pending");
    const completed = transactions.filter((t) => t.status === "completed");
    const failed = transactions.filter((t) => t.status === "failed");
    const totalVolume = completed.reduce((sum, t) => sum + t.value, 0);
    const totalTokens = wallets.reduce((sum, w) => sum + w.tokens.length, 0);
    const customTokens = wallets.reduce((sum, w) => sum + w.tokens.filter((t) => t.isCustom).length, 0);

    return { pending, completed, failed, totalVolume, totalTokens, customTokens, totalWallets: wallets.length };
  }, [transactions, wallets]);

  const recentPending = stats.pending.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-[oklch(0.8_0.15_85/0.08)] p-4">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-[oklch(0.8_0.15_85)]" />
            <span className="text-sm font-medium text-[oklch(0.8_0.15_85)]">Pending</span>
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.pending.length}</p>
          <p className="text-xs text-muted-foreground">Awaiting approval</p>
        </div>

        <div className="rounded-xl bg-[oklch(0.72_0.19_155/0.08)] p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-[oklch(0.72_0.19_155)]" />
            <span className="text-sm font-medium text-[oklch(0.72_0.19_155)]">Approved</span>
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.completed.length}</p>
          <p className="text-xs text-muted-foreground">Completed</p>
        </div>

        <div className="rounded-xl bg-destructive/8 p-4">
          <div className="flex items-center gap-2">
            <XCircle className="h-5 w-5 text-destructive" />
            <span className="text-sm font-medium text-destructive">Rejected</span>
          </div>
          <p className="mt-2 text-3xl font-bold">{stats.failed.length}</p>
          <p className="text-xs text-muted-foreground">Declined</p>
        </div>

        <div className="rounded-xl bg-primary/8 p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="text-sm font-medium text-primary">Volume</span>
          </div>
          <p className="mt-2 text-2xl font-bold">{formatCurrency(stats.totalVolume)}</p>
          <p className="text-xs text-muted-foreground">Total processed</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="flex gap-3">
        <div className="flex-1 rounded-xl bg-card p-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Wallets</span>
          </div>
          <p className="mt-1 text-xl font-bold">{stats.totalWallets}</p>
        </div>
        <div className="flex-1 rounded-xl bg-card p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Tokens</span>
          </div>
          <p className="mt-1 text-xl font-bold">{stats.totalTokens}</p>
        </div>
        <div className="flex-1 rounded-xl bg-card p-4">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">Custom</span>
          </div>
          <p className="mt-1 text-xl font-bold">{stats.customTokens}</p>
        </div>
      </div>

      {/* Pending Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Pending Approvals</h2>
          <Link href="/admin/transactions" className="text-sm text-primary">
            View all <ChevronRight className="inline h-4 w-4" />
          </Link>
        </div>
        {recentPending.length === 0 ? (
          <div className="rounded-xl bg-card p-8 text-center">
            <CheckCircle2 className="mx-auto h-10 w-10 text-muted-foreground/30" />
            <p className="mt-2 text-sm text-muted-foreground">All caught up! No pending transactions.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {recentPending.map((tx) => (
              <Link
                key={tx.id}
                href="/admin/transactions"
                className="flex items-center gap-3 rounded-xl bg-card p-4 transition-colors hover:bg-accent"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[oklch(0.8_0.15_85/0.15)]">
                  <ArrowLeftRight className="h-5 w-5 text-[oklch(0.8_0.15_85)]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium capitalize">{tx.type}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {tx.token} · {tx.tokenSymbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{tx.value > 0 ? formatCurrency(tx.value) : "—"}</p>
                  <span className="rounded-full bg-[oklch(0.8_0.15_85/0.15)] px-2 py-0.5 text-[10px] font-medium text-[oklch(0.8_0.15_85)]">
                    pending
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
