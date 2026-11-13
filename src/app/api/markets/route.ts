import { type NextRequest, NextResponse } from "next/server";

// ── Crypto (CoinGecko) ─────────────────────────────────────────────

const CATEGORY_MAP: Record<string, string[]> = {
  bitcoin: ["top", "layer1"],
  ethereum: ["top", "defi", "layer1"],
  solana: ["top", "layer1"],
  binancecoin: ["top", "layer1"],
  ripple: ["top"],
  cardano: ["top", "layer1"],
  dogecoin: ["meme"],
  "avalanche-2": ["layer1"],
  chainlink: ["defi"],
  uniswap: ["defi"],
  aave: ["defi"],
  "matic-network": ["layer2"],
  arbitrum: ["layer2"],
  optimism: ["layer2"],
  pepe: ["meme"],
  "shiba-inu": ["meme"],
};

interface CoinGeckoMarket {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  price_change_percentage_24h: number | null;
  sparkline_in_7d?: { price: number[] };
}

interface CryptoAsset {
  id: string;
  coinGeckoId: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
  category: string[];
  type: "crypto";
  image: string;
}

let cryptoCache: { data: CryptoAsset[]; ts: number } | null = null;

async function fetchAllCrypto(): Promise<CryptoAsset[]> {
  if (cryptoCache && Date.now() - cryptoCache.ts < 60_000) return cryptoCache.data;

  const res = await fetch(
    "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=true&price_change_percentage=24h",
    { next: { revalidate: 60 } },
  );
  if (!res.ok) return cryptoCache?.data ?? [];

  const coins: CoinGeckoMarket[] = await res.json();
  const data = coins.map((coin) => {
    const base = CATEGORY_MAP[coin.id] || [];
    const categories = [...base];
    const change = coin.price_change_percentage_24h ?? 0;
    if (change > 5) categories.push("gainers");
    if (change < -5) categories.push("losers");
    if (coin.market_cap_rank && coin.market_cap_rank <= 10) {
      if (!categories.includes("trending")) categories.push("trending");
    }
    return {
      id: `m-${coin.symbol}`,
      coinGeckoId: coin.id,
      name: coin.name,
      symbol: coin.symbol.toUpperCase(),
      price: coin.current_price ?? 0,
      change24h: change,
      marketCap: coin.market_cap ?? 0,
      volume24h: coin.total_volume ?? 0,
      sparkline: coin.sparkline_in_7d?.price?.slice(-24) ?? [],
      category: categories,
      type: "crypto" as const,
      image: coin.image,
    };
  });

  cryptoCache = { data, ts: Date.now() };
  return data;
}

function filterCrypto(all: CryptoAsset[], filter: string): CryptoAsset[] {
  switch (filter) {
    case "all":
      return all;
    case "trending":
      return all.filter((a) => a.category.includes("trending"));
    case "top":
      return [...all].sort((a, b) => b.marketCap - a.marketCap).slice(0, 20);
    case "gainers":
      return [...all].sort((a, b) => b.change24h - a.change24h).slice(0, 20);
    case "losers":
      return [...all].sort((a, b) => a.change24h - b.change24h).slice(0, 20);
    case "defi":
      return all.filter((a) => a.category.includes("defi"));
    case "layer1":
      return all.filter((a) => a.category.includes("layer1"));
    case "layer2":
      return all.filter((a) => a.category.includes("layer2"));
    case "meme":
      return all.filter((a) => a.category.includes("meme"));
    default:
      return all;
  }
}

// ── Stocks (Yahoo Finance spark endpoint – free, no key) ───────────

interface StockMeta {
  name: string;
  marketCap: number;
  sector: string;
}

const STOCKS: Record<string, StockMeta> = {
  // Tech
  AAPL:  { name: "Apple Inc.",           marketCap: 3_520_000_000_000, sector: "tech" },
  MSFT:  { name: "Microsoft Corp.",      marketCap: 3_180_000_000_000, sector: "tech" },
  GOOGL: { name: "Alphabet Inc.",        marketCap: 2_120_000_000_000, sector: "tech" },
  AMZN:  { name: "Amazon.com Inc.",      marketCap: 2_080_000_000_000, sector: "tech" },
  NVDA:  { name: "NVIDIA Corp.",         marketCap: 3_400_000_000_000, sector: "tech" },
  META:  { name: "Meta Platforms",       marketCap: 1_540_000_000_000, sector: "tech" },
  TSLA:  { name: "Tesla Inc.",           marketCap: 1_130_000_000_000, sector: "tech" },
  AMD:   { name: "Advanced Micro Dev.",  marketCap: 210_000_000_000,   sector: "tech" },
  NFLX:  { name: "Netflix Inc.",         marketCap: 390_000_000_000,   sector: "tech" },
  CRM:   { name: "Salesforce Inc.",      marketCap: 270_000_000_000,   sector: "tech" },
  ORCL:  { name: "Oracle Corp.",         marketCap: 480_000_000_000,   sector: "tech" },
  INTC:  { name: "Intel Corp.",          marketCap: 108_000_000_000,   sector: "tech" },
  // ETFs
  SPY:  { name: "SPDR S&P 500 ETF",     marketCap: 570_000_000_000,   sector: "etf" },
  QQQ:  { name: "Invesco QQQ Trust",    marketCap: 310_000_000_000,   sector: "etf" },
  IVV:  { name: "iShares Core S&P 500", marketCap: 530_000_000_000,   sector: "etf" },
  VOO:  { name: "Vanguard S&P 500",     marketCap: 480_000_000_000,   sector: "etf" },
  VTI:  { name: "Vanguard Total Market", marketCap: 410_000_000_000,  sector: "etf" },
  DIA:  { name: "SPDR Dow Jones ETF",   marketCap: 36_000_000_000,    sector: "etf" },
  ARKK: { name: "ARK Innovation ETF",   marketCap: 6_800_000_000,     sector: "etf" },
  // Finance
  JPM:  { name: "JPMorgan Chase",       marketCap: 680_000_000_000,   sector: "finance" },
  BAC:  { name: "Bank of America",      marketCap: 350_000_000_000,   sector: "finance" },
  GS:   { name: "Goldman Sachs",        marketCap: 180_000_000_000,   sector: "finance" },
  V:    { name: "Visa Inc.",            marketCap: 590_000_000_000,   sector: "finance" },
  MA:   { name: "Mastercard Inc.",      marketCap: 460_000_000_000,   sector: "finance" },
  // Healthcare
  JNJ:  { name: "Johnson & Johnson",    marketCap: 380_000_000_000,   sector: "healthcare" },
  UNH:  { name: "UnitedHealth Group",   marketCap: 460_000_000_000,   sector: "healthcare" },
  PFE:  { name: "Pfizer Inc.",          marketCap: 146_000_000_000,   sector: "healthcare" },
  ABBV: { name: "AbbVie Inc.",          marketCap: 310_000_000_000,   sector: "healthcare" },
  MRK:  { name: "Merck & Co.",          marketCap: 260_000_000_000,   sector: "healthcare" },
  // Consumer
  WMT:  { name: "Walmart Inc.",         marketCap: 670_000_000_000,   sector: "consumer" },
  COST: { name: "Costco Wholesale",     marketCap: 400_000_000_000,   sector: "consumer" },
  NKE:  { name: "Nike Inc.",            marketCap: 118_000_000_000,   sector: "consumer" },
  MCD:  { name: "McDonald's Corp.",     marketCap: 210_000_000_000,   sector: "consumer" },
  DIS:  { name: "Walt Disney Co.",      marketCap: 202_000_000_000,   sector: "consumer" },
  SBUX: { name: "Starbucks Corp.",      marketCap: 105_000_000_000,   sector: "consumer" },
  // Energy
  XOM:  { name: "Exxon Mobil Corp.",    marketCap: 460_000_000_000,   sector: "energy" },
  CVX:  { name: "Chevron Corp.",        marketCap: 280_000_000_000,   sector: "energy" },
  COP:  { name: "ConocoPhillips",       marketCap: 128_000_000_000,   sector: "energy" },
};

interface SparkEntry {
  symbol: string;
  fulldayPrice?: number;
  fulldayChangePercent?: number;
  regularMarketPrice?: number;
  regularMarketChangePercent?: number;
  chartPreviousClose?: number;
  close?: (number | null)[];
}

interface StockAsset {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
  category: string[];
  type: "stock";
}

let stocksCache: { data: StockAsset[]; ts: number } | null = null;

async function fetchAllStocks(): Promise<StockAsset[]> {
  if (stocksCache && Date.now() - stocksCache.ts < 60_000) return stocksCache.data;

  const allSymbols = Object.keys(STOCKS);
  const chunkSize = 12;
  const chunks: string[][] = [];
  for (let i = 0; i < allSymbols.length; i += chunkSize) {
    chunks.push(allSymbols.slice(i, i + chunkSize));
  }

  const results = await Promise.all(
    chunks.map(async (chunk) => {
      const res = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/spark?symbols=${chunk.join(",")}&range=7d&interval=1d`,
        { headers: { "User-Agent": "Mozilla/5.0" }, next: { revalidate: 60 } },
      );
      if (!res.ok) return {};
      return (await res.json()) as Record<string, SparkEntry>;
    }),
  );

  const raw: Record<string, SparkEntry> = Object.assign({}, ...results);

  const data = Object.entries(raw)
    .filter(([sym]) => STOCKS[sym])
    .map(([sym, entry]) => {
      const meta = STOCKS[sym];
      const price = entry.fulldayPrice ?? entry.regularMarketPrice ?? 0;
      const change = entry.fulldayChangePercent ?? entry.regularMarketChangePercent ?? 0;
      const sparkline = (entry.close ?? []).filter((c): c is number => c !== null);

      return {
        id: `s-${sym.toLowerCase()}`,
        name: meta.name,
        symbol: sym,
        price,
        change24h: change,
        marketCap: meta.marketCap,
        volume24h: 0,
        sparkline,
        category: [meta.sector],
        type: "stock" as const,
      };
    })
    .sort((a, b) => b.marketCap - a.marketCap);

  stocksCache = { data, ts: Date.now() };
  return data;
}

function filterStocks(all: StockAsset[], filter: string): StockAsset[] {
  switch (filter) {
    case "all":
      return all;
    case "gainers":
      return [...all].sort((a, b) => b.change24h - a.change24h).slice(0, 20);
    case "losers":
      return [...all].sort((a, b) => a.change24h - b.change24h).slice(0, 20);
    case "trending":
      return [...all].sort((a, b) => Math.abs(b.change24h) - Math.abs(a.change24h)).slice(0, 20);
    case "tech":
    case "etf":
    case "finance":
    case "healthcare":
    case "consumer":
    case "energy":
      return all.filter((a) => a.category.includes(filter));
    default:
      return all;
  }
}

// ── Route handler ──────────────────────────────────────────────────

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get("type");
  const filter = request.nextUrl.searchParams.get("filter") || "all";

  try {
    if (type === "stocks") {
      const all = await fetchAllStocks();
      const stocks = filterStocks(all, filter);
      return NextResponse.json({ stocks, filter, source: "yahoo", updatedAt: Date.now() });
    }
    if (type === "crypto") {
      const all = await fetchAllCrypto();
      const crypto = filterCrypto(all, filter);
      return NextResponse.json({ crypto, filter, source: "coingecko", updatedAt: Date.now() });
    }
    const [crypto, stocks] = await Promise.all([fetchAllCrypto(), fetchAllStocks()]);
    return NextResponse.json({
      crypto, stocks,
      source: { crypto: "coingecko", stocks: "yahoo" },
      updatedAt: Date.now(),
    });
  } catch (err) {
    if (err instanceof Error && "digest" in err) throw err;
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (type === "stocks") return NextResponse.json({ stocks: [], error: msg, updatedAt: Date.now() });
    if (type === "crypto") return NextResponse.json({ crypto: [], source: "error", updatedAt: Date.now() });
    return NextResponse.json({ crypto: [], stocks: [], source: { crypto: "error", stocks: "error" }, updatedAt: Date.now() });
  }
}
