"use client";

import { useEffect } from "react";
import { createClient } from "@/lib/supabase/client";

declare global {
  interface Window {
    google: {
      accounts: {
        id: {
          initialize: (config: GoogleOneTapConfig) => void;
          prompt: (callback: (notification: GooglePromptNotification) => void) => void;
        };
      };
    };
  }
}

interface GoogleOneTapConfig {
  client_id: string;
  callback: (response: GoogleCredentialResponse) => void;
  auto_select?: boolean;
  cancel_on_tap_outside?: boolean;
}

interface GoogleCredentialResponse {
  credential: string;
}

interface GooglePromptNotification {
  isNotDisplayed: () => boolean;
  isSkippedMoment: () => boolean;
  getNotDisplayedReason?: () => string;
}

interface GoogleOneTapProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export default function GoogleOneTap({ onSuccess, onError }: GoogleOneTapProps) {
  const supabase = createClient();

  useEffect(() => {
    // Wait for Google Script to load
    const initializeGoogleOneTap = () => {
      if (typeof window !== "undefined" && window.google) {
        const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

        if (!clientId) {
          console.error("Google Client ID not found. Please add NEXT_PUBLIC_GOOGLE_CLIENT_ID to your .env.local file");
          onError?.("Google authentication not configured");
          return;
        }

        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleCredentialResponse,
          auto_select: true, // Auto-select if user has only one Google account
          cancel_on_tap_outside: false,
        });

        // Show the One Tap prompt
        window.google.accounts.id.prompt((notification: GooglePromptNotification) => {
          if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
            // One Tap was not displayed - user might not be signed into Google
            console.log("Google One Tap not displayed:", notification.getNotDisplayedReason?.() || 'Unknown reason');
          }
        });
      }
    };

    // Handle the credential response from Google One Tap
    const handleCredentialResponse = async (response: GoogleCredentialResponse) => {
      try {
        // The response.credential contains the JWT token from Google
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: response.credential,
        });

        if (error) {
          console.error('Error signing in with Google One Tap:', error);
          onError?.(error.message);
          return;
        }

        if (data.user) {
          console.log('Successfully signed in with Google One Tap');
          onSuccess?.();
        }
      } catch (err) {
        console.error('Error processing Google One Tap:', err);
        onError?.('Failed to sign in with Google');
      }
    };

    // Initialize when Google script loads
    if (window.google) {
      initializeGoogleOneTap();
    } else {
      // Wait for script to load
      const checkGoogle = setInterval(() => {
        if (window.google) {
          clearInterval(checkGoogle);
          initializeGoogleOneTap();
        }
      }, 100);

      // Cleanup interval if component unmounts
      return () => clearInterval(checkGoogle);
    }
  }, [onSuccess, onError, supabase.auth]);

  // This component doesn't render anything visible
  return null;
}