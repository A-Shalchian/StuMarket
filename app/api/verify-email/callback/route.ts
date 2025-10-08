import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')
    const userId = searchParams.get('user_id')

    if (!token || !userId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?error=invalid_link`)
    }

    const supabase = await createClient()

    // Get the user's profile with the verification token
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('verification_code, verification_code_expires_at, college_email')
      .eq('id', userId)
      .single()

    if (profileError || !profile) {
      console.error('Error fetching profile:', profileError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?error=profile_not_found`)
    }

    // Verify the token matches
    if (profile.verification_code !== token) {
      console.error('Token mismatch')
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?error=invalid_token`)
    }

    // Check if token has expired
    const now = new Date()
    const expiresAt = new Date(profile.verification_code_expires_at)
    if (now > expiresAt) {
      console.error('Token expired')
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?error=token_expired`)
    }

    // Update the profile to verified
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        is_verified: true,
        verified_at: new Date().toISOString(),
        account_type: 'verified_student',
        next_verification_due: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(), // 1 year from now
        verification_code: null,
        verification_code_expires_at: null,
        verification_attempts: 0
      })
      .eq('id', userId)

    if (updateError) {
      console.error('Error updating profile:', updateError)
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?error=profile_update_failed`)
    }

    console.log(`✅ College email verified for user ${userId}: ${profile.college_email}`)

    // Redirect to dashboard with success
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?verified=true`)

  } catch (error) {
    console.error('Error in email verification callback:', error)
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/dashboard?error=server_error`)
  }
}