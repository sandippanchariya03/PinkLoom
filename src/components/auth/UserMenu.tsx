"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { LogOut, User, History, ChevronDown } from "lucide-react";
import type { UserProfile } from "@/lib/auth/auth";
import { signOut } from "@/lib/auth/auth";

interface UserMenuProps {
  user: UserProfile;
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close on Escape key
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    },
    [open]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleSignOut = async () => {
    setSigningOut(true);
    await signOut();

    // Clear per-user localStorage for data isolation
    try {
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(`pinkloom_user_${user.id}_`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((k) => localStorage.removeItem(k));
    } catch {
      // ignore storage access errors
    }

    setOpen(false);
    router.push("/signin");
    router.refresh();
  };

  const displayName = user.displayName || user.email.split("@")[0] || "User";
  const initials = (user.displayName || user.email)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase() || "U";

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        id="user-menu-btn"
        type="button"
        aria-label={`User menu for ${displayName}`}
        aria-expanded={open}
        aria-haspopup="true"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center gap-2 px-2.5 py-1.5 rounded-full border border-[#E8E5DF] hover:border-[#D4D1CA] bg-white hover:bg-[#F2EFE9] transition-all group focus:outline-none focus:ring-2 focus:ring-[#E87A90]/30 shadow-xs"
      >
        {/* Avatar */}
        {user.avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.avatarUrl}
            alt={displayName}
            className="w-6 h-6 rounded-full ring-1 ring-[#E8E5DF] object-cover shrink-0"
          />
        ) : (
          <div
            className="w-6 h-6 rounded-full bg-[#141416] flex items-center justify-center text-[10px] font-bold text-[#E87A90] ring-1 ring-[#E8E5DF] shrink-0"
            aria-hidden="true"
          >
            {initials}
          </div>
        )}

        <span className="hidden sm:inline-block text-xs font-medium text-[#141416] max-w-[120px] truncate">
          {displayName}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-[#96948F] transition-transform duration-200 shrink-0 ${
            open ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        />
      </button>

      {/* Compact Dropdown Menu */}
      {open && (
        <div
          role="menu"
          aria-label="User options"
          className="absolute right-0 top-full mt-2 w-60 max-w-[calc(100vw-2rem)] bg-white border border-[#E8E5DF] rounded-2xl shadow-[0_8px_30px_rgba(20,20,22,0.08)] overflow-hidden z-50 animate-in fade-in zoom-in-95 duration-100"
        >
          {/* User info header */}
          <div className="px-4 py-3.5 border-b border-[#F0EDE8] bg-[#FAF9F6]">
            <p className="text-xs font-semibold text-[#141416] truncate">
              {displayName}
            </p>
            <p className="text-[11px] text-[#86847E] truncate mt-0.5 font-mono">
              {user.email}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="py-1">
            <button
              type="button"
              role="menuitem"
              id="menu-history"
              onClick={() => {
                setOpen(false);
                router.push("/history");
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#2E2D2B] hover:bg-[#F4F1EA] transition-colors text-left"
            >
              <History className="w-3.5 h-3.5 text-[#E87A90]" />
              <span>Brand History</span>
            </button>

            <button
              type="button"
              role="menuitem"
              id="menu-profile"
              onClick={() => {
                setOpen(false);
                router.push("/");
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-[#2E2D2B] hover:bg-[#F4F1EA] transition-colors text-left"
            >
              <User className="w-3.5 h-3.5 text-[#96948F]" />
              <span>Discovery Workspace</span>
            </button>
          </div>

          {/* Sign Out Action */}
          <div className="border-t border-[#F0EDE8] py-1 bg-white">
            <button
              type="button"
              role="menuitem"
              id="menu-signout"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-xs text-red-600 hover:bg-red-50/80 transition-colors text-left disabled:opacity-50 font-medium"
            >
              <LogOut className="w-3.5 h-3.5 shrink-0" />
              <span>{signingOut ? "Signing out…" : "Sign Out"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
