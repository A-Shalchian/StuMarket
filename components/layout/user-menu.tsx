"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function UserMenu() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const supabase = createClient();
  const router = useRouter();

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  };

  if (!user) return null;

  const getInitials = (name: string | undefined) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-surface/50 transition-colors"
      >
        <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-hover rounded-full flex items-center justify-center text-accent-text text-sm font-medium">
          {getInitials(user.user_metadata?.full_name || user.email)}
        </div>
        <span className="hidden md:block text-sm font-medium text-text max-w-[150px] truncate">
          {user.user_metadata?.full_name || user.email?.split("@")[0]}
        </span>
        <svg
          className={`w-4 h-4 text-text/50 transition-transform ${isOpen ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-56 bg-surface rounded-lg shadow-lg border border-surface/50 py-1 z-50">
          <div className="px-4 py-3 border-b border-surface/50">
            <p className="text-sm font-medium text-text truncate">
              {user.user_metadata?.full_name || "User"}
            </p>
            <p className="text-xs text-text/50 truncate">
              {user.email}
            </p>
          </div>

          <Link
            href="/dashboard"
            className="block px-4 py-2 text-sm text-text hover:bg-surface/50"
            onClick={() => setIsOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            href="/profile"
            className="block px-4 py-2 text-sm text-text hover:bg-surface/50"
            onClick={() => setIsOpen(false)}
          >
            Profile
          </Link>

          <Link
            href="/profile/listings"
            className="block px-4 py-2 text-sm text-text hover:bg-surface/50"
            onClick={() => setIsOpen(false)}
          >
            My Listings
          </Link>

          <div className="border-t border-surface/50 mt-1 pt-1">
            <button
              onClick={handleSignOut}
              className="block w-full text-left px-4 py-2 text-sm text-red-500 hover:bg-surface/50"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}