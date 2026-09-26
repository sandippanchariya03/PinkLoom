"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  AnimatePresence,
} from "motion/react";
import { ArrowRight, Sparkles } from "lucide-react";
import { Lotus3DScene } from "./Lotus3DScene";
import { PetalSignInSurface } from "./PetalSignInSurface";
import { LotusCenterDiscovery } from "./LotusCenterDiscovery";
import { getCurrentUser, onAuthStateChange, type UserProfile } from "@/lib/auth/auth";
import { AuthHeaderControl } from "@/components/auth/AuthHeaderControl";

export type EcosystemState =
  | "LANDING"
  | "SIGN_IN_PETAL"
  | "LOTUS_ZOOMING"
  | "DISCOVERY_CENTER";

export function LotusEcosystem() {
  const shouldReduceMotion = useReducedMotion();
  const [experienceState, setExperienceState] = useState<EcosystemState>("LANDING");
  const [currentUser, setCurrentUser] = useState<UserProfile | null | undefined>(undefined);
  const [isCenterHovered, setIsCenterHovered] = useState(false);

  // Auth state listener
  useEffect(() => {
    let isMounted = true;
    getCurrentUser().then((user) => {
      if (isMounted) setCurrentUser(user);
    });

    const sub = onAuthStateChange((updated) => {
      if (isMounted) setCurrentUser(updated);
    });

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, []);

  // Handle clicking "Start Building" or the lotus center to initiate zoom
  const handleStartBuilding = useCallback(() => {
    if (shouldReduceMotion) {
      setExperienceState("DISCOVERY_CENTER");
      return;
    }

    setExperienceState("LOTUS_ZOOMING");
    setTimeout(() => {
      setExperienceState("DISCOVERY_CENTER");
    }, 900);
  }, [shouldReduceMotion]);

  // Return from Discovery back to water
  const handleBackToWater = useCallback(() => {
    setExperienceState("LANDING");
  }, []);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#070E12] text-[#FAF7F2] select-none">
      {/* 0. Full-Bleed Photographic Lotus Atmosphere matching user screenshot */}
      <div
        className="absolute inset-0 bg-cover bg-center pointer-events-none select-none transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: "url('/lotus/lotus-bloom.jpg')",
          filter: "blur(6px) brightness(0.68) saturate(1.22)",
        }}
      />

      {/* Atmospheric Dark Aquatic Vignette */}
      <div
        className="absolute inset-0 pointer-events-none select-none"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(7, 14, 18, 0.22) 0%, rgba(7, 14, 18, 0.65) 55%, #070E12 92%)",
        }}
      />

      {/* Warm Golden Botanical Core Bloom */}
      <div
        className="absolute top-[52%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-[440px] h-[440px] rounded-full pointer-events-none select-none"
        style={{
          background:
            "radial-gradient(circle, rgba(255, 235, 140, 0.72) 0%, rgba(255, 180, 50, 0.32) 42%, transparent 72%)",
          filter: "blur(26px)",
        }}
      />

      {/* 1. Realistic 3D WebGL Lotus & Water Scene */}
      <Lotus3DScene
        experienceState={experienceState}
        isCenterHovered={isCenterHovered}
        onCenterClick={handleStartBuilding}
        onPetalClick={() => setExperienceState("SIGN_IN_PETAL")}
        shouldReduceMotion={shouldReduceMotion ?? false}
      />

      {/* 2. Top Minimal Editorial Chrome matching user screenshot */}
      {experienceState !== "DISCOVERY_CENTER" && (
        <header className="fixed top-0 left-0 right-0 z-30 w-full max-w-6xl mx-auto px-6 py-7 flex items-center justify-between pointer-events-auto">
          <Link
            href="/"
            className="group flex items-center gap-2.5 text-xs tracking-[0.25em] uppercase font-semibold text-[#F7F5F0] hover:text-white transition-colors"
            id="nav-logo"
          >
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF4081] shadow-[0_0_10px_#FF4081,0_0_20px_#FF4081]" />
            PINKLOOM
          </Link>

          {/* Right Navigation State */}
          <div className="flex items-center gap-3">
            {currentUser ? (
              <>
                <button
                  type="button"
                  onClick={handleStartBuilding}
                  id="top-dashboard-btn"
                  title={`Workspace (${currentUser.displayName || currentUser.email})`}
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-medium text-white/90 backdrop-blur-md transition-all shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-editorial italic">Workspace</span>
                  <span className="text-xs">◉</span>
                </button>
                <AuthHeaderControl user={currentUser} returnTo="/" />
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setExperienceState("SIGN_IN_PETAL")}
                  id="top-signin-btn"
                  className="group inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-[#E87A90]/40 bg-white/10 hover:bg-[#E87A90]/20 text-xs font-medium text-white/90 backdrop-blur-md transition-all shadow-xs hover:border-[#E87A90]"
                >
                  <span className="w-2 h-2 rounded-full bg-[#FF4081] shadow-[0_0_8px_#FF4081]" />
                  <span>Sign In</span>
                  <ArrowRight className="w-3 h-3 text-[#E87A90] group-hover:translate-x-0.5 transition-transform" />
                </button>
                <button
                  type="button"
                  onClick={handleStartBuilding}
                  id="top-dashboard-btn"
                  className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/20 text-xs font-medium text-white/90 backdrop-blur-md transition-all shadow-xs"
                >
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="font-editorial italic">Workspace</span>
                  <span className="text-xs">◉</span>
                </button>
              </>
            )}
          </div>
        </header>
      )}

      {/* 4. Bottom Landing Editorial & Primary CTA */}
      <AnimatePresence>
        {experienceState === "LANDING" && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6 }}
            className="fixed bottom-0 left-0 right-0 z-20 pointer-events-none flex flex-col items-center justify-end pb-8 sm:pb-12 px-6 text-center"
          >
            <div className="pointer-events-auto space-y-2.5 max-w-xl mx-auto mb-5">
              <h1
                id="hero-heading"
                className="font-editorial text-3xl sm:text-4xl md:text-5xl font-normal tracking-tight text-[#FAF7F2] drop-shadow-[0_2px_18px_rgba(0,0,0,0.6)] leading-[1.12]"
              >
                Ideas become identities.
              </h1>
              <p className="text-xs sm:text-sm text-[#C8C5BD] font-light max-w-md mx-auto leading-relaxed drop-shadow-[0_1px_8px_rgba(0,0,0,0.5)]">
                Turn your rough idea into a brand that knows what it wants to be.
                A multi-stage agentic intelligence workflow that questions, shapes, and crystallizes.
              </p>
            </div>

            {/* Primary Action Button & Sign In Option */}
            <div className="pointer-events-auto flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                id="start-building-btn"
                onClick={handleStartBuilding}
                onMouseEnter={() => setIsCenterHovered(true)}
                onMouseLeave={() => setIsCenterHovered(false)}
                className="group relative inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-white text-[#111618] text-sm tracking-wide font-medium shadow-[0_0_24px_rgba(255,255,255,0.22)] hover:bg-[#FFF5F8] hover:shadow-[0_0_32px_rgba(255,107,139,0.35)] transition-all active:scale-[0.99]"
              >
                <Sparkles className="w-4 h-4 text-[#E87A90]" />
                <span>Start Building</span>
                <ArrowRight className="w-4 h-4 text-[#666] group-hover:text-[#111618] group-hover:translate-x-1 transition-all" />
              </button>

              {!currentUser && (
                <button
                  type="button"
                  id="hero-signin-btn"
                  onClick={() => setExperienceState("SIGN_IN_PETAL")}
                  className="group inline-flex items-center gap-2 px-5 py-3.5 rounded-full border border-white/20 bg-white/10 hover:bg-white/15 text-white/90 hover:text-white text-xs tracking-wider uppercase font-medium backdrop-blur-md transition-all active:scale-[0.99]"
                >
                  <span className="w-2 h-2 rounded-full bg-[#FF4081] shadow-[0_0_6px_#FF4081]" />
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#E87A90] group-hover:translate-x-0.5 transition-transform" />
                </button>
              )}
            </div>

            {/* Subtle Hint */}
            <p className="mt-3.5 text-[10px] tracking-[0.22em] uppercase text-white/40 font-mono pointer-events-auto">
              Click anywhere on water to ripple · Click lotus to enter
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Phase C & D: Sign-In Petal Separation Overlay */}
      <PetalSignInSurface
        isOpen={experienceState === "SIGN_IN_PETAL"}
        onClose={() => setExperienceState("LANDING")}
        onAuthSuccess={() => {
          setExperienceState("LANDING");
        }}
        returnTo="/"
      />

      {/* 6. Phase F, G, H: Lotus Center Seed Receptacle & Discovery Input */}
      <AnimatePresence>
        {experienceState === "DISCOVERY_CENTER" && (
          <LotusCenterDiscovery onBackToWater={handleBackToWater} />
        )}
      </AnimatePresence>
    </div>
  );
}
