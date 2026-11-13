"use client";

import Link from "next/link";
import { ArrowUpRight, ArrowDownLeft, ArrowLeftRight, Send, Plus, ChevronRight, Eye, EyeOff, TrendingDown, LogOut } from "lucide-react";
import { useState, useEffect, useMemo, useRef } from "react";
import { useWalletStore } from "@/lib/store";
import { useLivePrices } from "@/hooks/use-market-data";
import { formatCurrency, formatPercent, formatDate, formatTokenAmount } from "@/components/format";
import { TokenListSkeleton } from "@/components/skeleton";
import { cn } from "@/lib/utils";
import { CryptoIcon } from "@/components/crypto-icons";
import { LandingPage } from "@/components/landing-page";
import { useAuth } from "@/components/auth-provider";
import { usePageTransition } from "@/hooks/use-gsap";
import type { Token } from "@/lib/types";

function enrichToken(token: Token, priceMap: Record<string, { price: number; change24h: number }>): Token {
  const live = priceMap[token.symbol.toUpperCase()];
  if (!live) return token;
  const price = live.price;
  return { ...token, price, change24h: live.change24h, value: token.balance * price };
}

export default function HomePage() {
  const { user, logout } = useAuth();
  const animScope = usePageTransition();
  const { wallets, transactions, activeWalletId, isLoaded, fetchWallets, fetchTransactions } = useWalletStore();
  const priceMap = useLivePrices();
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [now, setNow] = useState<Date | undefined>(undefined);
  useEffect(() => setNow(new Date()), []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    if (showMenu) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [showMenu]);

  useEffect(() => {
    if (!isLoaded) {
      fetchWallets();
      fetchTransactions();
    }
  }, [isLoaded, fetchWallets, fetchTransactions]);

  const activeWallet = wallets.find((w) => w.id === activeWalletId) ?? wallets[0];
  const hasPrices = Object.keys(priceMap).length > 0;

  const enrichedTokens = useMemo(
    () => (activeWallet?.tokens ?? []).map((t) => enrichToken(t, priceMap)),
    [activeWallet?.tokens, priceMap],
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

  if (!user) {
    return <LandingPage />;
  }

  if (!activeWallet) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div ref={animScope} className="flex flex-col gap-6 px-4 pt-6">
      {/* Header */}
      <div data-anim="header" className="relative z-10 flex items-center justify-between">
        <div>
          <p className="text-sm text-muted-foreground">Welcome back</p>
          <h1 className="text-xl font-bold">Numirelics</h1>
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground"
          >
            {user.firstName[0]}{user.lastName[0]}
          </button>
          {showMenu && (
            <div className="absolute right-0 top-12 z-50 min-w-[180px] rounded-xl border border-border bg-card p-1 shadow-xl">
              <div className="px-3 py-2 border-b border-border">
                <p className="text-sm font-medium">{user.firstName} {user.lastName}</p>
                <p className="text-xs text-muted-foreground truncate">{user.email}</p>
              </div>
              <button
                onClick={() => { setShowMenu(false); logout(); }}
                className="mt-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-destructive transition-colors hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Balance Card */}
      <div data-anim="balance" className="gradient-primary rounded-2xl p-6 text-white">
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
              data-anim="action"
              className="flex flex-col items-center gap-1.5 rounded-xl bg-white/10 py-3 text-white transition-colors hover:bg-white/20"
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs font-medium">{label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* Active Wallet Tokens */}
      <div data-anim="section">
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
                data-anim="list-item"
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
      <div data-anim="section">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Recent Activity</h2>
          <Link href="/history" className="text-sm text-primary">
            View all <ChevronRight className="inline h-4 w-4" />
          </Link>
        </div>
        <div className="mt-3 flex flex-col gap-2">
          {recentTx.map((tx) => (
            <div key={tx.id} data-anim="list-item" className="flex items-center gap-3 rounded-xl bg-card p-3">
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
