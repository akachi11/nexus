"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronDown, Loader2, CheckCircle2, AlertCircle, TrendingDown, Building2, CreditCard } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useWalletStore } from "@/lib/store";
import { useLivePrices } from "@/hooks/use-market-data";
import { formatCurrency, formatTokenAmount } from "@/components/format";
import { cn } from "@/lib/utils";
import { CryptoIcon } from "@/components/crypto-icons";
import { usePageTransition } from "@/hooks/use-gsap";

type Step = "form" | "confirm" | "processing" | "success" | "error";

const PAYOUT_METHODS = [
  { id: "bank", name: "Bank Transfer", icon: Building2, fee: "1.0%" },
  { id: "card", name: "Debit Card", icon: CreditCard, fee: "1.5%" },
];

export default function SellPage() {
  const router = useRouter();
  const animScope = usePageTransition();
  const searchParams = useSearchParams();
  const preselectedToken = searchParams.get("token");

  const { wallets, activeWalletId, sellToken, isLoaded, fetchWallets } = useWalletStore();
  const priceMap = useLivePrices();
  const wallet = wallets.find((w) => w.id === activeWalletId) ?? wallets[0];
  const tokens = wallet?.tokens ?? [];

  const [selectedTokenId, setSelectedTokenId] = useState(preselectedToken ?? tokens[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [payoutMethodId, setPayoutMethodId] = useState(PAYOUT_METHODS[0].id);
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [showPayoutPicker, setShowPayoutPicker] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!isLoaded) fetchWallets();
    setStep("form");
    setAmount("");
    setTouched(false);
  }, []);

  const selectedToken = tokens.find((t) => t.id === selectedTokenId);
  const payoutMethod = PAYOUT_METHODS.find((p) => p.id === payoutMethodId) ?? PAYOUT_METHODS[0];

  const livePrice = selectedToken ? (priceMap[selectedToken.symbol.toUpperCase()]?.price ?? selectedToken.price) : 0;
  const rawNum = parseFloat(amount) || 0;
  const feePercent = payoutMethodId === "bank" ? 1.0 : 1.5;
  const grossValue = rawNum * livePrice;
  const fee = grossValue * (feePercent / 100);
  const networkFee = 2.50;
  const netPayout = Math.max(0, grossValue - fee - networkFee);

  const errors = useMemo(() => {
    const e: { amount?: string } = {};
    if (touched && !amount) e.amount = "Enter an amount";
    else if (touched && rawNum <= 0) e.amount = "Amount must be greater than 0";
    else if (touched && selectedToken && rawNum > selectedToken.balance) e.amount = "Insufficient balance";
    return e;
  }, [amount, rawNum, selectedToken, touched]);

  const canSell = selectedToken && rawNum > 0 && rawNum <= selectedToken.balance && !errors.amount;

  const handleConfirm = () => {
    if (!canSell) return;
    setStep("confirm");
  };

  const handleSell = async () => {
    if (!canSell || !selectedToken) return;
    setStep("processing");
    await new Promise((r) => setTimeout(r, 3000));
    try {
      await sellToken(wallet.id, selectedTokenId, rawNum, netPayout);
      setStep("success");
      setTimeout(() => router.replace("/"), 2500);
    } catch {
      setStep("error");
    }
  };

  if (!wallet) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (step === "success") {
    return (
      <div ref={animScope} className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4">
        <div data-anim="result-icon" className="flex h-20 w-20 items-center justify-center rounded-full bg-[oklch(0.72_0.19_155/0.15)]">
          <CheckCircle2 className="h-10 w-10 text-[oklch(0.72_0.19_155)]" />
        </div>
        <h2 data-anim="result-text" className="text-xl font-bold">Request Submitted Successfully</h2>
        <p data-anim="result-text" className="text-center text-muted-foreground">
          Your request to sell {formatTokenAmount(rawNum)} {selectedToken?.symbol} is being reviewed
        </p>
        <p data-anim="result-text" className="text-sm text-muted-foreground">Redirecting to home...</p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/15">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-bold">Request Failed</h2>
        <p className="text-center text-muted-foreground">Something went wrong. Please try again.</p>
        <button onClick={() => setStep("form")} className="mt-4 rounded-2xl bg-card px-6 py-3 font-medium">
          Try Again
        </button>
      </div>
    );
  }

  if (step === "processing") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <h2 className="text-xl font-bold">Submitting Request...</h2>
        <p className="text-center text-muted-foreground">
          Selling {formatTokenAmount(rawNum)} {selectedToken?.symbol}
        </p>
        <p className="text-sm text-muted-foreground">This may take a moment</p>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <div className="flex flex-col gap-6 px-4 pt-6 pb-24">
        <div className="flex items-center gap-3">
          <button onClick={() => setStep("form")} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Confirm Sale</h1>
        </div>

        <div className="flex flex-col items-center gap-2 py-4">
          <CryptoIcon symbol={selectedToken?.symbol ?? ""} size={56} fallbackColor={selectedToken?.color} fallbackIcon={selectedToken?.icon} />
          <p className="text-3xl font-bold">{formatTokenAmount(rawNum)} {selectedToken?.symbol}</p>
          <p className="text-lg text-muted-foreground">for ≈ {formatCurrency(netPayout)}</p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-card p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price per {selectedToken?.symbol}</span>
            <span>{formatCurrency(livePrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Gross Value</span>
            <span>{formatCurrency(grossValue)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payout Method</span>
            <span>{payoutMethod.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Processing Fee ({payoutMethod.fee})</span>
            <span>-{formatCurrency(fee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Network Fee</span>
            <span>-{formatCurrency(networkFee)}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between text-sm font-medium">
            <span>You Receive</span>
            <span className="text-[oklch(0.72_0.19_155)]">{formatCurrency(netPayout)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setStep("form")} className="flex-1 rounded-2xl bg-card py-4 font-semibold transition-all active:scale-[0.98]">
            Cancel
          </button>
          <button
            onClick={handleSell}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-destructive py-4 font-semibold text-white transition-all active:scale-[0.98]"
          >
            <TrendingDown className="h-5 w-5" />
            Confirm Sell
          </button>
        </div>
      </div>
    );
  }

  return (
    <div ref={animScope} className="flex flex-col gap-5 px-4 pt-6 pb-24">
      <div data-anim="header" className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Sell Crypto</h1>
      </div>

      {/* Token Picker */}
      <div data-anim="form">
        <label className="mb-2 block text-sm text-muted-foreground">Asset to Sell</label>
        <button
          onClick={() => { setShowTokenPicker(!showTokenPicker); setShowPayoutPicker(false); }}
          className="flex w-full items-center gap-3 rounded-xl bg-card p-4"
        >
          {selectedToken && (
            <>
              <CryptoIcon symbol={selectedToken.symbol} size={40} fallbackColor={selectedToken.color} fallbackIcon={selectedToken.icon} />
              <div className="flex-1 text-left">
                <p className="font-medium">{selectedToken.name}</p>
                <p className="text-sm text-muted-foreground">
                  Balance: {formatTokenAmount(selectedToken.balance)} {selectedToken.symbol}
                </p>
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
                  onClick={() => { setSelectedTokenId(t.id); setShowTokenPicker(false); setAmount(""); }}
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

      {/* Amount */}
      <div data-anim="form">
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm text-muted-foreground">Amount to Sell</label>
          {selectedToken && (
            <button
              onClick={() => { setAmount(formatTokenAmount(selectedToken.balance)); setTouched(true); }}
              className="text-xs font-medium text-primary"
            >
              MAX: {formatTokenAmount(selectedToken.balance)} {selectedToken.symbol}
            </button>
          )}
        </div>
        <div className="relative">
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setTouched(true); }}
            onBlur={() => setTouched(true)}
            placeholder="0.00"
            className={cn(
              "w-full rounded-xl bg-card p-4 pr-20 text-2xl font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2",
              errors.amount ? "ring-2 ring-destructive focus:ring-destructive" : "focus:ring-primary"
            )}
          />
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground">
            {selectedToken?.symbol ?? ""}
          </span>
        </div>
        {errors.amount ? (
          <p className="mt-1.5 flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3.5 w-3.5" /> {errors.amount}
          </p>
        ) : (
          rawNum > 0 && selectedToken && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              ≈ {formatCurrency(grossValue)}
            </p>
          )
        )}
        {selectedToken && rawNum > 0 && rawNum <= selectedToken.balance && (
          <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                rawNum / selectedToken.balance > 0.9 ? "bg-destructive" : rawNum / selectedToken.balance > 0.7 ? "bg-[oklch(0.8_0.15_85)]" : "bg-primary"
              )}
              style={{ width: `${Math.min(100, (rawNum / selectedToken.balance) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Quick Amounts */}
      <div data-anim="form" className="flex gap-2">
        {[25, 50, 75, 100].map((pct) => (
          <button
            key={pct}
            onClick={() => {
              if (selectedToken) {
                const amt = selectedToken.balance * (pct / 100);
                setAmount(formatTokenAmount(amt));
                setTouched(true);
              }
            }}
            className="flex-1 rounded-lg bg-card py-2 text-sm font-medium transition-colors hover:bg-accent"
          >
            {pct}%
          </button>
        ))}
      </div>

      {/* Payout Method */}
      <div data-anim="form">
        <label className="mb-2 block text-sm text-muted-foreground">Payout Method</label>
        <button
          onClick={() => { setShowPayoutPicker(!showPayoutPicker); setShowTokenPicker(false); }}
          className="flex w-full items-center gap-3 rounded-xl bg-card p-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <payoutMethod.icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">{payoutMethod.name}</p>
            <p className="text-sm text-muted-foreground">Fee: {payoutMethod.fee}</p>
          </div>
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", showPayoutPicker && "rotate-180")} />
        </button>
        {showPayoutPicker && (
          <div className="mt-2 flex flex-col gap-1 rounded-xl bg-card p-2">
            {PAYOUT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => { setPayoutMethodId(m.id); setShowPayoutPicker(false); }}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-3 text-left transition-colors",
                  m.id === payoutMethodId ? "bg-primary/10" : "hover:bg-accent"
                )}
              >
                <m.icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">Fee: {m.fee}</p>
                </div>
                {m.id === payoutMethodId && <div className="h-2 w-2 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {canSell && selectedToken && (
        <div className="rounded-xl bg-card p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You sell</span>
            <span>{formatTokenAmount(rawNum)} {selectedToken.symbol}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Gross Value</span>
            <span>{formatCurrency(grossValue)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Processing Fee</span>
            <span>-{formatCurrency(fee)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Network Fee</span>
            <span>-{formatCurrency(networkFee)}</span>
          </div>
          <div className="mt-2 border-t border-border pt-2 flex justify-between text-sm font-medium">
            <span>You receive</span>
            <span className="text-[oklch(0.72_0.19_155)]">{formatCurrency(netPayout)}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={!canSell}
        className={cn(
          "flex items-center justify-center gap-2 rounded-2xl py-4 text-lg font-semibold transition-all",
          canSell ? "bg-destructive text-white active:scale-[0.98]" : "bg-secondary text-muted-foreground"
        )}
      >
        <TrendingDown className="h-5 w-5" />
        Review Sale
      </button>
    </div>
  );
}
