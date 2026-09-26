"use client";

import React from "react";
import { motion } from "motion/react";
import { WorkspaceView } from "@/components/workspace/WorkspaceView";

interface LotusCenterDiscoveryProps {
  onBackToWater: () => void;
}

export function LotusCenterDiscovery({
  onBackToWater,
}: LotusCenterDiscoveryProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="fixed inset-0 z-40 flex flex-col overflow-y-auto overflow-x-hidden bg-[#0D1518] text-[#FAF6F0]"
    >
      {/* 
        Macro Lotus Center Environment
        Golden receptacle core with radiating stamens, magenta-tipped filaments,
        and surrounding warm translucent petals.
      */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden select-none"
        aria-hidden="true"
      >
        {/* Deep ambient dark pond backdrop */}
        <div className="absolute inset-0 bg-gradient-to-b from-[#141C20] via-[#0E171B] to-[#080E10]" />

        {/* Real Macro Lotus Center Photograph */}
        <div
          className="absolute inset-0 bg-center bg-no-repeat bg-cover opacity-45 mix-blend-screen scale-105 transition-transform duration-1000 ease-out"
          style={{
            backgroundImage: "url('/lotus/lotus-macro-center.jpg')",
            filter: "contrast(1.18) brightness(0.82) saturate(1.25)",
          }}
        />

        {/* Soft Vignette & Radial Depth Focus */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at 50% 40%, transparent 25%, rgba(13, 21, 24, 0.72) 65%, #0D1518 96%)",
          }}
        />

        {/* Warm Golden Botanical Glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[720px] rounded-full opacity-60 blur-3xl pointer-events-none"
          style={{
            background:
              "radial-gradient(circle, rgba(255, 215, 60, 0.45) 0%, rgba(245, 160, 20, 0.22) 50%, transparent 75%)",
          }}
        />

        {/* Radiating Stamens & Concentric Sacred Botanical Geometry */}
        <svg
          viewBox="0 0 1000 1000"
          fill="none"
          className="absolute -top-[8%] left-1/2 -translate-x-1/2 w-[1150px] h-[1150px] opacity-45"
        >
          <defs>
            <linearGradient id="cd_stamenGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#FFF176" />
              <stop offset="70%" stopColor="#FFB300" />
              <stop offset="100%" stopColor="#FF4081" />
            </linearGradient>
          </defs>

          {/* Seed Chamber Concentric Rings */}
          <circle cx="500" cy="500" r="110" stroke="#FFD54F" strokeWidth="1.2" strokeDasharray="3 4" opacity="0.8" />
          <circle cx="500" cy="500" r="180" stroke="#FFCA28" strokeWidth="1.2" strokeDasharray="4 6" opacity="0.7" />
          <circle cx="500" cy="500" r="280" stroke="#FFA000" strokeWidth="1.4" strokeDasharray="5 8" opacity="0.6" />
          <circle cx="500" cy="500" r="410" stroke="#FF80AB" strokeWidth="0.9" strokeDasharray="6 10" opacity="0.5" />

          {/* Radiating Golden Filaments with Pink/Magenta Anther Tips */}
          {Array.from({ length: 64 }).map((_, i) => {
            const angle = (i * Math.PI) / 32;
            const rInner = 180 + (i % 4) * 8;
            const rOuter = 380 + (i % 5) * 15;
            const x1 = 500 + Math.cos(angle) * rInner;
            const y1 = 500 + Math.sin(angle) * rInner;
            const x2 = 500 + Math.cos(angle) * rOuter;
            const y2 = 500 + Math.sin(angle) * rOuter;

            return (
              <g key={i}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="url(#cd_stamenGrad)"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  opacity="0.75"
                />
                <circle
                  cx={x2}
                  cy={y2}
                  r="2.5"
                  fill="#FF4081"
                  opacity="0.9"
                />
              </g>
            );
          })}
        </svg>

        {/* Ambient Film Grain */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: "radial-gradient(#FFFFFF 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      {/* Screen 2: Direct Discovery Workflow Interface (No intermediate Screen 3) */}
      <div className="relative z-10 w-full min-h-screen flex flex-col">
        <WorkspaceView onBackToWater={onBackToWater} />
      </div>
    </motion.div>
  );
}
