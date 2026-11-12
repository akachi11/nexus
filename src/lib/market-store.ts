import { create } from "zustand";
import type { MarketAsset } from "./types";

interface MarketApiAsset {
  id: string;
  coinGeckoId?: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
  category: string[];
  type: "crypto" | "stock";
  image?: string;
}

function toMarketAsset(a: MarketApiAsset): MarketAsset {
  return {
    id: a.id,
    name: a.name,
    symbol: a.symbol,
    icon: "",
    price: a.price,
    change24h: a.change24h,
    marketCap: a.marketCap,
    volume24h: a.volume24h,
    sparkline: a.sparkline,
    category: a.category,
    type: a.type,
  };
}

interface CacheEntry {
  assets: MarketAsset[];
  fetchedAt: number;
}

interface MarketState {
  cache: Record<string, CacheEntry>;
  loading: Record<string, boolean>;
  errors: Record<string, string | null>;
  priceMap: Record<string, { price: number; change24h: number }>;
  lastPriceFetch: number | null;

  fetchMarket: (type: "crypto" | "stocks", filter: string) => Promise<void>;
  fetchPrices: () => Promise<void>;
  getAssets: (type: "crypto" | "stocks", filter: string) => MarketAsset[];
  isLoading: (type: "crypto" | "stocks", filter: string) => boolean;
  getError: (type: "crypto" | "stocks", filter: string) => string | null;
  getPrice: (symbol: string) => { price: number; change24h: number } | null;
}

function cacheKey(type: "crypto" | "stocks", filter: string) {
  return `${type}:${filter}`;
}

const CACHE_TTL = 60_000;

export const useMarketStore = create<MarketState>((set, get) => ({
  cache: {},
  loading: {},
  errors: {},
  priceMap: {},
  lastPriceFetch: null,

  fetchMarket: async (type, filter) => {
    const key = cacheKey(type, filter);
    const state = get();
    const existing = state.cache[key];
    if (existing && Date.now() - existing.fetchedAt < CACHE_TTL) return;
    if (state.loading[key]) return;

    const showLoading = !existing;
    if (showLoading) set({ loading: { ...get().loading, [key]: true } });

    try {
      const res = await fetch(`/api/markets?type=${type}&filter=${filter}`);
      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const raw: MarketApiAsset[] = type === "crypto" ? (data.crypto || []) : (data.stocks || []);
      const assets = raw.map(toMarketAsset);

      set({
        cache: { ...get().cache, [key]: { assets, fetchedAt: Date.now() } },
        loading: { ...get().loading, [key]: false },
        errors: { ...get().errors, [key]: null },
      });
    } catch {
      set({
        loading: { ...get().loading, [key]: false },
        errors: { ...get().errors, [key]: `Failed to load ${type} data` },
      });
    }
  },

  fetchPrices: async () => {
    const state = get();
    if (state.lastPriceFetch && Date.now() - state.lastPriceFetch < CACHE_TTL) return;

    try {
      const res = await fetch("/api/markets?type=crypto");
      if (!res.ok) throw new Error("API error");

      const data = await res.json();
      const raw: MarketApiAsset[] = data.crypto || [];

      const priceMap: Record<string, { price: number; change24h: number }> = {};
      for (const a of raw) {
        priceMap[a.symbol.toUpperCase()] = { price: a.price, change24h: a.change24h };
      }

      const key = cacheKey("crypto", "all");
      set({
        priceMap,
        lastPriceFetch: Date.now(),
        cache: { ...get().cache, [key]: { assets: raw.map(toMarketAsset), fetchedAt: Date.now() } },
        loading: { ...get().loading, [key]: false },
        errors: { ...get().errors, [key]: null },
      });
    } catch {
      // silent
    }
  },

  getAssets: (type, filter) => {
    return get().cache[cacheKey(type, filter)]?.assets ?? [];
  },

  isLoading: (type, filter) => {
    return get().loading[cacheKey(type, filter)] ?? false;
  },

  getError: (type, filter) => {
    return get().errors[cacheKey(type, filter)] ?? null;
  },

  getPrice: (symbol: string) => {
    return get().priceMap[symbol.toUpperCase()] ?? null;
  },
}));
