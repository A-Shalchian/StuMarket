"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
      </div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md px-4">
        <div className="bg-background/50 backdrop-blur-xl border border-surface/50 rounded-2xl p-8 shadow-2xl">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-4xl font-bold">
                <span className="text-text">Stu</span>
                <span className="text-accent">Market</span>
              </h1>
            </Link>
            <p className="mt-3 text-text/60 text-sm">
              Your campus marketplace awaits
            </p>
          </div>

          {/* Welcome Message */}
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-text mb-2">
              Welcome Back
            </h2>
            <p className="text-text/70 text-sm">
              Sign in to connect with your college community
            </p>
          </div>

          {/* Google Login Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full group relative flex items-center justify-center gap-3 px-6 py-4 bg-background hover:bg-surface/50 border border-surface rounded-xl transition-all duration-200 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {!isLoading && (
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
            )}
            <span className="font-medium text-text">
              {isLoading ? "Signing in..." : "Continue with Google"}
            </span>
            {isLoading && (
              <div className="absolute right-4">
                <svg className="animate-spin h-5 w-5 text-accent" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-500 text-center">{error}</p>
            </div>
          )}

          {/* Divider */}
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface/50" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 text-text/50 bg-background">Secure login</span>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center space-y-2">
            <p className="text-xs text-text/50">
              By signing in, you agree to our
            </p>
            <div className="flex items-center justify-center gap-4 text-xs">
              <button className="text-accent hover:text-accent-hover transition-colors">
                Terms of Service
              </button>
              <span className="text-text/30">•</span>
              <button className="text-accent hover:text-accent-hover transition-colors">
                Privacy Policy
              </button>
            </div>
          </div>

          {/* Student Only Notice */}
          <div className="mt-8 p-3 bg-accent/5 rounded-lg border border-accent/10">
            <div className="flex items-center gap-2 justify-center">
              <svg className="w-4 h-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14v7" />
              </svg>
              <span className="text-xs text-accent font-medium">Students Only</span>
            </div>
            <p className="text-xs text-text/60 text-center mt-1">
              Exclusive access for verified college students
            </p>
          </div>
        </div>

        {/* Back to Home */}
        <div className="text-center mt-6">
          <Link href="/" className="text-sm text-text/60 hover:text-text transition-colors inline-flex items-center gap-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}