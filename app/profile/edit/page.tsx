"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/components/providers/auth-provider";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function EditProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    college: "",
    avatar_url: "",
  });

  const loadProfile = useCallback(async () => {
    if (!user) return;

    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (data) {
      setFormData({
        full_name: data.full_name || "",
        email: data.email || "",
        college: data.college || "",
        avatar_url: data.avatar_url || "",
      });
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user, loadProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: formData.full_name,
        email: formData.email,
        college: formData.college,
        avatar_url: formData.avatar_url,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      setMessage({ type: "error", text: error.message });
    } else {
      setMessage({ type: "success", text: "Profile updated successfully!" });
      setTimeout(() => {
        router.push("/profile");
      }, 1500);
    }

    setLoading(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-surface rounded-xl border border-surface/50 p-6">
        <h1 className="text-2xl font-bold text-text">Edit Profile</h1>
        <p className="text-text/60 mt-1">Update your profile information</p>
      </div>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-surface/50 p-6">
        <div className="space-y-6">
          {/* Personal Information */}
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Personal Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text"
                  placeholder="john@college.edu"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text/70 mb-2">
                  College
                </label>
                <input
                  type="text"
                  name="college"
                  value={formData.college}
                  onChange={handleChange}
                  className="w-full px-3 py-2 bg-background border border-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text"
                  placeholder="New York, NY"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div>
            <h2 className="text-lg font-semibold text-text mb-4">Academic Information</h2>
            <div>
              <label className="block text-sm font-medium text-text/70 mb-2">
                College/University
              </label>
              <input
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                className="w-full px-3 py-2 bg-background border border-surface rounded-lg focus:outline-none focus:ring-2 focus:ring-accent text-text"
                placeholder="Harvard University"
              />
            </div>
          </div>

          {/* Message */}
          {message && (
            <div
              className={`p-3 rounded-lg ${
                message.type === "success"
                  ? "bg-green-500/10 border border-green-500/20 text-green-600 dark:text-green-400"
                  : "bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400"
              }`}
            >
              <p className="text-sm">{message.text}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-accent text-white rounded-lg hover:bg-accent-hover transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>

            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="px-6 py-2 bg-surface border border-surface text-text/70 rounded-lg hover:bg-surface/50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}