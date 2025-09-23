'use client'

import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import UserMenu from '@/components/layout/user-menu'
import ThemeToggle from '@/components/layout/theme-toggle-debug'

export default function Navbar() {
  const { user, loading } = useAuth()

  return (
    <nav className="fixed top-0 w-full bg-background/80 backdrop-blur-md border-b border-surface/20 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold text-text">Stu</span>
            <span className="text-2xl font-bold text-accent">Market</span>
          </Link>

          <div className="flex items-center space-x-4">
            {!loading && (
              <>
                {user ? (
                  <>
                    <Link
                      href="/listings/new"
                      className="hidden sm:block px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
                    >
                      Sell Item
                    </Link>
                    <ThemeToggle />
                    <UserMenu />
                  </>
                ) : (
                  <>
                    <Link
                      href="#features"
                      className="hidden sm:block text-sm font-medium text-text/60 hover:text-text transition-colors"
                    >
                      How it works
                    </Link>
                    <Link
                      href="#about"
                      className="hidden sm:block text-sm font-medium text-text/60 hover:text-text transition-colors"
                    >
                      About
                    </Link>
                    <ThemeToggle />
                    <Link
                      href="/login"
                      className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent-hover rounded-lg transition-colors"
                    >
                      Login
                    </Link>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}