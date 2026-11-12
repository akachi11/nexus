import { useEffect } from "react";
import { useMarketStore } from "@/lib/market-store";
import type { MarketAsset } from "@/lib/types";

const EMPTY: MarketAsset[] = [];

function cacheKey(type: "crypto" | "stocks", filter: string) {
  return `${type}:${filter}`;
}

export function useMarketData(type: "crypto" | "stocks", filter: string) {
  const key = cacheKey(type, filter);
  const fetchMarket = useMarketStore((s) => s.fetchMarket);
  const assets = useMarketStore((s) => s.cache[key]?.assets) ?? EMPTY;
  const loading = useMarketStore((s) => !!s.loading[key]);
  const error = useMarketStore((s) => s.errors[key] ?? null);

  useEffect(() => {
    fetchMarket(type, filter);
    const interval = setInterval(() => fetchMarket(type, filter), 60_000);
    return () => clearInterval(interval);
  }, [type, filter, fetchMarket]);

  return { assets, loading, error };
}

export function useLivePrices() {
  const priceMap = useMarketStore((s) => s.priceMap);
  const fetchPrices = useMarketStore((s) => s.fetchPrices);

  useEffect(() => {
    fetchPrices();
    const interval = setInterval(fetchPrices, 60_000);
    return () => clearInterval(interval);
  }, [fetchPrices]);

  return priceMap;
}
