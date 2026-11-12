import { create } from "zustand";
import { Wallet, Transaction, Token } from "./types";
import { wallets as initialWallets, transactions as initialTransactions } from "./mock-data";

interface WalletStore {
  wallets: Wallet[];
  transactions: Transaction[];
  activeWalletId: string;

  getActiveWallet: () => Wallet;
  getTotalBalance: () => number;
  getTotalChange: () => number;

  addWallet: (wallet: Wallet) => void;
  addTransaction: (tx: Transaction) => void;
  createToken: (token: Token, walletId: string) => void;
  sendToken: (walletId: string, tokenId: string, amount: number, toAddress: string) => void;
  swapTokens: (walletId: string, fromTokenId: string, toTokenId: string, fromAmount: number, toAmount: number) => void;
  buyToken: (walletId: string, tokenId: string, amount: number, fiatAmount: number) => void;
  sellToken: (walletId: string, tokenId: string, amount: number, fiatAmount: number) => void;

  approveTransaction: (txId: string) => void;
  rejectTransaction: (txId: string) => void;
  updateTokenPrice: (walletId: string, tokenId: string, price: number) => void;
}

export const useWalletStore = create<WalletStore>((set, get) => ({
  wallets: initialWallets,
  transactions: initialTransactions,
  activeWalletId: "main",

  getActiveWallet: () => {
    const state = get();
    return state.wallets.find((w) => w.id === state.activeWalletId) ?? state.wallets[0];
  },

  getTotalBalance: () => get().wallets.reduce((sum, w) => sum + w.totalBalance, 0),

  getTotalChange: () => {
    const wallets = get().wallets;
    const total = wallets.reduce((sum, w) => sum + w.totalBalance, 0);
    if (total === 0) return 0;
    return wallets.reduce((sum, w) => sum + (w.change24h * w.totalBalance) / total, 0);
  },

  addWallet: (wallet) =>
    set((state) => ({ wallets: [...state.wallets, wallet] })),

  addTransaction: (tx) =>
    set((state) => ({ transactions: [tx, ...state.transactions] })),

  createToken: (token, walletId) =>
    set((state) => {
      const tx: Transaction = {
        id: `t-${Date.now()}`,
        type: "create",
        token: token.name,
        tokenSymbol: token.symbol,
        amount: token.totalSupply ?? 0,
        value: 0,
        address: "Contract",
        date: new Date().toISOString(),
        status: "pending",
        walletId,
        tokenData: token,
      };
      return {
        transactions: [tx, ...state.transactions],
      };
    }),

  sendToken: (walletId, tokenId, amount, toAddress) =>
    set((state) => {
      const wallet = state.wallets.find((w) => w.id === walletId);
      const token = wallet?.tokens.find((t) => t.id === tokenId);
      if (!wallet || !token) return state;

      const tx: Transaction = {
        id: `t-${Date.now()}`,
        type: "send",
        token: token.name,
        tokenSymbol: token.symbol,
        amount,
        value: amount * token.price,
        address: toAddress,
        date: new Date().toISOString(),
        status: "pending",
        walletId,
        tokenId,
      };

      return {
        transactions: [tx, ...state.transactions],
      };
    }),

  swapTokens: (walletId, fromTokenId, toTokenId, fromAmount, toAmount) =>
    set((state) => {
      const wallet = state.wallets.find((w) => w.id === walletId);
      const fromToken = wallet?.tokens.find((t) => t.id === fromTokenId);
      const toToken = wallet?.tokens.find((t) => t.id === toTokenId);
      if (!wallet || !fromToken || !toToken) return state;

      const tx: Transaction = {
        id: `t-${Date.now()}`,
        type: "swap",
        token: `${fromToken.symbol} → ${toToken.symbol}`,
        tokenSymbol: toToken.symbol,
        amount: toAmount,
        value: fromAmount * fromToken.price,
        address: "DEX",
        date: new Date().toISOString(),
        status: "pending",
        walletId,
        fromTokenId,
        toTokenId,
        toAmount,
      };

      return {
        transactions: [tx, ...state.transactions],
      };
    }),

  buyToken: (walletId, tokenId, amount, fiatAmount) =>
    set((state) => {
      const wallet = state.wallets.find((w) => w.id === walletId);
      const token = wallet?.tokens.find((t) => t.id === tokenId);
      if (!wallet || !token) return state;

      const tx: Transaction = {
        id: `t-${Date.now()}`,
        type: "receive",
        token: token.name,
        tokenSymbol: token.symbol,
        amount,
        value: fiatAmount,
        address: "Purchase",
        date: new Date().toISOString(),
        status: "pending",
        walletId,
        tokenId,
        fiatAmount,
      };

      return {
        transactions: [tx, ...state.transactions],
      };
    }),

  sellToken: (walletId, tokenId, amount, fiatAmount) =>
    set((state) => {
      const wallet = state.wallets.find((w) => w.id === walletId);
      const token = wallet?.tokens.find((t) => t.id === tokenId);
      if (!wallet || !token) return state;

      const tx: Transaction = {
        id: `t-${Date.now()}`,
        type: "sell",
        token: token.name,
        tokenSymbol: token.symbol,
        amount,
        value: fiatAmount,
        address: "Sale",
        date: new Date().toISOString(),
        status: "pending",
        walletId,
        tokenId,
        fiatAmount,
      };

      return {
        transactions: [tx, ...state.transactions],
      };
    }),

  approveTransaction: (txId) =>
    set((state) => {
      const tx = state.transactions.find((t) => t.id === txId);
      if (!tx || tx.status !== "pending") return state;

      let updatedWallets = state.wallets;

      if (tx.type === "send" && tx.tokenId) {
        updatedWallets = state.wallets.map((w) =>
          w.id === tx.walletId
            ? {
                ...w,
                tokens: w.tokens.map((t) =>
                  t.id === tx.tokenId
                    ? { ...t, balance: t.balance - tx.amount, value: (t.balance - tx.amount) * t.price }
                    : t
                ),
                totalBalance: w.totalBalance - tx.value,
              }
            : w
        );
      } else if (tx.type === "receive" && tx.tokenId) {
        updatedWallets = state.wallets.map((w) =>
          w.id === tx.walletId
            ? {
                ...w,
                tokens: w.tokens.map((t) =>
                  t.id === tx.tokenId
                    ? { ...t, balance: t.balance + tx.amount, value: (t.balance + tx.amount) * t.price }
                    : t
                ),
                totalBalance: w.totalBalance + (tx.fiatAmount ?? tx.value),
              }
            : w
        );
      } else if (tx.type === "swap" && tx.fromTokenId && tx.toTokenId && tx.toAmount) {
        const wallet = state.wallets.find((w) => w.id === tx.walletId);
        const fromToken = wallet?.tokens.find((t) => t.id === tx.fromTokenId);
        if (fromToken) {
          const fromAmount = tx.value / fromToken.price;
          updatedWallets = state.wallets.map((w) =>
            w.id === tx.walletId
              ? {
                  ...w,
                  tokens: w.tokens.map((t) => {
                    if (t.id === tx.fromTokenId) return { ...t, balance: t.balance - fromAmount, value: (t.balance - fromAmount) * t.price };
                    if (t.id === tx.toTokenId) return { ...t, balance: t.balance + tx.toAmount!, value: (t.balance + tx.toAmount!) * t.price };
                    return t;
                  }),
                }
              : w
          );
        }
      } else if (tx.type === "sell" && tx.tokenId) {
        updatedWallets = state.wallets.map((w) =>
          w.id === tx.walletId
            ? {
                ...w,
                tokens: w.tokens.map((t) =>
                  t.id === tx.tokenId
                    ? { ...t, balance: t.balance - tx.amount, value: (t.balance - tx.amount) * t.price }
                    : t
                ),
                totalBalance: w.totalBalance - tx.value,
              }
            : w
        );
      } else if (tx.type === "create" && tx.tokenData) {
        updatedWallets = state.wallets.map((w) =>
          w.id === tx.walletId
            ? { ...w, tokens: [...w.tokens, tx.tokenData!] }
            : w
        );
      }

      return {
        wallets: updatedWallets,
        transactions: state.transactions.map((t) =>
          t.id === txId ? { ...t, status: "completed" as const } : t
        ),
      };
    }),

  rejectTransaction: (txId) =>
    set((state) => ({
      transactions: state.transactions.map((t) =>
        t.id === txId && t.status === "pending"
          ? { ...t, status: "failed" as const }
          : t
      ),
    })),

  updateTokenPrice: (walletId, tokenId, price) =>
    set((state) => ({
      wallets: state.wallets.map((w) =>
        w.id === walletId
          ? {
              ...w,
              tokens: w.tokens.map((t) =>
                t.id === tokenId
                  ? { ...t, price, value: t.balance * price }
                  : t
              ),
            }
          : w
      ),
    })),
}));
