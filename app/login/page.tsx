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
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const redirectTo = searchParams.get('redirect') || '/'

  // If already logged in, redirect
  useEffect(() => {
    if (user) {
      router.push(redirectTo)
    }
  }, [user, redirectTo, router])

  const handleGoogleLogin = async () => {
    setIsLoading(true)
    try {
      const supabase = getBrowserClient()
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectTo)}`
        }
      })
      
      if (error) {
        console.error('Google login error:', error)
        alert('Google 로그인에 실패했습니다.')
        setIsLoading(false)
      }
      // 성공 시 리디렉션되므로 setIsLoading(false)는 호출하지 않음
    } catch (error) {
      console.error('Google login error:', error)
      alert('로그인 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // 입력값 검증
    if (!email || !password) {
      alert('이메일과 비밀번호를 입력해주세요.')
      setIsLoading(false)
      return
    }

    try {
      const supabase = getBrowserClient()
      
      // Supabase 클라이언트 확인
      if (!supabase) {
        alert('인증 서비스에 연결할 수 없습니다. 환경 변수를 확인해주세요.')
        console.error('Supabase client is not available')
        setIsLoading(false)
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
        setIsLoading(false)
        return
      }

      if (data?.user) {
        console.log('Login successful:', data.user.email)
        // 로그인 성공 - 세션이 로드될 때까지 기다린 후 리다이렉트
        // useAuth 훅이 세션을 로드하는 시간을 주기 위해 약간의 지연
        await new Promise(resolve => setTimeout(resolve, 800))
        router.push(redirectTo)
      } else {
        alert('로그인에 실패했습니다. 다시 시도해주세요.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Unexpected login error:', error)
      alert('로그인 중 오류가 발생했습니다. 다시 시도해주세요.')
      setIsLoading(false)
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
              {isLoading ? '로그인 중...' : 'Google로 로그인'}
            </button>
            
            <button className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-yellow-400 text-sm font-medium text-black hover:bg-yellow-500 transition-colors">
              <span className="mr-3 text-lg">💬</span>
              카카오로 로그인
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
                  {isLoading ? '로그인 중...' : '비밀번호로 로그인'}
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