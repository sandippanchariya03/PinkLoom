import { createBrowserClient } from "@supabase/ssr";
import { createClient as createStandardClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let browserClientInstance: SupabaseClient | null = null;
let standardClientInstance: SupabaseClient | null = null;

export function isSupabaseConfigured(): boolean {
  if (!supabaseUrl || !supabaseAnonKey) return false;
  if (
    supabaseUrl.includes("your-project-ref") ||
    supabaseUrl.includes("/dashboard/")
  ) {
    return false;
  }
  return true;
}

/**
 * Returns a configured Supabase client if environment credentials are present.
 * In browser contexts, uses createBrowserClient to guarantee cookie-based session synchronization.
 * In server contexts without cookies, falls back to standard client for zero-crash degradation.
 */
export function getSupabase(): SupabaseClient | null {
  if (!isSupabaseConfigured()) {
    return null;
  }

  if (typeof window !== "undefined") {
    if (!browserClientInstance) {
      browserClientInstance = createBrowserClient(supabaseUrl!, supabaseAnonKey!);
    }
    return browserClientInstance;
  }

  if (!standardClientInstance) {
    standardClientInstance = createStandardClient(supabaseUrl!, supabaseAnonKey!, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });
  }
  return standardClientInstance;
}
