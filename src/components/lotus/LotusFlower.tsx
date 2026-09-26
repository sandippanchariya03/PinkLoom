"use client";

import React from "react";
import { motion, type MotionValue } from "motion/react";

export interface LotusFlowerProps {
  size?: number;
  className?: string;
  isPetalDetached?: boolean;
  onDetachedPetalClick?: () => void;
  stemRotate?: MotionValue<number> | number;
  stemSkew?: MotionValue<number> | number;
  headRotate?: MotionValue<number> | number;
  headTranslateX?: MotionValue<number> | number;
  headTranslateY?: MotionValue<number> | number;
  leftOuterPetalRotate?: MotionValue<number> | number;
  rightOuterPetalRotate?: MotionValue<number> | number;
  leftInnerPetalRotate?: MotionValue<number> | number;
  rightInnerPetalRotate?: MotionValue<number> | number;
  centerPetalScaleY?: MotionValue<number> | number;
  zoomScale?: number;
  zoomOpacity?: number;
  isCenterHighlighted?: boolean;
  onCenterClick?: () => void;
}

export function LotusFlower({
  size = 420,
  className = "",
  isPetalDetached = false,
  onDetachedPetalClick,
  stemRotate = 0,
  stemSkew = 0,
  headRotate = 0,
  headTranslateX = 0,
  headTranslateY = 0,
  leftOuterPetalRotate = 0,
  rightOuterPetalRotate = 0,
  leftInnerPetalRotate = 0,
  rightInnerPetalRotate = 0,
  centerPetalScaleY = 1,
  zoomScale = 1,
  zoomOpacity = 1,
  isCenterHighlighted = false,
  onCenterClick,
}: LotusFlowerProps) {
  return (
    <motion.div
      className={`relative select-none pointer-events-none flex items-center justify-center ${className}`}
      style={{
        width: size,
        height: size,
        scale: zoomScale,
        opacity: zoomOpacity,
        transformOrigin: "50% 68%",
      }}
      transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
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
        <svg
          viewBox="0 0 500 500"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full overflow-visible drop-shadow-[0_24px_55px_rgba(232,122,144,0.3)]"
        >
          <defs>
            {/* Soft Translucent Petal Gradients (Inspired by Reference Images 1, 2, 4) */}
            <linearGradient id="lf_outerPetalLeft" x1="120" y1="180" x2="250" y2="340" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFA6B8" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#FDBDC9" stopOpacity="0.9" />
              <stop offset="75%" stopColor="#FFF2F5" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FAD3DC" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="lf_outerPetalRight" x1="380" y1="180" x2="250" y2="340" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFA6B8" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#FDBDC9" stopOpacity="0.9" />
              <stop offset="75%" stopColor="#FFF2F5" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#FAD3DC" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="lf_midPetalLeft" x1="180" y1="140" x2="250" y2="340" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF7A95" stopOpacity="0.98" />
              <stop offset="25%" stopColor="#FFA3B5" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#FFF0F3" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FCD5DE" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="lf_midPetalRight" x1="320" y1="140" x2="250" y2="340" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF7A95" stopOpacity="0.98" />
              <stop offset="25%" stopColor="#FFA3B5" stopOpacity="0.95" />
              <stop offset="70%" stopColor="#FFF0F3" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#FCD5DE" stopOpacity="0.85" />
            </linearGradient>

            <linearGradient id="lf_centerHeartPetal" x1="250" y1="80" x2="250" y2="340" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF6B88" stopOpacity="0.98" />
              <stop offset="30%" stopColor="#FFA1B4" stopOpacity="0.95" />
              <stop offset="75%" stopColor="#FFF5F7" stopOpacity="0.92" />
              <stop offset="100%" stopColor="#FAD1DB" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="lf_detachablePetal" x1="270" y1="150" x2="250" y2="340" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FF859E" stopOpacity="0.98" />
              <stop offset="40%" stopColor="#FFB3C2" stopOpacity="0.92" />
              <stop offset="80%" stopColor="#FFF6F8" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#E87A90" stopOpacity="0.85" />
            </linearGradient>

            {/* Golden Core & Stamens (Inspired by Reference Images 1 & 3) */}
            <radialGradient id="lf_goldCoreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#FFF4B8" stopOpacity="1" />
              <stop offset="45%" stopColor="#FFD338" stopOpacity="0.9" />
              <stop offset="85%" stopColor="#E6A817" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#B37805" stopOpacity="0" />
            </radialGradient>

            <linearGradient id="lf_goldPistilGradient" x1="250" y1="280" x2="250" y2="320" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#FFF9D2" />
              <stop offset="35%" stopColor="#FCD843" />
              <stop offset="80%" stopColor="#D99B16" />
              <stop offset="100%" stopColor="#8A5C04" />
            </linearGradient>

            {/* Lily Pad Emergent Green Gradients (Reference Images 1 & 4) */}
            <linearGradient id="lf_lilyPadLeft" x1="100" y1="310" x2="220" y2="360" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4A6546" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#374F34" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#253823" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="lf_lilyPadRight" x1="400" y1="310" x2="280" y2="360" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#4A6546" stopOpacity="0.9" />
              <stop offset="60%" stopColor="#374F34" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#253823" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="lf_stemGradient" x1="250" y1="340" x2="250" y2="460" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#82967F" />
              <stop offset="50%" stopColor="#4D604A" />
              <stop offset="100%" stopColor="#2B3A29" />
            </linearGradient>

            <filter id="lf_ambientBloom" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur stdDeviation="16" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* 1. Luminous Ambient Flora Halo */}
          <circle cx="250" cy="270" r="160" fill="#FCE8EC" opacity="0.35" filter="url(#lf_ambientBloom)" />

          {/* 2. Floating Water Lily Pads at the Waterline (Reference Images 1 & 4) */}
          <g opacity="0.85">
            {/* Left Pad with leaf cleft notch */}
            <path
              d="M90 345 C 90 325 145 315 195 328 C 220 334 235 348 225 358 C 215 368 185 368 145 365 C 105 362 90 355 90 345 Z"
              fill="url(#lf_lilyPadLeft)"
              stroke="#5D7A58"
              strokeWidth="0.8"
            />
            {/* Right Pad with leaf cleft */}
            <path
              d="M410 345 C 410 325 355 315 305 328 C 280 334 265 348 275 358 C 285 368 315 368 355 365 C 395 362 410 355 410 345 Z"
              fill="url(#lf_lilyPadRight)"
              stroke="#5D7A58"
              strokeWidth="0.8"
            />
          </g>

          {/* 3. Stem & Calyx Base */}
          <motion.g
            style={{
              rotate: stemRotate,
              skewX: stemSkew,
              transformOrigin: "250px 450px",
            }}
          >
            <path
              d="M248 340 Q 244 395 250 455"
              stroke="url(#lf_stemGradient)"
              strokeWidth="5"
              strokeLinecap="round"
            />
            {/* Calyx sepals */}
            <path
              d="M228 338 Q 250 358 272 338 Q 250 348 228 338 Z"
              fill="#374735"
              opacity="0.95"
            />
          </motion.g>

          {/* 4. Horizontal Outermost Floating Wings (Reference Image 4) */}
          <g opacity="0.75">
            <path
              d="M250 340 C 175 340 70 330 40 295 C 100 290 190 310 250 340 Z"
              fill="#F9BAC7"
              stroke="#E87A90"
              strokeWidth="1"
            />
            <path
              d="M250 340 C 325 340 430 330 460 295 C 400 290 310 310 250 340 Z"
              fill="#F9BAC7"
              stroke="#E87A90"
              strokeWidth="1"
            />
          </g>

          {/* 5. Outer Tier Left Petal (Broad curved cup, Image 1 & 4) */}
          <motion.g
            style={{
              rotate: leftOuterPetalRotate,
              transformOrigin: "250px 340px",
            }}
          >
            <path
              d="M250 340 C 160 320 90 245 105 165 C 160 205 225 280 250 340 Z"
              fill="url(#lf_outerPetalLeft)"
              stroke="#E66A82"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Fine Petal Veins */}
            <path
              d="M165 230 C 195 260 225 298 250 340"
              stroke="#D4506C"
              strokeWidth="0.6"
              strokeDasharray="2 3"
              opacity="0.4"
            />
          </motion.g>

          {/* 6. Outer Tier Right Petal (Broad curved cup) */}
          <motion.g
            style={{
              rotate: rightOuterPetalRotate,
              transformOrigin: "250px 340px",
            }}
          >
            <path
              d="M250 340 C 340 320 410 245 395 165 C 340 205 275 280 250 340 Z"
              fill="url(#lf_outerPetalRight)"
              stroke="#E66A82"
              strokeWidth="1.2"
              strokeLinejoin="round"
            />
            {/* Fine Petal Veins */}
            <path
              d="M335 230 C 305 260 275 298 250 340"
              stroke="#D4506C"
              strokeWidth="0.6"
              strokeDasharray="2 3"
              opacity="0.4"
            />
          </motion.g>

          {/* 7. Mid Tier Left Petal (Upright cupping) */}
          <motion.g
            style={{
              rotate: leftInnerPetalRotate,
              transformOrigin: "250px 340px",
            }}
          >
            <path
              d="M250 340 C 195 295 155 200 180 120 C 220 180 240 260 250 340 Z"
              fill="url(#lf_midPetalLeft)"
              stroke="#DE5A75"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </motion.g>

          {/* 8. Mid Tier Right Petal (THE DETACHABLE PETAL FOR SIGN-IN)
              Fades out smoothly on the flower as it detaches into the viewport */}
          <motion.g
            animate={{
              opacity: isPetalDetached ? 0 : 1,
              scale: isPetalDetached ? 0.9 : 1,
            }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            style={{
              rotate: rightInnerPetalRotate,
              transformOrigin: "250px 340px",
            }}
            onClick={onDetachedPetalClick}
            className="cursor-pointer"
          >
            <path
              d="M250 340 C 305 295 345 200 320 120 C 280 180 260 260 250 340 Z"
              fill="url(#lf_detachablePetal)"
              stroke="#DE5A75"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
            {/* Luminous Petal Crest Line */}
            <path
              d="M320 120 C 298 160 275 230 255 305"
              stroke="#FFF2F5"
              strokeWidth="0.9"
              opacity="0.75"
            />
          </motion.g>

          {/* 9. Upright Central Heart Petal (Backdrop for core, Image 1 & 2) */}
          <motion.g
            style={{
              scaleY: centerPetalScaleY,
              transformOrigin: "250px 340px",
            }}
          >
            <path
              d="M250 340 C 210 270 205 155 250 75 C 295 155 290 270 250 340 Z"
              fill="url(#lf_centerHeartPetal)"
              stroke="#D44D68"
              strokeWidth="1.5"
              strokeLinejoin="round"
            />
            <path
              d="M250 85 L 250 330"
              stroke="#FFF8F9"
              strokeWidth="1.1"
              opacity="0.8"
            />
          </motion.g>

          {/* 10. Golden Pistil Core & Radiating Stamens (Reference Image 1 & 3) */}
          <g
            onClick={onCenterClick}
            className={`cursor-pointer transition-all duration-300 pointer-events-auto ${
              isCenterHighlighted ? "scale-110 drop-shadow-[0_0_25px_#FFD338]" : ""
            }`}
          >
            {/* Golden radial ambient core aura */}
            <circle cx="250" cy="295" r="38" fill="url(#lf_goldCoreGlow)" />

            {/* Seed Receptacle Torus Core */}
            <ellipse
              cx="250"
              cy="296"
              rx="24"
              ry="12"
              fill="url(#lf_goldPistilGradient)"
              stroke="#9E6C04"
              strokeWidth="1.2"
            />

            {/* Concentric Seed Chamber Nodes (Botanical seed head sacred geometry) */}
            <circle cx="238" cy="294" r="2.2" fill="#5E3F02" />
            <circle cx="250" cy="292" r="2.5" fill="#5E3F02" />
            <circle cx="262" cy="294" r="2.2" fill="#5E3F02" />
            <circle cx="244" cy="299" r="1.8" fill="#5E3F02" />
            <circle cx="256" cy="299" r="1.8" fill="#5E3F02" />

            {/* Dense Radiating Golden Stamens with Magenta/Pink Anther Tips (Reference Image 3!) */}
            {Array.from({ length: 28 }).map((_, i) => {
              const angle = (i * Math.PI) / 14;
              const innerRadiusX = 22;
              const innerRadiusY = 11;
              const outerRadiusX = 35 + (i % 3) * 3;
              const outerRadiusY = 18 + (i % 3) * 2;

              const x1 = 250 + Math.cos(angle) * innerRadiusX;
              const y1 = 296 + Math.sin(angle) * innerRadiusY;
              const x2 = 250 + Math.cos(angle) * outerRadiusX;
              const y2 = 296 + Math.sin(angle) * outerRadiusY - 2;

              return (
                <g key={i}>
                  {/* Golden filament */}
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#FFD54F"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  {/* Pink/Magenta anther tip (as seen clearly in Reference Image 3) */}
                  <circle
                    cx={x2}
                    cy={y2}
                    r="1.4"
                    fill="#FF4081"
                    opacity="0.9"
                  />
                </g>
              );
            })}
          </g>
        </svg>
      </motion.div>
    </motion.div>
  );
}
