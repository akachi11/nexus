"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, ArrowLeftRight, TrendingDown, Plus, ChevronRight } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { useWalletStore } from "@/lib/store";
import { useLivePrices } from "@/hooks/use-market-data";
import { formatCurrency, formatPercent, formatTokenAmount, formatDate } from "@/components/format";
import { cn } from "@/lib/utils";
import { CryptoIcon } from "@/components/crypto-icons";
import { usePageTransition } from "@/hooks/use-gsap";
import type { Token } from "@/lib/types";

function enrichToken(token: Token, priceMap: Record<string, { price: number; change24h: number }>): Token {
  const live = priceMap[token.symbol.toUpperCase()];
  if (!live) return token;
  const price = live.price;
  return { ...token, price, change24h: live.change24h, value: token.balance * price };
}

export default function TokenDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const animScope = usePageTransition();
  const { wallets, activeWalletId, transactions, isLoaded, fetchWallets, fetchTransactions } = useWalletStore();
  const priceMap = useLivePrices();
  const [now, setNow] = useState<Date | undefined>(undefined);
  useEffect(() => {
    setNow(new Date());
    if (!isLoaded) { fetchWallets(); fetchTransactions(); }
  }, []);

  const wallet = wallets.find((w) => w.id === activeWalletId) ?? wallets[0];
  const rawToken = (wallet?.tokens ?? []).find((t) => t.id === id)
    ?? wallets.flatMap((w) => w.tokens).find((t) => t.id === id);

  const token = rawToken ? enrichToken(rawToken, priceMap) : null;

  const tokenTransactions = useMemo(
    () => transactions.filter(
      (tx) => tx.tokenSymbol === token?.symbol || tx.token.includes(token?.symbol ?? "___")
    ).slice(0, 10),
    [transactions, token?.symbol],
  );

  if (!token) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 pt-20">
        <p className="text-muted-foreground">Token not found</p>
        <button onClick={() => router.back()} className="text-primary">Go back</button>
      </div>
    );
  }

  return (
    <div ref={animScope} className="flex flex-col gap-6 px-4 pt-6 pb-24">
      {/* Header */}
      <div data-anim="header" className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">{token.name}</h1>
      </div>

      {/* Token Overview */}
      <div data-anim="balance" className="flex flex-col items-center gap-3 py-4">
        <CryptoIcon symbol={token.symbol} size={64} fallbackColor={token.color} fallbackIcon={token.icon} />
        <div className="text-center">
          <p className="text-3xl font-bold">{formatCurrency(token.value)}</p>
          <p className="mt-1 text-lg text-muted-foreground">
            {formatTokenAmount(token.balance)} {token.symbol}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">
            {formatCurrency(token.price)} per {token.symbol}
          </span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              token.change24h >= 0
                ? "bg-[oklch(0.72_0.19_155/0.15)] text-[oklch(0.72_0.19_155)]"
                : "bg-destructive/15 text-destructive"
            )}
          >
            {formatPercent(token.change24h)}
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div data-anim="section" className="grid grid-cols-5 gap-2">
        {[
          { icon: ArrowUpRight, label: "Send", href: `/send?token=${id}` },
          { icon: ArrowDownLeft, label: "Receive", href: "/receive" },
          { icon: ArrowLeftRight, label: "Swap", href: `/swap?from=${id}` },
          { icon: Plus, label: "Buy", href: `/buy?token=${id}` },
          { icon: TrendingDown, label: "Sell", href: `/sell?token=${id}` },
        ].map(({ icon: Icon, label, href }) => (
          <Link
            key={label}
            href={href}
            className="flex flex-col items-center gap-1.5 rounded-xl bg-card py-3 transition-colors hover:bg-accent active:scale-[0.97]"
          >
            <div className={cn(
              "flex h-10 w-10 items-center justify-center rounded-full",
              label === "Sell" ? "bg-destructive/15 text-destructive" : "bg-primary/15 text-primary"
            )}>
              <Icon className="h-5 w-5" />
            </div>
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </div>

      {/* Token Info */}
      <div data-anim="card" className="rounded-xl bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Token Info</h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price</span>
            <span className="font-medium">{formatCurrency(token.price)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">24h Change</span>
            <span className={cn("font-medium", token.change24h >= 0 ? "text-[oklch(0.72_0.19_155)]" : "text-destructive")}>
              {formatPercent(token.change24h)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Balance</span>
            <span className="font-medium">{formatTokenAmount(token.balance)} {token.symbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Value</span>
            <span className="font-medium">{formatCurrency(token.value)}</span>
          </div>
          {token.isCustom && token.description && (
            <div className="border-t border-border pt-2 mt-2">
              <p className="text-xs text-muted-foreground">{token.description}</p>
            </div>
          )}
        </div>
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-muted-foreground">Recent Activity</h3>
          <Link href="/history" className="text-xs text-primary">
            View all <ChevronRight className="inline h-3 w-3" />
          </Link>
        </div>
        {tokenTransactions.length === 0 ? (
          <div className="rounded-xl bg-card p-8 text-center">
            <p className="text-sm text-muted-foreground">No transactions yet</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {tokenTransactions.map((tx) => (
              <div key={tx.id} data-anim="list-item" className="flex items-center gap-3 rounded-xl bg-card p-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full",
                    tx.type === "receive" && "bg-[oklch(0.72_0.19_155/0.15)] text-[oklch(0.72_0.19_155)]",
                    tx.type === "send" && "bg-destructive/15 text-destructive",
                    tx.type === "sell" && "bg-destructive/15 text-destructive",
                    tx.type === "swap" && "bg-primary/15 text-primary",
                    tx.type === "create" && "bg-[oklch(0.8_0.15_85/0.15)] text-[oklch(0.8_0.15_85)]",
                  )}
                >
                  {tx.type === "receive" && <ArrowDownLeft className="h-4 w-4" />}
                  {tx.type === "send" && <ArrowUpRight className="h-4 w-4" />}
                  {tx.type === "sell" && <TrendingDown className="h-4 w-4" />}
                  {tx.type === "swap" && <ArrowLeftRight className="h-4 w-4" />}
                  {tx.type === "create" && <Plus className="h-4 w-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium capitalize">{tx.type}</p>
                    <span
                      className={cn(
                        "rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                        tx.status === "completed" && "bg-[oklch(0.72_0.19_155/0.15)] text-[oklch(0.72_0.19_155)]",
                        tx.status === "pending" && "bg-[oklch(0.8_0.15_85/0.15)] text-[oklch(0.8_0.15_85)]",
                        tx.status === "failed" && "bg-destructive/15 text-destructive"
                      )}
                    >
                      {tx.status}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground">{now ? formatDate(tx.date, now) : ""}</p>
                </div>
                <p className={cn(
                  "text-sm font-medium",
                  tx.type === "receive" ? "text-[oklch(0.72_0.19_155)]" : ""
                )}>
                  {tx.type === "receive" ? "+" : tx.type === "send" || tx.type === "sell" ? "-" : ""}
                  {formatTokenAmount(tx.amount)} {tx.tokenSymbol}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
