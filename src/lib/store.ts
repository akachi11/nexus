import { create } from "zustand";
import { apiFetch, apiPost, apiPatch } from "./api-client";

interface Token {
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
}

interface Wallet {
  id: string;
  name: string;
  address: string;
  totalBalance: number;
  change24h: number;
  tokens: Token[];
  color: string;
}

interface Transaction {
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
  isInternal?: boolean;
}

interface WalletStore {
  wallets: Wallet[];
  transactions: Transaction[];
  activeWalletId: string;
  isLoaded: boolean;

  getActiveWallet: () => Wallet;
  getTotalBalance: () => number;
  getTotalChange: () => number;

  fetchWallets: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  setActiveWalletId: (id: string) => void;

  sendToken: (walletId: string, tokenId: string, amount: number, toAddress: string) => Promise<void>;
  swapTokens: (walletId: string, fromTokenId: string, toTokenId: string, fromAmount: number, toAmount: number) => Promise<void>;
  buyToken: (walletId: string, tokenId: string, amount: number, fiatAmount: number) => Promise<void>;
  sellToken: (walletId: string, tokenId: string, amount: number, fiatAmount: number) => Promise<void>;
  createToken: (tokenData: { walletId: string; name: string; symbol: string; icon: string; color: string; totalSupply: number; description: string }) => Promise<void>;
  addWallet: (data: { name: string; color: string }) => Promise<void>;

  // Admin actions
  approveTransaction: (txId: string) => Promise<void>;
  rejectTransaction: (txId: string) => Promise<void>;
  updateTokenPrice: (tokenId: string, price: number) => Promise<void>;
  fetchAdminTransactions: (status?: string) => Promise<void>;
  fetchAdminTokens: () => Promise<{ id: string; name: string; symbol: string; price: number; balance: number; value: number; isCustom: boolean; wallet: { name: string }; user: { firstName: string; lastName: string } }[]>;
  fetchDashboard: () => Promise<{ stats: { pending: number; approved: number; rejected: number; totalVolume: number }; counts: { users: number; wallets: number; tokens: number; customTokens: number }; recentPending: unknown[] }>;
}

const EMPTY_WALLET: Wallet = {
  id: "",
  name: "Loading...",
  address: "",
  totalBalance: 0,
  change24h: 0,
  tokens: [],
  color: "blue",
};

export const useWalletStore = create<WalletStore>((set, get) => ({
  wallets: [],
  transactions: [],
  activeWalletId: "",
  isLoaded: false,

  getActiveWallet: () => {
    const state = get();
    return state.wallets.find((w) => w.id === state.activeWalletId) ?? state.wallets[0] ?? EMPTY_WALLET;
  },

  getTotalBalance: () => get().wallets.reduce((sum, w) => sum + w.totalBalance, 0),

  getTotalChange: () => {
    const wallets = get().wallets;
    const total = wallets.reduce((sum, w) => sum + w.totalBalance, 0);
    if (total === 0) return 0;
    return wallets.reduce((sum, w) => sum + (w.change24h * w.totalBalance) / total, 0);
  },

  setActiveWalletId: (id) => set({ activeWalletId: id }),

  fetchWallets: async () => {
    const res = await apiFetch<Wallet[]>("/api/wallets");
    if (res.success) {
      const wallets = res.data.map((w) => ({
        ...w,
        change24h: 0,
        tokens: w.tokens.map((t) => ({ ...t })),
      }));
      set((state) => ({
        wallets,
        activeWalletId: state.activeWalletId || wallets[0]?.id || "",
        isLoaded: true,
      }));
    }
  },

  fetchTransactions: async () => {
    const res = await apiFetch<{ transactions: Array<Transaction & { createdAt: string }> }>("/api/transactions?limit=100");
    if (res.success) {
      set({
        transactions: res.data.transactions.map((tx) => ({
          ...tx,
          date: tx.createdAt,
        })),
      });
    }
  },

  sendToken: async (walletId, tokenId, amount, toAddress) => {
    const res = await apiPost("/api/transactions", { type: "send", walletId, tokenId, amount, toAddress });
    if (!res.success) throw new Error(res.error || "Send failed");
    await get().fetchTransactions();
  },

  swapTokens: async (walletId, fromTokenId, toTokenId, fromAmount, toAmount) => {
    const res = await apiPost("/api/transactions", { type: "swap", walletId, fromTokenId, toTokenId, fromAmount, toAmount });
    if (!res.success) throw new Error(res.error || "Swap failed");
    await get().fetchTransactions();
  },

  buyToken: async (walletId, tokenId, amount, fiatAmount) => {
    const res = await apiPost("/api/transactions", { type: "buy", walletId, tokenId, amount, fiatAmount });
    if (!res.success) throw new Error(res.error || "Buy failed");
    await get().fetchTransactions();
  },

  sellToken: async (walletId, tokenId, amount, fiatAmount) => {
    const res = await apiPost("/api/transactions", { type: "sell", walletId, tokenId, amount, fiatAmount });
    if (!res.success) throw new Error(res.error || "Sell failed");
    await get().fetchTransactions();
  },

  createToken: async (tokenData) => {
    const res = await apiPost("/api/tokens", tokenData);
    if (!res.success) throw new Error(res.error || "Token creation failed");
    await get().fetchTransactions();
  },

  addWallet: async (data) => {
    const res = await apiPost("/api/wallets", data);
    if (!res.success) throw new Error(res.error || "Wallet creation failed");
    await get().fetchWallets();
  },

  approveTransaction: async (txId) => {
    const res = await apiPost(`/api/admin/transactions/${txId}/approve`, {});
    if (!res.success) throw new Error(res.error || "Approve failed");
    await Promise.all([get().fetchWallets(), get().fetchTransactions()]);
  },

  rejectTransaction: async (txId) => {
    const res = await apiPost(`/api/admin/transactions/${txId}/reject`, {});
    if (!res.success) throw new Error(res.error || "Reject failed");
    await get().fetchTransactions();
  },

  updateTokenPrice: async (tokenId, price) => {
    const res = await apiPatch(`/api/admin/tokens/${tokenId}`, { price });
    if (!res.success) throw new Error(res.error || "Price update failed");
    await get().fetchWallets();
  },

  fetchAdminTransactions: async (status) => {
    const url = status ? `/api/admin/transactions?status=${status}&limit=100` : "/api/admin/transactions?limit=100";
    const res = await apiFetch<{ transactions: Array<Transaction & { createdAt: string; user?: { firstName: string; lastName: string; email: string }; wallet?: { name: string } }> }>(url);
    if (res.success) {
      set({
        transactions: res.data.transactions.map((tx) => ({
          ...tx,
          date: tx.createdAt,
          walletId: typeof tx.wallet === "object" ? (tx.wallet as { _id?: string })?.["_id"] || "" : (tx.walletId || ""),
        })),
      });
    }
  },

  fetchAdminTokens: async () => {
    const res = await apiFetch<Array<{
      id: string; name: string; symbol: string; icon: string; price: number;
      change24h: number; balance: number; value: number; color: string;
      isCustom: boolean; totalSupply: number;
      wallet: { name: string }; user: { firstName: string; lastName: string };
    }>>("/api/admin/tokens");
    if (res.success) return res.data;
    return [];
  },

  fetchDashboard: async () => {
    const res = await apiFetch<{
      stats: { pending: number; approved: number; rejected: number; totalVolume: number };
      counts: { users: number; wallets: number; tokens: number; customTokens: number };
      recentPending: unknown[];
    }>("/api/admin/dashboard");
    if (res.success) return res.data;
    return { stats: { pending: 0, approved: 0, rejected: 0, totalVolume: 0 }, counts: { users: 0, wallets: 0, tokens: 0, customTokens: 0 }, recentPending: [] };
  },
}));
