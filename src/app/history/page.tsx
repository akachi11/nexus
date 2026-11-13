"use client";

import { ArrowDownLeft, ArrowLeftRight, Send, Plus, Filter, TrendingDown } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useWalletStore } from "@/lib/store";
import { formatCurrency, formatDate, formatTokenAmount } from "@/components/format";
import { cn } from "@/lib/utils";
import { usePageTransition } from "@/hooks/use-gsap";

type TxFilter = "all" | "send" | "receive" | "swap" | "create" | "sell";

const filters: { id: TxFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "send", label: "Sent" },
  { id: "receive", label: "Received" },
  { id: "swap", label: "Swaps" },
  { id: "sell", label: "Sold" },
  { id: "create", label: "Created" },
];

export default function HistoryPage() {
  const animScope = usePageTransition();
  const { transactions, wallets, isLoaded, fetchWallets, fetchTransactions } = useWalletStore();
  const [filter, setFilter] = useState<TxFilter>("all");
  const [now, setNow] = useState<Date | undefined>(undefined);
  useEffect(() => {
    setNow(new Date());
    if (!isLoaded) { fetchWallets(); fetchTransactions(); }
  }, []);

  const filtered = useMemo(() => {
    if (filter === "all") return transactions;
    return transactions.filter((tx) => tx.type === filter);
  }, [transactions, filter]);

  const grouped = useMemo(() => {
    const groups: Record<string, typeof transactions> = {};
    for (const tx of filtered) {
      const d = new Date(tx.date);
      const key = d.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });
      (groups[key] ??= []).push(tx);
    }
    return groups;
  }, [filtered]);

  return (
    <div ref={animScope} className="flex flex-col gap-4 px-4 pt-6">
      <div data-anim="header" className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Activity</h1>
        <button className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <Filter className="h-5 w-5" />
        </button>
      </div>

      {/* Filters */}
      <div data-anim="section" className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
        {filters.map(({ id, label }) => (
          <button
            key={id}
            onClick={() => setFilter(id)}
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

      {/* Transaction Groups */}
      {Object.entries(grouped).map(([date, txs]) => (
        <div key={date}>
          <p className="mb-2 text-xs font-medium text-muted-foreground">{date}</p>
          <div className="flex flex-col gap-2">
            {txs.map((tx) => {
              const wallet = wallets.find((w) => w.id === tx.walletId);
              return (
                <div key={tx.id} data-anim="list-item" className="flex items-center gap-3 rounded-xl bg-card p-4">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full",
                      tx.type === "receive" && "bg-[oklch(0.72_0.19_155/0.15)] text-[oklch(0.72_0.19_155)]",
                      tx.type === "send" && "bg-destructive/15 text-destructive",
                      tx.type === "sell" && "bg-destructive/15 text-destructive",
                      tx.type === "swap" && "bg-primary/15 text-primary",
                      tx.type === "create" && "bg-[oklch(0.8_0.15_85/0.15)] text-[oklch(0.8_0.15_85)]"
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
                      <p className="font-medium capitalize">{tx.type}</p>
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] font-medium",
                          tx.status === "completed" && "bg-[oklch(0.72_0.19_155/0.15)] text-[oklch(0.72_0.19_155)]",
                          tx.status === "pending" && "bg-[oklch(0.8_0.15_85/0.15)] text-[oklch(0.8_0.15_85)]",
                          tx.status === "failed" && "bg-destructive/15 text-destructive"
                        )}
                      >
                        {tx.status}
                      </span>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {tx.token} · {wallet?.name} · {now ? formatDate(tx.date, now) : ""}
                    </p>
                  </div>
                  <div className="text-right">
                    <p
                      className={cn(
                        "font-medium",
                        tx.type === "receive" ? "text-[oklch(0.72_0.19_155)]" : ""
                      )}
                    >
                      {tx.type === "receive" ? "+" : (tx.type === "send" || tx.type === "sell") ? "-" : ""}
                      {formatTokenAmount(tx.amount)} {tx.tokenSymbol}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {tx.value > 0 ? formatCurrency(tx.value) : "—"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}

      {filtered.length === 0 && (
        <div className="py-16 text-center text-muted-foreground">
          <p>No transactions found</p>
        </div>
      )}
    </div>
  );
}
