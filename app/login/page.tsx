'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock
} from 'lucide-react'


export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isGoogleLoading, setIsGoogleLoading] = useState(false)
  const [isKakaoLoading, setIsKakaoLoading] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const redirectTo = searchParams.get('redirect') || '/'
  
  // 전체 로딩 상태 (어떤 버튼이든 로딩 중이면 true)
  const isLoading = isGoogleLoading || isKakaoLoading || isEmailLoading

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      router.push(redirectTo)
    }
  }, [user, redirectTo, router])

  const handleGoogleLogin = async () => {
    setIsGoogleLoading(true)
    try {
      const supabase = getBrowserClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        }
      })
      
      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Google login error:', error)
        }
        alert('Google 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.')
        setIsGoogleLoading(false)
      }
      // 성공 시 리디렉션되므로 setIsGoogleLoading(false)는 호출하지 않음
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Google login error:', error)
      }
      alert('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setIsGoogleLoading(false)
    }
  }

  const handleKakaoLogin = async () => {
    setIsKakaoLoading(true)
    try {
      const supabase = getBrowserClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        }
      })
      
      if (error) {
        if (process.env.NODE_ENV === 'development') {
          console.error('Kakao login error:', error)
        }
        alert('카카오 로그인에 실패했습니다. 잠시 후 다시 시도해주세요.')
        setIsKakaoLoading(false)
      }
      // 성공 시 리디렉션되므로 setIsKakaoLoading(false)는 호출하지 않음
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Kakao login error:', error)
      }
      alert('로그인 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
      setIsKakaoLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsEmailLoading(true)
    
    // 입력값 검증
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.')
      setIsEmailLoading(false)
      return
    }

    try {
      const supabase = getBrowserClient()
      
      // Supabase 클라이언트 확인
      if (!supabase) {
        alert('인증 서비스에 연결할 수 없습니다. 환경 변수를 확인해주세요.')
        console.error('Supabase client is not available')
        setIsEmailLoading(false)
        return
      }

      // 환경 변수 확인
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      console.log('[Login] Supabase config check:', {
        url: supabaseUrl ? `${supabaseUrl.substring(0, 20)}...` : 'missing',
        key: supabaseKey ? 'set' : 'missing',
        urlValid: supabaseUrl?.match(/^https:\/\/[a-z0-9-]+\.supabase\.co$/) ? 'valid' : 'invalid'
      })
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
        alert('Supabase 환경 변수가 설정되지 않았습니다.\n\n.env.local 파일에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.\n\n자세한 내용은 docs/SUPABASE_EMAIL_PASSWORD_SETUP.md를 참고하세요.')
        console.error('Supabase environment variables not set:', {
          url: supabaseUrl ? 'set' : 'missing',
          key: supabaseKey ? 'set' : 'missing'
        })
        setIsEmailLoading(false)
        return
      }

      // URL 형식 검증
      if (!supabaseUrl.match(/^https:\/\/[a-z0-9-]+\.supabase\.co$/)) {
        alert(`Supabase URL 형식이 올바르지 않습니다.\n\n현재 URL: ${supabaseUrl}\n\n올바른 형식: https://[project-id].supabase.co\n\nSupabase 대시보드 → Settings → API에서 올바른 URL을 확인해주세요.`)
        console.error('Invalid Supabase URL format:', supabaseUrl)
        setIsEmailLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password,
      })
      
      if (error) {
        console.error('Login error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        })
        
        // 에러 타입에 따른 메시지
        let errorMessage = '로그인에 실패했습니다.'
        if (error.message.includes('Invalid login credentials')) {
          errorMessage = '이메일 또는 비밀번호가 올바르지 않습니다.'
        } else if (error.message.includes('Email not confirmed')) {
          errorMessage = '이메일 인증이 필요합니다. 이메일을 확인해주세요.'
        } else if (error.message.includes('User not found')) {
          errorMessage = '등록되지 않은 이메일입니다. 회원가입을 먼저 진행해주세요.'
        }
        
        alert(errorMessage)
        setIsEmailLoading(false)
        return
      }

      if (data?.user) {
        console.log('Login successful:', data.user.email)
        // 세션이 확실히 설정될 때까지 대기
        let sessionLoaded = false
        let attempts = 0
        const maxAttempts = 10
        
        while (!sessionLoaded && attempts < maxAttempts) {
          const { data: { session } } = await supabase.auth.getSession()
          if (session?.user) {
            sessionLoaded = true
            // 세션이 로드된 후 약간의 지연을 주어 useAuth가 업데이트될 시간 제공
            await new Promise(resolve => setTimeout(resolve, 500))
            // auth=success 파라미터를 추가하여 Header에서 세션 새로고침 트리거
            const redirectUrl = new URL(redirectTo, window.location.origin)
            redirectUrl.searchParams.set('auth', 'success')
            router.push(redirectUrl.toString())
            router.refresh() // 페이지 새로고침으로 상태 동기화
            break
          }
          await new Promise(resolve => setTimeout(resolve, 200))
          attempts++
        }
        
        if (!sessionLoaded) {
          // 세션 로드 실패 시에도 리다이렉트 (세션은 쿠키에 있을 수 있음)
          const redirectUrl = new URL(redirectTo, window.location.origin)
          redirectUrl.searchParams.set('auth', 'success')
          router.push(redirectUrl.toString())
          router.refresh()
        }
      } else {
        alert('로그인에 실패했습니다. 다시 시도해주세요.')
        setIsEmailLoading(false)
      }
    } catch (error) {
      console.error('Unexpected login error:', error)
      alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
      setIsEmailLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-orange-50">
      {/* Main Content */}
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div>
            <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
              로그인
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Safe Pet Food에 오신 것을 환영합니다
            </p>
          </div>
          
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button 
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image src="https://developers.google.com/identity/images/g-logo.png" alt="Google" width={20} height={20} className="mr-3" />
              {isGoogleLoading ? '로그인 중...' : 'Google로 로그인'}
            </button>
            
            <button 
              onClick={handleKakaoLogin}
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-yellow-400 text-sm font-medium text-black hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-3 text-lg">💬</span>
              {isKakaoLoading ? '로그인 중...' : '카카오로 로그인'}
            </button>
          </div>

          {/* Email/Password Login */}
          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gradient-to-br from-yellow-50 via-white to-orange-50 text-gray-500">또는</span>
              </div>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="email" className="sr-only">
                  이메일 주소
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                    placeholder="이메일 주소"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="password" className="sr-only">
                  비밀번호
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm pr-10"
                    placeholder="비밀번호"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isEmailLoading ? '로그인 중...' : '비밀번호로 로그인'}
                </button>
              </div>
            </form>
          </div>

          <div className="text-center mt-6">
            <span className="text-sm text-gray-600">
              아직 계정이 없으신가요?{' '}
              <Link href="/signup" className="font-medium text-yellow-600 hover:text-yellow-500">
                회원가입
              </Link>
            </span>
          </div>
        </div>
      </div>


    </div>
  )
} 