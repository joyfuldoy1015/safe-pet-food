import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import type { Database } from '@/lib/types/database'

/**
 * Auth callback route for Supabase OAuth (PKCE Flow)
 * Handles OAuth redirects with ?code= parameter
 * 
 * ⚠️ IMPORTANT: This route ONLY works with PKCE flow (?code=)
 * Implicit flow (#access_token) will NOT work here!
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  console.log('[Auth Callback] Request received:', {
    code: code ? `${code.substring(0, 10)}...` : 'none',
    next,
    url: requestUrl.href,
    hasHashFragment: requestUrl.hash ? 'YES (WRONG!)' : 'no'
  })

  if (code) {
    const cookieStore = cookies()
    
    // Create Supabase client with @supabase/ssr for proper cookie handling
    const supabase = createServerClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookieStore.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value, ...options })
            } catch (error) {
              // Handle cookies.set() error in Server Components
              console.warn('[Auth Callback] Cookie set failed:', error)
            }
          },
          remove(name: string, options: CookieOptions) {
            try {
              cookieStore.set({ name, value: '', ...options })
            } catch (error) {
              console.warn('[Auth Callback] Cookie remove failed:', error)
            }
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

    // 세션이 성공적으로 설정되었는지 다시 확인
    const { data: { session } } = await supabase.auth.getSession()
    
    if (!session) {
      console.error('[Auth Callback] Session not found after code exchange!')
      return NextResponse.redirect(
        new URL('/login?error=session_creation_failed', requestUrl.origin)
      )
    }

    console.log('[Auth Callback] Session verified:', {
      userId: session.user?.id,
      expiresAt: session.expires_at
    })

    // Profile이 없으면 생성
    try {
      const { data: existingProfile, error: profileError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', session.user.id)
        .single()

      if (profileError && profileError.code === 'PGRST116') {
        // Profile이 없으면 생성
        console.log('[Auth Callback] Creating profile for user:', session.user.email)
        
        const nickname = session.user.user_metadata?.full_name 
          || session.user.user_metadata?.name 
          || session.user.email?.split('@')[0] 
          || '사용자'

        const { error: createError } = await (supabase
          .from('profiles') as any)
          .insert({
            id: session.user.id,
            nickname
          })

        if (createError) {
          console.error('[Auth Callback] Error creating profile:', createError)
        } else {
          console.log('[Auth Callback] Profile created successfully')
        }
      } else if (!profileError) {
        console.log('[Auth Callback] Profile already exists')
      }
    } catch (profileError) {
      console.error('[Auth Callback] Profile check/create error:', profileError)
    }
  } else {
    console.warn('[Auth Callback] No code parameter provided')
  }

  // 리다이렉트 URL (auth 파라미터 없이 깔끔하게)
  const redirectUrl = new URL(next, requestUrl.origin)
  
  console.log('[Auth Callback] Redirecting to:', redirectUrl.href)
  
  const response = NextResponse.redirect(redirectUrl)
  
  // 세션 쿠키가 제대로 설정되도록 헤더 추가
  response.headers.set('Cache-Control', 'no-store, must-revalidate')
  response.headers.set('Pragma', 'no-cache')
  
  return response
}

