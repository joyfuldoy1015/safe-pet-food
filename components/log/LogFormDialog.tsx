'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogIn, Mail, Loader2 } from 'lucide-react'
import ReviewLogForm from '@/app/components/pet-log/ReviewLogForm'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'
import type { Database } from '@/lib/types/database'

type Pet = Database['public']['Tables']['pets']['Row']

interface LogFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  defaultValues?: {
    petId?: string
    [key: string]: any
  }
  onSuccess?: () => void
  requireAuth?: boolean
  userId?: string
}

/**
 * Dialog wrapper for LogForm with smooth login gating
 * Full-screen on mobile, responsive on desktop
 */
export default function LogFormDialog({
  open,
  onOpenChange,
  title = '새 로그 작성',
  defaultValues,
  onSuccess,
  requireAuth = true,
  userId
}: LogFormDialogProps) {
  const { user } = useAuth()
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoadingPets, setIsLoadingPets] = useState(false)
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [loginError, setLoginError] = useState<string | null>(null)
  const [showLoginSuccess, setShowLoginSuccess] = useState(false)
  const [email, setEmail] = useState('')
  const [isEmailSent, setIsEmailSent] = useState(false)

  // Load user's pets when user is available
  useEffect(() => {
    if (open && user) {
      loadPets()
      // Show success message briefly when user just logged in
      if (showLoginSuccess) {
        const timer = setTimeout(() => setShowLoginSuccess(false), 2000)
        return () => clearTimeout(timer)
      }
    }
  }, [open, user, showLoginSuccess])

  // Auto-detect when user logs in (transition from no user to user)
  const [wasLoggedOut, setWasLoggedOut] = useState(false)
  
  useEffect(() => {
    if (open && requireAuth) {
      if (!user) {
        setWasLoggedOut(true)
        setShowLoginSuccess(false)
        setLoginError(null)
      } else if (wasLoggedOut && user) {
        // User just logged in (transition detected)
        setWasLoggedOut(false)
        setShowLoginSuccess(true)
        setIsEmailSent(false)
        // Auto-hide success message after 3 seconds
        const timer = setTimeout(() => setShowLoginSuccess(false), 3000)
        return () => clearTimeout(timer)
      }
    }
  }, [open, user, requireAuth, wasLoggedOut])

  const loadPets = async () => {
    setIsLoadingPets(true)
    try {
      const supabase = getBrowserClient()
      if (!supabase || !user) {
        setPets([])
        return
      }

      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('owner_id', user.id)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('[LogFormDialog] Error loading pets:', error)
        setPets([])
      } else {
        setPets(data || [])
      }
    } catch (error) {
      console.error('[LogFormDialog] Error loading pets:', error)
      setPets([])
    } finally {
      setIsLoadingPets(false)
    }
  }

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    setIsLoggingIn(true)
    setLoginError(null)

    // Basic email validation
    if (!email || !email.includes('@')) {
      setLoginError('올바른 이메일 주소를 입력해주세요.')
      setIsLoggingIn(false)
      return
    }

    try {
      // Open email login flow
      const supabase = getBrowserClient()
      if (!supabase) {
        setLoginError('로그인 서비스를 사용할 수 없습니다.')
        setIsLoggingIn(false)
        return
      }

      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        setLoginError(error.message || '로그인에 실패했습니다.')
        setIsLoggingIn(false)
      } else {
        // Email sent successfully
        setIsEmailSent(true)
        setIsLoggingIn(false)
        // The user will be logged in when they click the link
        // The useEffect will detect the user change and show the form
      }
    } catch (error) {
      console.error('[LogFormDialog] Login error:', error)
      setLoginError('로그인 중 오류가 발생했습니다.')
      setIsLoggingIn(false)
    }
  }

  const handleFormSuccess = () => {
    onSuccess?.()
    onOpenChange(false)
  }

  const handleClose = () => {
    setLoginError(null)
    setShowLoginSuccess(false)
    setIsLoggingIn(false)
    setEmail('')
    setIsEmailSent(false)
    setWasLoggedOut(false)
    onOpenChange(false)
  }

  // Check if Supabase is configured
  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // In development mode without Supabase, allow bypassing auth
  const showLoginRequired = requireAuth && !user && hasSupabase

  if (!open) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm"
          onClick={handleClose}
        />

        {/* Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative z-50 w-full h-[100dvh] sm:h-auto sm:max-w-3xl sm:rounded-2xl bg-white shadow-xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-200 px-4 sm:px-6 py-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">{title}</h2>
            <button
              onClick={handleClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="닫기"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto">
            {showLoginRequired ? (
              // Login Required View
              <div className="flex flex-col items-center justify-center px-6 py-12 sm:py-16 text-center min-h-[300px]">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="mb-6"
                >
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                    <LogIn className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                    로그인이 필요한 기능입니다
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600">
                    로그인 후 이용해 주세요.
                  </p>
                </motion.div>

                {showLoginSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 rounded-xl"
                  >
                    로그인되었습니다. 로그를 작성해 주세요.
                  </motion.div>
                )}

                {!isEmailSent ? (
                  <>
                    {loginError && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700 max-w-md w-full"
                      >
                        {loginError}
                      </motion.div>
                    )}

                    <form onSubmit={handleLogin} className="w-full max-w-md space-y-4">
                      <div>
                        <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 mb-2 text-left">
                          이메일 주소
                        </label>
                        <input
                          id="login-email"
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="your@email.com"
                          required
                          disabled={isLoggingIn}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-3">
                        <button
                          type="submit"
                          disabled={isLoggingIn}
                          className="flex-1 px-6 py-3 bg-[#3056F5] text-white rounded-xl font-medium hover:bg-[#2648e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isLoggingIn ? (
                            <>
                              <Loader2 className="h-5 w-5 animate-spin" />
                              <span>처리 중...</span>
                            </>
                          ) : (
                            <>
                              <Mail className="h-5 w-5" />
                              <span>로그인하기</span>
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={handleClose}
                          className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                        >
                          닫기
                        </button>
                      </div>
                    </form>

                    <p className="mt-6 text-xs text-gray-500 max-w-md">
                      이메일로 로그인 링크를 보내드립니다. 링크를 클릭하면 자동으로 로그인됩니다.
                    </p>
                  </>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="w-full max-w-md"
                  >
                    <div className="px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 mb-4">
                      <strong className="text-blue-900">{email}</strong>로 로그인 링크를 보냈습니다.
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      이메일을 확인하고 링크를 클릭하여 로그인하세요.
                    </p>
                    <button
                      onClick={handleClose}
                      className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    >
                      닫기
                    </button>
                  </motion.div>
                )}
              </div>
            ) : (
              // Log Form View
              <>
                {!hasSupabase && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-4 sm:mx-6 mt-4 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700"
                  >
                    ⚠️ 개발 모드: Supabase가 설정되지 않아 로그인 없이 테스트 중입니다.
                  </motion.div>
                )}
                {showLoginSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mx-4 sm:mx-6 mt-4 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700"
                  >
                    로그인되었습니다. 로그를 작성해 주세요.
                  </motion.div>
                )}
                <ReviewLogForm
                  isOpen={true}
                  onClose={handleClose}
                  onSuccess={handleFormSuccess}
                  editData={null}
                  pets={pets}
                />
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

