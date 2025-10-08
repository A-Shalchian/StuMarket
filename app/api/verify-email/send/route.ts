import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Validate George Brown email
    if (!email.endsWith('@georgebrown.ca')) {
      return NextResponse.json({ error: 'Please use your George Brown College email' }, { status: 400 })
    }

    const supabase = await createClient()

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return NextResponse.json({ error: 'User not authenticated' }, { status: 401 })
    }

    // Check if this college email is already used by another user
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('college_email', email)
      .neq('id', user.id)
      .single()

    if (existingProfile) {
      return NextResponse.json({ error: 'This college email is already in use' }, { status: 400 })
    }

    // Generate a secure verification token
    const verificationToken = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now

    // Store the verification token in the profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        college_email: email,
        college_domain: 'georgebrown.ca',
        verification_code: verificationToken,
        verification_code_expires_at: expiresAt.toISOString(),
        last_verification_attempt: new Date().toISOString(),
      })
      .eq('id', user.id)

    if (updateError) {
      console.error('Error storing verification token:', updateError)
      return NextResponse.json({ error: 'Failed to store verification token' }, { status: 500 })
    }

    // Create verification link
    const verificationUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/verify-email/callback?token=${verificationToken}&user_id=${user.id}`

    // Use Resend to send email (free tier: 100 emails/day, 3000/month)
    // Install: npm install resend
    // Add to .env.local: RESEND_API_KEY=your_key

    const RESEND_API_KEY = process.env.RESEND_API_KEY

    if (RESEND_API_KEY) {
      try {
        // Send email using Resend
        const emailResponse = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${RESEND_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'StuMarket <onboarding@resend.dev>', // Use your verified domain in production
            to: email,
            subject: 'Verify Your Student Email - StuMarket',
            html: `
              <!DOCTYPE html>
              <html>
                <head>
                  <style>
                    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                    .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                    .button {
                      display: inline-block;
                      padding: 12px 24px;
                      background-color: #6366f1;
                      color: white;
                      text-decoration: none;
                      border-radius: 8px;
                      font-weight: 600;
                    }
                    .footer { margin-top: 30px; font-size: 12px; color: #666; }
                  </style>
                </head>
                <body>
                  <div class="container">
                    <h2>Verify Your Student Email</h2>
                    <p>Hi there!</p>
                    <p>Click the button below to verify your George Brown College email and get full access to StuMarket:</p>
                    <p style="margin: 30px 0;">
                      <a href="${verificationUrl}" class="button">Verify My Email</a>
                    </p>
                    <p>Or copy and paste this link in your browser:</p>
                    <p style="word-break: break-all; color: #6366f1;">${verificationUrl}</p>
                    <p class="footer">
                      This link will expire in 1 hour.<br>
                      If you didn't request this verification, please ignore this email.
                    </p>
                  </div>
                </body>
              </html>
            `,
          }),
        })

        if (!emailResponse.ok) {
          const errorData = await emailResponse.json()
          console.error('Resend error:', errorData)
          throw new Error('Failed to send email via Resend')
        }

        console.log(`✅ Email sent to: ${email}`)

        return NextResponse.json({
          success: true,
          message: 'Verification email sent! Please check your inbox.',
        })
      } catch (emailError) {
        console.error('Error sending email:', emailError)
        // Fall back to development mode
      }
    }

    // Development mode - no email service configured
    console.log(`📧 No email service configured. Verification link:`)
    console.log(`👤 User ID: ${user.id}`)
    console.log(`🔗 Verification URL: ${verificationUrl}`)
    console.log(`\n✉️  DEVELOPMENT MODE - Click this link to verify:\n${verificationUrl}\n`)

    return NextResponse.json({
      success: true,
      message: 'Verification link generated! Click the link below to verify.',
      verificationUrl: verificationUrl, // Send in dev mode
    })

  } catch (error) {
    console.error('Error in send verification:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}