"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Check, Coins, FileText, Settings, Rocket, AlertCircle } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useWalletStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { usePageTransition } from "@/hooks/use-gsap";

const COLORS = [
  "#6366f1", "#ec4899", "#f59e0b", "#10b981", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#14b8a6", "#e11d48",
];

const ICONS = ["🪙", "💎", "🔥", "⚡", "🌟", "🚀", "🦊", "🐉", "🌊", "👑"];

const steps = [
  { id: 1, label: "Basics", icon: Coins },
  { id: 2, label: "Details", icon: FileText },
  { id: 3, label: "Config", icon: Settings },
  { id: 4, label: "Launch", icon: Rocket },
];

function calculateMintingFee(totalSupply: number): number {
  return Math.max(20, totalSupply * 0.0001);
}

export default function CreateTokenPage() {
  const router = useRouter();
  const animScope = usePageTransition();
  const { wallets, createToken, isLoaded, fetchWallets } = useWalletStore();
  const [step, setStep] = useState(1);
  const [created, setCreated] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isLoaded) fetchWallets();
    setStep(1);
    setCreated(false);
  }, []);

  const [name, setName] = useState("");
  const [symbol, setSymbol] = useState("");
  const [icon, setIcon] = useState("🪙");
  const [color, setColor] = useState(COLORS[0]);
  const [description, setDescription] = useState("");
  const [totalSupply, setTotalSupply] = useState("1000000");
  const [decimals, setDecimals] = useState("18");
  const [walletId, setWalletId] = useState(wallets[0]?.id ?? "main");
  const [paymentTokenId, setPaymentTokenId] = useState("");

  useEffect(() => {
    if (wallets.length > 0 && !wallets.find((w) => w.id === walletId)) {
      setWalletId(wallets[0].id);
    }
  }, [wallets, walletId]);

  const selectedWallet = wallets.find((w) => w.id === walletId);
  const payableTokens = useMemo(
    () => (selectedWallet?.tokens ?? []).filter((t) => t.price > 0 && !t.isCustom),
    [selectedWallet]
  );

  useEffect(() => {
    if (payableTokens.length > 0 && !payableTokens.find((t) => t.id === paymentTokenId)) {
      setPaymentTokenId(payableTokens[0].id);
    }
  }, [payableTokens, paymentTokenId]);

  const supply = parseInt(totalSupply) || 0;
  const feeUsd = calculateMintingFee(supply);
  const selectedPaymentToken = payableTokens.find((t) => t.id === paymentTokenId);
  const feeAmount = selectedPaymentToken && selectedPaymentToken.price > 0 ? feeUsd / selectedPaymentToken.price : 0;
  const hasSufficientBalance = selectedPaymentToken ? selectedPaymentToken.balance >= feeAmount : false;

  const canNext = () => {
    if (step === 1) return name.length >= 2 && symbol.length >= 2 && symbol.length <= 6;
    if (step === 2) return description.length >= 10;
    if (step === 3) return supply > 0 && !!paymentTokenId && hasSufficientBalance;
    return true;
  };

  const [feeResult, setFeeResult] = useState<{ usd: number; amount: number; symbol: string } | null>(null);

  const handleCreate = async () => {
    setSubmitting(true);
    setError("");
    try {
      await createToken({
        walletId,
        name,
        symbol: symbol.toUpperCase(),
        icon,
        color,
        totalSupply: supply,
        description,
        paymentTokenId,
      });
      setFeeResult({ usd: feeUsd, amount: feeAmount, symbol: selectedPaymentToken?.symbol ?? "" });
      setCreated(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Token creation failed");
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div ref={animScope} className="flex flex-col items-center justify-center gap-6 px-4 pt-24">
        <div data-anim="result-icon" className="relative">
          <div
            className="flex h-24 w-24 items-center justify-center rounded-full text-5xl"
            style={{ backgroundColor: color + "22" }}
          >
            {icon}
          </div>
          <div className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-[oklch(0.72_0.19_155)]">
            <Check className="h-5 w-5 text-white" />
          </div>
        </div>
        <div className="text-center">
          <h2 data-anim="result-text" className="text-2xl font-bold">Request Submitted Successfully</h2>
          <p className="mt-2 text-muted-foreground">
            Your request to create {name} ({symbol.toUpperCase()}) with {supply.toLocaleString()} tokens is being reviewed
          </p>
        </div>
        <div className="w-full rounded-xl bg-card p-4">
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Token Name</span>
            <span className="font-medium">{name}</span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Symbol</span>
            <span className="font-medium">{symbol.toUpperCase()}</span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Supply</span>
            <span className="font-medium">{supply.toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Decimals</span>
            <span className="font-medium">{decimals}</span>
          </div>
          {feeResult && (
            <>
              <div className="my-2 border-t border-border" />
              <div className="flex justify-between py-1 text-sm">
                <span className="text-muted-foreground">Minting Fee</span>
                <span className="font-medium">${feeResult.usd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-1 text-sm">
                <span className="text-muted-foreground">Paid With</span>
                <span className="font-medium">{feeResult.amount.toFixed(6)} {feeResult.symbol}</span>
              </div>
            </>
          )}
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-[oklch(0.75_0.15_65)]">Pending Review</span>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          The minting fee has been deducted from your balance. If your request is rejected, the fee will be refunded automatically.
        </p>
        <button
          onClick={() => router.replace("/")}
          className="w-full rounded-2xl gradient-primary py-4 font-semibold text-white"
        >
          Back to Wallet
        </button>
      </div>
    );
  }

  return (
    <div ref={animScope} className="flex flex-col gap-6 px-4 pt-6">
      <div data-anim="header" className="flex items-center gap-3">
        <button onClick={() => (step > 1 ? setStep(step - 1) : router.back())} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold">Create Token</h1>
          <p className="text-xs text-muted-foreground">Step {step} of 4</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div data-anim="section" className="flex gap-2">
        {steps.map((s) => (
          <div key={s.id} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-full transition-colors",
                s.id < step && "bg-[oklch(0.72_0.19_155)] text-white",
                s.id === step && "gradient-primary text-white",
                s.id > step && "bg-secondary text-muted-foreground"
              )}
            >
              {s.id < step ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
            </div>
            <span className={cn("text-[10px]", s.id === step ? "text-primary font-medium" : "text-muted-foreground")}>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Step 1: Basics */}
      {step === 1 && (
        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Token Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. NexToken"
              maxLength={32}
              className="w-full rounded-xl bg-card p-4 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Symbol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              placeholder="e.g. NXT"
              maxLength={6}
              className="w-full rounded-xl bg-card p-4 font-mono uppercase placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">2-6 characters, like a ticker</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Icon</label>
            <div className="grid grid-cols-5 gap-2">
              {ICONS.map((ic) => (
                <button
                  key={ic}
                  onClick={() => setIcon(ic)}
                  className={cn(
                    "flex h-14 items-center justify-center rounded-xl text-2xl transition-all",
                    icon === ic ? "bg-primary/20 ring-2 ring-primary" : "bg-card hover:bg-accent"
                  )}
                >
                  {ic}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Color</label>
            <div className="grid grid-cols-5 gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "flex h-12 items-center justify-center rounded-xl transition-all",
                    color === c && "ring-2 ring-white ring-offset-2 ring-offset-background"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4 rounded-xl bg-card p-4">
            <div
              className="flex h-14 w-14 items-center justify-center rounded-full text-3xl"
              style={{ backgroundColor: color + "22" }}
            >
              {icon}
            </div>
            <div>
              <p className="text-lg font-bold">{name}</p>
              <p className="text-sm text-muted-foreground">{symbol.toUpperCase()}</p>
            </div>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this token for? Describe its purpose and utility..."
              rows={4}
              maxLength={500}
              className="w-full resize-none rounded-xl bg-card p-4 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-right text-xs text-muted-foreground">{description.length}/500</p>
          </div>
        </div>
      )}

      {/* Step 3: Config */}
      {step === 3 && (
        <div className="flex flex-col gap-5">
          <div>
            <label className="mb-2 block text-sm font-medium">Total Supply</label>
            <input
              type="number"
              value={totalSupply}
              onChange={(e) => setTotalSupply(e.target.value)}
              placeholder="1000000"
              className="w-full rounded-xl bg-card p-4 font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">Total number of tokens to create</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Decimals</label>
            <input
              type="number"
              value={decimals}
              onChange={(e) => setDecimals(e.target.value)}
              min={0}
              max={18}
              className="w-full rounded-xl bg-card p-4 font-mono placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-1 text-xs text-muted-foreground">Standard is 18 (like ETH). Use 0 for non-divisible tokens.</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Destination Wallet</label>
            <div className="flex flex-col gap-2">
              {wallets.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setWalletId(w.id)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl p-4 text-left transition-colors",
                    walletId === w.id ? "bg-primary/15 ring-1 ring-primary" : "bg-card hover:bg-accent"
                  )}
                >
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: w.color }}
                  >
                    {w.name[0]}
                  </div>
                  <div>
                    <p className="font-medium">{w.name}</p>
                    <p className="text-xs text-muted-foreground">{w.address}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Minting Fee Section */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-medium">Minting Fee</p>
              <p className="text-lg font-bold">${feeUsd.toFixed(2)}</p>
            </div>
            <p className="mb-4 text-xs text-muted-foreground">
              Fee = max($20, supply × 0.0001). This fee is burned on approval or refunded on rejection.
            </p>

            <label className="mb-2 block text-sm font-medium">Pay With</label>
            {payableTokens.length === 0 ? (
              <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>No tokens with a market price in this wallet. Buy some crypto first.</span>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                {payableTokens.map((t) => {
                  const tokenFee = t.price > 0 ? feeUsd / t.price : 0;
                  const enough = t.balance >= tokenFee;
                  return (
                    <button
                      key={t.id}
                      onClick={() => setPaymentTokenId(t.id)}
                      className={cn(
                        "flex items-center justify-between rounded-xl p-3 text-left transition-colors",
                        paymentTokenId === t.id
                          ? "bg-primary/15 ring-1 ring-primary"
                          : "bg-background hover:bg-accent",
                        !enough && "opacity-50"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold"
                          style={{ backgroundColor: (t.color || "#6366f1") + "22", color: t.color || "#6366f1" }}
                        >
                          {t.symbol.slice(0, 3)}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{t.symbol}</p>
                          <p className="text-xs text-muted-foreground">
                            Balance: {t.balance.toFixed(6)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">{tokenFee.toFixed(6)}</p>
                        {!enough && (
                          <p className="text-xs text-destructive">Insufficient</p>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {selectedPaymentToken && !hasSufficientBalance && (
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>
                  Need {feeAmount.toFixed(6)} {selectedPaymentToken.symbol} but you only have{" "}
                  {selectedPaymentToken.balance.toFixed(6)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 4: Review & Launch */}
      {step === 4 && (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4 rounded-xl bg-card p-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full text-4xl"
              style={{ backgroundColor: color + "22" }}
            >
              {icon}
            </div>
            <div>
              <p className="text-xl font-bold">{name}</p>
              <p className="text-sm font-medium" style={{ color }}>{symbol.toUpperCase()}</p>
            </div>
          </div>
          <div className="rounded-xl bg-card p-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Token Summary</p>
            <div className="space-y-2">
              {[
                ["Name", name],
                ["Symbol", symbol.toUpperCase()],
                ["Total Supply", supply.toLocaleString()],
                ["Decimals", decimals],
                ["Wallet", selectedWallet?.name ?? ""],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{label}</span>
                  <span className="font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-card p-4">
            <p className="text-sm">{description}</p>
          </div>

          {/* Fee Summary */}
          <div className="rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="mb-2 text-sm font-medium">Minting Fee</p>
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Fee (USD)</span>
                <span className="font-bold">${feeUsd.toFixed(2)}</span>
              </div>
              {selectedPaymentToken && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Pay with {selectedPaymentToken.symbol}</span>
                  <span className="font-medium">{feeAmount.toFixed(6)} {selectedPaymentToken.symbol}</span>
                </div>
              )}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              Deducted immediately. Refunded if your request is rejected.
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      )}

      {/* Navigation */}
      <div className="flex gap-3">
        {step < 4 ? (
          <button
            onClick={() => setStep(step + 1)}
            disabled={!canNext()}
            className={cn(
              "flex-1 rounded-2xl py-4 text-center font-semibold transition-all",
              canNext()
                ? "gradient-primary text-white active:scale-[0.98]"
                : "bg-secondary text-muted-foreground"
            )}
          >
            Continue
          </button>
        ) : (
          <button
            onClick={handleCreate}
            disabled={submitting}
            className={cn(
              "flex flex-1 items-center justify-center gap-2 rounded-2xl gradient-primary py-4 font-semibold text-white active:scale-[0.98]",
              submitting && "opacity-70"
            )}
          >
            <Sparkles className="h-5 w-5" />
            {submitting ? "Submitting..." : "Create Token"}
          </button>
        )}
      </div>
    </div>
  );
}
