'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  User
} from 'lucide-react'
import { getBrowserClient } from '@/lib/supabase-client'




export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })
  const [agreeTerms, setAgreeTerms] = useState(false)
  const [agreePrivacy, setAgreePrivacy] = useState(false)
  const [passwordValid, setPasswordValid] = useState(false)
  const [passwordsMatch, setPasswordsMatch] = useState(true)

  
  // 임시로 관리자 계정 여부를 설정 (실제로는 로그인 상태에서 가져와야 함)
  const isAdmin = true // 실제 구현 시 로그인 상태에서 관리자 권한 확인

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    try {
      const supabase = getBrowserClient()
      const petProfileRedirect = '/pet-log/pets/new'
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(petProfileRedirect)}`
        }
      })
      
      if (error) {
        console.error('Google signup error:', error)
        alert('Google 회원가입에 실패했습니다.')
        setIsLoading(false)
      }
      // 성공 시 리디렉션되므로 setIsLoading(false)는 호출하지 않음
    } catch (error) {
      console.error('Google signup error:', error)
      alert('회원가입 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  const handleKakaoSignup = async () => {
    setIsLoading(true)
    try {
      const supabase = getBrowserClient()
      const petProfileRedirect = '/pet-log/pets/new'
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'kakao',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(petProfileRedirect)}`
        }
      })
      
      if (error) {
        console.error('Kakao signup error:', error)
        alert('카카오 회원가입에 실패했습니다.')
        setIsLoading(false)
      }
      // 성공 시 리디렉션되므로 setIsLoading(false)는 호출하지 않음
    } catch (error) {
      console.error('Kakao signup error:', error)
      alert('회원가입 중 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // 비밀번호 유효성 검사
    if (name === 'password') {
      setPasswordValid(value.length >= 8)
      if (formData.confirmPassword) {
        setPasswordsMatch(value === formData.confirmPassword)
      }
    }

    // 비밀번호 확인 검사
    if (name === 'confirmPassword') {
      setPasswordsMatch(value === formData.password)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!agreeTerms || !agreePrivacy) {
      alert('약관에 동의해주세요.')
      return
    }
    if (!passwordValid) {
      alert('비밀번호는 8자 이상이어야 합니다.')
      return
    }
    if (!passwordsMatch) {
      alert('비밀번호가 일치하지 않습니다.')
      return
    }

    setIsLoading(true)

    try {
      const supabase = getBrowserClient()
      
      // Supabase 클라이언트 확인
      if (!supabase) {
        alert('인증 서비스에 연결할 수 없습니다. 환경 변수를 확인해주세요.')
        console.error('Supabase client is not available')
        setIsLoading(false)
        return
      }

      // 환경 변수 확인
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      
      if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder')) {
        alert('Supabase 환경 변수가 설정되지 않았습니다.\n\n.env.local 파일에 NEXT_PUBLIC_SUPABASE_URL과 NEXT_PUBLIC_SUPABASE_ANON_KEY를 설정해주세요.')
        console.error('Supabase environment variables not set')
        setIsLoading(false)
        return
      }

      // 회원가입
      const { data, error } = await supabase.auth.signUp({
        email: formData.email.trim(),
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            nickname: formData.name
          }
        }
      })

      if (error) {
        console.error('Signup error details:', {
          message: error.message,
          status: error.status,
          name: error.name
        })
        
        // 에러 타입에 따른 메시지
        let errorMessage = '회원가입에 실패했습니다.'
        if (error.message.includes('User already registered')) {
          errorMessage = '이미 등록된 이메일입니다. 로그인을 시도해주세요.'
        } else if (error.message.includes('Password')) {
          errorMessage = '비밀번호가 너무 짧습니다. 8자 이상 입력해주세요.'
        } else if (error.message.includes('Invalid email')) {
          errorMessage = '올바른 이메일 주소를 입력해주세요.'
        }
        
        alert(errorMessage)
        setIsLoading(false)
        return
      }

      if (data?.user) {
        console.log('Signup successful:', data.user.email)
        // 회원가입 성공 - 반려동물 프로필 입력 페이지로 리다이렉트
        // 세션이 로드될 때까지 기다린 후 리다이렉트
        await new Promise(resolve => setTimeout(resolve, 500))
        router.push('/pet-log/pets/new')
      } else {
        alert('회원가입에 실패했습니다. 다시 시도해주세요.')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Unexpected signup error:', error)
      alert('회원가입 중 오류가 발생했습니다. 다시 시도해주세요.')
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
              회원가입
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              Safe Pet Food와 함께 시작하세요
            </p>
          </div>
          
          {/* Social Signup Buttons */}
          <div className="space-y-3">
            <button 
              onClick={handleGoogleSignup}
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image src="https://developers.google.com/identity/images/g-logo.png" alt="Google" width={20} height={20} className="mr-3" />
              {isLoading ? '처리 중...' : 'Google로 회원가입'}
            </button>
            
            <button 
              onClick={handleKakaoSignup}
              disabled={isLoading}
              className="w-full flex justify-center items-center px-4 py-3 border border-gray-300 rounded-xl shadow-sm bg-yellow-400 text-sm font-medium text-black hover:bg-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="mr-3 text-lg">💬</span>
              {isLoading ? '처리 중...' : '카카오로 회원가입'}
            </button>
          </div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gradient-to-br from-yellow-50 via-white to-orange-50 text-gray-500">또는</span>
            </div>
          </div>

          <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="sr-only">
                  이름
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm"
                    placeholder="이름"
                    value={formData.name}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
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
                    value={formData.email}
                    onChange={handleInputChange}
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
                    autoComplete="new-password"
                    required
                    className="appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm pr-10"
                    placeholder="비밀번호 (8자 이상)"
                    value={formData.password}
                    onChange={handleInputChange}
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
                {formData.password && (
                  <div className="mt-2">
                    <div className={`text-sm ${passwordValid ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordValid ? '✓ 비밀번호가 유효합니다' : '✗ 비밀번호는 8자 이상이어야 합니다'}
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label htmlFor="confirmPassword" className="sr-only">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    required
                    className="appearance-none relative block w-full px-10 py-3 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-xl focus:outline-none focus:ring-yellow-500 focus:border-yellow-500 focus:z-10 sm:text-sm pr-10"
                    placeholder="비밀번호 확인"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                {formData.confirmPassword && (
                  <div className="mt-2">
                    <div className={`text-sm ${passwordsMatch ? 'text-green-600' : 'text-red-600'}`}>
                      {passwordsMatch ? '✓ 비밀번호가 일치합니다' : '✗ 비밀번호가 일치하지 않습니다'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center">
                <input
                  id="agree-terms"
                  name="agree-terms"
                  type="checkbox"
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                />
                <label htmlFor="agree-terms" className="ml-2 block text-sm text-gray-900">
                  <a href="#" className="text-yellow-600 hover:text-yellow-500">이용약관</a>에 동의합니다 (필수)
                </label>
              </div>
              
              <div className="flex items-center">
                <input
                  id="agree-privacy"
                  name="agree-privacy"
                  type="checkbox"
                  className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded"
                  checked={agreePrivacy}
                  onChange={(e) => setAgreePrivacy(e.target.checked)}
                />
                <label htmlFor="agree-privacy" className="ml-2 block text-sm text-gray-900">
                  <a href="#" className="text-yellow-600 hover:text-yellow-500">개인정보처리방침</a>에 동의합니다 (필수)
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isLoading}
                className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-yellow-600 hover:bg-yellow-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? '처리 중...' : '회원가입'}
              </button>
            </div>

            <div className="text-center">
              <span className="text-sm text-gray-600">
                이미 계정이 있으신가요?{' '}
                <Link href="/login" className="font-medium text-yellow-600 hover:text-yellow-500">
                  로그인
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>


    </div>
  )
} 