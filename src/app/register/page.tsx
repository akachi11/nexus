"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Eye, EyeOff, Loader2, Wallet } from "lucide-react";
import { useAuth } from "@/components/auth-provider";
import { usePageTransition } from "@/hooks/use-gsap";
import { cn } from "@/lib/utils";

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const animScope = usePageTransition();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordValid = password.length >= 8 && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[0-9]/.test(password);
  const canSubmit = firstName && lastName && email && passwordValid && !loading;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await register({ email, password, firstName, lastName });
    if (result.success) {
      router.replace("/");
    } else {
      setError(result.error || "Registration failed");
    }
    setLoading(false);
  };

  return (
    <div ref={animScope} className="flex min-h-screen flex-col items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div data-anim="header" className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl gradient-primary">
            <Wallet className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold">Create Account</h1>
          <p className="text-sm text-muted-foreground">Get started with Numirelics</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-xl bg-destructive/10 p-3 text-center text-sm text-destructive">
              {error}
            </div>
          )}

          <div data-anim="form" className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="John"
                required
                className="w-full rounded-xl bg-card p-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-muted-foreground">Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Doe"
                required
                className="w-full rounded-xl bg-card p-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div data-anim="form">
            <label className="mb-1.5 block text-sm text-muted-foreground">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
              className="w-full rounded-xl bg-card p-4 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div data-anim="form">
            <label className="mb-1.5 block text-sm text-muted-foreground">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min 8 chars, uppercase, lowercase, number"
                required
                className="w-full rounded-xl bg-card p-4 pr-12 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {password && !passwordValid && (
              <div className="mt-2 flex flex-col gap-1 text-xs">
                <p className={password.length >= 8 ? "text-[oklch(0.72_0.19_155)]" : "text-muted-foreground"}>
                  {password.length >= 8 ? "✓" : "○"} At least 8 characters
                </p>
                <p className={/[A-Z]/.test(password) ? "text-[oklch(0.72_0.19_155)]" : "text-muted-foreground"}>
                  {/[A-Z]/.test(password) ? "✓" : "○"} One uppercase letter
                </p>
                <p className={/[a-z]/.test(password) ? "text-[oklch(0.72_0.19_155)]" : "text-muted-foreground"}>
                  {/[a-z]/.test(password) ? "✓" : "○"} One lowercase letter
                </p>
                <p className={/[0-9]/.test(password) ? "text-[oklch(0.72_0.19_155)]" : "text-muted-foreground"}>
                  {/[0-9]/.test(password) ? "✓" : "○"} One number
                </p>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!canSubmit}
            className={cn(
              "mt-2 flex items-center justify-center gap-2 rounded-2xl py-4 text-lg font-semibold transition-all",
              !canSubmit
                ? "bg-[oklch(0.25_0.02_270)] text-muted-foreground"
                : "gradient-primary text-white shadow-lg shadow-primary/30 active:scale-[0.98]"
            )}
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
