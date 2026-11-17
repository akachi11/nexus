"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { ArrowRight, Shield, Globe, TrendingUp, Zap, Lock, BarChart3 } from "lucide-react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const ASSET_CATEGORIES = [
  {
    title: "Rare Coins",
    description: "From ancient Roman denarii to modern proof sets — authenticated, graded, and ready to trade.",
    image: "https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=800&q=80&auto=format",
    accent: "from-amber-500/80 to-amber-900/90",
  },
  {
    title: "Stocks & Equities",
    description: "Access global equity markets with fractional shares and real-time portfolio tracking.",
    image: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80&auto=format",
    accent: "from-emerald-500/80 to-emerald-900/90",
  },
  {
    title: "Blockchain Assets",
    description: "Tokenized collectibles and digital currencies bridging the physical and digital worlds.",
    image: "https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&q=80&auto=format",
    accent: "from-violet-500/80 to-violet-900/90",
  },
  {
    title: "Precious Metals",
    description: "Gold, silver, platinum — backed by verified physical reserves in insured vaults.",
    image: "https://images.unsplash.com/photo-1610375461246-83df859d849d?w=800&q=80&auto=format",
    accent: "from-yellow-600/80 to-yellow-950/90",
  },
];

const FEATURES = [
  {
    icon: Shield,
    title: "Bank-Grade Security",
    description: "AES-256 encryption and cold storage protection for every asset in your portfolio.",
  },
  {
    icon: Globe,
    title: "Global Marketplace",
    description: "Connect with collectors and investors worldwide. Trade across borders seamlessly.",
  },
  {
    icon: TrendingUp,
    title: "Live Valuations",
    description: "Real-time market data and AI-powered price discovery across all asset classes.",
  },
  {
    icon: Zap,
    title: "Instant Trades",
    description: "Execute swaps, purchases, and sales in seconds with near-zero settlement times.",
  },
  {
    icon: Lock,
    title: "Verified Authenticity",
    description: "Every collectible is authenticated and graded by certified third-party experts.",
  },
  {
    icon: BarChart3,
    title: "Portfolio Analytics",
    description: "Track performance, diversification, and historical trends across all your holdings.",
  },
];

const STEPS = [
  { num: "01", title: "Create Your Vault", desc: "Sign up in seconds and get a secure multi-asset wallet with military-grade encryption." },
  { num: "02", title: "Explore & Discover", desc: "Browse rare coins, equities, digital assets, and precious metals across global markets." },
  { num: "03", title: "Trade & Collect", desc: "Buy, sell, swap, and build a diversified portfolio that spans centuries of value." },
];

export function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero text stagger
      gsap.from("[data-hero-text]", {
        y: 40,
        opacity: 0,
        duration: 0.9,
        stagger: 0.15,
        ease: "power3.out",
        delay: 0.2,
      });

      // Hero buttons
      gsap.from("[data-hero-cta]", {
        y: 30,
        opacity: 0,
        duration: 0.7,
        stagger: 0.1,
        ease: "power2.out",
        delay: 0.8,
      });

      // Floating orbs
      gsap.to("[data-orb]", {
        y: "random(-20, 20)",
        x: "random(-15, 15)",
        duration: "random(3, 5)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: { each: 0.5, from: "random" },
      });

      // Stats counter
      gsap.utils.toArray<HTMLElement>("[data-stat-num]").forEach((el) => {
        const target = parseInt(el.dataset.statNum || "0", 10);
        gsap.from(el, {
          textContent: 0,
          duration: 2,
          ease: "power2.out",
          snap: { textContent: 1 },
          scrollTrigger: { trigger: el, start: "top 85%" },
          onUpdate() {
            const suffix = el.dataset.suffix || "";
            el.textContent = Math.floor(parseFloat(el.textContent || "0")).toLocaleString() + suffix;
          },
        });
      });

      // Section headings
      gsap.utils.toArray<HTMLElement>("[data-section-head]").forEach((el) => {
        gsap.from(el, {
          y: 30,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      // Asset cards staggered reveal
      gsap.utils.toArray<HTMLElement>("[data-asset-card]").forEach((el, i) => {
        gsap.from(el, {
          y: 60,
          opacity: 0,
          scale: 0.95,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%" },
          delay: i * 0.1,
        });
      });

      // Feature cards
      gsap.utils.toArray<HTMLElement>("[data-feature-card]").forEach((el, i) => {
        gsap.from(el, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 88%" },
          delay: (i % 2) * 0.12,
        });
      });

      // Step items
      gsap.utils.toArray<HTMLElement>("[data-step]").forEach((el, i) => {
        gsap.from(el, {
          x: -40,
          opacity: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
          delay: i * 0.15,
        });
      });

      // Timeline line growth
      const line = document.querySelector("[data-timeline-line]");
      if (line) {
        gsap.from(line, {
          scaleY: 0,
          transformOrigin: "top",
          duration: 1.5,
          ease: "power2.inOut",
          scrollTrigger: { trigger: line, start: "top 85%" },
        });
      }

      // CTA section
      gsap.from("[data-cta]", {
        y: 50,
        opacity: 0,
        scale: 0.97,
        duration: 0.8,
        ease: "power2.out",
        scrollTrigger: { trigger: "[data-cta]", start: "top 85%" },
      });

      // Image parallax on asset cards
      gsap.utils.toArray<HTMLElement>("[data-parallax-img]").forEach((img) => {
        gsap.to(img, {
          yPercent: -15,
          ease: "none",
          scrollTrigger: {
            trigger: img.parentElement,
            start: "top bottom",
            end: "bottom top",
            scrub: 1,
          },
        });
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={containerRef} className="flex flex-col -mb-20" style={{ marginLeft: "calc(-50vw + 50%)", marginRight: "calc(-50vw + 50%)", width: "100vw" }}>

      {/* ── Hero ─────────────────────────────────────── */}
      <section className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden px-6 pb-16 pt-12">
        {/* Ambient orbs */}
        <div data-orb className="pointer-events-none absolute -top-20 right-[-10%] h-72 w-72 rounded-full bg-primary/15 blur-[100px]" />
        <div data-orb className="pointer-events-none absolute bottom-10 left-[-15%] h-56 w-56 rounded-full bg-violet-500/15 blur-[90px]" />
        <div data-orb className="pointer-events-none absolute top-1/3 left-1/2 h-40 w-40 -translate-x-1/2 rounded-full bg-indigo-400/10 blur-[80px]" />

        {/* Grid texture */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "radial-gradient(circle, oklch(0.97 0 0) 1px, transparent 1px)", backgroundSize: "32px 32px" }} />

        {/* Content */}
        <div className="relative mx-auto flex max-w-md flex-col items-center text-center">
          <h2 data-hero-text className="mb-5 font-[var(--font-montserrat)] text-[2.75rem] font-black uppercase tracking-wider sm:text-5xl" style={{ fontFamily: "var(--font-montserrat)" }}>
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent drop-shadow-lg">
              NUMIRELICS
            </span>
          </h2>

          <div data-hero-text className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-xs font-medium text-primary backdrop-blur-sm">
            <span className="relative flex h-2 w-2"><span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-60" /><span className="relative inline-flex h-2 w-2 rounded-full bg-primary" /></span>
            Now in Public Beta
          </div>

          <h1 data-hero-text className="text-[2.5rem] font-bold leading-[1.1] tracking-tight sm:text-5xl">
            Preserving<br />
            <span className="bg-gradient-to-r from-primary via-violet-400 to-fuchsia-400 bg-clip-text text-transparent">
              History.
            </span>{" "}
            Connecting<br />
            <span className="bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
              Collectors.
            </span>
          </h1>

          <p data-hero-text className="mt-5 max-w-sm text-base leading-relaxed text-muted-foreground sm:text-lg">
            The multi-asset marketplace where rare coins, stocks, blockchain assets, and precious metals converge.
          </p>

          <div className="mt-10 flex w-full max-w-xs flex-col gap-3">
            <Link
              data-hero-cta
              href="/register"
              className="group relative flex items-center justify-center gap-2 overflow-hidden rounded-2xl py-4 text-lg font-semibold text-white transition-all active:scale-[0.97]"
            >
              <span className="absolute inset-0 gradient-primary" />
              <span className="absolute inset-0 bg-white/0 transition-colors group-hover:bg-white/10" />
              <span className="relative flex items-center gap-2">
                Get Started Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-0.5" />
              </span>
            </Link>
            <Link
              data-hero-cta
              href="/login"
              className="flex items-center justify-center rounded-2xl border border-border/50 bg-card/50 py-4 text-lg font-semibold backdrop-blur-sm transition-all hover:bg-card active:scale-[0.97]"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
          <div className="flex h-8 w-5 items-start justify-center rounded-full border border-muted-foreground/30 p-1">
            <div className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground/50" />
          </div>
        </div>
      </section>

      {/* ── Social Proof / Stats ───────────────────── */}
      <section className="border-y border-border/50 bg-card/30 backdrop-blur-sm">
        <div className="mx-auto flex max-w-lg items-center justify-around px-4 py-6">
          {[
            { num: 12000, suffix: "+", label: "Collectors" },
            { num: 50000, suffix: "+", label: "Assets Listed" },
            { num: 98, suffix: "%", label: "Uptime" },
          ].map(({ num, suffix, label }) => (
            <div key={label} className="flex flex-col items-center gap-0.5">
              <span data-stat-num={num} data-suffix={suffix} className="text-xl font-bold text-foreground sm:text-2xl">{num.toLocaleString()}{suffix}</span>
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── Asset Categories ───────────────────────── */}
      <section className="px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-lg">
          <div data-section-head className="mb-10 text-center">
            <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
              Multi-Asset Platform
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Four Markets.<br />One Vault.
            </h2>
          </div>

          <div className="flex flex-col gap-4">
            {ASSET_CATEGORIES.map(({ title, description, image, accent }) => (
              <div
                key={title}
                data-asset-card
                className="group relative h-52 overflow-hidden rounded-3xl sm:h-56"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <img
                    data-parallax-img
                    src={image}
                    alt={title}
                    loading="lazy"
                    className="h-[130%] w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className={`absolute inset-0 bg-gradient-to-t ${accent}`} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-5 sm:p-6">
                  <h3 className="text-xl font-bold text-white sm:text-2xl">{title}</h3>
                  <p className="mt-1.5 max-w-[85%] text-sm leading-relaxed text-white/80">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features Grid ──────────────────────────── */}
      <section className="px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-lg">
          <div data-section-head className="mb-10 text-center">
            <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
              Why Numirelics
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Built for Collectors<br />& Investors
            </h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                data-feature-card
                className="group flex flex-col gap-3 rounded-2xl border border-border/40 bg-card/50 p-4 backdrop-blur-sm transition-all hover:border-primary/30 hover:bg-card"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/20">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-semibold leading-snug">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ───────────────────────────── */}
      <section className="px-5 py-16 sm:px-6">
        <div className="mx-auto max-w-lg">
          <div data-section-head className="mb-10 text-center">
            <span className="mb-2 inline-block rounded-full bg-primary/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-primary">
              Getting Started
            </span>
            <h2 className="mt-2 text-2xl font-bold tracking-tight sm:text-3xl">
              Three Steps to<br />Your Portfolio
            </h2>
          </div>

          <div className="relative">
            {/* Vertical connecting line */}
            <div data-timeline-line className="absolute left-5 top-6 bottom-6 w-px bg-gradient-to-b from-primary via-violet-400 to-primary/20" />

            <div className="flex flex-col gap-6">
              {STEPS.map(({ num, title, desc }) => (
                <div key={num} data-step className="relative flex gap-5 pl-1">
                  <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full gradient-primary text-sm font-bold text-white shadow-lg shadow-primary/25">
                    {num}
                  </div>
                  <div className="flex-1 rounded-2xl border border-border/40 bg-card/50 p-4 backdrop-blur-sm">
                    <p className="text-base font-semibold">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Bottom CTA ─────────────────────────────── */}
      <section className="px-5 pb-16 pt-4 sm:px-6">
        <div className="mx-auto max-w-lg">
          <div data-cta className="relative overflow-hidden rounded-3xl">
            {/* Background image */}
            <div className="absolute inset-0">
              <img
                src="https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80&auto=format"
                alt=""
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-violet-600/85 to-fuchsia-600/80 backdrop-blur-[2px]" />
            </div>

            <div className="relative px-6 py-12 text-center sm:py-14">
              <h3 className="text-2xl font-bold text-white sm:text-3xl">
                Ready to Start<br />Collecting?
              </h3>
              <p className="mx-auto mt-3 max-w-xs text-sm leading-relaxed text-white/80">
                Join thousands of collectors and investors building diversified portfolios on Numirelics.
              </p>
              <Link
                href="/register"
                className="group mt-8 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-semibold text-primary shadow-xl transition-all hover:bg-white/90 active:scale-[0.97]"
              >
                Create Free Account
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────── */}
      <footer className="border-t border-border/50 bg-card/20 px-5 py-10">
        <div className="mx-auto flex max-w-lg flex-col items-center gap-4 text-center">
          <p className="text-2xl font-black uppercase tracking-wider" style={{ fontFamily: "var(--font-montserrat)" }}>
            <span className="bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 bg-clip-text text-transparent">
              NUMIRELICS
            </span>
          </p>
          <p className="text-xs text-muted-foreground">
            Preserving History. Connecting Collectors. Redefining Ownership.
          </p>
          <div className="flex gap-6 text-xs text-muted-foreground">
            <Link href="/login" className="transition-colors hover:text-foreground">Sign In</Link>
            <Link href="/register" className="transition-colors hover:text-foreground">Register</Link>
          </div>
          <p className="mt-2 text-[10px] text-muted-foreground/60">
            &copy; 2024 Numirelics. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
