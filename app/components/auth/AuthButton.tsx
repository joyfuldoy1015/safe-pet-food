'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { User, LogOut, Settings, Heart, ChevronDown } from 'lucide-react'
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
    await signOut()
    setIsMenuOpen(false)
  }

  if (isLoading) {
    return (
      <div className="px-4 py-2 bg-gray-100 rounded-xl animate-pulse">
        <div className="w-20 h-5 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <>
        <button
          onClick={() => setIsAuthDialogOpen(true)}
          className="px-4 py-2 bg-[#3056F5] text-white rounded-xl font-medium hover:bg-[#2648e6] transition-colors text-sm"
        >
          로그인
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
                <a
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <User className="h-4 w-4" />
                  내 프로필
                </a>
                <a
                  href="/pets"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Heart className="h-4 w-4" />
                  내 반려동물
                </a>
                <a
                  href="/settings"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  <Settings className="h-4 w-4" />
                  설정
                </a>
              </div>

              <div className="border-t border-gray-100 pt-1">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
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

