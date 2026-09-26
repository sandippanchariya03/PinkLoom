/**
 * Auth utility functions for PinkLoom.
 * Provides typed wrappers around Supabase Auth for Google OAuth and persistent sessions.
 */

import { getSupabase } from "@/lib/db/supabase";
import type { Subscription } from "@supabase/supabase-js";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  provider: string;
  createdAt: string;
}

/**
 * Initiates Google OAuth sign-in flow via Supabase.
 * Redirects the user to Google OAuth consent, which then calls back to /api/auth/callback.
 */
export async function signInWithGoogle(returnTo?: string): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    return { error: "Supabase is not configured. Please set environment variables." };
  }

  if (typeof window === "undefined") {
    return { error: "Sign-in must be called in a browser environment." };
  }

  const origin = window.location.origin;
  const destination = returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
    ? returnTo
    : "/";

  const redirectTo = `${origin}/api/auth/callback?returnTo=${encodeURIComponent(destination)}`;

  try {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo,
        queryParams: {
          access_type: "offline",
          prompt: "consent",
        },
      },
    });

    if (error) {
      console.error("[PinkLoom Auth] Google sign-in error:", error.message);
      return { error: error.message };
    }

    return { error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected sign-in error.";
    return { error: msg };
  }
}

/**
 * Signs the current user out and clears the Supabase session and cookies.
 */
export async function signOut(): Promise<{ error: string | null }> {
  const supabase = getSupabase();
  if (!supabase) return { error: null };

  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("[PinkLoom Auth] Sign-out error:", error.message);
      return { error: error.message };
    }
    return { error: null };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Unexpected sign-out error.";
    return { error: msg };
  }
}

/**
 * Returns the currently authenticated user's profile, or null if not signed in.
 */
export async function getCurrentUser(): Promise<UserProfile | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) return null;

    // Try to fetch profile from the user_profiles table
    try {
      const { data } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      if (data) {
        return {
          id: data.id,
          email: data.email || user.email || "",
          displayName: data.display_name || (user.user_metadata?.full_name ?? user.user_metadata?.name) || null,
          avatarUrl: data.avatar_url || user.user_metadata?.avatar_url || null,
          provider: data.provider || user.app_metadata?.provider || "google",
          createdAt: data.created_at || user.created_at,
        };
      }
    } catch {
      // Table query failure fallback to metadata
    }

    // Fallback to auth metadata
    return {
      id: user.id,
      email: user.email ?? "",
      displayName: (user.user_metadata?.full_name ?? user.user_metadata?.name) || null,
      avatarUrl: user.user_metadata?.avatar_url ?? null,
      provider: user.app_metadata?.provider ?? "google",
      createdAt: user.created_at,
    };
  } catch (err) {
    console.warn("[PinkLoom Auth] Failed to retrieve current user:", err);
    return null;
  }
}

/**
 * Subscribes to auth state changes to reactively update UI state.
 */
export function onAuthStateChange(
  callback: (user: UserProfile | null) => void
): Subscription | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
    if (!session?.user) {
      callback(null);
      return;
    }
    const profile = await getCurrentUser();
    callback(profile);
  });

  return subscription;
}

/**
 * Returns the per-user localStorage key prefix.
 * Guarantees brand data isolation between different users on the same browser.
 */
export function getUserStorageKey(userId: string, suffix: string): string {
  return `pinkloom_user_${userId}_${suffix}`;
}
