import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

/**
 * Minimal auth callback route for OAuth (PKCE flow)
 * 
 * ⚠️ RULES:
 * 1. Only @supabase/ssr
 * 2. Simple getAll/setAll pattern
 * 3. No complex profile creation (add later if needed)
 * 
 * 📝 Flow:
 * 1. OAuth provider redirects here with ?code=xxx
 * 2. Exchange code for session (PKCE verifier from cookies)
 * 3. Set session cookies on response
 * 4. Redirect to home
 * 5. Server Components (Header) can read session from cookies
 * 
 * 🔑 Critical:
 * - Must use getAll/setAll pattern for proper cookie handling
 * - Response must be created before supabase client
 * - Cookies are set on response object
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'
  
  console.log('[Auth Callback] Request received:', {
    code: code ? `${code.substring(0, 10)}...` : 'none',
    next,
    url: requestUrl.href
  })

  // Early return if no code
  if (!code) {
    console.error('[Auth Callback] No code parameter - PKCE flow required!')
    return NextResponse.redirect(
      new URL('/login?error=missing_code_use_pkce', requestUrl.origin)
    )
  }

  // Create response first (will be modified by supabase)
  const response = NextResponse.redirect(new URL(next, requestUrl.origin))

  // Create Supabase client with proper cookie handling
  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  console.log('[Auth Callback] Exchanging code for session...')
  
  // Exchange code for session
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[Auth Callback] Error exchanging code:', error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    )
  }

  console.log('[Auth Callback] Session created successfully:', {
    userId: data?.user?.id,
    email: data?.user?.email,
    hasSession: !!data?.session
  })

  // Set cache headers to prevent caching
  response.headers.set('Cache-Control', 'no-store, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  
  console.log('[Auth Callback] Redirecting to:', next)
  
  return response
}
