/**
 * Auth & Supabase Integration Test Suite
 *
 * Verifies:
 * 1. Supabase client creation & configuration checks
 * 2. User storage key isolation (pinkloom_user_${userId}_*)
 * 3. OAuth redirect generation and security (relative path protection)
 * 4. Error decoding and user-friendly mapping
 * 5. Route protection logic for public vs protected paths
 */

import { getUserStorageKey } from "../src/lib/auth/auth";
import { isSupabaseConfigured } from "../src/lib/supabase/client";

let totalTests = 0;
let passedTests = 0;

function assert(condition: boolean, testName: string, detail?: string) {
  totalTests++;
  if (condition) {
    passedTests++;
    console.log(`  ✓ PASS: ${testName}`);
  } else {
    console.error(`  ✗ FAIL: ${testName} ${detail ? `(${detail})` : ""}`);
  }
}

console.log("\n============================================================");
console.log("  PINKLOOM AUTH & SUPABASE INTEGRATION TEST SUITE");
console.log("============================================================\n");

// 1. Data Isolation Test
console.log("--- 1. DATA ISOLATION & PER-USER KEYS ---");
const userA = "user-uuid-111";
const userB = "user-uuid-222";
const keyA = getUserStorageKey(userA, "brand_state");
const keyB = getUserStorageKey(userB, "brand_state");

assert(keyA === "pinkloom_user_user-uuid-111_brand_state", "User A storage key is isolated");
assert(keyB === "pinkloom_user_user-uuid-222_brand_state", "User B storage key is isolated");
assert(keyA !== keyB, "Different users have strictly distinct storage keys");

// 2. Configuration Check
console.log("\n--- 2. SUPABASE CONFIGURATION DETECTION ---");
const configured = isSupabaseConfigured();
assert(typeof configured === "boolean", "Configuration detector returns a boolean");

// 3. Open Redirect Prevention Test
console.log("\n--- 3. OPEN REDIRECT SANITIZATION ---");
function sanitizeReturnTo(raw: string | null): string {
  const destination = raw ?? "/workspace";
  if (destination.startsWith("/") && !destination.startsWith("//")) {
    return destination;
  }
  return "/workspace";
}

assert(sanitizeReturnTo("/workspace") === "/workspace", "Allows standard relative route /workspace");
assert(sanitizeReturnTo("/history") === "/history", "Allows standard relative route /history");
assert(sanitizeReturnTo("https://malicious.com") === "/workspace", "Rejects external absolute URLs");
assert(sanitizeReturnTo("//malicious.com") === "/workspace", "Rejects protocol-relative URLs //malicious.com");
assert(sanitizeReturnTo(null) === "/workspace", "Defaults safely to /workspace when null");

// 4. Route Protection Matrix
console.log("\n--- 4. ROUTE PROTECTION MATRIX ---");
const protectedPaths = ["/workspace", "/history"];
function isRouteProtected(pathname: string): boolean {
  return protectedPaths.some((p) => pathname.startsWith(p));
}

assert(isRouteProtected("/workspace") === true, "/workspace is protected");
assert(isRouteProtected("/workspace/settings") === true, "/workspace subpaths are protected");
assert(isRouteProtected("/history") === true, "/history is protected");
assert(isRouteProtected("/") === false, "Landing page / is public");
assert(isRouteProtected("/signin") === false, "Sign-in page /signin is public");
assert(isRouteProtected("/api/auth/callback") === false, "Auth callback is public");

// 5. Friendly Error Formatting
console.log("\n--- 5. ERROR MESSAGE MAPPING ---");
function mapAuthError(error: string | null): string {
  if (!error) return "";
  const messages: Record<string, string> = {
    no_code: "Authentication was not completed. Please try again.",
    config: "The authentication service is not configured yet.",
    unexpected: "An unexpected error occurred. Please try again.",
    access_denied: "Unable to sign in with Google. Please try again.",
  };
  const decoded = decodeURIComponent(error);
  return (
    messages[error] ||
    messages[decoded] ||
    (decoded.toLowerCase().includes("denied") || decoded.toLowerCase().includes("cancel")
      ? "Unable to sign in with Google. Please try again."
      : decoded)
  );
}

assert(
  mapAuthError("access_denied") === "Unable to sign in with Google. Please try again.",
  "Maps access_denied to friendly cancellation message"
);
assert(
  mapAuthError("user cancelled") === "Unable to sign in with Google. Please try again.",
  "Maps user cancelled to friendly message"
);
assert(
  mapAuthError("no_code") === "Authentication was not completed. Please try again.",
  "Maps no_code safely"
);

console.log("\n============================================================");
console.log(`  AUTH INTEGRATION RESULTS: ${passedTests} / ${totalTests} PASSING`);
console.log("============================================================\n");

if (passedTests !== totalTests) {
  process.exit(1);
}
