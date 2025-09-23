import { getUser } from "@/lib/supabase/auth";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function ProfilePage() {
  const user = await getUser();

  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-surface rounded-xl border border-surface/50 p-6">
        <h1 className="text-2xl font-bold text-text">My Profile</h1>
        <p className="text-text/60 mt-1">Manage your profile information and preferences</p>
      </div>

      {/* Profile Information */}
      <div className="bg-surface rounded-xl border border-surface/50 p-6">
        <h2 className="text-lg font-semibold text-text mb-4">Profile Information</h2>

        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-text/70">Full Name</label>
              <p className="mt-1 text-text">{profile?.full_name || "Not set"}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-text/70">Email</label>
              <p className="mt-1 text-text">{user.email}</p>
            </div>

            <div>
              <label className="text-sm font-medium text-text/70">College</label>
              <p className="mt-1 text-text">{profile?.college || "Not set"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-surface rounded-xl border border-surface/50 p-6">
        <h2 className="text-lg font-semibold text-text mb-4">Account Status</h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm text-green-600 dark:text-green-400">Active Student</span>
          </div>

          <div className="text-sm text-text/60">
            Member since {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
          </div>
        </div>
      </div>
    </div>
  );
}