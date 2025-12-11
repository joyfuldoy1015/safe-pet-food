'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Settings, Heart, ChevronDown, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import AuthDialog from './AuthDialog'

/**
 * Authentication button component
 * Shows login button or user menu based on auth state
 */
export default function AuthButton() {
  const { user, profile, signOut, isLoading } = useAuth()
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleSignOut = async () => {
    console.log('[AuthButton] 로그아웃 버튼 클릭됨')
    try {
      setIsMenuOpen(false)
      console.log('[AuthButton] signOut 함수 호출 시작')
      
      // 로그아웃 처리
      await signOut()
      console.log('[AuthButton] signOut 완료')
      
      // 세션 정리 완료 대기
      await new Promise(resolve => setTimeout(resolve, 500))
      console.log('[AuthButton] 리다이렉트 시작')
      
      // 페이지 완전 새로고침으로 세션 상태 동기화 (OAuth 세션 정리를 위해)
      // window.location.href 대신 window.location.replace를 사용하여 히스토리에 남기지 않음
      window.location.replace('/')
    } catch (error) {
      console.error('[AuthButton] 로그아웃 오류:', error)
      // 에러가 있어도 홈으로 리다이렉트 (강제 새로고침)
      alert('로그아웃 중 오류가 발생했습니다. 홈으로 이동합니다.')
      window.location.replace('/')
    }
  }

  const handleOpenDialog = () => {
    setIsAuthDialogOpen(true)
  }

  if (!user) {
    return (
      <>
        <button
          onClick={handleOpenDialog}
          className="px-4 py-2 bg-[#3056F5] text-white rounded-xl font-medium hover:bg-[#2648e6] transition-colors text-sm flex items-center gap-2"
        >
          {isLoading && (
            <Loader2 className="h-4 w-4 animate-spin" />
          )}
          <span>{isLoading ? '확인 중...' : '로그인'}</span>
        </button>
        <AuthDialog
          isOpen={isAuthDialogOpen}
          onClose={() => setIsAuthDialogOpen(false)}
        />
      </>
    )
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors"
      >
        {profile?.avatar_url ? (
          <img
            src={profile.avatar_url}
            alt={profile.nickname}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-[#3056F5] flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
        )}
        <span className="text-sm font-medium text-gray-700 hidden sm:inline">
          {profile?.nickname || '사용자'}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-500" />
      </button>

      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
              className="fixed inset-0 z-40"
            />
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 py-2 z-50"
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <p className="text-sm font-medium text-gray-900">{profile?.nickname || '사용자'}</p>
                <p className="text-xs text-gray-500 mt-1">{user.email}</p>
              </div>
              
              <div className="py-1">
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  내 프로필
                </Link>
                <Link
                  href="/pets"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="h-4 w-4" />
                  내 반려동물
                </Link>
                <Link
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  설정
                </Link>
              </div>

              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    console.log('[AuthButton] 로그아웃 버튼 클릭 이벤트 발생')
                    handleSignOut()
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  type="button"
                >
                  <LogOut className="h-4 w-4" />
                  로그아웃
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

