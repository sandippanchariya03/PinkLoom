"use client";

import React, { useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useReducedMotion,
  type MotionValue,
} from "motion/react";

interface LotusInteractionProps {
  size?: number;
  className?: string;
  interactive?: boolean;
}

export function LotusInteraction({
  size = 320,
  className = "",
  interactive = true,
}: LotusInteractionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const shouldReduceMotion = useReducedMotion();

  // Raw wind impulse motion values
  const windX = useMotionValue(0);
  const windY = useMotionValue(0);

  // Organic spring physics: smooth damping and natural oscillation
  const springConfig = { stiffness: 90, damping: 16, mass: 0.6 };
  const springX = useSpring(windX, springConfig);
  const springY = useSpring(windY, springConfig);

  // Derived transforms for organic biological reaction
  // Stem sways gently with the wind
  const stemRotate = useTransform(springX, [-100, 100], [-10, 10]);
  const stemSkew = useTransform(springX, [-100, 100], [-6, 6]);

  // Lotus head rotation & slight lateral translation
  const headRotate = useTransform(springX, [-100, 100], [-14, 14]);
  const headTranslateX = useTransform(springX, [-100, 100], [-18, 18]);
  const headTranslateY = useTransform(springY, [-100, 100], [-10, 10]);

  // Petal flutter layers: different depths react with distinct inertia
  const leftOuterPetalRotate = useTransform(springX, [-100, 100], [-18, 8]);
  const rightOuterPetalRotate = useTransform(springX, [-100, 100], [-8, 18]);
  const leftInnerPetalRotate = useTransform(springX, [-100, 100], [-12, 6]);
  const rightInnerPetalRotate = useTransform(springX, [-100, 100], [-6, 12]);
  const centerPetalScaleY = useTransform(springY, [-100, 100], [0.94, 1.04]);

  useEffect(() => {
    // If reduced motion is requested or interactive is disabled, skip event listeners
    if (shouldReduceMotion || !interactive) return;

    let lastX = 0;
    let lastY = 0;
    let lastTime = performance.now();
    let decayTimeout: NodeJS.Timeout | null = null;

    const handlePointerMove = (e: PointerEvent) => {
      if (!containerRef.current) return;

      const now = performance.now();
      const dt = Math.max(now - lastTime, 16); // avoid div by 0
      const vx = (e.clientX - lastX) / dt; // pixels per ms
      const vy = (e.clientY - lastY) / dt;

      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;

      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      // Distance from lotus center
      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      // Proximity falloff (strongest within 400px, gently dissipates beyond)
      const maxDist = 500;
      const proximity = Math.max(0, 1 - dist / maxDist);

      if (proximity > 0) {
        // Wind impulse proportional to pointer speed and proximity
        const forceMultiplier = 45;
        const targetWindX = Math.max(-90, Math.min(90, vx * forceMultiplier * proximity));
        const targetWindY = Math.max(-60, Math.min(60, vy * forceMultiplier * proximity));

        windX.set(targetWindX);
        windY.set(targetWindY);

        if (decayTimeout) clearTimeout(decayTimeout);
        decayTimeout = setTimeout(() => {
          windX.set(0);
          windY.set(0);
        }, 120);
      }
    };

    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      if (decayTimeout) clearTimeout(decayTimeout);
    };
  }, [interactive, shouldReduceMotion, windX, windY]);

  // Static view for reduced motion preference
  if (shouldReduceMotion) {
    return (
      <div
        className={`relative flex items-center justify-center select-none ${className}`}
        style={{ width: size, height: size }}
        aria-label="PinkLoom Lotus brand symbol (static for reduced motion)"
        role="img"
      >
        <LotusSVG />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative flex items-center justify-center select-none pointer-events-auto ${className}`}
      style={{ width: size, height: size }}
      aria-label="PinkLoom interactive wind-responsive lotus"
      role="img"
    >
      <motion.div
        className="w-full h-full flex items-center justify-center"
        style={{
          x: headTranslateX,
          y: headTranslateY,
          rotate: headRotate,
          transformOrigin: "50% 85%",
        }}
      >
        <LotusSVG
          stemRotate={stemRotate}
          stemSkew={stemSkew}
          leftOuterPetalRotate={leftOuterPetalRotate}
          rightOuterPetalRotate={rightOuterPetalRotate}
          leftInnerPetalRotate={leftInnerPetalRotate}
          rightInnerPetalRotate={rightInnerPetalRotate}
          centerPetalScaleY={centerPetalScaleY}
        />
      </motion.div>
    </div>
  );
}


interface LotusSVGProps {
  stemRotate?: MotionValue<number> | number;
  stemSkew?: MotionValue<number> | number;
  leftOuterPetalRotate?: MotionValue<number> | number;
  rightOuterPetalRotate?: MotionValue<number> | number;
  leftInnerPetalRotate?: MotionValue<number> | number;
  rightInnerPetalRotate?: MotionValue<number> | number;
  centerPetalScaleY?: MotionValue<number> | number;
}

function LotusSVG({
  stemRotate = 0,
  stemSkew = 0,
  leftOuterPetalRotate = 0,
  rightOuterPetalRotate = 0,
  leftInnerPetalRotate = 0,
  rightInnerPetalRotate = 0,
  centerPetalScaleY = 1,
}: LotusSVGProps) {
  return (
    <svg
      viewBox="0 0 400 400"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="w-full h-full overflow-visible drop-shadow-[0_12px_32px_rgba(232,122,144,0.18)]"
    >
      <defs>
        {/* Soft Organic Gradients */}
        <linearGradient id="petalGradientCenter" x1="200" y1="90" x2="200" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FDE2E8" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#F9BAC7" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#E87A90" stopOpacity="0.8" />
        </linearGradient>

        <linearGradient id="petalGradientOuterLeft" x1="100" y1="160" x2="200" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF1F4" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#F4AEC0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#D9657C" stopOpacity="0.75" />
        </linearGradient>

        <linearGradient id="petalGradientOuterRight" x1="300" y1="160" x2="200" y2="280" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFF1F4" stopOpacity="0.9" />
          <stop offset="60%" stopColor="#F4AEC0" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#D9657C" stopOpacity="0.75" />
        </linearGradient>

        <linearGradient id="goldCoreGradient" x1="200" y1="210" x2="200" y2="250" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FCEFC7" />
          <stop offset="100%" stopColor="#D4AF37" />
        </linearGradient>

        <linearGradient id="stemGradient" x1="200" y1="280" x2="200" y2="360" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#8A9A86" />
          <stop offset="100%" stopColor="#4A5847" />
        </linearGradient>

        <filter id="lotusGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>
      </defs>

      {/* Atmospheric Ambient Glow */}
      <circle cx="200" cy="220" r="110" fill="#FCE9ED" opacity="0.45" filter="url(#lotusGlow)" />

      {/* Stem & Calyx Base */}
      <motion.g
        style={{
          rotate: stemRotate,
          skewX: stemSkew,
          transformOrigin: "200px 360px",
        }}
      >
        <path
          d="M198 280 Q 196 320 200 365"
          stroke="url(#stemGradient)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />
        <path
          d="M185 278 Q 200 292 215 278 Q 200 286 185 278 Z"
          fill="#5D6D59"
          opacity="0.85"
        />
      </motion.g>

      {/* Outermost Wings / Water Ripples Base */}
      <g opacity="0.6">
        <path
          d="M110 270 C 145 285 185 285 200 280 C 185 272 140 268 110 270 Z"
          fill="#F5D0D9"
          stroke="#E87A90"
          strokeWidth="0.75"
        />
        <path
          d="M290 270 C 255 285 215 285 200 280 C 215 272 260 268 290 270 Z"
          fill="#F5D0D9"
          stroke="#E87A90"
          strokeWidth="0.75"
        />
      </g>

      {/* Outer Left Petals */}
      <motion.g
        style={{
          rotate: leftOuterPetalRotate,
          transformOrigin: "200px 280px",
        }}
      >
        <path
          d="M200 280 C 140 265 95 215 105 160 C 140 185 185 235 200 280 Z"
          fill="url(#petalGradientOuterLeft)"
          stroke="#DE7288"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M152 208 C 172 230 188 255 200 280"
          stroke="#C85A70"
          strokeWidth="0.6"
          strokeDasharray="2 3"
          opacity="0.6"
        />
      </motion.g>

      {/* Outer Right Petals */}
      <motion.g
        style={{
          rotate: rightOuterPetalRotate,
          transformOrigin: "200px 280px",
        }}
      >
        <path
          d="M200 280 C 260 265 305 215 295 160 C 260 185 215 235 200 280 Z"
          fill="url(#petalGradientOuterRight)"
          stroke="#DE7288"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
        <path
          d="M248 208 C 228 230 212 255 200 280"
          stroke="#C85A70"
          strokeWidth="0.6"
          strokeDasharray="2 3"
          opacity="0.6"
        />
      </motion.g>

      {/* Mid Left Petal */}
      <motion.g
        style={{
          rotate: leftInnerPetalRotate,
          transformOrigin: "200px 280px",
        }}
      >
        <path
          d="M200 280 C 160 250 135 185 155 125 C 180 165 195 220 200 280 Z"
          fill="url(#petalGradientCenter)"
          stroke="#DE7288"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </motion.g>

      {/* Mid Right Petal */}
      <motion.g
        style={{
          rotate: rightInnerPetalRotate,
          transformOrigin: "200px 280px",
        }}
      >
        <path
          d="M200 280 C 240 250 265 185 245 125 C 220 165 205 220 200 280 Z"
          fill="url(#petalGradientCenter)"
          stroke="#DE7288"
          strokeWidth="1.2"
          strokeLinejoin="round"
        />
      </motion.g>

      {/* Central Heart / Inner Petals */}
      <motion.g
        style={{
          scaleY: centerPetalScaleY,
          transformOrigin: "200px 280px",
        }}
      >
        <path
          d="M200 280 C 175 225 170 145 200 85 C 230 145 225 225 200 280 Z"
          fill="url(#petalGradientCenter)"
          stroke="#D46077"
          strokeWidth="1.4"
          strokeLinejoin="round"
        />
        {/* Subtle center spine */}
        <path
          d="M200 95 L 200 270"
          stroke="#FCE4EC"
          strokeWidth="1"
          opacity="0.8"
        />
      </motion.g>

      {/* Golden Pistil Core (Soul of the Lotus) */}
      <g>
        <ellipse cx="200" cy="245" rx="14" ry="7" fill="url(#goldCoreGradient)" />
        <circle cx="194" cy="244" r="1.5" fill="#936D16" />
        <circle cx="200" cy="243" r="1.5" fill="#936D16" />
        <circle cx="206" cy="244" r="1.5" fill="#936D16" />
        <circle cx="197" cy="247" r="1.2" fill="#936D16" />
        <circle cx="203" cy="247" r="1.2" fill="#936D16" />
      </g>
    </svg>
  );
}
