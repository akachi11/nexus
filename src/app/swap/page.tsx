"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowDownUp, ChevronDown, Loader2, CheckCircle2, AlertCircle, Settings2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useWalletStore } from "@/lib/store";
import { useLivePrices } from "@/hooks/use-market-data";
import { formatCurrency, formatTokenAmount } from "@/components/format";
import { cn } from "@/lib/utils";
import { CryptoIcon } from "@/components/crypto-icons";

type Step = "form" | "confirm" | "swapping" | "success" | "error";

const SLIPPAGE_OPTIONS = [0.1, 0.5, 1.0];

export default function SwapPage() {
  const router = useRouter();
  const { wallets, activeWalletId, swapTokens } = useWalletStore();
  const priceMap = useLivePrices();
  const wallet = wallets.find((w) => w.id === activeWalletId) ?? wallets[0];

  const [fromTokenId, setFromTokenId] = useState(wallet.tokens[0]?.id ?? "");
  const [toTokenId, setToTokenId] = useState(wallet.tokens[1]?.id ?? wallet.tokens[0]?.id ?? "");
  const [fromAmount, setFromAmount] = useState("");
  const [showFromPicker, setShowFromPicker] = useState(false);
  const [showToPicker, setShowToPicker] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [slippage, setSlippage] = useState(0.5);
  const [step, setStep] = useState<Step>("form");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    setStep("form");
    setFromAmount("");
    setTouched(false);
  }, []);

  const fromToken = wallet.tokens.find((t) => t.id === fromTokenId);
  const toToken = wallet.tokens.find((t) => t.id === toTokenId);

  const fromPrice = fromToken ? (priceMap[fromToken.symbol.toUpperCase()]?.price ?? fromToken.price) : 0;
  const toPrice = toToken ? (priceMap[toToken.symbol.toUpperCase()]?.price ?? toToken.price) : 0;

  const fromAmountNum = parseFloat(fromAmount) || 0;
  const fromFiat = fromAmountNum * fromPrice;
  const toAmountNum = toPrice > 0 ? (fromAmountNum * fromPrice) / toPrice : 0;
  const toFiat = toAmountNum * toPrice;
  const rate = toPrice > 0 ? fromPrice / toPrice : 0;
  const priceImpact = fromAmountNum > 0 ? Math.min(fromAmountNum * 0.03, 5) : 0;
  const networkFee = 3.50;
  const minReceived = toAmountNum * (1 - slippage / 100);

  const errors = useMemo(() => {
    const e: { from?: string } = {};
    if (touched && !fromAmount) e.from = "Enter an amount";
    else if (touched && fromAmountNum <= 0) e.from = "Amount must be greater than 0";
    else if (touched && fromToken && fromAmountNum > fromToken.balance) e.from = "Insufficient balance";
    return e;
  }, [fromAmount, fromAmountNum, fromToken, touched]);

  const canSwap = fromToken && toToken && fromTokenId !== toTokenId && fromAmountNum > 0 && fromToken.balance >= fromAmountNum && !errors.from;

  const handleFlip = () => {
    setFromTokenId(toTokenId);
    setToTokenId(fromTokenId);
    setFromAmount("");
    setTouched(false);
  };

  const handleConfirm = () => {
    if (!canSwap) return;
    setStep("confirm");
  };

  const handleSwap = async () => {
    if (!canSwap || !fromToken || !toToken) return;
    setStep("swapping");
    await new Promise((r) => setTimeout(r, 2500));
    try {
      swapTokens(wallet.id, fromTokenId, toTokenId, fromAmountNum, toAmountNum);
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
          Your request to swap {fromAmount} {fromToken?.symbol} for {formatTokenAmount(toAmountNum)} {toToken?.symbol} is being reviewed
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
        <h2 className="text-xl font-bold">Swap Failed</h2>
        <p className="text-center text-muted-foreground">Transaction could not be completed. Please try again.</p>
        <button onClick={() => setStep("form")} className="mt-4 rounded-2xl bg-card px-6 py-3 font-medium">
          Try Again
        </button>
      </div>
    );
  }

  if (step === "swapping") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <h2 className="text-xl font-bold">Swapping...</h2>
        <p className="text-center text-muted-foreground">
          {fromAmount} {fromToken?.symbol} → {formatTokenAmount(toAmountNum)} {toToken?.symbol}
        </p>
        <p className="text-sm text-muted-foreground">Confirming on-chain, please wait</p>
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
          <h1 className="text-xl font-bold">Confirm Swap</h1>
        </div>

        <div className="flex flex-col items-center gap-2 py-2">
          <div className="flex items-center gap-3">
            <CryptoIcon symbol={fromToken?.symbol ?? ""} size={40} fallbackColor={fromToken?.color} fallbackIcon={fromToken?.icon} />
            <div>
              <p className="text-2xl font-bold">{fromAmount} {fromToken?.symbol}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(fromFiat)}</p>
            </div>
          </div>
          <ArrowDownUp className="h-6 w-6 text-muted-foreground" />
          <div className="flex items-center gap-3">
            <CryptoIcon symbol={toToken?.symbol ?? ""} size={40} fallbackColor={toToken?.color} fallbackIcon={toToken?.icon} />
            <div>
              <p className="text-2xl font-bold">{formatTokenAmount(toAmountNum)} {toToken?.symbol}</p>
              <p className="text-sm text-muted-foreground">{formatCurrency(toFiat)}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-card p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rate</span>
            <span>1 {fromToken?.symbol} = {formatTokenAmount(rate)} {toToken?.symbol}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Price Impact</span>
            <span className={priceImpact > 3 ? "text-destructive" : priceImpact > 1 ? "text-[oklch(0.8_0.15_85)]" : ""}>
              {priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Slippage Tolerance</span>
            <span>{slippage}%</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Min. Received</span>
            <span>{formatTokenAmount(minReceived)} {toToken?.symbol}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between text-sm">
            <span className="text-muted-foreground">Network Fee</span>
            <span>{formatCurrency(networkFee)}</span>
          </div>
        </div>

        {priceImpact > 3 && (
          <div className="flex items-start gap-2 rounded-xl bg-destructive/10 p-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            <p className="text-xs text-destructive">
              High price impact! You may receive significantly less than expected.
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button onClick={() => setStep("form")} className="flex-1 rounded-2xl bg-card py-4 font-semibold transition-all active:scale-[0.98]">
            Cancel
          </button>
          <button
            onClick={handleSwap}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl gradient-primary py-4 font-semibold text-white transition-all active:scale-[0.98]"
          >
            <ArrowDownUp className="h-5 w-5" />
            Confirm Swap
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5 px-4 pt-6 pb-24">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-xl font-bold">Swap</h1>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={cn("flex h-10 w-10 items-center justify-center rounded-full bg-secondary", showSettings && "bg-primary/10 text-primary")}
        >
          <Settings2 className="h-5 w-5" />
        </button>
      </div>

      {/* Slippage Settings */}
      {showSettings && (
        <div className="rounded-xl bg-card p-4">
          <p className="mb-3 text-sm font-medium">Slippage Tolerance</p>
          <div className="flex gap-2">
            {SLIPPAGE_OPTIONS.map((s) => (
              <button
                key={s}
                onClick={() => setSlippage(s)}
                className={cn(
                  "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                  slippage === s ? "bg-primary text-white" : "bg-secondary"
                )}
              >
                {s}%
              </button>
            ))}
          </div>
        </div>
      )}

      {/* From Token */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm text-muted-foreground">You Pay</label>
          {fromToken && (
            <button
              onClick={() => { setFromAmount(fromToken.balance.toString()); setTouched(true); }}
              className="text-xs font-medium text-primary"
            >
              MAX: {formatTokenAmount(fromToken.balance)} {fromToken.symbol}
            </button>
          )}
        </div>
        <div className="rounded-xl bg-card p-4">
          <button
            onClick={() => { setShowFromPicker(!showFromPicker); setShowToPicker(false); }}
            className="flex w-full items-center gap-3 mb-3"
          >
            {fromToken && (
              <>
                <CryptoIcon symbol={fromToken.symbol} size={36} fallbackColor={fromToken.color} fallbackIcon={fromToken.icon} />
                <div className="flex-1 text-left">
                  <p className="font-medium">{fromToken.symbol}</p>
                  <p className="text-xs text-muted-foreground">Balance: {formatTokenAmount(fromToken.balance)}</p>
                </div>
              </>
            )}
            <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", showFromPicker && "rotate-180")} />
          </button>
          {showFromPicker && (
            <div className="mb-3 flex flex-col gap-1 rounded-lg bg-secondary p-2">
              {wallet.tokens.filter((t) => t.id !== toTokenId).map((t) => {
                const tp = priceMap[t.symbol.toUpperCase()]?.price ?? t.price;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setFromTokenId(t.id); setShowFromPicker(false); setFromAmount(""); setTouched(false); }}
                    className={cn("flex items-center gap-3 rounded-lg p-2 text-left transition-colors", t.id === fromTokenId ? "bg-primary/10" : "hover:bg-accent")}
                  >
                    <CryptoIcon symbol={t.symbol} size={28} fallbackColor={t.color} fallbackIcon={t.icon} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t.symbol}</p>
                      <p className="text-xs text-muted-foreground">{formatTokenAmount(t.balance)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatCurrency(t.balance * tp)}</p>
                  </button>
                );
              })}
            </div>
          )}
          <input
            type="number"
            value={fromAmount}
            onChange={(e) => { setFromAmount(e.target.value); setTouched(true); }}
            onBlur={() => setTouched(true)}
            placeholder="0.00"
            className={cn(
              "w-full bg-transparent text-2xl font-bold placeholder:text-muted-foreground/50 focus:outline-none",
              errors.from && "text-destructive"
            )}
          />
          {errors.from ? (
            <p className="mt-1 flex items-center gap-1 text-sm text-destructive">
              <AlertCircle className="h-3.5 w-3.5" /> {errors.from}
            </p>
          ) : (
            fromAmountNum > 0 && <p className="mt-1 text-sm text-muted-foreground">≈ {formatCurrency(fromFiat)}</p>
          )}
        </div>
      </div>

      {/* Flip Button */}
      <div className="flex justify-center -my-2 relative z-10">
        <button
          onClick={handleFlip}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-lg transition-all hover:scale-105 active:scale-95"
        >
          <ArrowDownUp className="h-5 w-5" />
        </button>
      </div>

      {/* To Token */}
      <div>
        <label className="mb-2 block text-sm text-muted-foreground">You Receive</label>
        <div className="rounded-xl bg-card p-4">
          <button
            onClick={() => { setShowToPicker(!showToPicker); setShowFromPicker(false); }}
            className="flex w-full items-center gap-3 mb-3"
          >
            {toToken && (
              <>
                <CryptoIcon symbol={toToken.symbol} size={36} fallbackColor={toToken.color} fallbackIcon={toToken.icon} />
                <div className="flex-1 text-left">
                  <p className="font-medium">{toToken.symbol}</p>
                  <p className="text-xs text-muted-foreground">Balance: {formatTokenAmount(toToken.balance)}</p>
                </div>
              </>
            )}
            <ChevronDown className={cn("h-5 w-5 text-muted-foreground transition-transform", showToPicker && "rotate-180")} />
          </button>
          {showToPicker && (
            <div className="mb-3 flex flex-col gap-1 rounded-lg bg-secondary p-2">
              {wallet.tokens.filter((t) => t.id !== fromTokenId).map((t) => {
                const tp = priceMap[t.symbol.toUpperCase()]?.price ?? t.price;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setToTokenId(t.id); setShowToPicker(false); }}
                    className={cn("flex items-center gap-3 rounded-lg p-2 text-left transition-colors", t.id === toTokenId ? "bg-primary/10" : "hover:bg-accent")}
                  >
                    <CryptoIcon symbol={t.symbol} size={28} fallbackColor={t.color} fallbackIcon={t.icon} />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{t.symbol}</p>
                      <p className="text-xs text-muted-foreground">{formatTokenAmount(t.balance)}</p>
                    </div>
                    <p className="text-xs text-muted-foreground">{formatCurrency(t.balance * tp)}</p>
                  </button>
                );
              })}
            </div>
          )}
          <p className="text-2xl font-bold">
            {toAmountNum > 0 ? formatTokenAmount(toAmountNum) : "0.00"}
          </p>
          {toAmountNum > 0 && <p className="mt-1 text-sm text-muted-foreground">≈ {formatCurrency(toFiat)}</p>}
        </div>
      </div>

      {/* Rate Info */}
      {canSwap && (
        <div className="rounded-xl bg-card p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Rate</span>
            <span>1 {fromToken?.symbol} = {formatTokenAmount(rate)} {toToken?.symbol}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Price Impact</span>
            <span className={priceImpact > 3 ? "text-destructive" : priceImpact > 1 ? "text-[oklch(0.8_0.15_85)]" : ""}>
              {priceImpact.toFixed(2)}%
            </span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Network Fee</span>
            <span>~{formatCurrency(networkFee)}</span>
          </div>
        </div>
      )}

      {fromTokenId === toTokenId && fromToken && (
        <p className="text-center text-sm text-destructive">Select a different token to swap to</p>
      )}

      <button
        onClick={handleConfirm}
        disabled={!canSwap}
        className={cn(
          "flex items-center justify-center gap-2 rounded-2xl py-4 text-lg font-semibold transition-all",
          canSwap ? "gradient-primary text-white active:scale-[0.98]" : "bg-secondary text-muted-foreground"
        )}
      >
        <ArrowDownUp className="h-5 w-5" />
        Review Swap
      </button>
    </div>
  );
}
