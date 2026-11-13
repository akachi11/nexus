"use client";

import { Search, TrendingUp, Flame, Award, ArrowUp, ArrowDown, Layers, Hexagon, Zap, Dog, ChevronDown, RefreshCw, Coins } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useMarketData } from "@/hooks/use-market-data";
import { useWalletStore } from "@/lib/store";
import { useAuth } from "@/components/auth-provider";
import { formatCurrency, formatPercent, formatCompactCurrency } from "@/components/format";
import { MiniChart } from "@/components/mini-chart";
import { MarketListSkeleton } from "@/components/skeleton";
import { cn } from "@/lib/utils";
import { CryptoIcon } from "@/components/crypto-icons";

const cryptoFilters = [
  { id: "trending", label: "Trending", icon: Flame },
  { id: "top", label: "Top", icon: Award },
  { id: "gainers", label: "Top Gainers", icon: ArrowUp },
  { id: "losers", label: "Top Losers", icon: ArrowDown },
  { id: "defi", label: "DeFi", icon: Hexagon },
  { id: "layer1", label: "Layer 1", icon: Zap },
  { id: "layer2", label: "Layer 2", icon: Layers },
  { id: "meme", label: "Meme", icon: Dog },
];

const stockFilters = [
  { id: "all", label: "All" },
  { id: "trending", label: "Trending" },
  { id: "gainers", label: "Top Gainers" },
  { id: "losers", label: "Top Losers" },
  { id: "tech", label: "Tech" },
  { id: "etf", label: "ETFs" },
  { id: "finance", label: "Finance" },
  { id: "healthcare", label: "Healthcare" },
  { id: "consumer", label: "Consumer" },
  { id: "energy", label: "Energy" },
];

export default function MarketsPage() {
  const [mounted, setMounted] = useState(false);
  const [mainTab, setMainTab] = useState<"crypto" | "stocks">("crypto");
  const [cryptoFilter, setCryptoFilter] = useState("trending");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"marketCap" | "volume" | "change24h">("marketCap");
  const [search, setSearch] = useState("");

  const { user } = useAuth();
  const { wallets, isLoaded, fetchWallets } = useWalletStore();

  useEffect(() => setMounted(true), []);
  useEffect(() => { if (user && !isLoaded) fetchWallets(); }, [user, isLoaded, fetchWallets]);

  const activeFilter = mainTab === "crypto" ? cryptoFilter : stockFilter;
  const { assets, loading, error } = useMarketData(mainTab, activeFilter);

  const userTokens = useMemo(() => {
    if (!user) return [];
    return wallets.flatMap((w) => w.tokens);
  }, [user, wallets]);

  const matchedUserTokens = useMemo(() => {
    if (!search || mainTab !== "crypto") return [];
    const q = search.toLowerCase();
    return userTokens.filter(
      (t) =>
        (t.name.toLowerCase().includes(q) || t.symbol.toLowerCase().includes(q)) &&
        !assets.some((a) => a.symbol.toLowerCase() === t.symbol.toLowerCase()),
    );
  }, [search, mainTab, userTokens, assets]);

  const bluechips = useMemo(
    () => assets.filter((a) => ["BTC", "ETH"].includes(a.symbol)).slice(0, 2),
    [assets],
  );

  const displayed = useMemo(() => {
    let list = [...assets];

    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (a) => a.name.toLowerCase().includes(q) || a.symbol.toLowerCase().includes(q),
      );
    }

    list.sort((a, b) => {
      if (sortBy === "change24h") return b.change24h - a.change24h;
      if (sortBy === "volume") return b.volume24h - a.volume24h;
      return b.marketCap - a.marketCap;
    });

    return list;
  }, [assets, search, sortBy]);

  const sortLabel = sortBy === "marketCap" ? "Market cap" : sortBy === "volume" ? "Volume" : "24h %";
  const hasData = assets.length > 0;

  return (
    <div className="flex flex-col gap-4 px-4 pt-6 pb-24">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Markets</h1>
        {hasData && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[oklch(0.72_0.19_155)]" />
            Live
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
          <RefreshCw className="h-4 w-4" />
          {error} — showing cached data
        </div>
      )}

      {/* Main Tabs: Crypto | Stocks */}
      <div className="flex border-b border-border">
        {(["crypto", "stocks"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setMainTab(tab);
              setSearch("");
            }}
            className={cn(
              "flex-1 pb-3 text-center text-sm font-semibold transition-colors",
              mainTab === tab
                ? "border-b-2 border-primary text-foreground"
                : "text-muted-foreground",
            )}
          >
            {tab === "crypto" ? "Crypto" : "Stocks"}
          </button>
        ))}
      </div>

      {!mounted ? (
        <MarketListSkeleton count={10} />
      ) : (
        <>
          {/* CRYPTO TAB */}
          {mainTab === "crypto" && (
            <>
              {/* Bluechips */}
              {bluechips.length > 0 && !search && cryptoFilter === "trending" && (
                <div>
                  <p className="mb-2 text-sm font-semibold text-muted-foreground">Bluechips</p>
                  <div className="grid grid-cols-2 gap-3">
                    {bluechips.map((coin) => (
                      <div
                        key={coin.id}
                        className="flex items-center gap-3 rounded-xl bg-card/80 p-3"
                      >
                        <CryptoIcon symbol={coin.symbol} size={36} />
                        <div>
                          <p className="text-sm font-bold">{coin.symbol}</p>
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs text-muted-foreground">{formatCurrency(coin.price)}</span>
                            <span
                              className={cn(
                                "text-xs font-medium",
                                coin.change24h >= 0 ? "text-[oklch(0.72_0.19_155)]" : "text-destructive",
                              )}
                            >
                              {formatPercent(coin.change24h)}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Sub-tabs */}
              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
                {cryptoFilters.map(({ id, label }) => (
                  <button
                    key={id}
                    onClick={() => setCryptoFilter(id)}
                    className={cn(
                      "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                      cryptoFilter === id
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </>
          )}

          {/* STOCKS TAB */}
          {mainTab === "stocks" && (
            <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
              {stockFilters.map(({ id, label }) => (
                <button
                  key={id}
                  onClick={() => setStockFilter(id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-xs font-semibold transition-colors",
                    stockFilter === id
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          )}

          {/* Sort Row */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <button
              className="flex items-center gap-1"
              onClick={() => {
                const order: typeof sortBy[] = ["marketCap", "volume", "change24h"];
                setSortBy(order[(order.indexOf(sortBy) + 1) % order.length]);
              }}
            >
              {sortLabel} <ChevronDown className="h-3 w-3" />
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={mainTab === "stocks" ? "Search stocks, ETFs..." : "Search coins, tokens..."}
              className="w-full rounded-xl bg-card py-2.5 pl-11 pr-4 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* User Tokens (search results) */}
          {matchedUserTokens.length > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-muted-foreground">My Tokens</p>
              {matchedUserTokens.map((token) => (
                <div key={token.id} className="flex items-center gap-3 rounded-xl bg-card p-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-lg"
                    style={{ backgroundColor: (token.color || "#6366f1") + "22" }}
                  >
                    {token.icon || <Coins className="h-5 w-5" style={{ color: token.color || "#6366f1" }} />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-semibold">{token.symbol}</p>
                      {token.isCustom && (
                        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">Custom</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{token.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(token.price)}</p>
                    <p className="text-xs text-muted-foreground">{token.balance} {token.symbol}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Asset List */}
          {loading ? (
            <MarketListSkeleton count={10} />
          ) : (
            <div className="flex flex-col gap-2">
              {displayed.map((asset) => (
                <div key={asset.id} className="flex items-center gap-3 rounded-xl bg-card p-3">
                  <CryptoIcon symbol={asset.symbol} size={40} />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold">{asset.symbol}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCompactCurrency(asset.marketCap)} MCap
                    </p>
                  </div>
                  <MiniChart data={asset.sparkline} positive={asset.change24h >= 0} />
                  <div className="text-right">
                    <p className="text-sm font-semibold">{formatCurrency(asset.price)}</p>
                    <p
                      className={cn(
                        "text-xs font-medium",
                        asset.change24h >= 0 ? "text-[oklch(0.72_0.19_155)]" : "text-destructive",
                      )}
                    >
                      {formatPercent(asset.change24h)}
                    </p>
                  </div>
                </div>
              ))}
              {displayed.length === 0 && matchedUserTokens.length === 0 && (
                <div className="py-12 text-center text-muted-foreground">
                  <TrendingUp className="mx-auto mb-3 h-10 w-10 opacity-40" />
                  <p>No assets found</p>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
