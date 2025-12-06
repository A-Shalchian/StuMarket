"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import UserMenu from '@/components/auth/user-menu';

interface UserProfile {
  id: string;
  full_name: string | null;
  email: string | null;
  is_verified: boolean;
  college_name: string | null;
  college_email: string | null;
}

interface User {
  id: string;
  email?: string;
}

interface DashboardClientProps {
  user: User;
  userProfile: UserProfile | null;
}

export default function DashboardClient({ user, userProfile }: DashboardClientProps) {
  const searchParams = useSearchParams();
  const [profile] = useState(userProfile);
  const [notification, setNotification] = useState<{ type: 'success' | 'error', message: string } | null>(null);

  useEffect(() => {
    // Check for verification success from callback URL
    const verified = searchParams.get('verified');

    if (verified === 'true') {
      setNotification({ type: 'success', message: 'Email verified successfully! You now have full access to the marketplace.' });
      // Clear the query param
      window.history.replaceState({}, '', '/dashboard');
      // Reload to get updated profile
      setTimeout(() => window.location.reload(), 2000);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-background transition-colors">
      <header className="bg-surface shadow-sm border-b border-surface/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <h1 className="text-xl font-semibold text-text">College Marketplace</h1>
            <UserMenu />
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success/Error Notification */}
        {notification && (
          <div className={`mb-6 ${notification.type === 'success' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'} border rounded-lg p-4`}>
            <div className="flex items-center">
              <div className="flex-shrink-0">
                {notification.type === 'success' ? (
                  <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <div className="ml-3">
                <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-red-200'}`}>
                  {notification.message}
                </p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setNotification(null)}
                  className={`inline-flex ${notification.type === 'success' ? 'text-green-400 hover:text-green-500' : 'text-red-400 hover:text-red-500'}`}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Verification Alert */}
        {!profile?.is_verified && (
          <div className="mb-6 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                  Email Verification Required
                </h3>
                <div className="mt-1 text-sm text-yellow-700 dark:text-yellow-300">
                  <p>Please check your <strong>@georgebrown.ca</strong> email inbox and click the verification link to access the marketplace.</p>
                  <p className="mt-1 text-xs">Didn&apos;t receive the email? Check your spam folder or contact support.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-surface rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-text">Welcome back, {profile?.full_name || user.email}!</h2>
            {profile?.is_verified && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Verified Student</span>
              </div>
            )}
          </div>

          {profile?.is_verified && profile?.college_name && (
            <div className="mb-6 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm text-text/70">
                <strong className="text-accent">{profile.college_name}</strong>
                {profile.college_email && ` • ${profile.college_email}`}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <Link
              href="/marketplace"
              className="bg-accent/10 p-6 rounded-lg border border-accent/20 hover:border-accent/40 hover:bg-accent/15 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-accent">Browse Listings</h3>
                <svg className="w-5 h-5 text-accent opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-text/70 text-sm">
                Explore items for sale from other students
              </p>
            </Link>

            <Link
              href={profile?.is_verified ? "/listings/new" : "#"}
              onClick={(e) => {
                if (!profile?.is_verified) {
                  e.preventDefault();
                }
              }}
              className={`bg-green-500/10 p-6 rounded-lg border border-green-500/20 transition-all group ${
                profile?.is_verified ? 'hover:border-green-500/40 hover:bg-green-500/15' : 'opacity-60 cursor-not-allowed'
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-green-600 dark:text-green-400">Sell Items</h3>
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-text/70 text-sm">
                {profile?.is_verified
                  ? "List your items for other students to buy"
                  : "Verify your email to start selling"
                }
              </p>
            </Link>

            <Link
              href="/messages"
              className="bg-purple-500/10 p-6 rounded-lg border border-purple-500/20 hover:border-purple-500/40 hover:bg-purple-500/15 transition-all group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-purple-600 dark:text-purple-400">Messages</h3>
                <svg className="w-5 h-5 text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <p className="text-text/70 text-sm">
                Chat with buyers and sellers
              </p>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}