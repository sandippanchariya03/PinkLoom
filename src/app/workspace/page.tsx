"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Page 3 (/workspace) has been fully consolidated into Page 2 (/) Discovery.
 * Any legacy bookmarks or references are immediately redirected to root.
 */
export default function WorkspaceRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/");
  }, [router]);

  return null;
}
