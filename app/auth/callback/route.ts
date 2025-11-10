import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(`${origin}/login?error=auth_failed`)
    }

    if (data.user) {
      // Update the profile to set is_verified to true
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          is_verified: true,
          verified_at: new Date().toISOString(),
          account_type: 'verified_student'
        })
        .eq('id', data.user.id)

      if (profileError) {
        console.error('Profile update error:', profileError)
      }

      // Redirect to dashboard with verification success
      return NextResponse.redirect(`${origin}/dashboard?verified=true`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=no_code`)
}