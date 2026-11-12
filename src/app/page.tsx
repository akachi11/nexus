"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, QrCode, ArrowLeftRight, Send, Plus, ChevronRight, Eye, EyeOff, TrendingDown } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useWalletStore } from "@/lib/store";
import { useLivePrices } from "@/hooks/use-market-data";
import { formatCurrency, formatPercent, formatDate, formatTokenAmount } from "@/components/format";
import { TokenListSkeleton } from "@/components/skeleton";
import { cn } from "@/lib/utils";
import { CryptoIcon } from "@/components/crypto-icons";
import type { Token } from "@/lib/types";

function enrichToken(token: Token, priceMap: Record<string, { price: number; change24h: number }>): Token {
  const live = priceMap[token.symbol.toUpperCase()];
  if (!live) return token;
  const price = live.price;
  return { ...token, price, change24h: live.change24h, value: token.balance * price };
}

export default function HomePage() {
  const { wallets, transactions, activeWalletId } = useWalletStore();
  const priceMap = useLivePrices();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [now, setNow] = useState<Date | undefined>(undefined);
  useEffect(() => setNow(new Date()), []);

  const activeWallet = wallets.find((w) => w.id === activeWalletId) ?? wallets[0];
  const hasPrices = Object.keys(priceMap).length > 0;

  const enrichedTokens = useMemo(
    () => activeWallet.tokens.map((t) => enrichToken(t, priceMap)),
    [activeWallet.tokens, priceMap],
  );

  const totalBalance = useMemo(() => {
    if (!hasPrices) return wallets.reduce((s, w) => s + w.totalBalance, 0);
    return wallets.reduce(
      (sum, w) => sum + w.tokens.reduce((ts, t) => ts + enrichToken(t, priceMap).value, 0),
      0,
    );
  }, [wallets, priceMap, hasPrices]);

  const totalChange = useMemo(() => {
    if (!hasPrices) {
      const tb = wallets.reduce((s, w) => s + w.totalBalance, 0);
      if (tb === 0) return 0;
      return wallets.reduce((s, w) => s + (w.change24h * w.totalBalance) / tb, 0);
    }
    if (totalBalance === 0) return 0;
    const weighted = wallets.reduce(
      (sum, w) =>
        sum +
        w.tokens.reduce((ts, t) => {
          const e = enrichToken(t, priceMap);
          return ts + e.change24h * e.value;
        }, 0),
      0,
    );
    return weighted / totalBalance;
  }, [wallets, priceMap, hasPrices, totalBalance]);

  const recentTx = transactions.slice(0, 5);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-xl font-bold">NexusWallet</h1>
        </div>
        <Link
          href="/wallets"
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
        >
          <QrCode className="h-5 w-5" />
        </Link>
      </div>

      {/* Balance Card */}
      <div className="gradient-primary rounded-2xl p-6 text-white">
        <div className="flex items-center gap-2">
          <p className="text-sm opacity-80">Total Balance</p>
          <button onClick={() => setBalanceVisible(!balanceVisible)} className="opacity-80 hover:opacity-100">
            {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
          </button>
        </div>
        <p className="mt-1 text-3xl font-bold tracking-tight">
          {balanceVisible ? formatCurrency(totalBalance) : "••••••"}
        </p>
        <div className="mt-1 flex items-center gap-1">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
              totalChange >= 0 ? "bg-white/20 text-green-200" : "bg-white/20 text-red-200",
            )}
          >
            {formatPercent(totalChange)} today
          </span>
        </div>

        {/* Quick Actions */}
        <div className="mt-6 grid grid-cols-4 gap-3">
          {[
            { icon: ArrowUpRight, label: "Send", href: "/send" },
            { icon: ArrowDownLeft, label: "Receive", href: "/receive" },
            { icon: ArrowLeftRight, label: "Swap", href: "/swap" },
            { icon: Plus, label: "Buy", href: "/buy" },
          ].map(({ icon: Icon, label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex flex-col items-center gap-1.5 rounded-xl bg-white/10 py-3 text-white transition-colors hover:bg-white/20"
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Active Wallet Tokens */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">{activeWallet.name}</h2>
          <Link href={`/wallet/${activeWallet.id}`} className="text-sm text-primary">
            See all <ChevronRight className="inline h-4 w-4" />
          </Link>
        </div>
        {!hasPrices ? (
          <div className="mt-3">
            <TokenListSkeleton count={4} />
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {enrichedTokens.slice(0, 4).map((token) => (
              <Link
                key={token.id}
                href={`/token/${token.id}`}
                className="flex items-center gap-3 rounded-xl bg-card p-3 transition-colors hover:bg-accent active:scale-[0.99]"
              >
                <CryptoIcon symbol={token.symbol} size={40} fallbackColor={token.color} fallbackIcon={token.icon} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{token.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatTokenAmount(token.balance)} {token.symbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium">{formatCurrency(token.value)}</p>
                  <p
                    className={cn(
                      "text-xs",
                      token.change24h >= 0 ? "text-[oklch(0.72_0.19_155)]" : "text-destructive",
                    )}
                  >
                    {formatPercent(token.change24h)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Transactions */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Link href="/history" className="text-sm text-primary">
            View all <ChevronRight className="inline h-4 w-4" />
          </Link>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {recentTx.map((tx) => (
            <div key={tx.id} className="flex items-center gap-3 rounded-xl bg-card p-3">
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
                <p className="font-medium capitalize">{tx.type}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {tx.token} · {now ? formatDate(tx.date, now) : ""}
                </p>
              </div>
              <div className="text-right">
                <p className={cn("font-medium", tx.type === "receive" ? "text-[oklch(0.72_0.19_155)]" : "")}>
                  {tx.type === "receive" ? "+" : (tx.type === "send" || tx.type === "sell") ? "-" : ""}
                  {formatTokenAmount(tx.amount)} {tx.tokenSymbol}
                </p>
                <p className="text-xs text-muted-foreground">
                  {tx.value > 0 ? formatCurrency(tx.value) : "—"}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
