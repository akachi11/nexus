"use client";

import { Coins, Save, X, Pencil, Loader2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useWalletStore } from "@/lib/store";
import { useAuth } from "@/components/auth-provider";
import { useRouter } from "next/navigation";
import { formatCurrency, formatTokenAmount } from "@/components/format";
import { cn } from "@/lib/utils";
import { CryptoIcon } from "@/components/crypto-icons";

interface AdminToken {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  price: number;
  balance: number;
  value: number;
  color: string;
  isCustom: boolean;
  totalSupply?: number;
  wallet: { name: string };
  user: { firstName: string; lastName: string };
}

interface EditingState {
  tokenId: string;
  price: string;
}

export default function AdminTokensPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { updateTokenPrice, fetchAdminTokens } = useWalletStore();
  const [tokens, setTokens] = useState<AdminToken[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<EditingState | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "custom">("all");

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") {
      router.replace(process.env.NEXT_PUBLIC_APP_MODE === "admin" ? "/login" : "/");
      return;
    }
    loadTokens();
  }, [user]);

  const loadTokens = async () => {
    const data = await fetchAdminTokens();
    setTokens(data as AdminToken[]);
    setLoading(false);
  };

  const filtered = filter === "custom"
    ? tokens.filter((t) => t.isCustom)
    : tokens;

  const handleEdit = (token: AdminToken) => {
    setEditing({
      tokenId: token.id,
      price: token.price.toString(),
    });
  };

  const handleSave = async () => {
    if (!editing) return;
    const price = parseFloat(editing.price);
    if (isNaN(price) || price < 0) return;
    try {
      await updateTokenPrice(editing.tokenId, price);
      setSavedId(editing.tokenId);
      setEditing(null);
      setTimeout(() => setSavedId(null), 2000);
      loadTokens();
    } catch { /* error thrown by store */ }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 px-4 pt-6">
      <div>
        <h2 className="text-lg font-semibold">Token Management</h2>
        <p className="text-sm text-muted-foreground">View and edit token prices and details</p>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {(["all", "custom"] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "rounded-full px-4 py-2 text-sm font-medium transition-colors capitalize",
              filter === f
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground hover:text-foreground"
            )}
          >
            {f === "all" ? `All (${tokens.length})` : `Custom (${tokens.filter((t) => t.isCustom).length})`}
          </button>
        ))}
      </div>

      {/* Tokens List */}
      {filtered.length === 0 ? (
        <div className="rounded-xl bg-card p-12 text-center">
          <Coins className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <p className="mt-2 text-sm text-muted-foreground">
            {filter === "custom" ? "No custom tokens created yet" : "No tokens found"}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((token) => {
            const isEditing = editing?.tokenId === token.id;
            const justSaved = savedId === token.id;

            return (
              <div
                key={token.id}
                className={cn(
                  "rounded-xl bg-card p-4 transition-all",
                  justSaved && "ring-2 ring-[oklch(0.72_0.19_155)]"
                )}
              >
                <div className="flex items-center gap-3">
                  <CryptoIcon symbol={token.symbol} size={44} fallbackColor={token.color} fallbackIcon={token.icon} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{token.name}</p>
                      <span className="text-xs text-muted-foreground">{token.symbol}</span>
                      {token.isCustom && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">Custom</span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {token.wallet?.name} · {token.user?.firstName} {token.user?.lastName}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{formatCurrency(token.price)}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTokenAmount(token.balance)} {token.symbol}
                    </p>
                  </div>
                </div>

                {/* Token Details */}
                <div className="mt-3 rounded-lg bg-secondary/50 p-3">
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Balance:</span>
                      <span className="ml-1 font-medium">{formatTokenAmount(token.balance)}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Value:</span>
                      <span className="ml-1 font-medium">{formatCurrency(token.value)}</span>
                    </div>
                    {token.totalSupply != null && (
                      <div>
                        <span className="text-muted-foreground">Supply:</span>
                        <span className="ml-1 font-medium">{token.totalSupply.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Edit Section */}
                {isEditing ? (
                  <div className="mt-3 flex flex-col gap-3">
                    <div>
                      <label className="mb-1 block text-xs text-muted-foreground">Price (USD)</label>
                      <input
                        type="number"
                        value={editing.price}
                        onChange={(e) => setEditing({ ...editing, price: e.target.value })}
                        step="0.01"
                        min="0"
                        className="w-full rounded-lg bg-secondary p-3 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={handleSave}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[oklch(0.72_0.19_155)] py-2.5 text-sm font-semibold text-white transition-all active:scale-[0.98]"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </button>
                      <button
                        onClick={() => setEditing(null)}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-secondary py-2.5 text-sm font-semibold transition-all active:scale-[0.98]"
                      >
                        <X className="h-4 w-4" />
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEdit(token)}
                    className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-secondary py-2.5 text-sm font-medium transition-colors hover:bg-accent active:scale-[0.98]"
                  >
                    <Pencil className="h-4 w-4" />
                    Edit Price
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
