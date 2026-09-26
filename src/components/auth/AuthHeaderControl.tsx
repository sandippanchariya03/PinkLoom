"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { getCurrentUser, onAuthStateChange, type UserProfile } from "@/lib/auth/auth";
import { UserMenu } from "./UserMenu";

interface AuthHeaderControlProps {
  user?: UserProfile | null | undefined;
  isLoading?: boolean;
  returnTo?: string;
  className?: string;
}

export function AuthHeaderControl({
  user: initialUser,
  isLoading: initialIsLoading,
  returnTo = "/",
  className = "",
}: AuthHeaderControlProps) {
  const isControlled = initialUser !== undefined;
  const [fetchedUser, setFetchedUser] = useState<UserProfile | null | undefined>(undefined);
  const [fetchLoading, setFetchLoading] = useState<boolean>(true);

  useEffect(() => {
    if (isControlled) return;

    let isMounted = true;

    getCurrentUser()
      .then((profile) => {
        if (isMounted) {
          setFetchedUser(profile);
          setFetchLoading(false);
        }
      })
      .catch(() => {
        if (isMounted) {
          setFetchedUser(null);
          setFetchLoading(false);
        }
      });

    // Reactive listener for login/logout across tabs/windows
    const sub = onAuthStateChange((updated) => {
      if (isMounted) {
        setFetchedUser(updated);
        setFetchLoading(false);
      }
    });

    return () => {
      isMounted = false;
      sub?.unsubscribe();
    };
  }, [isControlled]);

  const currentUser = isControlled ? initialUser : fetchedUser;
  const loading = isControlled ? (initialIsLoading ?? false) : fetchLoading;

  // Loading skeleton state: prevents flash of logged-out "Sign in" before session resolves
  if (loading || currentUser === undefined) {
    return (
      <div
        className={`h-8 w-20 rounded-full bg-[#EAE7E0]/60 animate-pulse ${className}`}
        aria-hidden="true"
        title="Checking authentication status"
      />
    );
  }

  // Authenticated state: compact dropdown
  if (currentUser) {
    return (
      <div className={className}>
        <UserMenu user={currentUser} />
      </div>
    );
  }

  // Logged-out state: Clean, non-intrusive "Sign in" button
  const signInHref = `/signin${returnTo ? `?returnTo=${encodeURIComponent(returnTo)}` : ""}`;

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Link
        href={signInHref}
        id="top-right-signin-btn"
        className="inline-flex items-center gap-1.5 text-xs font-medium tracking-wide uppercase px-3.5 py-1.5 rounded-full border border-[#E8E5DF] text-[#141416] hover:bg-[#F2EFE9] hover:border-[#D5D2CA] transition-all active:scale-[0.98] shadow-2xs"
        aria-label="Sign in to PinkLoom"
      >
        <span>Sign in</span>
      </Link>
    </div>
  );
}
