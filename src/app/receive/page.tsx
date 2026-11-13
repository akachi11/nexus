"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Copy, Check, Share2, ChevronDown, QrCode } from "lucide-react";
import { useState, useCallback, useEffect } from "react";
import { useWalletStore } from "@/lib/store";
import { formatCurrency, formatTokenAmount } from "@/components/format";
import { cn } from "@/lib/utils";
import { CryptoIcon } from "@/components/crypto-icons";
import { useLivePrices } from "@/hooks/use-market-data";
import { usePageTransition } from "@/hooks/use-gsap";

const NETWORKS = [
  { id: "ethereum", name: "Ethereum", symbol: "ETH", fee: "~$2.50" },
  { id: "bsc", name: "BNB Smart Chain", symbol: "BNB", fee: "~$0.10" },
  { id: "solana", name: "Solana", symbol: "SOL", fee: "~$0.01" },
  { id: "polygon", name: "Polygon", symbol: "MATIC", fee: "~$0.02" },
  { id: "arbitrum", name: "Arbitrum", symbol: "ARB", fee: "~$0.15" },
];

function QRCodeSVG({ value, size }: { value: string; size: number }) {
  const cells = 21;
  const cellSize = size / (cells + 2);
  const offset = cellSize;

  const hash = (s: string, i: number) => {
    let h = 0;
    for (let j = 0; j < s.length; j++) h = ((h << 5) - h + s.charCodeAt(j) + i * 7) | 0;
    return h;
  };

  const grid: boolean[][] = [];
  for (let r = 0; r < cells; r++) {
    grid[r] = [];
    for (let c = 0; c < cells; c++) {
      const inFinderTL = r < 7 && c < 7;
      const inFinderTR = r < 7 && c >= cells - 7;
      const inFinderBL = r >= cells - 7 && c < 7;
      if (inFinderTL || inFinderTR || inFinderBL) {
        const lr = inFinderBL ? r - (cells - 7) : r;
        const lc = inFinderTR ? c - (cells - 7) : c;
        grid[r][c] = lr === 0 || lr === 6 || lc === 0 || lc === 6 || (lr >= 2 && lr <= 4 && lc >= 2 && lc <= 4);
      } else {
        grid[r][c] = (hash(value, r * cells + c) & 3) === 0;
      }
    }
  }

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="white" rx="8" />
      {grid.map((row, r) =>
        row.map((filled, c) =>
          filled ? (
            <rect
              key={`${r}-${c}`}
              x={offset + c * cellSize}
              y={offset + r * cellSize}
              width={cellSize}
              height={cellSize}
              fill="#000"
              rx={1}
            />
          ) : null
        )
      )}
    </svg>
  );
}

export default function ReceivePage() {
  const router = useRouter();
  const animScope = usePageTransition();
  const { wallets, activeWalletId, isLoaded, fetchWallets } = useWalletStore();

  useEffect(() => {
    if (!isLoaded) fetchWallets();
  }, [isLoaded, fetchWallets]);
  const priceMap = useLivePrices();
  const wallet = wallets.find((w) => w.id === activeWalletId) ?? wallets[0];
  const tokens = wallet?.tokens ?? [];
  const walletAddress = wallet?.address ?? "";

  const [selectedTokenId, setSelectedTokenId] = useState(tokens[0]?.id ?? "");
  const [selectedNetworkId, setSelectedNetworkId] = useState(NETWORKS[0].id);
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [showNetworkPicker, setShowNetworkPicker] = useState(false);
  const [copied, setCopied] = useState(false);

  const selectedToken = tokens.find((t) => t.id === selectedTokenId);
  const selectedNetwork = NETWORKS.find((n) => n.id === selectedNetworkId) ?? NETWORKS[0];

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(walletAddress);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [walletAddress]);

  const handleShare = useCallback(async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Receive ${selectedToken?.symbol ?? "crypto"}`,
        text: `Send ${selectedToken?.symbol ?? "crypto"} to: ${walletAddress}`,
      });
    } else {
      handleCopy();
    }
  }, [selectedToken, walletAddress, handleCopy]);

  if (!wallet) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div ref={animScope} className="flex flex-col gap-5 px-4 pt-6 pb-24">
      <div data-anim="header" className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Receive</h1>
      </div>

      {/* Token Picker */}
      <div data-anim="form">
        <label className="mb-2 block text-sm text-muted-foreground">Asset</label>
        <button
          onClick={() => { setShowTokenPicker(!showTokenPicker); setShowNetworkPicker(false); }}
          className="flex w-full items-center gap-3 rounded-xl bg-card p-4"
        >
          {selectedToken && (
            <>
              <CryptoIcon symbol={selectedToken.symbol} size={40} fallbackColor={selectedToken.color} fallbackIcon={selectedToken.icon} />
              <div className="flex-1 text-left">
                <p className="font-medium">{selectedToken.name}</p>
                <p className="text-sm text-muted-foreground">{selectedToken.symbol}</p>
              </div>
            </>
          )}
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", showTokenPicker && "rotate-180")} />
        </button>
        {showTokenPicker && (
          <div className="mt-2 flex flex-col gap-1 rounded-xl bg-card p-2">
            {tokens.map((t) => {
              const tp = priceMap[t.symbol.toUpperCase()]?.price ?? t.price;
              return (
                <button
                  key={t.id}
                  onClick={() => { setSelectedTokenId(t.id); setShowTokenPicker(false); }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg p-3 text-left transition-colors",
                    t.id === selectedTokenId ? "bg-primary/10" : "hover:bg-accent"
                  )}
                >
                  <CryptoIcon symbol={t.symbol} size={32} fallbackColor={t.color} fallbackIcon={t.icon} />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{formatTokenAmount(t.balance)} {t.symbol}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{formatCurrency(t.balance * tp)}</p>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Network Picker */}
      <div data-anim="form">
        <label className="mb-2 block text-sm text-muted-foreground">Network</label>
        <button
          onClick={() => { setShowNetworkPicker(!showNetworkPicker); setShowTokenPicker(false); }}
          className="flex w-full items-center gap-3 rounded-xl bg-card p-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <QrCode className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">{selectedNetwork.name}</p>
            <p className="text-sm text-muted-foreground">Fee: {selectedNetwork.fee}</p>
          </div>
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", showNetworkPicker && "rotate-180")} />
        </button>
        {showNetworkPicker && (
          <div className="mt-2 flex flex-col gap-1 rounded-xl bg-card p-2">
            {NETWORKS.map((n) => (
              <button
                key={n.id}
                onClick={() => { setSelectedNetworkId(n.id); setShowNetworkPicker(false); }}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-3 text-left transition-colors",
                  n.id === selectedNetworkId ? "bg-primary/10" : "hover:bg-accent"
                )}
              >
                <div className="flex-1">
                  <p className="text-sm font-medium">{n.name}</p>
                  <p className="text-xs text-muted-foreground">{n.symbol} · Fee: {n.fee}</p>
                </div>
                {n.id === selectedNetworkId && (
                  <div className="h-2 w-2 rounded-full bg-primary" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* QR Code */}
      <div data-anim="card" className="flex flex-col items-center gap-4 rounded-2xl bg-card p-6">
        <p className="text-sm text-muted-foreground">
          Scan to send {selectedToken?.symbol ?? "crypto"} on {selectedNetwork.name}
        </p>
        <div className="rounded-xl bg-white p-3">
          <QRCodeSVG value={wallet.address} size={200} />
        </div>
      </div>

      {/* Address */}
      <div data-anim="card" className="rounded-xl bg-card p-4">
        <p className="mb-2 text-sm text-muted-foreground">Your {selectedNetwork.name} Address</p>
        <p className="break-all font-mono text-sm">{wallet.address}</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleCopy}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 font-semibold transition-all active:scale-[0.98]",
            copied ? "bg-[oklch(0.72_0.19_155/0.15)] text-[oklch(0.72_0.19_155)]" : "gradient-primary text-white"
          )}
        >
          {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
          {copied ? "Copied!" : "Copy Address"}
        </button>
        <button
          onClick={handleShare}
          className="flex items-center justify-center gap-2 rounded-2xl bg-card px-6 py-4 font-semibold transition-all active:scale-[0.98]"
        >
          <Share2 className="h-5 w-5" />
        </button>
      </div>

      {/* Warning */}
      <div className="flex items-start gap-2 rounded-xl bg-[oklch(0.8_0.15_85/0.1)] p-3">
        <p className="text-xs text-[oklch(0.8_0.15_85)]">
          Only send {selectedToken?.symbol ?? "tokens"} on the {selectedNetwork.name} network. Sending on the wrong network may result in permanent loss.
        </p>
      </div>
    </div>
  );
}
