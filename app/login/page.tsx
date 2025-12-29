'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase-client.new'
import { useAuth } from '@/hooks/useAuth.new'

/**
 * Minimal login page
 * 
 * ⚠️ RULES:
 * 1. Start with Google OAuth only
 * 2. No complex session checking
 * 3. Simple redirect handling
 * 4. No custom retry logic
 * 
 * 📝 Flow:
 * 1. User clicks "Google 로그인"
 * 2. Redirects to Google OAuth
 * 3. Google redirects to /auth/callback?code=xxx
 * 4. Callback exchanges code for session (sets cookies)
 * 5. Redirects back to home
 * 6. Header shows logged-in state
 */
export default function LoginPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading: authLoading } = useAuth()
  const supabase = getBrowserClient()

  // Check for error from callback
  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      setError(decodeURIComponent(errorParam))
    }
  }, [searchParams])

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      console.log('[Login] User already logged in, redirecting to home')
      router.push('/')
    }
  }, [authLoading, user, router])

  const handleGoogleLogin = async () => {
    if (!supabase) {
      setError('Supabase client not initialized')
      return
    }
    
    setLoading(true)
    setError(null)
    
    console.log('[Login] Starting Google OAuth...')
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('[Login] Google OAuth error:', error)
      setError(`로그인 실패: ${error.message}`)
      setLoading(false)
    }
    // If no error, user will be redirected to Google
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">로그인</h2>
          <p className="mt-2 text-center text-gray-600">
            Safe Pet Food에 오신 것을 환영합니다
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-4">
          <button
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="text-gray-600">로그인 중...</span>
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="text-gray-700 font-medium">Google로 로그인</span>
              </>
            )}
          </button>

          <div className="text-center text-sm text-gray-500">
            로그인하시면 이용약관 및 개인정보처리방침에 동의하게 됩니다.
          </div>
        </div>
      </div>
    </div>
  )
}
