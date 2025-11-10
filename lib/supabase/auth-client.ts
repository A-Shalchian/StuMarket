'use client'

import { createClient } from './client'

export async function signOut() {
  const supabase = createClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    console.error('Error signing out:', error)
    return { error }
  }

  window.location.href = '/'
}