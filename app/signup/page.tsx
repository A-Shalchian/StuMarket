"use client";

import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import "./signup.css";

export default function SignupPage() {
  const [success, setSuccess] = useState(false);
  const [successEmail, setSuccessEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const validateEmail = (email: string): boolean => {
    return email.toLowerCase().endsWith("@georgebrown.ca");
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setSuccess(false);

    // Validation
    if (!firstName || !lastName || !email || !password) {
      toast.error("Please fill in all required fields");
      setIsLoading(false);
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Please use your @georgebrown.ca email address");
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      setIsLoading(false);
      return;
    }

    if (dateOfBirth) {
      const birthDate = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      if (age < 16) {
        toast.error("You must be at least 16 years old to sign up");
        setIsLoading(false);
        return;
      }
    }

    try {
      // First check if user exists in profiles
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id, is_verified')
        .eq('email', email)
        .single();

      if (existingProfile) {
        if (existingProfile.is_verified) {
          // User is verified, tell them to sign in
          toast.error("An account with this email already exists. Please sign in instead.");
          setIsLoading(false);
          return;
        } else {
          // User exists but not verified - tell them to check email
          toast.error("You already have an unverified account. Please check your email for the verification link, or sign in and request a new one.", {
            duration: 7000,
          });
          setIsLoading(false);
          return;
        }
      }

      const fullName = `${firstName} ${lastName}`;

      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
            email: email,
            college_email: email,
            college_domain: 'georgebrown.ca',
            date_of_birth: dateOfBirth || null,
          }
        }
      });

      if (signUpError) {
        // Check if user already exists
        if (signUpError.message.includes('already registered') ||
            signUpError.message.includes('User already registered')) {
          toast.error("An account with this email already exists. Please sign in instead.");
          setIsLoading(false);
          return;
        }
        toast.error(signUpError.message);
        setIsLoading(false);
        return;
      }

      // Check if user already exists but no error was thrown (Supabase sometimes does this)
      if (signUpData.user && signUpData.user.identities && signUpData.user.identities.length === 0) {
        toast.error("An account with this email already exists. Please sign in instead.");
        setIsLoading(false);
        return;
      }

      if (signUpData.user) {
        toast.success("Account created! Check your email to verify.");
        setSuccessEmail(email);
        setSuccess(true);
        setFirstName("");
        setLastName("");
        setDateOfBirth("");
        setEmail("");
        setPassword("");
      }
    } catch (err) {
      console.error("Signup error:", err);
      toast.error("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen pt-20 pb-8 px-4 bg-background relative overflow-hidden flex items-center justify-center">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        </div>

        <div className="relative z-10 w-full max-w-md">
          <div className="bg-background/60 backdrop-blur-xl border border-surface/50 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-text mb-4">Check Your Email!</h2>
            <p className="text-text/70 mb-2">
              We&apos;ve sent a verification link to:
            </p>
            <p className="text-accent font-semibold mb-6">{successEmail}</p>
            <p className="text-text/60 text-sm mb-6">
              Click the link in the email to verify your account and access StuMarket.
            </p>
            <Link
              href="/login"
              className="inline-block px-6 py-3 bg-accent hover:bg-accent-hover text-accent-text font-medium rounded-lg transition-colors"
            >
              Go to Login
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-8 px-4 bg-background relative overflow-hidden flex items-center justify-center">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}} />
        <div className="absolute top-1/2 left-1/4 w-32 h-32 bg-accent/5 rounded-full blur-2xl animate-bounce" style={{animationDelay: '2s', animationDuration: '3s'}} />
        <div className="absolute bottom-1/4 right-1/4 w-24 h-24 bg-accent/5 rounded-full blur-xl animate-pulse" style={{animationDelay: '0.5s'}} />
      </div>

      <div className="relative z-10 w-full max-w-sm sm:max-w-md animate-fade-in-up">
        <div className="bg-background/60 backdrop-blur-xl border border-surface/50 rounded-2xl p-6 sm:p-8 shadow-2xl">
          <div className="text-center mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-text mb-2">
              Create Your Account
            </h2>
            <p className="text-text/70 text-sm">
              Join the George Brown College marketplace
            </p>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  placeholder="First Name *"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-text placeholder-text/50 text-sm sm:text-base"
                  disabled={isLoading}
                  required
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last Name *"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-text placeholder-text/50 text-sm sm:text-base"
                  disabled={isLoading}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-text/70 mb-2 ml-1">
                Date of Birth (Optional)
              </label>
              <input
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-text text-sm sm:text-base [&::-webkit-calendar-picker-indicator]:cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-70 hover:[&::-webkit-calendar-picker-indicator]:opacity-100 [&::-webkit-calendar-picker-indicator]:hover:scale-110 [&::-webkit-calendar-picker-indicator]:transition-all"
                disabled={isLoading}
              />
            </div>

            <div>
              <input
                type="email"
                placeholder="your.email@georgebrown.ca *"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-text placeholder-text/50 text-sm sm:text-base"
                disabled={isLoading}
                required
              />
            </div>

            <div>
              <input
                type="password"
                placeholder="Password (min 6 characters) *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 sm:px-4 py-2.5 sm:py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-text placeholder-text/50 text-sm sm:text-base"
                disabled={isLoading}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full px-6 py-3 sm:py-4 bg-accent hover:bg-accent-hover text-accent-text border border-accent rounded-xl transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-text/60">
              Already have an account?{" "}
              <Link href="/login" className="text-accent hover:text-accent-hover font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href="/" className="text-sm text-text/60 hover:text-accent transition-all inline-flex items-center gap-2">
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
