"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, Copy, Check } from "lucide-react";
import { useState, useMemo } from "react";
import { useWalletStore } from "@/lib/store";
import { useLivePrices } from "@/hooks/use-market-data";
import { formatCurrency, formatPercent, formatTokenAmount } from "@/components/format";
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

export default function WalletDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { wallets } = useWalletStore();
  const priceMap = useLivePrices();
  const wallet = wallets.find((w) => w.id === id);
  const [copied, setCopied] = useState(false);

  const hasPrices = Object.keys(priceMap).length > 0;

  const enrichedTokens = useMemo(
    () => wallet?.tokens.map((t) => enrichToken(t, priceMap)) ?? [],
    [wallet?.tokens, priceMap],
  );

  const walletBalance = useMemo(
    () => (hasPrices ? enrichedTokens.reduce((s, t) => s + t.value, 0) : wallet?.totalBalance ?? 0),
    [hasPrices, enrichedTokens, wallet?.totalBalance],
  );

  const walletChange = useMemo(() => {
    if (!hasPrices || walletBalance === 0) return wallet?.change24h ?? 0;
    return enrichedTokens.reduce((s, t) => s + t.change24h * t.value, 0) / walletBalance;
  }, [hasPrices, enrichedTokens, walletBalance, wallet?.change24h]);

  if (!wallet) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 pt-20">
        <p className="text-muted-foreground">Wallet not found</p>
        <Link href="/wallets" className="text-primary">
          Back to wallets
        </Link>
      </div>
    );
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">{wallet.name}</h1>
      </div>

      <div
        className="rounded-2xl p-6 text-white"
        style={{ background: `linear-gradient(135deg, ${wallet.color}, ${wallet.color}88)` }}
      >
        <p className="text-sm opacity-80">Balance</p>
        <p className="mt-1 text-3xl font-bold">{formatCurrency(walletBalance)}</p>
        <p className={cn("mt-1 text-sm", walletChange >= 0 ? "text-green-200" : "text-red-200")}>
          {formatPercent(walletChange)} today
        </p>

        <button
          onClick={handleCopy}
          className="mt-4 flex items-center gap-2 rounded-lg bg-white/15 px-3 py-1.5 text-sm"
        >
          {wallet.address}
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </button>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <Link
            href="/send"
            className="flex items-center justify-center gap-2 rounded-xl bg-white/15 py-3 font-medium"
          >
            <ArrowUpRight className="h-5 w-5" /> Send
          </Link>
          <Link
            href="/receive"
            className="flex items-center justify-center gap-2 rounded-xl bg-white/15 py-3 font-medium"
          >
            <ArrowDownLeft className="h-5 w-5" /> Receive
          </Link>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-semibold">Tokens</h2>
        {!hasPrices ? (
          <div className="mt-3">
            <TokenListSkeleton count={wallet.tokens.length} />
          </div>
        ) : (
          <div className="mt-3 flex flex-col gap-2">
            {enrichedTokens.map((token) => (
              <Link
                key={token.id}
                href={`/token/${token.id}`}
                className="flex items-center gap-3 rounded-xl bg-card p-4 transition-colors hover:bg-accent active:scale-[0.99]"
              >
                <CryptoIcon symbol={token.symbol} size={44} fallbackColor={token.color} fallbackIcon={token.icon} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium">{token.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatTokenAmount(token.balance)} {token.symbol}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">{formatCurrency(token.value)}</p>
                  <p className={cn("text-xs", token.change24h >= 0 ? "text-[oklch(0.72_0.19_155)]" : "text-destructive")}>
                    {formatPercent(token.change24h)}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
