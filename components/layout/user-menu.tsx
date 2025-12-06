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
        <div className="w-8 h-8 bg-gradient-to-br from-accent to-accent-hover rounded-full flex items-center justify-center text-white text-sm font-medium">
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
        <div className="absolute right-0 mt-3 w-64 bg-background border border-surface/30 rounded-xl shadow-2xl py-2 z-50 backdrop-blur-sm">
          {/* User Info Header */}
          <div className="px-4 py-3 border-b border-surface/20">
            <p className="text-sm font-medium text-text truncate">
              {user.user_metadata?.full_name || "User"}
            </p>
            <p className="text-xs text-text/60 truncate mt-0.5">
              {user.email}
            </p>
          </div>

          {/* Navigation Links */}
          <div className="py-2">
            <Link
              href="/"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text/80 hover:text-text hover:bg-surface/40 transition-all duration-150"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              Marketplace
            </Link>

            <Link
              href="/events"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text/80 hover:text-text hover:bg-surface/40 transition-all duration-150"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              Parties/Events
            </Link>

            <Link
              href="/chat"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text/80 hover:text-text hover:bg-surface/40 transition-all duration-150"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              Chat
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-surface/20 my-2"></div>

          {/* Account Links */}
          <div className="py-2">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text/80 hover:text-text hover:bg-surface/40 transition-all duration-150"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
              </svg>
              Dashboard
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text/80 hover:text-text hover:bg-surface/40 transition-all duration-150"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Profile
            </Link>

            <Link
              href="/listings/my-listings"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-text/80 hover:text-text hover:bg-surface/40 transition-all duration-150"
              onClick={() => setIsOpen(false)}
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              My Listings
            </Link>
          </div>

          {/* Divider */}
          <div className="border-t border-surface/20 my-2"></div>

          {/* Sign Out */}
          <div className="py-2">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all duration-150"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Log out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}