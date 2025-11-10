"use client";

import { useState } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function DeleteAccountPage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [confirmation, setConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!user || confirmation !== "DELETE MY ACCOUNT") {
      setError("Please type the confirmation text exactly as shown");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Call the API route to delete the user
      const response = await fetch('/api/delete-account', {
        method: 'POST',
      });

      const data = await response.json();

      if (!response.ok || data.error) {
        throw new Error(data.error || "Failed to delete account");
      }

      // Sign out and redirect
      await supabase.auth.signOut();
      router.push("/");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to delete account. Please try again.";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Warning Header */}
      <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800/30 rounded-xl p-6">
        <div className="flex items-start gap-3">
          <svg
            className="w-6 h-6 text-red-600 dark:text-red-400 mt-0.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <div>
            <h1 className="text-2xl font-bold text-red-600 dark:text-red-400">
              Delete Account
            </h1>
            <p className="text-red-600/80 dark:text-red-400/80 mt-1">
              This action cannot be undone. Please read carefully before proceeding.
            </p>
          </div>
        </div>
      </div>

      {/* What happens when you delete */}
      <div className="bg-surface rounded-xl border border-surface/50 p-6">
        <h2 className="text-lg font-semibold text-text mb-4">
          What happens when you delete your account?
        </h2>

        <ul className="space-y-3 text-text/70 text-sm">
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✕</span>
            <span>Your profile and all personal information will be permanently deleted</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✕</span>
            <span>All your active listings will be removed from the marketplace</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✕</span>
            <span>Your message history will be deleted</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✕</span>
            <span>Your reviews and ratings will be removed</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✕</span>
            <span>You will lose access to all purchased items history</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-red-500 mt-0.5">✕</span>
            <span>This action is irreversible and cannot be undone</span>
          </li>
        </ul>
      </div>

      {/* Alternative Options */}
      <div className="bg-surface rounded-xl border border-surface/50 p-6">
        <h2 className="text-lg font-semibold text-text mb-4">
          Before you go...
        </h2>

        <p className="text-text/70 mb-4">
          Consider these alternatives before deleting your account:
        </p>

        <div className="space-y-3">
          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm font-medium text-accent">Take a break instead</p>
            <p className="text-xs text-text/60 mt-1">
              You can temporarily deactivate your listings and come back whenever you want
            </p>
          </div>

          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm font-medium text-accent">Update privacy settings</p>
            <p className="text-xs text-text/60 mt-1">
              Control what others can see on your profile
            </p>
          </div>

          <div className="p-3 bg-accent/10 rounded-lg border border-accent/20">
            <p className="text-sm font-medium text-accent">Turn off notifications</p>
            <p className="text-xs text-text/60 mt-1">
              Stop receiving emails and notifications without deleting your account
            </p>
          </div>
        </div>
      </div>

      {/* Confirmation */}
      <div className="bg-surface rounded-xl border border-red-500/20 p-6">
        <h2 className="text-lg font-semibold text-text mb-4">
          Confirm Account Deletion
        </h2>

        <p className="text-text/70 mb-4">
          To confirm deletion, type <span className="font-mono font-bold text-red-600 dark:text-red-400">DELETE MY ACCOUNT</span> in the field below:
        </p>

        <input
          type="text"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder="Type here..."
          className="w-full px-3 py-2 bg-background border border-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-text"
        />

        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3 mt-6">
          <button
            onClick={handleDelete}
            disabled={loading || confirmation !== "DELETE MY ACCOUNT"}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Deleting..." : "Delete My Account"}
          </button>

          <button
            onClick={() => router.push("/profile")}
            className="px-6 py-2 bg-surface border border-surface text-text/70 rounded-lg hover:bg-surface/50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}