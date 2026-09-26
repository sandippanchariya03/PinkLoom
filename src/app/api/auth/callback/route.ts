import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * OAuth Callback Handler
 *
 * Supabase redirects users here after Google OAuth completes.
 * Exchanges the code for a session and attaches session cookies to the response,
 * then safely redirects to the user's intended destination (defaulting to /workspace).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const errorParam = searchParams.get("error");
  const errorDesc = searchParams.get("error_description");
  const rawReturnTo = searchParams.get("returnTo") ?? "/";

  // Prevent open redirect attacks: only allow relative paths
  const returnTo =
    rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
      ? rawReturnTo
      : "/";

  // If OAuth was cancelled or returned an error from Google/Supabase
  if (errorParam || errorDesc) {
    const errorMsg = errorDesc || errorParam || "Authentication was not completed.";
    console.warn("[PinkLoom Auth Callback] OAuth error from provider:", errorMsg);
    return NextResponse.redirect(
      new URL(`/signin?error=${encodeURIComponent(errorMsg)}`, origin)
    );
  }

  if (!code) {
    return NextResponse.redirect(new URL("/signin?error=no_code", origin));
  }

  if (
    !supabaseUrl ||
    !supabaseKey ||
    supabaseUrl.includes("your-project-ref") ||
    supabaseUrl.includes("/dashboard/")
  ) {
    return NextResponse.redirect(new URL("/signin?error=config", origin));
  }

  // Pre-construct redirect response to attach cookies to
  const destination = new URL(returnTo, origin);
  const response = NextResponse.redirect(destination);

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  try {
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error("[PinkLoom Auth Callback] Code exchange error:", error.message);
      return NextResponse.redirect(
        new URL(`/signin?error=${encodeURIComponent(error.message)}`, origin)
      );
    }

    // Success! Response contains Set-Cookie headers with Supabase auth tokens
    return response;
  } catch (err) {
    console.error("[PinkLoom Auth Callback] Unexpected callback error:", err);
    return NextResponse.redirect(new URL("/signin?error=unexpected", origin));
  }
}
