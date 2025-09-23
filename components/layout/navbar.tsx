'use client'

import Link from 'next/link'
import { useAuth } from '@/components/providers/auth-provider'
import UserMenu from '@/components/layout/user-menu'
import ThemeToggle from '@/components/layout/theme-toggle'

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

          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium text-text/70 hover:text-text transition-colors">Marketplace</Link>
            <Link href="/events" className="text-sm font-medium text-text/70 hover:text-text transition-colors">Parties/Events</Link>
            <Link href="/chat" className="text-sm font-medium text-text/70 hover:text-text transition-colors">Chat</Link>
          </div>

          <div className="flex items-center space-x-2">
            <ThemeToggle />
            <Link
              href="/settings"
              aria-label="Settings"
              className="p-2 rounded-lg hover:bg-surface/50 text-text/80 hover:text-text transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                <path d="M12 9.5A2.5 2.5 0 1 0 12 14.5 2.5 2.5 0 0 0 12 9.5Zm9.44 2.06a1 1 0 0 1 0 .88l-1.27 2.2a1 1 0 0 1-.76.5l-1.7.2a7.12 7.12 0 0 1-.7 1.2l.51 1.63a1 1 0 0 1-.24.98l-1.8 1.8a1 1 0 0 1-.98.24l-1.63-.51a7.12 7.12 0 0 1-1.2.7l-.2 1.7a1 1 0 0 1-.5.76l-2.2 1.27a1 1 0 0 1-.88 0l-2.2-1.27a1 1 0 0 1-.5-.76l-.2-1.7a7.12 7.12 0 0 1-1.2-.7l-1.63.51a1 1 0 0 1-.98-.24l-1.8-1.8a1 1 0 0 1-.24-.98l.51-1.63a7.12 7.12 0 0 1-.7-1.2l-1.7-.2a1 1 0 0 1-.76-.5L2.56 12.44a1 1 0 0 1 0-.88l1.27-2.2a1 1 0 0 1 .76-.5l1.7-.2c.2-.43.44-.83.7-1.2l-.51-1.63a1 1 0 0 1 .24-.98l1.8-1.8a1 1 0 0 1 .98-.24l1.63.51c.38-.26.78-.5 1.2-.7l.2-1.7a1 1 0 0 1 .5-.76l2.2-1.27a1 1 0 0 1 .88 0l2.2 1.27a1 1 0 0 1 .5.76l.2 1.7c.43.2.83.44 1.2.7l1.63-.51a1 1 0 0 1 .98.24l1.8 1.8c.26.26.35.65.24.98l-.51 1.63c.26.38.5.78.7 1.2l1.7.2c.32.04.6.24.76.5ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z" />
              </svg>
            </Link>

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
                    <UserMenu />
                  </>
                ) : (
                  <>
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