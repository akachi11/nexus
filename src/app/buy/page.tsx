"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, Loader2, CheckCircle2, AlertCircle, CreditCard, Building2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useWalletStore } from "@/lib/store";
import { useLivePrices } from "@/hooks/use-market-data";
import { formatCurrency, formatTokenAmount } from "@/components/format";
import { cn } from "@/lib/utils";
import { CryptoIcon } from "@/components/crypto-icons";

type Step = "form" | "confirm" | "processing" | "success" | "error";

const FIAT_PRESETS = [50, 100, 250, 500, 1000];

const PAYMENT_METHODS = [
  { id: "card", name: "Credit / Debit Card", icon: CreditCard, fee: "2.5%" },
  { id: "bank", name: "Bank Transfer", icon: Building2, fee: "1.0%" },
];

export default function BuyPage() {
  const router = useRouter();
  const { wallets, activeWalletId, buyToken } = useWalletStore();
  const priceMap = useLivePrices();
  const wallet = wallets.find((w) => w.id === activeWalletId) ?? wallets[0];

  const [selectedTokenId, setSelectedTokenId] = useState(wallet.tokens[0]?.id ?? "");
  const [fiatAmount, setFiatAmount] = useState("");
  const [paymentMethodId, setPaymentMethodId] = useState(PAYMENT_METHODS[0].id);
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [showPaymentPicker, setShowPaymentPicker] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setStep("form");
    setFiatAmount("");
    setTouched(false);
  }, []);

  const selectedToken = wallet.tokens.find((t) => t.id === selectedTokenId);
  const paymentMethod = PAYMENT_METHODS.find((p) => p.id === paymentMethodId) ?? PAYMENT_METHODS[0];

  const livePrice = selectedToken ? (priceMap[selectedToken.symbol.toUpperCase()]?.price ?? selectedToken.price) : 0;
  const fiatNum = parseFloat(fiatAmount) || 0;
  const feePercent = paymentMethodId === "card" ? 2.5 : 1.0;
  const fee = fiatNum * (feePercent / 100);
  const networkFee = 2.50;
  const totalCost = fiatNum + fee + networkFee;
  const tokenAmount = livePrice > 0 ? (fiatNum - fee - networkFee) / livePrice : 0;
  const effectiveAmount = Math.max(0, tokenAmount);

  const errors = useMemo(() => {
    const e: { amount?: string } = {};
    if (touched && !fiatAmount) e.amount = "Enter an amount";
    else if (touched && fiatNum <= 0) e.amount = "Amount must be greater than 0";
    else if (touched && fiatNum < 10) e.amount = "Minimum purchase is $10";
    else if (touched && fiatNum > 50000) e.amount = "Maximum purchase is $50,000";
    return e;
  }, [fiatAmount, fiatNum, touched]);

  const canBuy = fiatNum >= 10 && fiatNum <= 50000 && selectedToken && effectiveAmount > 0 && !errors.amount;

  const handleConfirm = () => {
    if (!canBuy) return;
    setStep("confirm");
  };

  const handleBuy = async () => {
    if (!canBuy || !selectedToken) return;
    setStep("processing");
    await new Promise((r) => setTimeout(r, 3000));
    try {
      buyToken(wallet.id, selectedTokenId, effectiveAmount, fiatNum);
      setStep("success");
      setTimeout(() => router.replace("/"), 2500);
    } catch {
      setStep("error");
    }
  };

  if (step === "success") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[oklch(0.72_0.19_155/0.15)]">
          <CheckCircle2 className="h-10 w-10 text-[oklch(0.72_0.19_155)]" />
        </div>
        <h2 className="text-xl font-bold">Request Submitted Successfully</h2>
        <p className="text-center text-muted-foreground">
          Your request to buy {formatTokenAmount(effectiveAmount)} {selectedToken?.symbol} for {formatCurrency(fiatNum)} is being reviewed
        </p>
        <p className="text-sm text-muted-foreground">Redirecting to home...</p>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-destructive/15">
          <AlertCircle className="h-10 w-10 text-destructive" />
        </div>
        <h2 className="text-xl font-bold">Purchase Failed</h2>
        <p className="text-center text-muted-foreground">Payment could not be processed. Please try again.</p>
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
        <h2 className="text-xl font-bold">Processing Payment...</h2>
        <p className="text-center text-muted-foreground">
          Buying {formatTokenAmount(effectiveAmount)} {selectedToken?.symbol}
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
          <h1 className="text-xl font-bold">Confirm Purchase</h1>
        </div>

        <div className="flex flex-col items-center gap-2 py-4">
          <CryptoIcon symbol={selectedToken?.symbol ?? ""} size={56} fallbackColor={selectedToken?.color} fallbackIcon={selectedToken?.icon} />
          <p className="text-3xl font-bold">{formatTokenAmount(effectiveAmount)} {selectedToken?.symbol}</p>
          <p className="text-lg text-muted-foreground">for {formatCurrency(fiatNum)}</p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-card p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price per {selectedToken?.symbol}</span>
            <span>{formatCurrency(livePrice)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment Method</span>
            <span>{paymentMethod.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Processing Fee ({paymentMethod.fee})</span>
            <span>{formatCurrency(fee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Network Fee</span>
            <span>{formatCurrency(networkFee)}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between text-sm font-medium">
            <span>Total</span>
            <span>{formatCurrency(totalCost)}</span>
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={() => setStep("form")} className="flex-1 rounded-2xl bg-card py-4 font-semibold transition-all active:scale-[0.98]">
            Cancel
          </button>
          <button
            onClick={handleBuy}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl gradient-primary py-4 font-semibold text-white transition-all active:scale-[0.98]"
          >
            <CreditCard className="h-5 w-5" />
            Confirm Buy
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-24">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">Buy Crypto</h1>
      </div>

      {/* Token Picker */}
      <div>
        <label className="mb-2 block text-sm text-muted-foreground">Asset</label>
        <button
          onClick={() => { setShowTokenPicker(!showTokenPicker); setShowPaymentPicker(false); }}
          className="flex w-full items-center gap-3 rounded-xl bg-card p-4"
        >
          {selectedToken && (
            <>
              <CryptoIcon symbol={selectedToken.symbol} size={40} fallbackColor={selectedToken.color} fallbackIcon={selectedToken.icon} />
              <div className="flex-1 text-left">
                <p className="font-medium">{selectedToken.name}</p>
                <p className="text-sm text-muted-foreground">{formatCurrency(livePrice)} per {selectedToken.symbol}</p>
              </div>
            </>
          )}
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", showTokenPicker && "rotate-180")} />
        </button>
        {showTokenPicker && (
          <div className="mt-2 flex flex-col gap-1 rounded-xl bg-card p-2">
            {wallet.tokens.map((t) => {
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
                    <p className="text-xs text-muted-foreground">{formatCurrency(tp)} per {t.symbol}</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Fiat Amount */}
      <div>
        <label className="mb-2 block text-sm text-muted-foreground">Amount (USD)</label>
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">$</span>
          <input
            type="number"
            value={fiatAmount}
            onChange={(e) => { setFiatAmount(e.target.value); setTouched(true); }}
            onBlur={() => setTouched(true)}
            placeholder="0.00"
            className={cn(
              "w-full rounded-xl bg-card p-4 pl-10 text-2xl font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2",
              errors.amount ? "ring-2 ring-destructive focus:ring-destructive" : "focus:ring-primary"
            )}
          />
        </div>
        {errors.amount ? (
          <p className="mt-1.5 flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3.5 w-3.5" /> {errors.amount}
          </p>
        ) : (
          fiatNum > 0 && selectedToken && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              ≈ {formatTokenAmount(effectiveAmount)} {selectedToken.symbol}
            </p>
          )
        )}
      </div>

      {/* Quick Amounts */}
      <div className="flex gap-2">
        {FIAT_PRESETS.map((p) => (
          <button
            key={p}
            onClick={() => { setFiatAmount(p.toString()); setTouched(true); }}
            className={cn(
              "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
              parseFloat(fiatAmount) === p ? "bg-primary text-white" : "bg-card"
            )}
          >
            ${p}
          </button>
        ))}
      </div>

      {/* Payment Method */}
      <div>
        <label className="mb-2 block text-sm text-muted-foreground">Payment Method</label>
        <button
          onClick={() => { setShowPaymentPicker(!showPaymentPicker); setShowTokenPicker(false); }}
          className="flex w-full items-center gap-3 rounded-xl bg-card p-4"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <paymentMethod.icon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 text-left">
            <p className="font-medium">{paymentMethod.name}</p>
            <p className="text-sm text-muted-foreground">Fee: {paymentMethod.fee}</p>
          </div>
          <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", showPaymentPicker && "rotate-180")} />
        </button>
        {showPaymentPicker && (
          <div className="mt-2 flex flex-col gap-1 rounded-xl bg-card p-2">
            {PAYMENT_METHODS.map((m) => (
              <button
                key={m.id}
                onClick={() => { setPaymentMethodId(m.id); setShowPaymentPicker(false); }}
                className={cn(
                  "flex items-center gap-3 rounded-lg p-3 text-left transition-colors",
                  m.id === paymentMethodId ? "bg-primary/10" : "hover:bg-accent"
                )}
              >
                <m.icon className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{m.name}</p>
                  <p className="text-xs text-muted-foreground">Fee: {m.fee}</p>
                </div>
                {m.id === paymentMethodId && <div className="h-2 w-2 rounded-full bg-primary" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Summary */}
      {canBuy && selectedToken && (
        <div className="rounded-xl bg-card p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You pay</span>
            <span>{formatCurrency(fiatNum)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Processing Fee</span>
            <span>{formatCurrency(fee)}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Network Fee</span>
            <span>{formatCurrency(networkFee)}</span>
          </div>
          <div className="mt-2 border-t border-border pt-2 flex justify-between text-sm font-medium">
            <span>You receive</span>
            <span>{formatTokenAmount(effectiveAmount)} {selectedToken.symbol}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={!canBuy}
        className={cn(
          "flex items-center justify-center gap-2 rounded-2xl py-4 text-lg font-semibold transition-all",
          canBuy ? "gradient-primary text-white active:scale-[0.98]" : "bg-secondary text-muted-foreground"
        )}
      >
        <CreditCard className="h-5 w-5" />
        Review Purchase
      </button>
    </div>
  );
}
