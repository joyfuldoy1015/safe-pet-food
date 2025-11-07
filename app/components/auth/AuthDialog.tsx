'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Mail, Loader2 } from 'lucide-react'
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
  const [isLoading, setIsLoading] = useState(false)
  const [isEmailSent, setIsEmailSent] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { signIn } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    // Basic email validation
    if (!email || !email.includes('@')) {
      setError('올바른 이메일 주소를 입력해주세요.')
      setIsLoading(false)
      return
    }

    const { error: signInError } = await signIn(email)

    if (signInError) {
      setError(signInError.message || '로그인에 실패했습니다.')
      setIsLoading(false)
    } else {
      setIsEmailSent(true)
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setEmail('')
    setIsEmailSent(false)
    setError(null)
    onClose()
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

          {!isEmailSent ? (
            <>
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <Mail className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">로그인</h2>
                <p className="text-sm text-gray-600">
                  이메일로 로그인 링크를 보내드립니다
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
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
                      <span>전송 중...</span>
                    </>
                  ) : (
                    <span>로그인 링크 보내기</span>
                  )}
                </button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  로그인 링크를 클릭하면 자동으로 로그인됩니다
                </p>
              </div>
            </>
          ) : (
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                <Mail className="h-8 w-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">이메일 확인</h2>
              <p className="text-sm text-gray-600 mb-4">
                <strong className="text-gray-900">{email}</strong>로 로그인 링크를 보냈습니다.
              </p>
              <p className="text-xs text-gray-500 mb-6">
                이메일을 확인하고 링크를 클릭하여 로그인하세요.
              </p>
              <button
                onClick={handleClose}
                className="w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
              >
                닫기
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

