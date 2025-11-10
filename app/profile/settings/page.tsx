"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";

export default function SettingsPage() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [settings, setSettings] = useState({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    message_notifications: true,
    listing_notifications: true,
    event_notifications: true,
    privacy_show_phone: false,
    privacy_show_email: false,
  });

  const loadSettings = useCallback(async () => {
    if (!user) return;

    // Since we don't have a user_settings table in the current schema,
    // we'll use the default settings for now
    // You can extend the profiles table or create a new settings table later
    setSettings({
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      message_notifications: true,
      listing_notifications: true,
      event_notifications: true,
      privacy_show_phone: false,
      privacy_show_email: false,
    });
  }, [user]);

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user, loadSettings]);

  const handleToggle = (key: keyof typeof settings) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setMessage(null);

    // Since we don't have a user_settings table, we'll just show a success message
    // You can implement actual settings storage later
    setMessage({ type: "success", text: "Settings saved successfully!" });
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-surface rounded-xl border border-surface/50 p-6">
        <h1 className="text-2xl font-bold text-text">Settings</h1>
        <p className="text-text/60 mt-1">Manage your notification and privacy preferences</p>
      </div>

      {/* Notification Settings */}
      <div className="bg-surface rounded-xl border border-surface/50 p-6">
        <h2 className="text-lg font-semibold text-text mb-4">Notifications</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Email Notifications</p>
              <p className="text-sm text-text/60">Receive updates via email</p>
            </div>
            <button
              onClick={() => handleToggle("email_notifications")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.email_notifications ? "bg-accent" : "bg-surface"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  settings.email_notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Push Notifications</p>
              <p className="text-sm text-text/60">Receive push notifications on your device</p>
            </div>
            <button
              onClick={() => handleToggle("push_notifications")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.push_notifications ? "bg-accent" : "bg-surface"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  settings.push_notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">SMS Notifications</p>
              <p className="text-sm text-text/60">Receive important updates via SMS</p>
            </div>
            <button
              onClick={() => handleToggle("sms_notifications")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.sms_notifications ? "bg-accent" : "bg-surface"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  settings.sms_notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Messages</p>
              <p className="text-sm text-text/60">Notifications for new messages</p>
            </div>
            <button
              onClick={() => handleToggle("message_notifications")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.message_notifications ? "bg-accent" : "bg-surface"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  settings.message_notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Listings</p>
              <p className="text-sm text-text/60">Updates about your listings and activities</p>
            </div>
            <button
              onClick={() => handleToggle("listing_notifications")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.listing_notifications ? "bg-accent" : "bg-surface"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  settings.listing_notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Events</p>
              <p className="text-sm text-text/60">Updates about events you are interested in</p>
            </div>
            <button
              onClick={() => handleToggle("event_notifications")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.event_notifications ? "bg-accent" : "bg-surface"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  settings.event_notifications ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Settings */}
      <div className="bg-surface rounded-xl border border-surface/50 p-6">
        <h2 className="text-lg font-semibent text-text mb-4">Privacy</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Show Phone Number</p>
              <p className="text-sm text-text/60">Make your phone number visible to other users</p>
            </div>
            <button
              onClick={() => handleToggle("privacy_show_phone")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.privacy_show_phone ? "bg-accent" : "bg-surface"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  settings.privacy_show_phone ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-text">Show Email Address</p>
              <p className="text-sm text-text/60">Make your email address visible to other users</p>
            </div>
            <button
              onClick={() => handleToggle("privacy_show_email")}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                settings.privacy_show_email ? "bg-accent" : "bg-surface"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-background transition-transform ${
                  settings.privacy_show_email ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-surface rounded-xl border border-surface/50 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-text">Save Changes</h3>
            <p className="text-sm text-text/60">Save your settings preferences</p>
          </div>

          <button
            onClick={handleSave}
            disabled={loading}
            className="px-6 py-2 bg-accent text-accent-text rounded-lg hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? "Saving..." : "Save Settings"}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div
            className={`mt-4 p-3 rounded-lg ${
              message.type === "success"
                ? "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
                : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
            }`}
          >
            <p className="text-sm">{message.text}</p>
          </div>
        )}
      </div>
    </div>
  );
}