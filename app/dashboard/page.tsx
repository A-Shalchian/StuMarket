import { getUser } from '@/lib/supabase/auth'
import { createClient } from '@/lib/supabase/server'
import UserMenu from '@/components/auth/user-menu'
import { redirect } from 'next/navigation'

export default async function DashboardPage() {
  const user = await getUser()

  if (!user) {
    redirect('/')
  }

  // Get user profile from database
  const supabase = await createClient()
  const { data: userProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

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
        <div className="bg-surface rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-text">Welcome back, {userProfile?.full_name || user.email}!</h2>
            {userProfile?.is_verified && (
              <div className="flex items-center text-green-600 dark:text-green-400">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-medium">Verified Student</span>
              </div>
            )}
          </div>

          {userProfile?.college_name && (
            <div className="mb-6 p-3 bg-accent/10 rounded-lg border border-accent/20">
              <p className="text-sm text-text/70">
                <strong className="text-accent">{userProfile.college_name}</strong>
                {userProfile.major && ` • ${userProfile.major}`}
                {userProfile.graduation_year && ` • Class of ${userProfile.graduation_year}`}
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
            <div className="bg-accent/10 p-6 rounded-lg border border-accent/20">
              <h3 className="font-semibold text-accent mb-2">Browse Listings</h3>
              <p className="text-text/70 text-sm">
                Explore items for sale from other students
              </p>
            </div>

            <div className="bg-green-500/10 p-6 rounded-lg border border-green-500/20">
              <h3 className="font-semibold text-green-600 dark:text-green-400 mb-2">Sell Items</h3>
              <p className="text-text/70 text-sm">
                List your items for other students to buy
              </p>
            </div>

            <div className="bg-purple-500/10 p-6 rounded-lg border border-purple-500/20">
              <h3 className="font-semibold text-purple-600 dark:text-purple-400 mb-2">Messages</h3>
              <p className="text-text/70 text-sm">
                Chat with buyers and sellers
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}