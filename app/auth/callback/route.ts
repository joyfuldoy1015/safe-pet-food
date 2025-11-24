import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import type { Database } from '@/lib/types/database'

/**
 * Auth callback route for Supabase
 * Handles OAuth and magic link redirects
 */
export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') || '/'

  if (code) {
    const cookieStore = cookies()
    const supabase = createRouteHandlerClient<Database>({ cookies: () => cookieStore })

    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('[Auth Callback] Error exchanging code for session:', error)
      return NextResponse.redirect(new URL(`/?error=${encodeURIComponent(error.message)}`, requestUrl))
    }

    // 세션이 성공적으로 설정되었는지 확인
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      console.warn('[Auth Callback] Session not found after code exchange')
    }
  }

  // 리다이렉트 URL에 세션 새로고침을 위한 플래그 추가
  const redirectUrl = new URL(next, requestUrl)
  redirectUrl.searchParams.set('auth', 'success')
  
  const response = NextResponse.redirect(redirectUrl)
  
  // 세션 쿠키가 제대로 설정되도록 헤더 추가
  response.headers.set('Cache-Control', 'no-store, must-revalidate')
  
  return response
}

