'use client'

import { useAuth } from '@/components/providers/auth-provider'
import { signOut } from '@/lib/supabase/auth-client'
import { useState } from 'react'
import Image from 'next/image'

export default function UserMenu() {
  const { user } = useAuth()
  const [isOpen, setIsOpen] = useState(false)

  if (!user) return null

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-surface transition-colors"
      >
        <Image
          src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${user.email}`}
          alt="Avatar"
          width={32}
          height={32}
          className="rounded-full"
        />
        <span className="text-sm font-medium text-text">{user.email}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-surface rounded-lg shadow-lg border border-surface/50 py-1 z-10">
          <button
            onClick={() => signOut()}
            className="w-full px-4 py-2 text-left text-sm text-text hover:bg-background transition-colors"
          >
            Sign out
          </button>
        </div>
      )}
    </div>
  )
}