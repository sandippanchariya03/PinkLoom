"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams, useRouter } from "next/navigation";
import { signInWithGoogle } from "@/lib/auth/auth";
import { getSupabase } from "@/lib/db/supabase";
import { Sparkles, ArrowRight, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

// Google "G" SVG icon
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

function LoomThreadDecoration() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Diagonal thread lines — architectural aesthetic */}
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            top: `${10 + i * 12}%`,
            left: "-5%",
            width: "110%",
            height: "1px",
            background: `linear-gradient(90deg, transparent, rgba(232,122,144,${0.04 + i * 0.01}), transparent)`,
            transform: `rotate(${-3 + i * 0.5}deg)`,
            transformOrigin: "left center",
          }}
        />
      ))}
      {/* Corner dot-grid pattern */}
      <div
        className="absolute top-0 right-0 w-48 h-48 opacity-[0.06]"
        style={{
          backgroundImage: "radial-gradient(circle, #E87A90 1.5px, transparent 1.5px)",
          backgroundSize: "16px 16px",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-32 h-32 opacity-[0.05]"
        style={{
          backgroundImage: "radial-gradient(circle, #141416 1.5px, transparent 1.5px)",
          backgroundSize: "16px 16px",
        }}
      />
    </div>
  );
}

function SignInContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const returnTo = searchParams.get("returnTo") ?? "/";
  const urlError = searchParams.get("error");

  // Check if already signed in
  useEffect(() => {
    const supabase = getSupabase();
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        router.replace(returnTo.startsWith("/") ? returnTo : "/");
      }
    });
  }, [returnTo, router]);

  // Derive friendly error message from URL query parameter without cascading renders
  const urlErrorMessage = React.useMemo(() => {
    if (!urlError) return null;
    const messages: Record<string, string> = {
      no_code: "Authentication was not completed. Please try again.",
      config: "The authentication service is not configured yet.",
      unexpected: "An unexpected error occurred. Please try again.",
      access_denied: "Unable to sign in with Google. Please try again.",
    };
    const decoded = decodeURIComponent(urlError);
    const isKnown = messages[urlError] || messages[decoded];
    return isKnown ?? (
      decoded.toLowerCase().includes("denied") ||
      decoded.toLowerCase().includes("cancel") ||
      decoded.toLowerCase().includes("oauth")
        ? "Unable to sign in with Google. Please try again."
        : decoded
    );
  }, [urlError]);

  const error = actionError || urlErrorMessage;

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setActionError(null);

    const { error: signInError } = await signInWithGoogle(returnTo);
    if (signInError) {
      const isCancellation =
        signInError.toLowerCase().includes("denied") ||
        signInError.toLowerCase().includes("cancel");
      setActionError(isCancellation ? "Unable to sign in with Google. Please try again." : signInError);
      setIsLoading(false);
    }
    // On success, Google redirects the page — no need to setIsLoading(false)
  };

  const features = [
    { icon: "⬡", label: "Google Sign-In", desc: "Secure, one-click authentication" },
    { icon: "◈", label: "Private workspace", desc: "Your brand data is only yours" },
    { icon: "◎", label: "Full history", desc: "Every project you build, saved" },
  ];

  return (
    <div className="relative min-h-screen bg-[#FBF9F6] flex flex-col" id="signin-page">
      {/* Grain overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.03]"
        style={{
          backgroundImage: "radial-gradient(#141416 1px, transparent 1px)",
          backgroundSize: "20px 20px",
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between px-6 py-7 max-w-6xl mx-auto w-full">
        <Link
          href="/"
          id="signin-logo"
          className="group flex items-center gap-2.5 text-xs tracking-[0.25em] uppercase font-semibold text-[#141416] hover:opacity-70 transition-opacity"
        >
          <Image
            src="/logo.png"
            alt="PinkLoom"
            width={20}
            height={20}
            className="w-5 h-5 rounded-full object-cover ring-1 ring-[#E8E5DF] transition-transform group-hover:scale-110"
          />
          PINKLOOM
        </Link>
        <span className="text-[11px] tracking-widest uppercase text-[#96948F]">
          Brand Intelligence Platform
        </span>
      </header>

      {/* Main content */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[420px]">

          {/* Card */}
          <div className="relative bg-white border border-[#E8E5DF] rounded-2xl overflow-hidden shadow-[0_4px_32px_rgba(20,20,22,0.06)]">
            <LoomThreadDecoration />

            <div className="relative p-8 sm:p-10">
              {/* Icon cluster */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-[#141416] flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5 text-[#E87A90]" />
                </div>
                <div>
                  <p className="text-[10px] tracking-[0.22em] uppercase text-[#96948F] font-medium">
                    Welcome to
                  </p>
                  <p className="text-sm font-semibold tracking-wide text-[#141416]">
                    PinkLoom
                  </p>
                </div>
              </div>

              {/* Headline matching Section 5 design */}
              <div className="mb-6">
                <h1
                  id="signin-heading"
                  className="font-editorial text-3xl font-normal text-[#141416] leading-[1.18] tracking-tight"
                >
                  Build your brand.
                </h1>
                <p className="font-editorial text-2xl text-[#8E8B84] italic mt-1 leading-[1.2]">
                  Strategically, with AI.
                </p>
              </div>

              <p className="text-[#686764] text-xs leading-relaxed mb-8">
                Sign in to access your personal brand workspace. Every project you
                build is privately stored and accessible only to you.
              </p>

              {/* Error banner */}
              {error && (
                <div
                  role="alert"
                  id="signin-error"
                  className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Google Sign-In Button */}
              <button
                id="google-signin-btn"
                onClick={handleGoogleSignIn}
                disabled={isLoading}
                aria-label="Sign in with Google"
                className="w-full flex items-center justify-center gap-3 px-5 py-3.5 rounded-xl border border-[#E8E5DF] bg-white hover:bg-[#FAFAF9] hover:border-[#D4D1CA] text-[#141416] font-medium text-sm transition-all shadow-[0_1px_4px_rgba(0,0,0,0.06)] hover:shadow-[0_2px_8px_rgba(0,0,0,0.09)] active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed group"
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

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="flex-1 h-px bg-[#E8E5DF]" />
                <span className="text-[11px] tracking-widest text-[#96948F] uppercase">
                  Private Workspace Access
                </span>
                <div className="flex-1 h-px bg-[#E8E5DF]" />
              </div>

              {/* Feature list */}
              <ul className="space-y-3">
                {features.map((f) => (
                  <li key={f.label} className="flex items-start gap-3">
                    <span
                      className="text-[#E87A90] text-base mt-0.5 shrink-0 font-light"
                      aria-hidden="true"
                    >
                      {f.icon}
                    </span>
                    <div>
                      <span className="text-[#141416] text-sm font-medium">{f.label}</span>
                      <span className="text-[#686764] text-xs ml-1.5">— {f.desc}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer strip */}
            <div className="border-t border-[#F0EDE8] px-8 py-3.5 bg-[#FAFAF9] flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#E87A90]" />
                <p className="text-[11px] font-medium text-[#686764]">
                  Secure authentication via Supabase
                </p>
              </div>
              <span className="text-[10px] text-[#A5A39E] font-mono">OAuth 2.0</span>
            </div>
          </div>

          {/* Below-card note */}
          <p className="text-center text-[11px] text-[#A5A39E] mt-6 leading-relaxed">
            By continuing, you agree to our Terms of Service.{" "}
            <br />
            Your brand projects are private and isolated from other accounts.
          </p>
        </div>
      </main>

      {/* Pipeline footer */}
      <footer className="relative z-10 w-full max-w-5xl mx-auto px-6 py-6 border-t border-[#E8E5DF]/60 text-center">
        <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1.5 text-[10px] tracking-[0.16em] uppercase text-[#B8B4AE]">
          <span>01 Discover</span>
          <span className="text-[#DDD9D0]">→</span>
          <span>02 Position</span>
          <span className="text-[#DDD9D0]">→</span>
          <span>03 Personality</span>
          <span className="text-[#DDD9D0]">→</span>
          <span>04 Naming</span>
          <span className="text-[#DDD9D0]">→</span>
          <span>05 Voice</span>
          <span className="text-[#DDD9D0]">→</span>
          <span>06 Visualize</span>
          <span className="text-[#DDD9D0]">→</span>
          <span>07 Challenge</span>
          <span className="text-[#DDD9D0]">→</span>
          <span>08 Consistency</span>
          <span className="text-[#DDD9D0]">→</span>
          <span>09 Deliver</span>
          <span className="text-[#DDD9D0]">→</span>
          <span>10 Brand Kit</span>
        </div>
      </footer>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#FBF9F6] flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-[#E87A90]" />
      </div>
    }>
      <SignInContent />
    </Suspense>
  );
}
