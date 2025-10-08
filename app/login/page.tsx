 "use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";
import "./login.css";

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isEmailLoading, setIsEmailLoading] = useState(false);
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

  // const handleOneTapSuccess = () => {
  //   window.location.href = '/dashboard';
  // };

  // const handleOneTapError = (error: string) => {
  //   setError(error);
  // };

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEmailLoading(true);
    setError(null);

    if (!email || !password) {
      setError("Please fill in all fields");
      setIsEmailLoading(false);
      return;
    }

    try {
      // First, try to sign in (for existing users)
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInData.user && !signInError) {
        // Success! User signed in
        window.location.href = '/dashboard';
        return;
      }

      // If sign in failed, check if it's because user doesn't exist
      if (signInError?.message?.includes('Invalid login credentials')) {
        // Try to sign up the user (new user)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
        });

        if (signUpError) {
          setError(signUpError.message);
          setIsEmailLoading(false);
          return;
        }

        if (signUpData.user) {
          // Check if email confirmation is required
          if (!signUpData.session) {
            setError("Please check your email to confirm your account before signing in.");
          } else {
            // User created and signed in successfully
            window.location.href = '/dashboard';
          }
        }
      } else {
        // Other sign in error
        setError(signInError?.message || "Failed to sign in");
      }
    } catch (err) {
      console.error("Email authentication error:", err);
      setError("An unexpected error occurred");
    } finally {
      setIsEmailLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 bg-background relative overflow-hidden flex items-center justify-center">
      {/* Google One Tap - Temporarily disabled due to FedCM issues */}
      {/* <GoogleOneTap onSuccess={handleOneTapSuccess} onError={handleOneTapError} /> */}

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
              Sign in to connect with your college community
            </p>
          </div>

          {/* Google Login Button with enhanced animations */}
          <div className="animate-fade-in" style={{animationDelay: '0.6s'}}>
            <button
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full group/google relative flex items-center justify-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-background hover:bg-surface/50 border border-surface rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover:border-accent/30"
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
              <span className="font-medium text-text group-hover/google:text-accent transition-colors duration-300">
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
          </div>

          {/* Animated Divider */}
          <div className="relative my-6 sm:my-8 animate-fade-in" style={{animationDelay: '0.8s'}}>
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-surface/50 group-hover:border-accent/20 transition-colors duration-500" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-4 text-text/50 bg-background group-hover:text-accent/70 transition-colors duration-300">or</span>
            </div>
          </div>

          {/* Email/Password Form with stagger animations */}
          <form onSubmit={handleEmailAuth} className="space-y-3 sm:space-y-4 animate-fade-in" style={{animationDelay: '1s'}}>
            <div className="animate-slide-in-left" style={{animationDelay: '1.2s'}}>
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent focus:scale-[1.02] transition-all duration-300 text-text placeholder-text/50 text-sm sm:text-base hover:border-accent/30"
                disabled={isEmailLoading}
              />
            </div>
            <div className="animate-slide-in-left" style={{animationDelay: '1.4s'}}>
              <input
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent focus:scale-[1.02] transition-all duration-300 text-text placeholder-text/50 text-sm sm:text-base hover:border-accent/30"
                disabled={isEmailLoading}
              />
            </div>
            <div className="animate-slide-in-left" style={{animationDelay: '1.6s'}}>
              <button
                type="submit"
                disabled={isEmailLoading || !email || !password}
                className="w-full group/submit relative flex items-center justify-center gap-3 px-4 sm:px-6 py-3 sm:py-4 bg-accent hover:bg-accent-hover text-white border border-accent rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-accent/25"
              >
                <span className="font-medium group-hover/submit:scale-105 transition-transform duration-200">
                  {isEmailLoading ? "Please wait..." : "Continue"}
                </span>
                {isEmailLoading && (
                  <div className="absolute right-4">
                    <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                  </div>
                )}
              </button>
            </div>
          </form>

          {/* Error Message with animation */}
          {error && (
            <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg animate-shake animate-fade-in">
              <p className="text-sm text-red-500 text-center">{error}</p>
            </div>
          )}

          {/* Footer with delayed animation */}
          <div className="text-center space-y-2 mt-6 sm:mt-8 animate-fade-in" style={{animationDelay: '1.8s'}}>
            <p className="text-xs text-text/50 group-hover:text-text/70 transition-colors duration-300">
              By signing in, you agree to our
            </p>
            <div className="flex items-center justify-center gap-3 sm:gap-4 text-xs">
              <button className="text-accent hover:text-accent-hover hover:scale-105 transition-all duration-200">
                Terms of Service
              </button>
              <span className="text-text/30">•</span>
              <button className="text-accent hover:text-accent-hover hover:scale-105 transition-all duration-200">
                Privacy Policy
              </button>
            </div>
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