export interface Token {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  price: number;
  change24h: number;
  balance: number;
  value: number;
  color: string;
  isCustom?: boolean;
  totalSupply?: number;
  description?: string;
  createdAt?: string;
}

export interface Wallet {
  id: string;
  name: string;
  address: string;
  totalBalance: number;
  change24h: number;
  tokens: Token[];
  color: string;
}

export interface Transaction {
  id: string;
  type: "send" | "receive" | "swap" | "create" | "sell";
  token: string;
  tokenSymbol: string;
  amount: number;
  value: number;
  address: string;
  date: string;
  status: "completed" | "pending" | "failed";
  walletId: string;
  tokenId?: string;
  fromTokenId?: string;
  toTokenId?: string;
  toAmount?: number;
  fiatAmount?: number;
  tokenData?: Token;
}

export interface MarketAsset {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  sparkline: number[];
  category: string[];
  type: "crypto" | "stock";
}

export type MarketCategory =
  | "all"
  | "trending"
  | "top"
  | "gainers"
  | "losers"
  | "defi"
  | "nft"
  | "layer1"
  | "layer2"
  | "meme";

export type StockSector = "all" | "tech" | "etf" | "finance" | "healthcare" | "consumer" | "energy";

export type AssetType = "all" | "crypto" | "stock";
