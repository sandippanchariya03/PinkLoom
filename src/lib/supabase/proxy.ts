import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "./client";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

/**
 * Handles session token refresh and protected route redirects in Next.js 16 Proxy.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/workspace")) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  const isProtected = pathname.startsWith("/history");
  const isSignIn = pathname.startsWith("/signin");

  if (!isSupabaseConfigured()) {
    // Graceful fallback for local development without credentials
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl!, supabaseKey!, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // getUser() safely authenticates the user by verifying the JWT with the Supabase Auth server
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // If unauthenticated and requesting protected workspace or history, redirect to signin
  if (!user && isProtected) {
    const signinUrl = new URL("/signin", request.url);
    signinUrl.searchParams.set("returnTo", pathname);
    return NextResponse.redirect(signinUrl);
  }

  // If already authenticated and visiting signin, send directly to workspace or requested return destination
  if (user && isSignIn) {
    const rawReturnTo = request.nextUrl.searchParams.get("returnTo") || "/";
    const dest =
      rawReturnTo.startsWith("/") && !rawReturnTo.startsWith("//")
        ? rawReturnTo
        : "/";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  return supabaseResponse;
}
