"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Send, ChevronDown, Loader2, CheckCircle2, AlertCircle, Scan, ArrowUpDown } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { useWalletStore } from "@/lib/store";
import { useLivePrices } from "@/hooks/use-market-data";
import { formatCurrency, formatTokenAmount, shortenAddress } from "@/components/format";
import { cn } from "@/lib/utils";
import { CryptoIcon } from "@/components/crypto-icons";

type Step = "form" | "confirm" | "sending" | "success" | "error";
type InputMode = "crypto" | "fiat";

export default function SendPage() {
  const router = useRouter();
  const { wallets, activeWalletId, sendToken } = useWalletStore();
  const priceMap = useLivePrices();
  const wallet = wallets.find((w) => w.id === activeWalletId) ?? wallets[0];

  const [selectedTokenId, setSelectedTokenId] = useState(wallet.tokens[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [showTokenPicker, setShowTokenPicker] = useState(false);
  const [step, setStep] = useState<Step>("form");
  const [touched, setTouched] = useState({ amount: false, address: false });
  const [inputMode, setInputMode] = useState<InputMode>("crypto");

  useEffect(() => {
    setStep("form");
    setAmount("");
    setAddress("");
    setTouched({ amount: false, address: false });
  }, []);

  const selectedToken = wallet.tokens.find((t) => t.id === selectedTokenId);
  const livePrice = selectedToken ? (priceMap[selectedToken.symbol.toUpperCase()]?.price ?? selectedToken.price) : 0;

  const rawNum = parseFloat(amount) || 0;
  const cryptoAmount = inputMode === "crypto" ? rawNum : (livePrice > 0 ? rawNum / livePrice : 0);
  const fiatAmount = inputMode === "fiat" ? rawNum : rawNum * livePrice;
  const networkFee = 2.45;

  const handleToggleMode = () => {
    if (!livePrice) return;
    const converted = inputMode === "crypto"
      ? (rawNum * livePrice).toFixed(2)
      : formatTokenAmount(rawNum / livePrice);
    setInputMode((m) => (m === "crypto" ? "fiat" : "crypto"));
    setAmount(parseFloat(converted) > 0 ? converted : "");
  };

  const errors = useMemo(() => {
    const e: { amount?: string; address?: string } = {};
    if (touched.amount && !amount) e.amount = "Enter an amount";
    else if (touched.amount && rawNum <= 0) e.amount = "Amount must be greater than 0";
    else if (touched.amount && selectedToken && cryptoAmount > selectedToken.balance) e.amount = "Insufficient balance";
    if (touched.address && !address) e.address = "Enter a recipient address";
    else if (touched.address && address.length < 10) e.address = "Address is too short";
    else if (touched.address && !address.startsWith("0x")) e.address = "Invalid address format";
    return e;
  }, [amount, rawNum, cryptoAmount, address, selectedToken, touched]);

  const canSend = selectedToken && cryptoAmount > 0 && cryptoAmount <= selectedToken.balance && address.length >= 10 && address.startsWith("0x") && !errors.amount && !errors.address;

  const handleConfirm = () => {
    if (!canSend) return;
    setStep("confirm");
  };

  const handleSend = async () => {
    if (!canSend || !selectedToken) return;
    setStep("sending");
    await new Promise((r) => setTimeout(r, 2000));
    try {
      sendToken(wallet.id, selectedTokenId, cryptoAmount, address);
      setStep("success");
      setTimeout(() => router.replace("/"), 2500);
    } catch {
      setStep("error");
    }
  };

  const cryptoDisplay = formatTokenAmount(cryptoAmount);

  if (step === "success") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[oklch(0.72_0.19_155/0.15)]">
          <CheckCircle2 className="h-10 w-10 text-[oklch(0.72_0.19_155)]" />
        </div>
        <h2 className="text-xl font-bold">Request Submitted Successfully</h2>
        <p className="text-center text-muted-foreground">
          Your request to send {cryptoDisplay} {selectedToken?.symbol} to {shortenAddress(address)} is being reviewed
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
        <h2 className="text-xl font-bold">Transaction Failed</h2>
        <p className="text-center text-muted-foreground">Something went wrong. Please try again.</p>
        <button
          onClick={() => setStep("form")}
          className="mt-4 rounded-2xl bg-card px-6 py-3 font-medium"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (step === "sending") {
    return (
      <div className="flex min-h-[80vh] flex-col items-center justify-center gap-4 px-4">
        <Loader2 className="h-16 w-16 animate-spin text-primary" />
        <h2 className="text-xl font-bold">Sending...</h2>
        <p className="text-center text-muted-foreground">
          Sending {cryptoDisplay} {selectedToken?.symbol} to {shortenAddress(address)}
        </p>
        <p className="text-sm text-muted-foreground">Please wait, do not close this page</p>
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
          <h1 className="text-xl font-bold">Confirm Send</h1>
        </div>

        <div className="flex flex-col items-center gap-2 py-4">
          <CryptoIcon symbol={selectedToken?.symbol ?? ""} size={56} fallbackColor={selectedToken?.color} fallbackIcon={selectedToken?.icon} />
          <p className="text-3xl font-bold">{cryptoDisplay} {selectedToken?.symbol}</p>
          <p className="text-lg text-muted-foreground">{formatCurrency(fiatAmount)}</p>
        </div>

        <div className="flex flex-col gap-3 rounded-xl bg-card p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">From</span>
            <span className="font-medium">{wallet.name}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">To</span>
            <span className="font-mono text-xs">{shortenAddress(address)}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between text-sm">
            <span className="text-muted-foreground">Network Fee</span>
            <span>{formatCurrency(networkFee)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Total Cost</span>
            <span className="font-semibold">{formatCurrency(fiatAmount + networkFee)}</span>
          </div>
        </div>

        <div className="flex items-start gap-2 rounded-xl bg-[oklch(0.8_0.15_85/0.1)] p-3">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-[oklch(0.8_0.15_85)]" />
          <p className="text-xs text-[oklch(0.8_0.15_85)]">
            Ensure the address is correct. Transactions cannot be reversed once confirmed.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep("form")}
            className="flex-1 rounded-2xl bg-card py-4 font-semibold transition-all active:scale-[0.98]"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl gradient-primary py-4 font-semibold text-white transition-all active:scale-[0.98]"
          >
            <Send className="h-5 w-5" />
            Confirm Send
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
        <h1 className="text-xl font-bold">Send</h1>
      </div>

      {/* Token Picker */}
      <div>
        <label className="mb-2 block text-sm text-muted-foreground">Asset</label>
        <button
          onClick={() => setShowTokenPicker(!showTokenPicker)}
          className="flex w-full items-center gap-3 rounded-xl bg-card p-4"
        >
          {selectedToken && (
            <>
              <CryptoIcon symbol={selectedToken.symbol} size={40} fallbackColor={selectedToken.color} fallbackIcon={selectedToken.icon} />
              <div className="flex-1 text-left">
                <p className="font-medium">{selectedToken.name}</p>
                <p className="text-sm text-muted-foreground">
                  Balance: {formatTokenAmount(selectedToken.balance)} {selectedToken.symbol} ({formatCurrency(selectedToken.balance * livePrice)})
                </p>
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
                  onClick={() => { setSelectedTokenId(t.id); setShowTokenPicker(false); setAmount(""); setInputMode("crypto"); }}
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
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-sm text-muted-foreground">Amount</label>
          {selectedToken && (
            <button
              onClick={() => {
                if (inputMode === "crypto") {
                  setAmount(formatTokenAmount(selectedToken.balance));
                } else {
                  setAmount((selectedToken.balance * livePrice).toFixed(2));
                }
                setTouched((p) => ({ ...p, amount: true }));
              }}
              className="text-xs font-medium text-primary"
            >
              MAX: {inputMode === "crypto"
                ? `${formatTokenAmount(selectedToken.balance)} ${selectedToken.symbol}`
                : formatCurrency(selectedToken.balance * livePrice)}
            </button>
          )}
        </div>
        <div className="relative">
          {inputMode === "fiat" && (
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-muted-foreground">$</span>
          )}
          <input
            type="number"
            value={amount}
            onChange={(e) => { setAmount(e.target.value); setTouched((p) => ({ ...p, amount: true })); }}
            onBlur={() => setTouched((p) => ({ ...p, amount: true }))}
            placeholder="0.00"
            className={cn(
              "w-full rounded-xl bg-card p-4 pr-24 text-2xl font-bold placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2",
              inputMode === "fiat" && "pl-10",
              errors.amount ? "ring-2 ring-destructive focus:ring-destructive" : "focus:ring-primary"
            )}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
            <span className="text-sm font-semibold text-muted-foreground">
              {inputMode === "crypto" ? selectedToken?.symbol : "USD"}
            </span>
            <button
              onClick={handleToggleMode}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary transition-colors hover:bg-accent active:scale-95"
              title={`Switch to ${inputMode === "crypto" ? "USD" : selectedToken?.symbol}`}
            >
              <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>
        </div>
        {errors.amount ? (
          <p className="mt-1.5 flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3.5 w-3.5" /> {errors.amount}
          </p>
        ) : (
          rawNum > 0 && (
            <p className="mt-1.5 text-sm text-muted-foreground">
              {inputMode === "crypto"
                ? `≈ ${formatCurrency(fiatAmount)}`
                : `≈ ${cryptoDisplay} ${selectedToken?.symbol ?? ""}`}
            </p>
          )
        )}
        {selectedToken && cryptoAmount > 0 && cryptoAmount <= selectedToken.balance && (
          <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                cryptoAmount / selectedToken.balance > 0.9 ? "bg-destructive" : cryptoAmount / selectedToken.balance > 0.7 ? "bg-[oklch(0.8_0.15_85)]" : "bg-primary"
              )}
              style={{ width: `${Math.min(100, (cryptoAmount / selectedToken.balance) * 100)}%` }}
            />
          </div>
        )}
      </div>

      {/* Address */}
      <div>
        <label className="mb-2 block text-sm text-muted-foreground">Recipient Address</label>
        <div className="relative">
          <input
            type="text"
            value={address}
            onChange={(e) => { setAddress(e.target.value); setTouched((p) => ({ ...p, address: true })); }}
            onBlur={() => setTouched((p) => ({ ...p, address: true }))}
            placeholder="0x..."
            className={cn(
              "w-full rounded-xl bg-card p-4 pr-12 font-mono text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2",
              errors.address ? "ring-2 ring-destructive focus:ring-destructive" : "focus:ring-primary"
            )}
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg bg-secondary p-2">
            <Scan className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>
        {errors.address && (
          <p className="mt-1.5 flex items-center gap-1 text-sm text-destructive">
            <AlertCircle className="h-3.5 w-3.5" /> {errors.address}
          </p>
        )}
      </div>

      {/* Summary */}
      {canSend && selectedToken && (
        <div className="rounded-xl bg-card p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">You send</span>
            <span>{cryptoDisplay} {selectedToken.symbol}</span>
          </div>
          <div className="mt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Network Fee</span>
            <span>~{formatCurrency(networkFee)}</span>
          </div>
          <div className="mt-2 border-t border-border pt-2 flex justify-between text-sm font-medium">
            <span>Total</span>
            <span>{formatCurrency(fiatAmount + networkFee)}</span>
          </div>
        </div>
      )}

      <button
        onClick={handleConfirm}
        disabled={!canSend}
        className={cn(
          "flex items-center justify-center gap-2 rounded-2xl py-4 text-lg font-semibold transition-all",
          canSend
            ? "gradient-primary text-white active:scale-[0.98]"
            : "bg-secondary text-muted-foreground"
        )}
      >
        <Send className="h-5 w-5" />
        Review Send
      </button>
    </div>
  );
}
