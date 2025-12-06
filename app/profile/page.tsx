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

  // Determine college name
  let collegeName = profile?.college_name;

  // If college_id exists, fetch college name
  if (!collegeName && profile?.college_id) {
    const { data: college } = await supabase
      .from("colleges")
      .select("name")
      .eq("id", profile.college_id)
      .single();

    if (college) {
      collegeName = college.name;
    }
  }

  // Fallback: derive from email domain
  if (!collegeName && user.email?.endsWith('@georgebrown.ca')) {
    collegeName = 'George Brown College';
  }

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
              <p className="mt-1 text-text">{collegeName || "Not set"}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Account Status */}
      <div className="bg-surface rounded-xl border border-surface/50 p-6">
        <h2 className="text-lg font-semibold text-text mb-4">Account Status</h2>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {profile?.is_verified ? (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600 dark:text-green-400">Active Student</span>
                <svg className="w-4 h-4 text-green-600 dark:text-green-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                <span className="text-sm text-yellow-600 dark:text-yellow-400">Pending Verification</span>
              </>
            )}
          </div>

          <div className="text-sm text-text/60">
            Member since {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
          </div>
        </div>

        {profile?.is_verified && profile?.verified_at && (
          <div className="mt-3 text-xs text-text/50">
            Verified on {new Date(profile.verified_at).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}