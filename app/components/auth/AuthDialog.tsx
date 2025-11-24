'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'

interface AuthDialogProps {
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

/**
 * Authentication dialog component
 * Supports email magic link login
 */
export default function AuthDialog({ isOpen, onClose, onSuccess }: AuthDialogProps) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [providerLoading, setProviderLoading] = useState<'google' | 'kakao' | null>(null)
  const { signInWithPassword, signInWithProvider } = useAuth()

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    if (!email || !password) {
      setError('이메일과 비밀번호를 입력해주세요.')
      setIsLoading(false)
      return
    }

    const { error } = await signInWithPassword(email.trim(), password)
    if (error) {
      setError(error.message || '로그인에 실패했습니다.')
      setIsLoading(false)
      return
    }

    setIsLoading(false)
    onSuccess?.()
    handleClose()
  }

  const handleClose = () => {
    setEmail('')
    setPassword('')
    setShowPassword(false)
    setError(null)
    setProviderLoading(null)
    onClose()
  }

  const handleProviderLogin = async (provider: 'google' | 'kakao') => {
    setError(null)
    setProviderLoading(provider)
    const { error } = await signInWithProvider(provider)
    if (error) {
      setError(error.message || '로그인에 실패했습니다.')
      setProviderLoading(null)
    }
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          <>
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인</h2>
              <p className="text-sm text-gray-600">Safe Pet Food에 오신 것을 환영합니다</p>
            </div>

            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleProviderLogin('google')}
                disabled={!!providerLoading}
                className="w-full flex items-center justify-center gap-2 py-3 border border-gray-300 rounded-xl font-medium hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {providerLoading === 'google' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Google로 이동 중...</span>
                  </>
                ) : (
                  <span>Google로 로그인</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => handleProviderLogin('kakao')}
                disabled={!!providerLoading}
                className="w-full flex items-center justify-center gap-2 py-3 border border-yellow-300 bg-yellow-100 text-yellow-900 rounded-xl font-medium hover:bg-yellow-200 transition-colors disabled:opacity-50"
              >
                {providerLoading === 'kakao' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>카카오로 이동 중...</span>
                  </>
                ) : (
                  <span>카카오로 로그인</span>
                )}
              </button>
            </div>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200" />
              </div>
              <div className="relative flex justify-center text-xs text-gray-500">
                <span className="px-2 bg-white">또는 이메일로 로그인</span>
              </div>
            </div>

            <form onSubmit={handlePasswordLogin} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  이메일 주소
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm"
                  disabled={isLoading}
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호를 입력하세요"
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm pr-12"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label="비밀번호 표시 전환"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-[#3056F5] text-white rounded-xl font-medium hover:bg-[#2648e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    <span>로그인 중...</span>
                  </>
                ) : (
                  <span>이메일로 로그인</span>
                )}
              </button>
            </form>
          </>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

