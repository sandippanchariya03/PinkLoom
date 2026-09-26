import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let clientInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseKey) return false;
  if (
    supabaseUrl.includes("your-project-ref") ||
    supabaseUrl.includes("/dashboard/")
  ) {
    return false;
  }
  return true;
}

/**
 * Creates or retrieves the singleton Supabase client for browser contexts.
 * Automatically synchronizes auth tokens with document cookies for SSR/Proxy compatibility.
 */
export function createClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (typeof window === "undefined") {
    return null;
  }

  if (clientInstance) {
    return clientInstance;
  }

  clientInstance = createBrowserClient(supabaseUrl!, supabaseKey!);
  return clientInstance;
}
