import type { NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/proxy";

/**
 * PinkLoom Route Proxy (Next.js 16 file convention)
 *
 * Protects /history and authenticated session state:
 * - Refreshes Supabase session tokens and passes updated cookies.
 * - Unauthenticated users attempting to access protected routes are redirected to /signin.
 * - Authenticated users visiting /signin are sent to /.
 */
export async function proxy(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files and images
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
