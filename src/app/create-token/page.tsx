"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Check, Coins, FileText, Settings, Rocket } from "lucide-react";
import { useState, useEffect } from "react";
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

export default function CreateTokenPage() {
  const router = useRouter();
  const animScope = usePageTransition();
  const { wallets, createToken, isLoaded, fetchWallets } = useWalletStore();
  const [step, setStep] = useState(1);
  const [created, setCreated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

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

  const canNext = () => {
    if (step === 1) return name.length >= 2 && symbol.length >= 2 && symbol.length <= 6;
    if (step === 2) return description.length >= 10;
    if (step === 3) return parseInt(totalSupply) > 0;
    return true;
  };

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      await createToken({
        walletId,
        name,
        symbol: symbol.toUpperCase(),
        icon,
        color,
        totalSupply: parseInt(totalSupply),
        description,
      });
      setCreated(true);
    } catch {
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
            Your request to create {name} ({symbol.toUpperCase()}) with {parseInt(totalSupply).toLocaleString()} tokens is being reviewed
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
            <span className="font-medium">{parseInt(totalSupply).toLocaleString()}</span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Decimals</span>
            <span className="font-medium">{decimals}</span>
          </div>
          <div className="flex justify-between py-1 text-sm">
            <span className="text-muted-foreground">Status</span>
            <span className="font-medium text-[oklch(0.72_0.19_155)]">Active</span>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground">
          When web3 integration goes live, this token spec will be deployed as a smart contract on-chain.
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
                ["Total Supply", parseInt(totalSupply).toLocaleString()],
                ["Decimals", decimals],
                ["Wallet", wallets.find((w) => w.id === walletId)?.name ?? ""],
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
          <div className="rounded-xl border border-[oklch(0.8_0.15_85/0.3)] bg-[oklch(0.8_0.15_85/0.08)] p-4">
            <p className="text-sm text-[oklch(0.8_0.15_85)]">
              <strong>Web2 MVP:</strong> This token will be created locally in your wallet. When web3 integration is enabled, it will be deployed as a smart contract (ERC-20 compatible) on your chosen blockchain.
            </p>
          </div>
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
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl gradient-primary py-4 font-semibold text-white active:scale-[0.98]"
          >
            <Sparkles className="h-5 w-5" />
            Create Token
          </button>
        )}
      </div>
    </div>
  );
}
