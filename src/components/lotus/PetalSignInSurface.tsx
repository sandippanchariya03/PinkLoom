"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight, Loader2, ShieldCheck, X, Sparkles } from "lucide-react";
import { signInWithGoogle } from "@/lib/auth/auth";

interface PetalSignInSurfaceProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess?: () => void;
  returnTo?: string;
}

// Official Google G Multi-Color Icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
        fill="#4285F4"
      />
      <path
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
        fill="#34A853"
      />
      <path
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
        fill="#FBBC05"
      />
      <path
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
        fill="#EA4335"
      />
    </svg>
  );
}

export function PetalSignInSurface({
  isOpen,
  onClose,
  returnTo = "/",
}: PetalSignInSurfaceProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError(null);

    const { error: signInError } = await signInWithGoogle(returnTo);
    if (signInError) {
      const isCancellation =
        signInError.toLowerCase().includes("denied") ||
        signInError.toLowerCase().includes("cancel");
      setError(
        isCancellation
          ? "Unable to sign in with Google. Please try again."
          : signInError
      );
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-auto">
          {/* Soft atmospheric backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            onClick={onClose}
            className="absolute inset-0 bg-[#141416]/20 backdrop-blur-md"
            aria-hidden="true"
          />

          {/* Organic Petal Container:
              Animates from lotus center into foreground with 3D rotation,
              floating with gentle botanical wind inertia */}
          <motion.div
            initial={{
              scale: 0.18,
              opacity: 0,
              y: 80,
              x: 40,
              rotate: -12,
            }}
            animate={{
              scale: 1,
              opacity: 1,
              y: [0, -4, 0],
              x: 0,
              rotate: 0,
            }}
            exit={{
              scale: 1.15,
              opacity: 0,
              y: -160,
              x: 60,
              rotate: 14,
              transition: { duration: 0.65, ease: [0.32, 0, 0.67, 0] },
            }}
            transition={{
              type: "spring",
              stiffness: 120,
              damping: 18,
              mass: 0.85,
              y: {
                repeat: Infinity,
                duration: 6,
                ease: "easeInOut",
              },
            }}
            className="relative w-full max-w-[460px] max-h-[92vh] overflow-visible"
          >
            {/* The Square Lotus Surface Canvas */}
            <div
              className="relative overflow-hidden p-8 sm:p-10 text-[#141416] backdrop-blur-2xl transition-all"
              style={{
                borderRadius: "0px",
                background:
                  "linear-gradient(180deg, #FFFFFF 0%, #FFF7FA 55%, #FDEEF3 100%)",
                boxShadow:
                  "0 28px 70px -10px rgba(0, 0, 0, 0.45), 0 12px 30px -6px rgba(232, 122, 144, 0.3), inset 0 1px 0 rgba(255, 255, 255, 1)",
                border: "1px solid rgba(248, 187, 208, 0.85)",
              }}
            >
              {/* Subtle Botanical Corner Watermark */}
              <div
                className="absolute top-0 right-0 w-36 h-36 pointer-events-none opacity-20 overflow-hidden"
                aria-hidden="true"
              >
                <div
                  className="w-full h-full"
                  style={{
                    background: "radial-gradient(circle at top right, #E87A90 0%, transparent 70%)",
                  }}
                />
              </div>

              {/* Close Button / Return to Lotus */}
              <button
                type="button"
                onClick={onClose}
                aria-label="Return petal to lotus"
                className="absolute top-7 right-7 w-8 h-8 rounded-none bg-white/80 hover:bg-white text-[#96948F] hover:text-[#141416] flex items-center justify-center border border-[#F0D5DD] transition-all shadow-xs"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Petal Header Brand Mark */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-9 h-9 rounded-none bg-[#141416] flex items-center justify-center shadow-xs">
                  <Sparkles className="w-4 h-4 text-[#E87A90]" />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.24em] uppercase text-[#96948F] font-medium">
                    The Lotus Petal
                  </p>
                  <p className="text-xs font-semibold tracking-wider uppercase text-[#141416]">
                    PinkLoom Ecosystem
                  </p>
                </div>
              </div>

              {/* Headline */}
              <div className="mb-5">
                <h2 className="font-editorial text-3xl font-normal text-[#141416] leading-[1.15] tracking-tight">
                  Build your brand.
                </h2>
                <p className="font-editorial text-2xl text-[#8E8B84] italic mt-0.5 leading-[1.2]">
                  Strategically, with AI.
                </p>
              </div>

              <p className="text-[#686764] text-xs leading-relaxed mb-7 font-light">
                Sign in to open your private brand workspace. Every project you
                crystallize is stored securely and accessible only to your account.
              </p>

              {/* Error message */}
              {error && (
                <div
                  role="alert"
                  className="p-3.5 mb-5 rounded-none bg-red-50/90 border border-red-200 text-red-700 text-xs leading-relaxed"
                >
                  {error}
                </div>
              )}

              {/* Google Sign-In Button */}
              <button
                type="button"
                id="petal-google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                aria-label="Continue with Google"
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-none border border-[#E8BAC6] bg-white/95 hover:bg-white text-[#141416] font-medium text-sm transition-all shadow-[0_2px_12px_rgba(232,122,144,0.14)] hover:shadow-[0_4px_18px_rgba(232,122,144,0.22)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin text-[#E87A90]" />
                ) : (
                  <GoogleIcon className="w-5 h-5 shrink-0" />
                )}
                <span>
                  {isLoading ? "Connecting to Google…" : "Continue with Google"}
                </span>
                {!isLoading && (
                  <ArrowRight className="w-4 h-4 text-[#96948F] group-hover:translate-x-0.5 transition-transform ml-auto" />
                )}
              </button>

              {/* Security / Subtext */}
              <div className="mt-7 pt-4 border-t border-[#F2D7DF]/70 flex items-center justify-between text-[11px] text-[#86847E]">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#E87A90]" />
                  <span>Secure via Supabase</span>
                </div>
                <span className="font-mono text-[10px] text-[#A5A39E]">OAuth 2.0</span>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
