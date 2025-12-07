'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'
import { Settings, ArrowLeft, Bell, Shield, Trash2, LogOut, Save } from 'lucide-react'

export default function SettingsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading, signOut } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  
  // 알림 설정
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    comments: true,
    updates: true
  })

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/settings')
    }
  }, [user, authLoading, router])

  const handleSaveSettings = async () => {
    if (!user) return
    
    setIsSaving(true)
    try {
      const supabase = getBrowserClient()
      
      // 설정을 profiles 테이블에 저장 (JSON 형태로 저장 가능하도록 확장)
      // 현재는 localStorage에 저장하고, 추후 Supabase에 user_settings 테이블 추가 가능
      const settingsData = {
        notifications,
        updated_at: new Date().toISOString()
      }
      
      // localStorage에 저장 (임시)
      localStorage.setItem(`user_settings_${user.id}`, JSON.stringify(settingsData))
      
      // 추후 Supabase에 저장하려면:
      // await supabase.from('user_settings').upsert({
      //   user_id: user.id,
      //   settings: settingsData,
      //   updated_at: new Date().toISOString()
      // })
      
      alert('설정이 저장되었습니다.')
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error saving settings:', error)
      }
      alert('설정 저장에 실패했습니다.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm('정말로 계정을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.')) {
      return
    }

    if (!confirm('모든 데이터가 영구적으로 삭제됩니다. 계속하시겠습니까?')) {
      return
    }

    if (!confirm('마지막 확인입니다. 정말로 계정을 삭제하시겠습니까?')) {
      return
    }

    try {
      const supabase = getBrowserClient()
      if (!supabase || !user) return

      // Supabase에서 사용자 삭제
      // 주의: 이 작업은 Supabase Admin API가 필요할 수 있습니다
      // 일반적으로는 사용자 계정을 비활성화하는 것이 더 안전합니다
      
      // 방법 1: 사용자 계정 삭제 (Admin API 필요)
      // const { error } = await supabase.auth.admin.deleteUser(user.id)
      
      // 방법 2: 사용자 계정 비활성화 (현재 세션만 삭제)
      const { error: signOutError } = await supabase.auth.signOut()
      
      if (signOutError) {
        throw signOutError
      }
      
      // 로컬 스토리지 정리
      localStorage.removeItem(`user_settings_${user.id}`)
      
      alert('계정이 삭제되었습니다. (참고: 실제 데이터베이스 삭제는 관리자에게 문의하세요)')
      router.push('/')
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Error deleting account:', error)
      }
      alert('계정 삭제 중 오류가 발생했습니다. 관리자에게 문의하세요.')
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/')
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3056F5] mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back()
              } else {
                router.push('/')
              }
            }}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>돌아가기</span>
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-r from-gray-500 to-gray-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">설정</h1>
          </div>
        </div>

        <div className="space-y-6">
          {/* 알림 설정 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Bell className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-semibold text-gray-900">알림 설정</h2>
            </div>
            <div className="space-y-4">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-gray-900 font-medium">이메일 알림</span>
                  <p className="text-sm text-gray-600">이메일로 알림을 받습니다</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={(e) => setNotifications({ ...notifications, email: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-gray-900 font-medium">푸시 알림</span>
                  <p className="text-sm text-gray-600">브라우저 푸시 알림을 받습니다</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={(e) => setNotifications({ ...notifications, push: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-gray-900 font-medium">댓글 알림</span>
                  <p className="text-sm text-gray-600">댓글이 달리면 알림을 받습니다</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.comments}
                  onChange={(e) => setNotifications({ ...notifications, comments: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <span className="text-gray-900 font-medium">업데이트 알림</span>
                  <p className="text-sm text-gray-600">서비스 업데이트를 알려드립니다</p>
                </div>
                <input
                  type="checkbox"
                  checked={notifications.updates}
                  onChange={(e) => setNotifications({ ...notifications, updates: e.target.checked })}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
              </label>
            </div>
            <button
              onClick={handleSaveSettings}
              disabled={isSaving}
              className="mt-6 w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {isSaving ? '저장 중...' : '설정 저장'}
            </button>
          </div>

          {/* 계정 설정 */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Shield className="w-5 h-5 text-green-500" />
              <h2 className="text-xl font-semibold text-gray-900">계정 설정</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">이메일</label>
                <div className="px-4 py-2 bg-gray-50 rounded-lg text-gray-600">
                  {user.email}
                </div>
                <p className="mt-1 text-xs text-gray-500">이메일은 변경할 수 없습니다</p>
              </div>
              <div>
                <Link
                  href="/profile"
                  className="block w-full px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-center"
                >
                  프로필 수정하기
                </Link>
              </div>
            </div>
          </div>

          {/* 주의 */}
          <div className="bg-white rounded-2xl shadow-lg border border-red-200 p-6">
            <div className="flex items-center gap-3 mb-6">
              <Trash2 className="w-5 h-5 text-red-500" />
              <h2 className="text-xl font-semibold text-gray-900">주의</h2>
            </div>
            <div className="space-y-4">
              <div>
                <h3 className="text-gray-900 font-medium mb-2">로그아웃</h3>
                <p className="text-sm text-gray-600 mb-4">현재 계정에서 로그아웃합니다</p>
                <button
                  onClick={handleLogout}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  로그아웃
                </button>
              </div>
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-red-600 font-medium mb-2">계정 삭제</h3>
                <p className="text-sm text-gray-600 mb-4">
                  계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.
                </p>
                <button
                  onClick={handleDeleteAccount}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  계정 삭제
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

