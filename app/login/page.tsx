 "use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import "./login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const validateEmail = (email: string): boolean => {
    return email.toLowerCase().endsWith("@georgebrown.ca");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    if (!email || !password) {
      toast.error("Please fill in all fields");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please use your @georgebrown.ca email address");
      setIsLoading(false);
      return;
    }

    try {
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Check for email not confirmed error
        if (signInError.message.includes('Email not confirmed')) {
          toast.error("Please verify your email before signing in. Check your @georgebrown.ca inbox and click the verification link.", {
            duration: 6000,
          });
          setIsLoading(false);
          return;
        }

        // Check for invalid credentials
        if (signInError.message.includes('Invalid login credentials')) {
          toast.error("Invalid email or password. Don't have an account? Sign up first.");
          setIsLoading(false);
          return;
        }

        // Generic error
        toast.error(signInError.message);
        setIsLoading(false);
        return;
      }

      if (signInData.user) {
        // Double check if email is verified
        if (!signInData.user.email_confirmed_at) {
          toast.error("Please verify your email before signing in. Check your @georgebrown.ca inbox for the verification link.", {
            duration: 6000,
          });
          await supabase.auth.signOut();
          setIsLoading(false);
          return;
        }

        // Success! Redirect to dashboard
        toast.success("Signed in successfully!");
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 500);
      }
    } catch (err) {
      console.error("Login error:", err);
      toast.error("An unexpected error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 bg-background relative overflow-hidden flex items-center justify-center">
      {/* Enhanced Background decoration with animations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent/5 rounded-full blur-2xl animate-bounce" style={{animationDelay: '2s', animationDuration: '3s'}} />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/5 rounded-full blur-xl animate-pulse" style={{animationDelay: '0.5s'}} />
      </div>

      {/* Login Card with entrance animation */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md animate-fade-in-up">
        <div className="bg-background/60 backdrop-blur-xl border border-surface/50 rounded-2xl p-6 sm:p-8 shadow-2xl hover:shadow-3xl transition-all duration-500 hover:border-accent/20 group">

          {/* Welcome Message with stagger animation */}
          <div className="text-center mb-6 sm:mb-8 animate-fade-in" style={{animationDelay: '0.2s'}}>
            <h2 className="text-xl sm:text-2xl font-semibold text-text mb-2 group-hover:text-accent transition-colors duration-300">
              Welcome Back
            </h2>
            <p className="text-text/70 text-sm animate-fade-in" style={{animationDelay: '0.4s'}}>
              Sign in to your StuMarket account
            </p>
          </div>

          {/* Email/Password Form with stagger animations */}
          <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4 animate-fade-in" style={{animationDelay: '0.6s'}}>
            <div className="animate-slide-in-left" style={{animationDelay: '0.8s'}}>
              <input
                type="email"
                placeholder="your.email@georgebrown.ca"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent focus:scale-[1.02] transition-all duration-300 text-text placeholder-text/50 text-sm sm:text-base hover:border-accent/30"
                disabled={isLoading}
              />
            </div>
            <div className="animate-slide-in-left" style={{animationDelay: '1s'}}>
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent focus:scale-[1.02] transition-all duration-300 text-text placeholder-text/50 text-sm sm:text-base hover:border-accent/30"
                disabled={isLoading}
              />
            </div>
            <div className="animate-slide-in-left" style={{animationDelay: '1.2s'}}>
              <button
                type="submit"
                disabled={isLoading || !email || !password}
                className="w-full group/submit relative flex items-center justify-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-accent hover:bg-accent-hover text-accent-text border border-accent rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-accent/25"
              >
                <span className="font-medium group-hover/submit:scale-105 transition-transform duration-200">
                  {isLoading ? "Signing In..." : "Sign In"}
                </span>
                {isLoading && (
                  <div className="absolute right-4">
                    <svg className="animate-spin h-5 w-5 text-accent-text" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Sign up link */}
          <div className="text-center mt-6 animate-fade-in" style={{animationDelay: '1.4s'}}>
            <p className="text-sm text-text/60">
              Don&apos;t have an account?{" "}
              <Link href="/signup" className="text-accent hover:text-accent-hover font-medium">
                Create one
              </Link>
            </p>
          </div>

        </div>

        {/* Back to Home with animation */}
        <div className="text-center mt-4 sm:mt-6 animate-fade-in" style={{animationDelay: '2s'}}>
          <Link href="/" className="text-xs sm:text-sm text-text/60 hover:text-accent transition-all duration-300 inline-flex items-center gap-2 hover:scale-105 group/back">
            <svg className="w-4 h-4 group-hover/back:-translate-x-1 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to home
          </Link>
        </div>
      </div>
    </div>
  );
}