"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save, Plus, X, ChevronDown, Wallet, Shield, User as UserIcon } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/components/auth-provider";
import { apiFetch, apiPatch, apiPost } from "@/lib/api-client";
import { formatCurrency } from "@/components/format";
import { cn } from "@/lib/utils";
import { CryptoIcon } from "@/components/crypto-icons";

interface TokenRow {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  price: number;
  balance: number;
  value: number;
  color: string;
  isCustom: boolean;
}

interface WalletRow {
  id: string;
  name: string;
  address: string;
  color: string;
  totalBalance: number;
  tokens: TokenRow[];
}

interface UserDetail {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "user" | "admin";
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
}

interface AvailableToken {
  name: string;
  symbol: string;
  icon: string;
  price: number;
  color: string;
  isCustom: boolean;
}

export default function AdminUserDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user: admin } = useAuth();

  const [userData, setUserData] = useState<UserDetail | null>(null);
  const [wallets, setWallets] = useState<WalletRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingToken, setEditingToken] = useState<string | null>(null);
  const [editBalance, setEditBalance] = useState("");
  const [saving, setSaving] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [showAddToken, setShowAddToken] = useState(false);
  const [addWalletId, setAddWalletId] = useState("");
  const [availableTokens, setAvailableTokens] = useState<AvailableToken[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [selectedSymbol, setSelectedSymbol] = useState("");
  const [addBalance, setAddBalance] = useState("");
  const [addingSaving, setAddingSaving] = useState(false);

  const fetchUser = async () => {
    const res = await apiFetch<{ user: UserDetail; wallets: WalletRow[] }>(
      `/api/admin/users/${id}`
    );
    if (res.success) {
      setUserData(res.data.user);
      setWallets(res.data.wallets);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!admin || admin.role !== "admin") return;
    fetchUser();
  }, [admin, id]);

  const handleSaveBalance = async (tokenId: string) => {
    const newBalance = parseFloat(editBalance);
    if (isNaN(newBalance) || newBalance < 0) {
      setMessage({ type: "error", text: "Balance must be a non-negative number" });
      return;
    }

    setSaving(tokenId);
    const res = await apiPatch(`/api/admin/users/${id}/tokens/${tokenId}`, {
      balance: newBalance,
    });

    if (res.success) {
      setMessage({ type: "success", text: `Balance updated to ${newBalance}` });
      setEditingToken(null);
      await fetchUser();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to update balance" });
    }
    setSaving(null);
    setTimeout(() => setMessage(null), 3000);
  };

  const handleOpenAddToken = async (walletId: string) => {
    setAddWalletId(walletId);
    setShowAddToken(true);
    setSelectedSymbol("");
    setAddBalance("");
    setLoadingAvailable(true);

    const res = await apiFetch<AvailableToken[]>(
      `/api/admin/users/${id}/tokens`
    );
    if (res.success) {
      setAvailableTokens(res.data);
      if (res.data.length > 0) setSelectedSymbol(res.data[0].symbol);
    }
    setLoadingAvailable(false);
  };

  const handleAddToken = async () => {
    if (!selectedSymbol || !addWalletId) return;
    const bal = parseFloat(addBalance) || 0;

    setAddingSaving(true);
    const res = await apiPost(`/api/admin/users/${id}/tokens`, {
      walletId: addWalletId,
      symbol: selectedSymbol,
      balance: bal,
    });

    if (res.success) {
      setMessage({ type: "success", text: `${selectedSymbol} added successfully` });
      setShowAddToken(false);
      await fetchUser();
    } else {
      setMessage({ type: "error", text: res.error || "Failed to add token" });
    }
    setAddingSaving(false);
    setTimeout(() => setMessage(null), 3000);
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 pt-20">
        <p className="text-muted-foreground">User not found</p>
        <button onClick={() => router.back()} className="text-primary">
          Go back
        </button>
      </div>
    );
  }

  const totalPortfolio = wallets.reduce((s, w) => s + w.totalBalance, 0);

  return (
    <div className="flex flex-col gap-6 px-4 pt-6 pb-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">
            {userData.firstName} {userData.lastName}
          </h1>
          <p className="truncate text-sm text-muted-foreground">{userData.email}</p>
        </div>
        <div
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            userData.role === "admin"
              ? "bg-primary/15 text-primary"
              : "bg-secondary text-muted-foreground"
          )}
        >
          {userData.role === "admin" ? (
            <Shield className="h-5 w-5" />
          ) : (
            <UserIcon className="h-5 w-5" />
          )}
        </div>
      </div>

      {/* Toast */}
      {message && (
        <div
          className={cn(
            "rounded-lg px-4 py-2 text-sm font-medium",
            message.type === "success"
              ? "bg-[oklch(0.72_0.19_155/0.15)] text-[oklch(0.72_0.19_155)]"
              : "bg-destructive/15 text-destructive"
          )}
        >
          {message.text}
        </div>
      )}

      {/* User Info Card */}
      <div className="rounded-xl bg-card p-4">
        <h3 className="mb-3 text-sm font-semibold text-muted-foreground">Account Info</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <span className="font-medium capitalize">{userData.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span
              className={cn(
                "font-medium",
                userData.isActive ? "text-[oklch(0.72_0.19_155)]" : "text-destructive"
              )}
            >
              {userData.isActive ? "Active" : "Disabled"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Portfolio Value</span>
            <span className="font-bold">{formatCurrency(totalPortfolio)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Wallets</span>
            <span className="font-medium">{wallets.length}</span>
          </div>
        </div>
      </div>

      {/* Wallets & Tokens */}
      {wallets.map((wallet) => (
        <div key={wallet.id} className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: wallet.color }}
              >
                {wallet.name[0]}
              </div>
              <div>
                <p className="text-sm font-semibold">{wallet.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatCurrency(wallet.totalBalance)}
                </p>
              </div>
            </div>
            <button
              onClick={() => handleOpenAddToken(wallet.id)}
              className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary/20"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Token
            </button>
          </div>

          <div className="flex flex-col gap-2">
            {wallet.tokens.map((token) => (
              <div
                key={token.id}
                className="rounded-xl bg-card p-4"
              >
                <div className="flex items-center gap-3">
                  <CryptoIcon
                    symbol={token.symbol}
                    size={40}
                    fallbackColor={token.color}
                    fallbackIcon={token.icon}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="font-medium">{token.name}</p>
                      {token.isCustom && (
                        <span className="rounded-full bg-primary/15 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          Custom
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(token.price)} per {token.symbol}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(token.value)}</p>
                    <p className="text-xs text-muted-foreground">
                      {token.balance} {token.symbol}
                    </p>
                  </div>
                </div>

                {editingToken === token.id ? (
                  <div className="mt-3 flex items-center gap-2 border-t border-border pt-3">
                    <input
                      type="number"
                      value={editBalance}
                      onChange={(e) => setEditBalance(e.target.value)}
                      placeholder="New balance"
                      min="0"
                      step="any"
                      className="flex-1 rounded-lg bg-secondary px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                    />
                    <span className="text-xs font-medium text-muted-foreground">
                      {token.symbol}
                    </span>
                    <button
                      onClick={() => handleSaveBalance(token.id)}
                      disabled={saving === token.id}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white transition-colors hover:bg-primary/90"
                    >
                      {saving === token.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                    </button>
                    <button
                      onClick={() => setEditingToken(null)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary text-muted-foreground transition-colors hover:bg-accent"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      setEditingToken(token.id);
                      setEditBalance(token.balance.toString());
                    }}
                    className="mt-3 w-full rounded-lg border border-border py-2 text-xs font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  >
                    Edit Balance
                  </button>
                )}
              </div>
            ))}

            {wallet.tokens.length === 0 && (
              <div className="rounded-xl bg-card p-6 text-center">
                <Wallet className="mx-auto h-8 w-8 text-muted-foreground/30" />
                <p className="mt-2 text-sm text-muted-foreground">No tokens in this wallet</p>
              </div>
            )}
          </div>
        </div>
      ))}

      {/* Add Token Modal */}
      {showAddToken && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 sm:items-center">
          <div className="w-full max-w-md rounded-t-2xl bg-background p-6 sm:rounded-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Add Token</h3>
              <button
                onClick={() => setShowAddToken(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {loadingAvailable ? (
              <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            ) : availableTokens.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">
                  This wallet already has all available tokens
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {/* Token Picker */}
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">
                    Token
                  </label>
                  <div className="relative">
                    <select
                      value={selectedSymbol}
                      onChange={(e) => setSelectedSymbol(e.target.value)}
                      className="w-full appearance-none rounded-xl bg-card p-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      {availableTokens.map((t) => (
                        <option key={t.symbol} value={t.symbol}>
                          {t.name} ({t.symbol}){t.isCustom ? " — Custom" : ""}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  </div>
                </div>

                {/* Selected token preview */}
                {selectedSymbol && (() => {
                  const sel = availableTokens.find((t) => t.symbol === selectedSymbol);
                  if (!sel) return null;
                  return (
                    <div className="flex items-center gap-3 rounded-xl bg-secondary/50 p-3">
                      <CryptoIcon
                        symbol={sel.symbol}
                        size={36}
                        fallbackColor={sel.color}
                        fallbackIcon={sel.icon}
                      />
                      <div>
                        <p className="text-sm font-medium">{sel.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(sel.price)} per {sel.symbol}
                        </p>
                      </div>
                    </div>
                  );
                })()}

                {/* Balance */}
                <div>
                  <label className="mb-1.5 block text-sm text-muted-foreground">
                    Initial Balance
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={addBalance}
                      onChange={(e) => setAddBalance(e.target.value)}
                      placeholder="0"
                      min="0"
                      step="any"
                      className="w-full rounded-xl bg-card p-3 pr-16 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-muted-foreground">
                      {selectedSymbol}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAddToken}
                  disabled={!selectedSymbol || addingSaving}
                  className={cn(
                    "flex items-center justify-center gap-2 rounded-xl py-3 font-semibold transition-all",
                    selectedSymbol && !addingSaving
                      ? "bg-primary text-white active:scale-[0.98]"
                      : "bg-secondary text-muted-foreground"
                  )}
                >
                  {addingSaving ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : (
                    <Plus className="h-5 w-5" />
                  )}
                  Add Token
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
