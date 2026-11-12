"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Wallet, Check } from "lucide-react";
import { useState } from "react";
import { useWalletStore } from "@/lib/store";
import { cn } from "@/lib/utils";

const COLORS = ["#6366f1", "#ec4899", "#f59e0b", "#10b981", "#ef4444", "#8b5cf6", "#06b6d4", "#f97316"];

function generateAddress(): string {
  const chars = "0123456789abcdefABCDEF";
  let addr = "0x";
  for (let i = 0; i < 40; i++) addr += chars[Math.floor(Math.random() * chars.length)];
  return addr;
}

export default function CreateWalletPage() {
  const router = useRouter();
  const { addWallet } = useWalletStore();
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [created, setCreated] = useState(false);

  const handleCreate = () => {
    if (name.length < 2) return;
    const address = generateAddress();
    addWallet({
      id: `wallet-${Date.now()}`,
      name,
      address: `${address.slice(0, 6)}...${address.slice(-4)}`,
      totalBalance: 0,
      change24h: 0,
      tokens: [],
      color,
    });
    setCreated(true);
    setTimeout(() => router.push("/wallets"), 2000);
  };

  if (created) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 px-4 pt-32">
        <div className="flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: color }}>
          <Check className="h-10 w-10 text-white" />
        </div>
        <h2 className="text-xl font-bold">Wallet Created!</h2>
        <p className="text-muted-foreground">{name} is ready to use</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 px-4 pt-6">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <h1 className="text-xl font-bold">New Wallet</h1>
      </div>

      <div className="flex flex-col items-center gap-4 py-6">
        <div
          className="flex h-20 w-20 items-center justify-center rounded-full text-3xl font-bold text-white transition-colors"
          style={{ backgroundColor: color }}
        >
          {name ? name[0].toUpperCase() : <Wallet className="h-10 w-10" />}
        </div>
      </div>

      <div>
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

      <div>
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
        disabled={name.length < 2}
        className={cn(
          "mt-4 rounded-2xl py-4 font-semibold transition-all",
          name.length >= 2
            ? "gradient-primary text-white active:scale-[0.98]"
            : "bg-secondary text-muted-foreground"
        )}
      >
        Create Wallet
      </button>
    </div>
  );
}
