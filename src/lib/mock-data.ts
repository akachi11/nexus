import { Wallet, Transaction, MarketAsset } from "./types";

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

function sparkline(base: number, volatility: number, seed: number): number[] {
  const rng = seededRandom(seed);
  const points: number[] = [];
  let v = base;
  for (let i = 0; i < 24; i++) {
    v += (rng() - 0.5) * volatility;
    points.push(Math.max(0, v));
  }
  return points;
}

export const wallets: Wallet[] = [
  {
    id: "main",
    name: "Main Wallet",
    address: "0x1a2B...9f4E",
    totalBalance: 12847.53,
    change24h: 3.24,
    color: "#6366f1",
    tokens: [
      { id: "btc", name: "Bitcoin", symbol: "BTC", icon: "₿", price: 97234.12, change24h: 2.14, balance: 0.0821, value: 7982.82, color: "#f7931a" },
      { id: "eth", name: "Ethereum", symbol: "ETH", icon: "Ξ", price: 3456.78, change24h: 4.56, balance: 0.892, value: 3083.45, color: "#627eea" },
      { id: "sol", name: "Solana", symbol: "SOL", icon: "◎", price: 187.92, change24h: 7.23, balance: 5.4, value: 1014.77, color: "#9945ff" },
      { id: "usdt", name: "Tether", symbol: "USDT", icon: "₮", price: 1.0, change24h: 0.01, balance: 766.49, value: 766.49, color: "#26a17b" },
    ],
  },
  {
    id: "trading",
    name: "Trading",
    address: "0x3c4D...2a1B",
    totalBalance: 5231.88,
    change24h: -1.12,
    color: "#ec4899",
    tokens: [
      { id: "eth-2", name: "Ethereum", symbol: "ETH", icon: "Ξ", price: 3456.78, change24h: 4.56, balance: 0.45, value: 1555.55, color: "#627eea" },
      { id: "avax", name: "Avalanche", symbol: "AVAX", icon: "▲", price: 38.45, change24h: -2.34, balance: 42.1, value: 1618.75, color: "#e84142" },
      { id: "link", name: "Chainlink", symbol: "LINK", icon: "⬡", price: 18.92, change24h: 1.87, balance: 108.7, value: 2057.58, color: "#2a5ada" },
    ],
  },
  {
    id: "savings",
    name: "Savings",
    address: "0x7e8F...5c3D",
    totalBalance: 3420.0,
    change24h: 0.05,
    color: "#10b981",
    tokens: [
      { id: "usdc", name: "USD Coin", symbol: "USDC", icon: "$", price: 1.0, change24h: 0.0, balance: 2200.0, value: 2200.0, color: "#2775ca" },
      { id: "dai", name: "Dai", symbol: "DAI", icon: "◆", price: 1.0, change24h: -0.01, balance: 1220.0, value: 1220.0, color: "#f5ac37" },
    ],
  },
];

export const transactions: Transaction[] = [
  { id: "t1", type: "receive", token: "Bitcoin", tokenSymbol: "BTC", amount: 0.025, value: 2430.85, address: "0x9a8B...3f2E", date: "2026-11-11T10:30:00Z", status: "completed", walletId: "main" },
  { id: "t2", type: "send", token: "Ethereum", tokenSymbol: "ETH", amount: 0.5, value: 1728.39, address: "0x4d5E...7a1C", date: "2026-11-10T14:22:00Z", status: "completed", walletId: "main" },
  { id: "t3", type: "receive", token: "Solana", tokenSymbol: "SOL", amount: 12.5, value: 2349.0, address: "0x2b3C...8d4F", date: "2026-11-10T09:15:00Z", status: "completed", walletId: "main" },
  { id: "t4", type: "send", token: "USDT", tokenSymbol: "USDT", amount: 500, value: 500.0, address: "0x6f7G...1e5A", date: "2026-11-09T18:45:00Z", status: "completed", walletId: "main" },
  { id: "t5", type: "swap", token: "ETH → SOL", tokenSymbol: "SOL", amount: 15.2, value: 2856.38, address: "DEX", date: "2026-11-09T12:00:00Z", status: "completed", walletId: "trading" },
  { id: "t6", type: "receive", token: "Chainlink", tokenSymbol: "LINK", amount: 50, value: 946.0, address: "0x1a2B...9f4E", date: "2026-11-08T20:30:00Z", status: "completed", walletId: "trading" },
  { id: "t7", type: "send", token: "Avalanche", tokenSymbol: "AVAX", amount: 10, value: 384.5, address: "0x8c9D...2b3A", date: "2026-11-08T08:12:00Z", status: "pending", walletId: "trading" },
  { id: "t8", type: "create", token: "NexToken", tokenSymbol: "NXT", amount: 1000000, value: 0, address: "Contract", date: "2026-11-07T15:00:00Z", status: "completed", walletId: "main" },
];

export const marketAssets: MarketAsset[] = [
  { id: "m-btc", name: "Bitcoin", symbol: "BTC", icon: "₿", price: 97234.12, change24h: 2.14, marketCap: 1920000000000, volume24h: 48200000000, sparkline: sparkline(97000, 800, 1), category: ["trending", "top", "layer1"], type: "crypto" },
  { id: "m-eth", name: "Ethereum", symbol: "ETH", icon: "Ξ", price: 3456.78, change24h: 4.56, marketCap: 415000000000, volume24h: 21300000000, sparkline: sparkline(3400, 60, 2), category: ["trending", "top", "defi", "layer1"], type: "crypto" },
  { id: "m-sol", name: "Solana", symbol: "SOL", icon: "◎", price: 187.92, change24h: 7.23, marketCap: 87000000000, volume24h: 5800000000, sparkline: sparkline(180, 8, 3), category: ["trending", "top", "gainers", "layer1"], type: "crypto" },
  { id: "m-bnb", name: "BNB", symbol: "BNB", icon: "◇", price: 612.34, change24h: 1.23, marketCap: 89000000000, volume24h: 2100000000, sparkline: sparkline(608, 10, 4), category: ["top", "layer1"], type: "crypto" },
  { id: "m-xrp", name: "XRP", symbol: "XRP", icon: "✕", price: 2.34, change24h: -0.89, marketCap: 134000000000, volume24h: 8900000000, sparkline: sparkline(2.35, 0.05, 5), category: ["top"], type: "crypto" },
  { id: "m-ada", name: "Cardano", symbol: "ADA", icon: "₳", price: 0.892, change24h: 3.45, marketCap: 31500000000, volume24h: 1200000000, sparkline: sparkline(0.87, 0.03, 6), category: ["top", "layer1"], type: "crypto" },
  { id: "m-doge", name: "Dogecoin", symbol: "DOGE", icon: "Ð", price: 0.387, change24h: 12.34, marketCap: 56000000000, volume24h: 4500000000, sparkline: sparkline(0.35, 0.02, 7), category: ["trending", "gainers", "meme"], type: "crypto" },
  { id: "m-avax", name: "Avalanche", symbol: "AVAX", icon: "▲", price: 38.45, change24h: -2.34, marketCap: 15800000000, volume24h: 890000000, sparkline: sparkline(39, 1.5, 8), category: ["losers", "layer1"], type: "crypto" },
  { id: "m-link", name: "Chainlink", symbol: "LINK", icon: "⬡", price: 18.92, change24h: 1.87, marketCap: 11800000000, volume24h: 720000000, sparkline: sparkline(18.5, 0.5, 9), category: ["defi"], type: "crypto" },
  { id: "m-uni", name: "Uniswap", symbol: "UNI", icon: "🦄", price: 12.45, change24h: 5.67, marketCap: 9400000000, volume24h: 560000000, sparkline: sparkline(12, 0.4, 10), category: ["trending", "gainers", "defi"], type: "crypto" },
  { id: "m-aave", name: "Aave", symbol: "AAVE", icon: "👻", price: 287.34, change24h: 3.21, marketCap: 4300000000, volume24h: 320000000, sparkline: sparkline(280, 8, 11), category: ["defi"], type: "crypto" },
  { id: "m-matic", name: "Polygon", symbol: "POL", icon: "⬠", price: 0.567, change24h: -4.56, marketCap: 5600000000, volume24h: 410000000, sparkline: sparkline(0.59, 0.02, 12), category: ["losers", "layer2"], type: "crypto" },
  { id: "m-arb", name: "Arbitrum", symbol: "ARB", icon: "⟐", price: 1.234, change24h: 2.89, marketCap: 4200000000, volume24h: 380000000, sparkline: sparkline(1.2, 0.04, 13), category: ["layer2"], type: "crypto" },
  { id: "m-op", name: "Optimism", symbol: "OP", icon: "⊕", price: 2.87, change24h: 6.12, marketCap: 3800000000, volume24h: 290000000, sparkline: sparkline(2.7, 0.1, 14), category: ["gainers", "layer2"], type: "crypto" },
  { id: "m-pepe", name: "Pepe", symbol: "PEPE", icon: "🐸", price: 0.0000234, change24h: 18.92, marketCap: 9800000000, volume24h: 2100000000, sparkline: sparkline(0.00002, 0.000002, 15), category: ["trending", "gainers", "meme"], type: "crypto" },
  { id: "m-shib", name: "Shiba Inu", symbol: "SHIB", icon: "🐕", price: 0.0000287, change24h: -1.23, marketCap: 16900000000, volume24h: 890000000, sparkline: sparkline(0.000029, 0.000001, 16), category: ["meme"], type: "crypto" },
  { id: "m-aapl", name: "Apple Inc.", symbol: "AAPL", icon: "", price: 234.56, change24h: 1.23, marketCap: 3600000000000, volume24h: 67000000000, sparkline: sparkline(232, 3, 17), category: ["top"], type: "stock" },
  { id: "m-msft", name: "Microsoft", symbol: "MSFT", icon: "⊞", price: 456.78, change24h: 0.89, marketCap: 3400000000000, volume24h: 32000000000, sparkline: sparkline(454, 4, 18), category: ["top"], type: "stock" },
  { id: "m-nvda", name: "NVIDIA", symbol: "NVDA", icon: "◈", price: 145.23, change24h: 3.45, marketCap: 3500000000000, volume24h: 51000000000, sparkline: sparkline(142, 4, 19), category: ["trending", "top", "gainers"], type: "stock" },
  { id: "m-tsla", name: "Tesla", symbol: "TSLA", icon: "⚡", price: 312.45, change24h: -2.12, marketCap: 980000000000, volume24h: 28000000000, sparkline: sparkline(318, 8, 20), category: ["trending", "losers"], type: "stock" },
];
