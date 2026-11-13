"use client";

import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { useEffect } from "react";
import { useWalletStore } from "@/lib/store";
import { formatCurrency, formatPercent } from "@/components/format";
import { cn } from "@/lib/utils";
import { usePageTransition } from "@/hooks/use-gsap";

export default function WalletsPage() {
  const animScope = usePageTransition();
  const { wallets, getTotalBalance, isLoaded, fetchWallets } = useWalletStore();

  useEffect(() => {
    if (!isLoaded) fetchWallets();
  }, [isLoaded, fetchWallets]);

  return (
    <div ref={animScope} className="flex flex-col gap-6 px-4 pt-6">
      <div data-anim="header" className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Wallets</h1>
        <Link
          href="/create-wallet"
          className="flex items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          <Plus className="h-4 w-4" />
          New
        </Link>
      </div>

      <div data-anim="balance" className="rounded-2xl bg-card p-4">
        <p className="text-sm text-muted-foreground">Portfolio Value</p>
        <p className="text-2xl font-bold">{formatCurrency(getTotalBalance())}</p>
      </div>

      <div className="flex flex-col gap-3">
        {wallets.map((wallet) => (
          <Link
            key={wallet.id}
            href={`/wallet/${wallet.id}`}
            data-anim="list-item"
            className="flex items-center gap-4 rounded-2xl bg-card p-4 transition-colors active:bg-accent"
          >
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold text-white"
              style={{ backgroundColor: wallet.color }}
            >
              {wallet.name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold">{wallet.name}</p>
              <p className="text-sm text-muted-foreground">{wallet.address}</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <p className="font-semibold">{formatCurrency(wallet.totalBalance)}</p>
                <p
                  className={cn(
                    "text-xs",
                    wallet.change24h >= 0 ? "text-[oklch(0.72_0.19_155)]" : "text-destructive"
                  )}
                >
                  {formatPercent(wallet.change24h)}
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
