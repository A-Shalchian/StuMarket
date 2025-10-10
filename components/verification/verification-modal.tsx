"use client";

import { useState } from "react";

interface VerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function VerificationModal({ isOpen, onClose }: VerificationModalProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [verificationUrl, setVerificationUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const validateGeorgeBrownEmail = (email: string) => {
    return email.endsWith('@georgebrown.ca');
  };

  const handleSendVerification = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    if (!email) {
      setError('Please enter your email address');
      setIsLoading(false);
      return;
    }

    if (!validateGeorgeBrownEmail(email)) {
      setError('Please use your George Brown College email (@georgebrown.ca)');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/verify-email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to send verification email');
        setIsLoading(false);
        return;
      }

      // Show success message and verification URL (if in dev mode)
      setEmailSent(true);
      if (data.verificationUrl) {
        setVerificationUrl(data.verificationUrl);
      }

    } catch (err) {
      console.error('Error sending verification email:', err);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setEmailSent(false);
    setVerificationUrl(null);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-md border border-surface/50">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-surface/50">
          <h2 className="text-xl font-semibold text-text">
            Verify Your Student Email
          </h2>
          <button
            onClick={handleClose}
            className="text-text/60 hover:text-text transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {!emailSent ? (
            <form onSubmit={handleSendVerification} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-text mb-2">
                  George Brown College Email
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your.name@georgebrown.ca"
                  className="w-full px-4 py-3 bg-background border border-surface rounded-xl focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent transition-all text-text placeholder-text/50"
                  disabled={isLoading}
                />
              </div>

              {error && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <p className="text-sm text-red-500">{error}</p>
                </div>
              )}

              <div className="bg-accent/10 p-4 rounded-lg border border-accent/20">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <p className="text-sm text-accent font-medium">Email Verification</p>
                    <p className="text-xs text-text/70 mt-1">
                      We&apos;ll send a verification link to your George Brown email. Click the link to verify your student status.
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading || !email}
                className="w-full bg-accent hover:bg-accent-hover text-white font-medium py-3 px-4 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Sending Email...' : 'Send Verification Email'}
              </button>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-center w-16 h-16 bg-green-500/10 rounded-full mx-auto">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 19v-8.93a2 2 0 01.89-1.664l7-4.666a2 2 0 012.22 0l7 4.666A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-1.14.76a2 2 0 01-2.22 0l-1.14-.76" />
                </svg>
              </div>

              <div className="text-center">
                <h3 className="text-lg font-semibold text-text mb-2">
                  {verificationUrl ? 'Verification Link Generated' : 'Check Your Email'}
                </h3>
                <p className="text-sm text-text/70 mb-4">
                  {verificationUrl ? (
                    <>
                      <strong className="text-accent">{email}</strong> - Click the link below to verify
                    </>
                  ) : (
                    <>
                      We&apos;ve sent a verification link to <strong className="text-accent">{email}</strong>
                    </>
                  )}
                </p>
                {verificationUrl ? (
                  <div className="mb-4 p-3 bg-accent/10 border border-accent/20 rounded-lg">
                    <p className="text-xs text-accent font-medium mb-2">Development Mode - Click to Verify:</p>
                    <a
                      href={verificationUrl}
                      className="text-sm text-accent hover:text-accent-hover underline break-all"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Verify Email
                    </a>
                  </div>
                ) : (
                  <p className="text-xs text-text/60">
                    Click the link in the email to verify your student status. You can close this window.
                  </p>
                )}
              </div>

              <button
                onClick={handleClose}
                className="w-full bg-surface hover:bg-surface/80 text-text font-medium py-3 px-4 rounded-xl transition-colors"
              >
                Close
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}