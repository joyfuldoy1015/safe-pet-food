'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase-client'

/**
 * Signup page with OAuth and email/password
 * 
 * 📝 Flow:
 * 1. User can sign up with Google/Kakao OAuth
 * 2. Or sign up with email/password
 * 3. After signup, redirect to pet profile creation
 */
export default function SignupPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [agreeTerms, setAgreeTerms] = useState(false)
  const router = useRouter()
  const supabase = getBrowserClient()

  const handleGoogleSignup = async () => {
    if (!supabase) {
      setError('Supabase client not initialized')
      return
    }
    
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/pet-log/pets/new`
      }
    })
    
    if (error) {
      console.error('[Signup] Google OAuth error:', error)
      setError(`회원가입 실패: ${error.message}`)
      setLoading(false)
    }
  }

  const handleKakaoSignup = async () => {
    if (!supabase) {
      setError('Supabase client not initialized')
      return
    }
    
    setLoading(true)
    setError(null)
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'kakao',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/pet-log/pets/new`
      }
    })
    
    if (error) {
      console.error('[Signup] Kakao OAuth error:', error)
      setError(`회원가입 실패: ${error.message}`)
      setLoading(false)
    }
  }

  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!supabase) {
      setError('Supabase client not initialized')
      return
    }

    // Validation
    if (!email || !password || !nickname) {
      setError('모든 필드를 입력해주세요.')
      return
    }

    if (password.length < 6) {
      setError('비밀번호는 최소 6자 이상이어야 합니다.')
      return
    }

    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    if (!agreeTerms) {
      setError('이용약관에 동의해주세요.')
      return
    }
    
    setLoading(true)
    setError(null)
    
    console.log('[Signup] Starting email/password signup...')
    
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: email.trim(),
      password: password,
      options: {
        data: {
          nickname: nickname.trim()
        }
      }
    })
    
    if (signUpError) {
      console.error('[Signup] Email signup error:', signUpError)
      
      let errorMessage = '회원가입에 실패했습니다.'
      if (signUpError.message.includes('already registered')) {
        errorMessage = '이미 가입된 이메일입니다.'
      }
      
      setError(errorMessage)
      setLoading(false)
    } else if (data.user) {
      console.log('[Signup] Email signup successful, creating profile...')
      
      // Create profile
      try {
        await (supabase.from('profiles') as any).insert({
          id: data.user.id,
          nickname: nickname.trim()
        })
        
        console.log('[Signup] Profile created, redirecting...')
        router.push('/pet-log/pets/new')
      } catch (profileError) {
        console.error('[Signup] Profile creation error:', profileError)
        // Non-critical, user is already signed up
        router.push('/pet-log/pets/new')
      }
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
        <div>
          <h2 className="text-3xl font-bold text-center">회원가입</h2>
          <p className="mt-2 text-center text-gray-600">
            Safe Pet Food와 함께 시작하세요
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Social Signup Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="text-gray-600">처리 중...</span>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="text-gray-700 font-medium">Google로 회원가입</span>
                </>
              )}
            </button>

            <button
              onClick={handleKakaoSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 px-6 py-3 bg-yellow-400 border-2 border-yellow-500 rounded-lg hover:bg-yellow-500 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="text-gray-800">처리 중...</span>
              ) : (
                <>
                  <span className="text-2xl">💬</span>
                  <span className="text-gray-800 font-medium">카카오로 회원가입</span>
                </>
              )}
            </button>
          </div>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">또는</span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSignup} className="space-y-4">
            <div>
              <label htmlFor="nickname" className="block text-sm font-medium text-gray-700 mb-1">
                닉네임
              </label>
              <input
                id="nickname"
                name="nickname"
                type="text"
                required
                value={nickname}
                onChange={(e) => setNickname(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="닉네임"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="이메일 주소"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                  placeholder="비밀번호 (최소 6자)"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  disabled={loading}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                placeholder="비밀번호 확인"
              />
            </div>

            <div className="flex items-start">
              <input
                id="agreeTerms"
                name="agreeTerms"
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-1 h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
              />
              <label htmlFor="agreeTerms" className="ml-2 block text-sm text-gray-700">
                이용약관 및 개인정보처리방침에 동의합니다. (필수)
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-yellow-600 text-white font-medium rounded-lg hover:bg-yellow-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '처리 중...' : '회원가입'}
            </button>
          </form>

          {/* Login Link */}
          <div className="text-center">
            <span className="text-sm text-gray-600">
              이미 계정이 있으신가요?{' '}
              <a href="/login" className="font-medium text-yellow-600 hover:text-yellow-700">
                로그인
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
