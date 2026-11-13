"use client";

import { CheckCircle2, XCircle, Clock, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Plus, TrendingDown, Send, Loader2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useWalletStore } from "@/lib/store";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { formatCurrency, formatDate, formatTokenAmount } from "@/components/format";
import { cn } from "@/lib/utils";

type StatusFilter = "all" | "pending" | "completed" | "failed";

const statusFilters: { id: StatusFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "completed", label: "Approved" },
  { id: "failed", label: "Rejected" },
];

export default function AdminTransactionsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { transactions, approveTransaction, rejectTransaction, fetchAdminTransactions } = useWalletStore();
  const [filter, setFilter] = useState<StatusFilter>("pending");
  const [now, setNow] = useState<Date | undefined>(undefined);
  const [actionedId, setActionedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== "admin") {
      router.replace("/");
      return;
    }
    setNow(new Date());
    fetchAdminTransactions().then(() => setLoading(false));
  }, [user]);

  const handleFilterChange = (f: StatusFilter) => {
    setFilter(f);
    setLoading(true);
    const status = f === "all" ? undefined : f;
    fetchAdminTransactions(status).then(() => setLoading(false));
  };

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((tx) => tx.status === filter);
  }, [transactions, filter]);

  const handleApprove = async (txId: string) => {
    try {
      await approveTransaction(txId);
      setActionedId(txId);
      setTimeout(() => setActionedId(null), 2000);
      fetchAdminTransactions(filter === "all" ? undefined : filter);
    } catch { /* error is thrown by store */ }
  };

  const handleReject = async (txId: string) => {
    try {
      await rejectTransaction(txId);
      setActionedId(txId);
      setTimeout(() => setActionedId(null), 2000);
      fetchAdminTransactions(filter === "all" ? undefined : filter);
    } catch { /* error is thrown by store */ }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <div>
        <h2 className="text-lg font-semibold">Transaction Management</h2>
        <p className="text-sm text-muted-foreground">Review and manage all transaction requests</p>
      </div>

      {/* Status Filters */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {statusFilters.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => handleFilterChange(id)}
            className={cn(
              "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              filter === id
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-card p-12 text-center">
          <p className="text-muted-foreground">
            {filter === "pending" ? "No pending transactions" : "No transactions found"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((tx) => {
            const justActioned = actionedId === tx.id;

            return (
              <div
                key={tx.id}
                className={cn(
                  "rounded-xl bg-card p-4 transition-all",
                  justActioned && "ring-2 ring-[oklch(0.72_0.19_155)]"
                )}
              >
                {/* Transaction Header */}
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      tx.type === "receive" && "bg-[oklch(0.72_0.19_155/0.15)] text-[oklch(0.72_0.19_155)]",
                      tx.type === "send" && "bg-destructive/15 text-destructive",
                      tx.type === "sell" && "bg-destructive/15 text-destructive",
                      tx.type === "swap" && "bg-primary/15 text-primary",
                      tx.type === "create" && "bg-[oklch(0.8_0.15_85/0.15)] text-[oklch(0.8_0.15_85)]",
                    )}
                  >
                    {tx.type === "receive" && <ArrowDownLeft className="h-5 w-5" />}
                    {tx.type === "send" && <Send className="h-5 w-5" />}
                    {tx.type === "sell" && <TrendingDown className="h-5 w-5" />}
                    {tx.type === "swap" && <ArrowLeftRight className="h-5 w-5" />}
                    {tx.type === "create" && <Plus className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold capitalize">{tx.type}</p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          tx.status === "completed" && "bg-[oklch(0.72_0.19_155/0.15)] text-[oklch(0.72_0.19_155)]",
                          tx.status === "pending" && "bg-[oklch(0.8_0.15_85/0.15)] text-[oklch(0.8_0.15_85)]",
                          tx.status === "failed" && "bg-destructive/15 text-destructive"
                        )}
                      >
                        {tx.status === "completed" ? "approved" : tx.status}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {now ? formatDate(tx.date, now) : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">
                      {formatTokenAmount(tx.amount)} {tx.tokenSymbol}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.value > 0 ? formatCurrency(tx.value) : "—"}
                    </p>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="mt-3 rounded-lg bg-secondary/50 p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Token:</span>
                      <span className="ml-1 font-medium">{tx.token}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">ID:</span>
                      <span className="ml-1 font-mono">{tx.id.slice(0, 10)}</span>
                    </div>
                    {tx.address && tx.address !== "Contract" && tx.address !== "DEX" && tx.address !== "Purchase" && tx.address !== "Sale" && (
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Address:</span>
                        <span className="ml-1 font-mono">{tx.address}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {tx.status === "pending" && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleApprove(tx.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[oklch(0.72_0.19_155)] py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                    >
                      <CheckCircle2 className="h-4 w-4" />
                      Approve
                    </button>
                    <button
                      onClick={() => handleReject(tx.id)}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-destructive py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                    >
                      <XCircle className="h-4 w-4" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
