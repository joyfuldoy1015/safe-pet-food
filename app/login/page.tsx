'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase-client'
import { useAuth } from '@/hooks/useAuth'

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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
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

  const handleKakaoLogin = async () => {
    if (!supabase) {
      setError('Supabase client not initialized')
      return
    }
    
    setLoading(true)
    setError(null)
    
    console.log('[Login] Starting Kakao OAuth...')
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })
    
    if (error) {
      console.error('[Login] Kakao OAuth error:', error)
      setError(`로그인 실패: ${error.message}`)
      setLoading(false)
    }
    // If no error, user will be redirected to Kakao
  }

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supabase) {
      setError('Supabase client not initialized')
      return
    }

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    console.log('[Login] Starting email/password login...')
    
    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password: password,
    })
    
    if (error) {
      console.error('[Login] Email login error:', error)
      
      // User-friendly error messages
      let errorMessage = '로그인에 실패했습니다.'
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.'
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = '이메일 인증이 필요합니다. 이메일을 확인해주세요.'
      }
      
      setError(errorMessage)
      setLoading(false)
    } else {
      console.log('[Login] Email login successful')
      // Auth state will be updated by useAuth hook
      // Page will redirect automatically via useEffect
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">로그인</h1>
          <p className="text-sm text-gray-500">
            Safe Pet Food에 오신 것을 환영합니다
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          {error && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-3 mb-5">
              <p className="text-red-600 text-xs">{error}</p>
            </div>
          )}

          <div className="space-y-5">
            {/* Social Login Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="text-gray-500">로그인 중...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    <span className="text-gray-700 font-medium">Google로 로그인</span>
                  </>
                )}
              </button>

              <button
                onClick={handleKakaoLogin}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-[#FEE500] rounded-xl hover:bg-[#FDD800] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="text-gray-800">로그인 중...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#000000">
                      <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.47 1.607 4.647 4.058 5.897l-.79 2.908c-.092.34.288.617.585.426l3.47-2.233c.86.128 1.751.197 2.677.197 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
                    </svg>
                    <span className="text-gray-900 font-medium">카카오로 로그인</span>
                  </>
                )}
              </button>
            </div>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-3 bg-white text-gray-400">또는</span>
              </div>
            </div>

            {/* Email/Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-3">
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-gray-600 mb-1.5">
                  이메일
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="이메일 주소"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-600 mb-1.5">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                    placeholder="비밀번호"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    disabled={loading}
                  >
                    {showPassword ? (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-violet-500 text-white text-sm font-medium rounded-xl hover:bg-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '로그인 중...' : '로그인'}
              </button>
            </form>

            {/* Sign Up Link */}
            <div className="text-center pt-2">
              <span className="text-xs text-gray-500">
                아직 계정이 없으신가요?{' '}
                <a href="/signup" className="font-medium text-violet-600 hover:text-violet-700">
                  회원가입
                </a>
              </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-[10px] text-gray-400 mt-4">
          로그인하시면 이용약관 및 개인정보처리방침에 동의하게 됩니다.
        </div>
      </div>
    </div>
  )
}
