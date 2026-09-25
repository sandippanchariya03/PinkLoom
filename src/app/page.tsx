import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { LotusInteraction } from "@/components/motion/LotusInteraction";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#FBF9F6] text-[#141416]">
      {/* Subtle organic grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035] mix-blend-multiply"
        style={{
          backgroundImage: `radial-gradient(#141416 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      {/* Top Editorial Navigation */}
      <header className="relative z-10 w-full max-w-6xl mx-auto px-6 py-8 flex items-center justify-between">
        <Link
          href="/"
          className="group flex items-center gap-2.5 text-xs tracking-[0.25em] uppercase font-semibold text-[#141416] hover:opacity-70 transition-opacity"
          id="nav-logo"
        >
          <span className="w-2 h-2 rounded-full bg-[#E87A90] inline-block transition-transform group-hover:scale-125" />
          PINKLOOM
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/workspace"
            id="nav-enter-btn"
            className="inline-flex items-center gap-1.5 text-xs tracking-wider uppercase text-[#686764] hover:text-[#141416] transition-colors py-1.5 px-3 rounded-full hover:bg-[#F2EFE9]"
          >
            <span>Enter</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </nav>
      </header>

      {/* Main Hero & Interactive Lotus */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-6 text-center max-w-4xl mx-auto my-auto py-12">
        {/* Lotus Visual Anchor */}
        <div className="relative mb-6 cursor-pointer">
          <LotusInteraction size={300} className="mx-auto" />
          <p className="sr-only">
            Interactive biological lotus flower reacting organically to cursor movement.
          </p>
        </div>

        {/* Editorial Headline */}
        <div className="space-y-4 max-w-2xl">
          <h1
            className="font-editorial text-4xl sm:text-5xl md:text-6xl font-normal tracking-tight text-[#141416] leading-[1.12]"
            id="hero-heading"
          >
            Ideas become identities.
          </h1>

          <p className="text-base sm:text-lg text-[#686764] font-light max-w-xl mx-auto leading-relaxed">
            Turn your rough idea into a brand that knows what it wants to be.
            A multi-stage agentic intelligence workflow that questions, shapes, and crystallizes.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="mt-10">
          <Link
            href="/workspace"
            id="start-building-btn"
            className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#141416] text-[#FBF9F6] text-sm tracking-wide font-medium shadow-sm hover:bg-[#27262A] transition-all hover:shadow-md active:scale-[0.99]"
          >
            <Sparkles className="w-4 h-4 text-[#E87A90]" />
            <span>Start Building</span>
            <ArrowRight className="w-4 h-4 text-[#96948F] group-hover:text-[#FBF9F6] group-hover:translate-x-1 transition-all" />
          </Link>
        </div>
      </main>

      {/* Minimal Footer Pipeline Summary */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-8 border-t border-[#E8E5DF]/60 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[11px] tracking-[0.18em] uppercase text-[#96948F]">
          <span>01 Discover</span>
          <span className="text-[#DDD9D0]">→</span>
          <span>02 Position</span>
          <span className="text-[#DDD9D0]">→</span>
          <span>03 Shape</span>
          <span className="text-[#DDD9D0]">→</span>
          <span>04 Visualize</span>
          <span className="text-[#DDD9D0]">→</span>
          <span>05 Challenge</span>
          <span className="text-[#DDD9D0]">→</span>
          <span>06 Consistency</span>
          <span className="text-[#DDD9D0]">→</span>
          <span>07 Deliver</span>
        </div>
        <p className="mt-3 text-[11px] text-[#A5A39E]">
          PinkLoom Intelligence System · Phase 1 Foundation
        </p>
      </footer>
    </div>
  );
}
