'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'
import { User, Mail, Calendar, Save, ArrowLeft, Camera } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const router = useRouter()
  const { user, profile, isLoading: authLoading, refreshProfile } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [nickname, setNickname] = useState('')
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // URL에서 auth=success 파라미터 확인 및 세션 새로고침
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('auth') === 'success') {
      // URL에서 파라미터 제거
      const newUrl = new URL(window.location.href)
      newUrl.searchParams.delete('auth')
      window.history.replaceState({}, '', newUrl.toString())
      
      // 세션 새로고침을 위해 페이지 새로고침 (약간의 지연을 주어 쿠키가 설정될 시간 제공)
      setTimeout(() => {
        window.location.reload()
      }, 300)
    }
  }, [])

  // 세션 확인을 위한 추가 체크
  useEffect(() => {
    let mounted = true
    let redirectTimer: NodeJS.Timeout | null = null

    const checkSession = async () => {
      // useAuth가 로딩 중이면 기다림
      if (authLoading) {
        setIsCheckingAuth(true)
        return
      }

      try {
        // useAuth에서 이미 사용자가 있으면 세션 확인 완료
        if (user) {
          setIsCheckingAuth(false)
          return
        }

        // useAuth에서 사용자가 없으면 직접 세션 확인 (최대 3번 재시도)
        let retryCount = 0
        const maxRetries = 3
        
        const attemptSessionCheck = async (): Promise<boolean> => {
          const supabase = getBrowserClient()
          const { data: { session }, error } = await supabase.auth.getSession()
          
          if (error) {
            console.error('Session check error:', error)
          }
          
          if (session?.user) {
            // 세션을 찾았으면 성공
            return true
          }
          
          // 세션을 찾지 못했고 재시도 횟수가 남았으면 재시도
          if (retryCount < maxRetries) {
            retryCount++
            await new Promise(resolve => setTimeout(resolve, 500)) // 500ms 대기
            return attemptSessionCheck()
          }
          
          return false
        }

        const hasSession = await attemptSessionCheck()
        
        // 세션 확인 완료
        if (mounted) {
          setIsCheckingAuth(false)
        }
        
        // 세션이 없고 로딩도 완료되었으면 리다이렉트
        if (!hasSession && !authLoading && mounted) {
          // 충분한 지연을 주어 모든 상태 업데이트가 완료되도록 함
          redirectTimer = setTimeout(() => {
            if (mounted) {
              router.push('/login?redirect=/profile')
            }
          }, 500)
        }
      } catch (error) {
        console.error('Error checking session:', error)
        if (mounted) {
          setIsCheckingAuth(false)
        }
        // 에러 발생 시에도 로딩이 완료되었고 사용자가 없으면 리다이렉트
        if (!authLoading && !user && mounted) {
          redirectTimer = setTimeout(() => {
            if (mounted) {
              router.push('/login?redirect=/profile')
            }
          }, 500)
        }
      }
    }

    // 초기 세션 확인
    checkSession()

    return () => {
      mounted = false
      if (redirectTimer) {
        clearTimeout(redirectTimer)
      }
    }
  }, [router, authLoading, user])

  useEffect(() => {
    if (profile) {
      setNickname(profile.nickname || '')
      setAvatarUrl(profile.avatar_url)
    } else if (user && !authLoading) {
      // 프로필이 없으면 기본값 설정
      setNickname(user.email?.split('@')[0] || '사용자')
    }
  }, [profile, user, authLoading])

  const handleSave = async () => {
    if (!user) return

    setIsSaving(true)
    try {
      const supabase = getBrowserClient()
      
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          nickname: nickname.trim(),
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })

      if (error) {
        console.error('Error updating profile:', error)
        alert('프로필 업데이트에 실패했습니다.')
        setIsSaving(false)
        return
      }

      await refreshProfile()
      setIsEditing(false)
      alert('프로필이 업데이트되었습니다.')
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('프로필 업데이트 중 오류가 발생했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setNickname(profile.nickname || '')
      setAvatarUrl(profile.avatar_url)
    } else if (user) {
      setNickname(user.email?.split('@')[0] || '사용자')
      setAvatarUrl(null)
    }
    setIsEditing(false)
  }

  // 로딩 중이거나 세션 확인 중이면 로딩 화면 표시
  if (authLoading || isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3056F5] mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 세션 확인이 완료되었고 사용자가 없으면 아무것도 렌더링하지 않음 (리다이렉트 중)
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3056F5] mx-auto mb-4"></div>
          <p className="text-gray-600">인증 확인 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>돌아가기</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
              <User className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">마이 페이지</h1>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
          {/* Avatar Section */}
          <div className="flex flex-col items-center mb-8">
            <div className="relative">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={nickname}
                  className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center border-4 border-white shadow-lg">
                  <User className="w-12 h-12 text-white" />
                </div>
              )}
              {isEditing && (
                <button
                  className="absolute bottom-0 right-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-blue-600 transition-colors"
                  onClick={() => {
                    // TODO: 이미지 업로드 기능 구현
                    alert('이미지 업로드 기능은 준비 중입니다.')
                  }}
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
            </div>
            {!isEditing && (
              <h2 className="mt-4 text-xl font-semibold text-gray-900">{nickname}</h2>
            )}
          </div>

          {/* Profile Information */}
          <div className="space-y-6">
            {/* Nickname */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                닉네임
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="닉네임을 입력하세요"
                  maxLength={20}
                />
              ) : (
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-900">
                  {nickname || '닉네임이 설정되지 않았습니다'}
                </div>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                이메일
              </label>
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-600">
                {user.email}
              </div>
              <p className="mt-1 text-xs text-gray-500">이메일은 변경할 수 없습니다</p>
            </div>

            {/* Account Created */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                가입일
              </label>
              <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-600">
                {user.created_at
                  ? new Date(user.created_at).toLocaleDateString('ko-KR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })
                  : '정보 없음'}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  disabled={isSaving}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
                >
                  취소
                </button>
                <button
                  onClick={handleSave}
                  disabled={isSaving || !nickname.trim()}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  <Save className="w-4 h-4" />
                  {isSaving ? '저장 중...' : '저장'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                프로필 수정
              </button>
            )}
          </div>
        </div>

        {/* Quick Links */}
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link
            href="/pets"
            className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">내 반려동물</h3>
                <p className="text-sm text-gray-600">반려동물 관리</p>
              </div>
            </div>
          </Link>
          <Link
            href="/settings"
            className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">설정</h3>
                <p className="text-sm text-gray-600">계정 설정</p>
              </div>
            </div>
          </Link>
        </div>
      </main>
    </div>
  )
}

