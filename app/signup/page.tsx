'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase-client'
import { Camera, User, X } from 'lucide-react'

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
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const router = useRouter()
  const supabase = getBrowserClient()

  // 이미지를 정사각형으로 크롭하는 함수
  const cropToSquare = (file: File): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        const size = Math.min(img.width, img.height)
        const outputSize = 400 // 출력 크기 (400x400)
        canvas.width = outputSize
        canvas.height = outputSize
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context not available'))
          return
        }
        // 중앙 기준으로 정사각형 크롭
        const sx = (img.width - size) / 2
        const sy = (img.height - size) / 2
        ctx.drawImage(img, sx, sy, size, size, 0, 0, outputSize, outputSize)
        canvas.toBlob((blob) => {
          if (blob) resolve(blob)
          else reject(new Error('Failed to create blob'))
        }, 'image/jpeg', 0.9)
      }
      img.onerror = reject
      img.src = URL.createObjectURL(file)
    })
  }

  // 프로필 이미지 선택 핸들러
  const handleAvatarSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 파일 크기 제한 (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('이미지 크기는 5MB 이하여야 합니다.')
      return
    }

    // 파일 타입 확인
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드 가능합니다.')
      return
    }

    try {
      // 이미지를 정사각형으로 크롭
      const croppedBlob = await cropToSquare(file)
      const croppedFile = new File([croppedBlob], `avatar-${Date.now()}.jpg`, { type: 'image/jpeg' })
      
      setAvatarFile(croppedFile)

      // 크롭된 이미지로 미리보기 생성
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(croppedFile)
    } catch (error) {
      console.error('Image crop error:', error)
      alert('이미지 처리 중 오류가 발생했습니다.')
    }
  }

  // 프로필 이미지 업로드 함수
  const uploadAvatar = async (userId: string): Promise<string | null> => {
    if (!avatarFile || !supabase) return null

    try {
      const fileName = `${userId}-${Date.now()}.jpg`
      const filePath = `avatars/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, avatarFile, {
          cacheControl: '3600',
          upsert: true
        })

      if (uploadError) {
        console.error('Avatar upload error:', uploadError)
        return null
      }

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error('Avatar upload error:', error)
      return null
    }
  }

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
        // 프로필 이미지 업로드
        let avatarUrl = null
        if (avatarFile) {
          avatarUrl = await uploadAvatar(data.user.id)
        }

        await (supabase.from('profiles') as any).insert({
          id: data.user.id,
          nickname: nickname.trim(),
          avatar_url: avatarUrl
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-8 px-4">
      <div className="max-w-sm w-full">
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">회원가입</h1>
          <p className="text-sm text-gray-500">
            Safe Pet Food와 함께 시작하세요
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
            {/* Social Signup Buttons */}
            <div className="space-y-2.5">
              <button
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="text-gray-500">처리 중...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-[#FEE500] rounded-xl hover:bg-[#FDD800] transition text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="text-gray-800">처리 중...</span>
                ) : (
                  <>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#000000">
                      <path d="M12 3C6.477 3 2 6.477 2 10.5c0 2.47 1.607 4.647 4.058 5.897l-.79 2.908c-.092.34.288.617.585.426l3.47-2.233c.86.128 1.751.197 2.677.197 5.523 0 10-3.477 10-7.5S17.523 3 12 3z"/>
                    </svg>
                    <span className="text-gray-900 font-medium">카카오로 회원가입</span>
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
            <form onSubmit={handleEmailSignup} className="space-y-3">
              {/* 프로필 이미지 업로드 */}
              <div className="flex flex-col items-center mb-2">
                <div className="relative">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="프로필 미리보기"
                      className="w-20 h-20 rounded-full object-cover border-2 border-gray-200"
                    />
                  ) : (
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border-2 border-gray-200">
                      <User className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarSelect}
                    disabled={loading}
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute bottom-0 right-0 w-7 h-7 bg-violet-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-violet-600 transition-colors cursor-pointer"
                  >
                    <Camera className="w-3.5 h-3.5" />
                  </label>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={() => {
                        setAvatarFile(null)
                        setAvatarPreview(null)
                      }}
                      className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <p className="text-xs text-gray-400 mt-2">프로필 사진 (선택)</p>
              </div>

              <div>
                <label htmlFor="nickname" className="block text-xs font-medium text-gray-600 mb-1.5">
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
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="닉네임"
                />
              </div>

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
                    autoComplete="new-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed pr-10"
                    placeholder="비밀번호 (최소 6자)"
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

              <div>
                <label htmlFor="confirmPassword" className="block text-xs font-medium text-gray-600 mb-1.5">
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
                  className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                  placeholder="비밀번호 확인"
                />
              </div>

              <div className="flex items-start pt-1">
                <input
                  id="agreeTerms"
                  name="agreeTerms"
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 text-violet-600 focus:ring-violet-500 border-gray-300 rounded"
                />
                <label htmlFor="agreeTerms" className="ml-2 block text-xs text-gray-600">
                  이용약관 및 개인정보처리방침에 동의합니다. (필수)
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2.5 bg-violet-500 text-white text-sm font-medium rounded-xl hover:bg-violet-600 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '처리 중...' : '회원가입'}
              </button>
            </form>

            {/* Login Link */}
            <div className="text-center pt-2">
              <span className="text-xs text-gray-500">
                이미 계정이 있으신가요?{' '}
                <a href="/login" className="font-medium text-violet-600 hover:text-violet-700">
                  로그인
                </a>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
