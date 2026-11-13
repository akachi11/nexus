"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, Check, Loader2 } from "lucide-react";
import { useState } from "react";
import { useWalletStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import { usePageTransition } from "@/hooks/use-gsap";

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

export default function CreateWalletPage() {
  const router = useRouter();
  const animScope = usePageTransition();
  const { addWallet } = useWalletStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [created, setCreated] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleCreate = async () => {
    if (name.length < 2) return;
    setSubmitting(true);
    try {
      await addWallet({ name, color });
      setCreated(true);
      setTimeout(() => router.push("/wallets"), 2000);
    } catch {
      setSubmitting(false);
    }
  };

  if (created) {
    return (
      <div ref={animScope} className="flex flex-col items-center justify-center gap-4 px-4 pt-32">
        <div data-anim="result-icon" className="flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
          <Check className="h-10 w-10 text-white" />
        </div>
        <h2 data-anim="result-text" className="text-xl font-bold">Wallet Created!</h2>
        <p data-anim="result-text" className="text-muted-foreground">{name} is ready to use</p>
      </div>
    );
  }

  return (
    <div ref={animScope} className="flex flex-col gap-6 px-4 pt-6">
      <div data-anim="header" className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">New Wallet</h1>
      </div>

      <div data-anim="card" className="flex flex-col items-center gap-4 py-6">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white transition-colors"
          style={{ backgroundColor: color }}
        >
          {name ? name[0].toUpperCase() : <Wallet className="h-10 w-10" />}
        </div>
      </div>

      <div data-anim="form">
        <label className="mb-2 block text-sm font-medium">Wallet Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. DeFi Portfolio"
          maxLength={24}
          className="w-full rounded-xl bg-card p-4 placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div data-anim="form">
        <label className="mb-2 block text-sm font-medium">Color</label>
        <div className="grid grid-cols-4 gap-3">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setColor(c)}
              className={cn(
                "h-14 rounded-xl transition-all",
                color === c && "ring-2 ring-white ring-offset-2 ring-offset-background"
              )}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <button
        onClick={handleCreate}
        disabled={name.length < 2 || submitting}
        className={cn(
          "mt-4 flex items-center justify-center gap-2 rounded-2xl py-4 font-semibold transition-all",
          name.length >= 2 && !submitting
            ? "gradient-primary text-white active:scale-[0.98]"
            : "bg-secondary text-muted-foreground"
        )}
      >
        {submitting ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Creating...
          </>
        ) : (
          "Create Wallet"
        )}
      </button>
    </div>
  );
}
