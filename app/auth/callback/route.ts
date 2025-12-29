import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

/**
 * Auth callback route for Supabase OAuth (PKCE Flow)
 * Handles OAuth redirects with ?code= parameter
 * 
 * ⚠️ CRITICAL: Uses @supabase/ssr with getAll/setAll pattern
 * This ensures PKCE code_verifier is read from cookies correctly!
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

  // Redirect early if no code
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
  
  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    console.error('[Auth Callback] Error exchanging code for session:', error)
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(error.message)}`, requestUrl.origin)
    )
  }

  console.log('[Auth Callback] Code exchange successful:', {
    userId: data?.user?.id,
    email: data?.user?.email,
    hasSession: !!data?.session
  })

  // Profile 생성 (선택적 - 에러 무시)
  if (data?.user) {
    try {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        console.log('[Auth Callback] Creating profile for user:', data.user.email)
        
        const nickname = data.user.user_metadata?.full_name 
          || data.user.user_metadata?.name 
          || data.user.email?.split('@')[0] 
          || '사용자'

        await (supabase.from('profiles') as any).insert({
          id: data.user.id,
          nickname
        })

        console.log('[Auth Callback] Profile created')
      }
    } catch (profileError) {
      // Profile 생성 실패는 무시 (세션은 이미 생성됨)
      console.warn('[Auth Callback] Profile creation failed (non-critical):', profileError)
    }
  }

  // Set cache headers to prevent caching
  response.headers.set('Cache-Control', 'no-store, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  
  console.log('[Auth Callback] Redirecting to:', next)
  
  return response
}

