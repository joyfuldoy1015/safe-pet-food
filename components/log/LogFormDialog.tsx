'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, LogIn, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'
import type { Database } from '@/lib/types/database'

type Pet = Database['public']['Tables']['pets']['Row']
type ReviewLog = Database['public']['Tables']['review_logs']['Row']
type ReviewLogInsert = Database['public']['Tables']['review_logs']['Insert']

interface LogFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  defaultValues?: {
    petId?: string
    [key: string]: any
  }
  editData?: ReviewLog | null
  onSuccess?: () => void
  requireAuth?: boolean
  userId?: string
}

/**
 * Dialog wrapper for LogForm with login gating
 * Full-screen on mobile, responsive on desktop
 * Shows login prompt if not authenticated (no magic link)
 */
export default function LogFormDialog({
  open,
  onOpenChange,
  title = '새 로그 작성',
  defaultValues,
  editData,
  onSuccess,
  requireAuth = true,
  userId
}: LogFormDialogProps) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoadingPets, setIsLoadingPets] = useState(false)
  const [authTimeout, setAuthTimeout] = useState(false)

  // Safety timeout: if auth loading takes more than 6 seconds, assume not logged in
  // useAuth의 타임아웃(5초)보다 길게 설정하여 세션 로드 완료를 기다림
  useEffect(() => {
    if (!open) return

    const timeoutId = setTimeout(() => {
      if (authLoading) {
        console.warn('[LogFormDialog] Auth loading timeout after 6 seconds')
        setAuthTimeout(true)
      }
    }, 6000)  // 3초 → 6초로 연장

    return () => {
      clearTimeout(timeoutId)
      setAuthTimeout(false)
    }
  }, [open, authLoading])

  const loadPets = useCallback(async () => {
    setIsLoadingPets(true)
    try {
      const supabase = getBrowserClient()
      const hasSupabase = typeof window !== 'undefined' && 
        !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
        !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

      // Check if Supabase URL is placeholder
      const clientUrl = (supabase as any)?.supabaseUrl || ''
      const isPlaceholder = clientUrl === 'https://placeholder.supabase.co' || 
                           clientUrl.includes('placeholder') ||
                           !clientUrl

      if (!hasSupabase || isPlaceholder || !supabase || !user) {
        setPets([])
        setIsLoadingPets(false)
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
  }, [user])

  // Load user's pets when user is available
  useEffect(() => {
    if (open && user && !authLoading) {
      loadPets()
    }
  }, [open, user, authLoading, loadPets])

  const handleFormSuccess = () => {
    onSuccess?.()
    onOpenChange(false)
  }

  const handleClose = () => {
    onOpenChange(false)
  }

  const handleLoginClick = () => {
    onOpenChange(false)
    router.push('/login?redirect=/pet-log')
  }

  // Check if Supabase is configured
  const hasSupabase = typeof window !== 'undefined' && 
    !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  // In development mode without Supabase, allow bypassing auth
  // Show login required only when:
  // 1. Auth is required (requireAuth = true)
  // 2. Auth loading is complete OR timeout occurred
  // 3. No user is logged in
  // 4. Supabase is configured
  const showLoginRequired = requireAuth && (!authLoading || authTimeout) && !user && hasSupabase

  // If Supabase is not configured, show form directly (dev mode)
  const bypassAuth = !hasSupabase
  
  // Debug info (개발 환경에서만)
  if (process.env.NODE_ENV === 'development' && open) {
    console.log('[LogFormDialog] Auth state:', { 
      authLoading, 
      authTimeout, 
      hasUser: !!user, 
      showLoginRequired,
      requireAuth,
      hasSupabase
    })
  }

  if (!open) return null

  // Show loading spinner while checking auth status
  // authTimeout이 발생하면 로딩을 중단하고 로그인 화면 표시
  if (authLoading && !authTimeout && !bypassAuth && requireAuth) {
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
            className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col p-6 sm:p-8"
          >
            {/* Close button */}
            <button
              onClick={handleClose}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
              aria-label="닫기"
            >
              <X className="h-5 w-5 text-gray-500" />
            </button>

            {/* Loading spinner */}
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#3056F5]" />
            </div>
          </motion.div>
        </div>
      </AnimatePresence>
    )
  }

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
          className={`relative bg-white rounded-3xl shadow-2xl w-full ${
            showLoginRequired ? 'max-w-md' : 'max-w-3xl'
          } max-h-[90vh] flex flex-col p-6 sm:p-8`}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          {showLoginRequired ? (
            // Login Required View - 안내 팝업
            <div className="text-center">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-6"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                  <LogIn className="h-8 w-8 text-blue-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  로그인이 필요합니다
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  로그인 후 급여 후기를 작성할 수 있습니다.
                </p>
              </motion.div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleLoginClick}
                  className="flex-1 px-6 py-3 bg-[#3056F5] text-white rounded-xl font-medium hover:bg-[#2648e6] transition-colors flex items-center justify-center gap-2"
                >
                  <LogIn className="h-5 w-5" />
                  <span>로그인하기</span>
                </button>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  닫기
                </button>
              </div>
            </div>
          ) : (
            // Log Form View
            <div className="flex-1 overflow-y-auto -mx-6 sm:-mx-8 px-6 sm:px-8">
              {!hasSupabase && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-4 px-4 py-3 bg-yellow-50 border border-yellow-200 rounded-xl text-sm text-yellow-700"
                >
                  ⚠️ 개발 모드: Supabase가 설정되지 않아 로그인 없이 테스트 중입니다.
                </motion.div>
              )}
              {(bypassAuth || user) && (
                <ReviewLogFormContent
                  onClose={handleClose}
                  onSuccess={handleFormSuccess}
                  editData={editData || null}
                  pets={pets}
                  isLoadingPets={isLoadingPets}
                />
              )}
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

/**
 * ReviewLogForm content without modal wrapper
 * Used inside LogFormDialog to avoid modal nesting
 */
function ReviewLogFormContent({
  onClose,
  onSuccess,
  editData,
  pets,
  isLoadingPets
}: {
  onClose: () => void
  onSuccess: () => void
  editData?: ReviewLog | null
  pets: Pet[]
  isLoadingPets: boolean
}) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<ReviewLogInsert>>({
    pet_id: '',
    category: 'feed',
    brand: '',
    product: '',
    status: 'feeding',
    period_start: new Date().toISOString().split('T')[0],
    period_end: null,
    rating: null,
    palatability_score: null,
    digestibility_score: null,
    coat_quality_score: null,
    recommend: null,
    continue_reasons: [],
    stop_reasons: [],
    excerpt: '',
    notes: null,
    stool_score: null,
    appetite_change: null,
    vomiting: null,
    allergy_symptoms: []
  })

  const [continueReasonInput, setContinueReasonInput] = useState('')
  const [stopReasonInput, setStopReasonInput] = useState('')
  const [allergyInput, setAllergyInput] = useState('')

  // Load edit data
  useEffect(() => {
    if (editData) {
      setFormData({
        pet_id: editData.pet_id,
        category: editData.category,
        brand: editData.brand,
        product: editData.product,
        status: editData.status,
        period_start: editData.period_start,
        period_end: editData.period_end || null,
        rating: editData.rating || null,
        palatability_score: (editData as any).palatability_score ?? null,
        digestibility_score: (editData as any).digestibility_score ?? null,
        coat_quality_score: (editData as any).coat_quality_score ?? null,
        recommend: editData.recommend ?? null,
        continue_reasons: editData.continue_reasons || [],
        stop_reasons: editData.stop_reasons || [],
        excerpt: editData.excerpt,
        notes: editData.notes || null,
        stool_score: editData.stool_score ?? null,
        appetite_change: editData.appetite_change ?? null,
        vomiting: editData.vomiting ?? null,
        allergy_symptoms: editData.allergy_symptoms || []
      })
    } else {
      setFormData({
        pet_id: pets.length > 0 ? pets[0].id : '',
        category: 'feed',
        brand: '',
        product: '',
        status: 'feeding',
        period_start: new Date().toISOString().split('T')[0],
        period_end: null,
        rating: null,
        palatability_score: null,
        digestibility_score: null,
        coat_quality_score: null,
        recommend: null,
        continue_reasons: [],
        stop_reasons: [],
        excerpt: '',
        notes: null,
        stool_score: null,
        appetite_change: null,
        vomiting: null,
        allergy_symptoms: []
      })
    }
  }, [editData, pets])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError(null)
    setIsLoading(true)

    try {
      const supabase = getBrowserClient()

      // Calculate duration_days if period_end exists
      let durationDays: number | null = null
      if (formData.period_start && formData.period_end) {
        const start = new Date(formData.period_start)
        const end = new Date(formData.period_end)
        durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      }

      const data: ReviewLogInsert = {
        pet_id: formData.pet_id as string,
        owner_id: user.id,
        category: formData.category as 'feed' | 'snack' | 'supplement' | 'toilet',
        brand: formData.brand as string,
        product: formData.product as string,
        status: formData.status as 'feeding' | 'paused' | 'completed',
        period_start: formData.period_start as string,
        period_end: formData.period_end || null,
        duration_days: durationDays,
        rating: formData.rating ? Number(formData.rating) : null,
        palatability_score: formData.palatability_score ?? null,
        digestibility_score: formData.digestibility_score ?? null,
        coat_quality_score: formData.coat_quality_score ?? null,
        recommend: formData.recommend ?? null,
        continue_reasons: formData.continue_reasons && formData.continue_reasons.length > 0 ? formData.continue_reasons : null,
        stop_reasons: formData.stop_reasons && formData.stop_reasons.length > 0 ? formData.stop_reasons : null,
        excerpt: formData.excerpt as string,
        notes: formData.notes || null,
        likes: editData?.likes || 0,
        views: editData?.views || 0,
        comments_count: editData?.comments_count || 0,
        stool_score: formData.stool_score ?? null,
        appetite_change: formData.appetite_change || null,
        vomiting: formData.vomiting ?? null,
        allergy_symptoms: formData.allergy_symptoms && formData.allergy_symptoms.length > 0 ? formData.allergy_symptoms : null
      }

      if (editData) {
        // Update
        const { error: updateError } = await (supabase
          .from('review_logs') as any)
          .update(data)
          .eq('id', editData.id)

        if (updateError) {
          setError(updateError.message || '수정에 실패했습니다.')
          setIsLoading(false)
          return
        }
      } else {
        // Insert
        const { error: insertError } = await (supabase
          .from('review_logs') as any)
          .insert(data)
          .select()
          .single()

        if (insertError) {
          setError(insertError.message || '작성에 실패했습니다.')
          setIsLoading(false)
          return
        }
      }

      onSuccess()
      onClose()
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  const handleAddContinueReason = () => {
    if (continueReasonInput.trim()) {
      const reasons = formData.continue_reasons || []
      if (!reasons.includes(continueReasonInput.trim()) && reasons.length < 5) {
        setFormData({
          ...formData,
          continue_reasons: [...reasons, continueReasonInput.trim()]
        })
        setContinueReasonInput('')
      }
    }
  }

  const handleRemoveContinueReason = (reason: string) => {
    const reasons = formData.continue_reasons || []
    setFormData({
      ...formData,
      continue_reasons: reasons.filter(r => r !== reason)
    })
  }

  const handleAddStopReason = () => {
    if (stopReasonInput.trim()) {
      const reasons = formData.stop_reasons || []
      if (!reasons.includes(stopReasonInput.trim()) && reasons.length < 5) {
        setFormData({
          ...formData,
          stop_reasons: [...reasons, stopReasonInput.trim()]
        })
        setStopReasonInput('')
      }
    }
  }

  const handleRemoveStopReason = (reason: string) => {
    const reasons = formData.stop_reasons || []
    setFormData({
      ...formData,
      stop_reasons: reasons.filter(r => r !== reason)
    })
  }

  if (isLoadingPets) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-[#3056F5]" />
      </div>
    )
  }

  return (
    <div className="py-4">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {editData ? '후기 수정' : '후기 작성'}
        </h2>
        <p className="text-sm text-gray-600">급여 경험을 공유해주세요</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Pet Selection */}
        <div>
          <label htmlFor="pet_id" className="block text-sm font-medium text-gray-700 mb-2">
            반려동물 <span className="text-red-500">*</span>
          </label>
          <select
            id="pet_id"
            value={formData.pet_id || ''}
            onChange={(e) => setFormData({ ...formData, pet_id: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base"
          >
            <option value="">선택하세요</option>
            {pets.map((pet) => (
              <option key={pet.id} value={pet.id}>
                {pet.name} ({pet.species === 'dog' ? '강아지' : '고양이'})
              </option>
            ))}
          </select>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제품군 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {(['feed', 'snack', 'supplement', 'toilet'] as const).map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setFormData({ ...formData, category: cat })}
                className={`px-4 py-3 rounded-xl border-2 transition-colors text-sm ${
                  formData.category === cat
                    ? 'border-[#3056F5] bg-blue-50 text-[#3056F5]'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {cat === 'feed' && '🍽️ 사료'}
                {cat === 'snack' && '🦴 간식'}
                {cat === 'supplement' && '💊 영양제'}
                {cat === 'toilet' && '🚽 화장실'}
              </button>
            ))}
          </div>
        </div>

        {/* Brand */}
        <div>
          <label htmlFor="brand" className="block text-sm font-medium text-gray-700 mb-2">
            브랜드 <span className="text-red-500">*</span>
          </label>
          <input
            id="brand"
            type="text"
            value={formData.brand || ''}
            onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base"
            placeholder="예: 로얄캐닌"
          />
        </div>

        {/* Product */}
        <div>
          <label htmlFor="product" className="block text-sm font-medium text-gray-700 mb-2">
            제품명 <span className="text-red-500">*</span>
          </label>
          <input
            id="product"
            type="text"
            value={formData.product || ''}
            onChange={(e) => setFormData({ ...formData, product: e.target.value })}
            required
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base"
            placeholder="예: 어덜트 라지 브리드"
          />
        </div>

        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            상태 <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['feeding', 'paused', 'completed'] as const).map((status) => (
              <button
                key={status}
                type="button"
                onClick={() => setFormData({ ...formData, status })}
                className={`px-4 py-3 rounded-xl border-2 transition-colors text-sm ${
                  formData.status === status
                    ? 'border-[#3056F5] bg-blue-50 text-[#3056F5]'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                {status === 'feeding' && '급여 중'}
                {status === 'paused' && '급여 중지'}
                {status === 'completed' && '급여 완료'}
              </button>
            ))}
          </div>
        </div>

        {/* Period Start */}
        <div>
          <label htmlFor="period_start" className="block text-sm font-medium text-gray-700 mb-2">
            시작일 <span className="text-red-500">*</span>
          </label>
          <input
            id="period_start"
            type="date"
            value={formData.period_start || ''}
            onChange={(e) => setFormData({ ...formData, period_start: e.target.value })}
            required
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base appearance-none"
          />
        </div>

        {/* Period End */}
        <div>
          <label htmlFor="period_end" className="block text-sm font-medium text-gray-700 mb-2">
            종료일 {formData.status === 'completed' && <span className="text-red-500">*</span>}
          </label>
          <input
            id="period_end"
            type="date"
            value={formData.period_end || ''}
            onChange={(e) => setFormData({ ...formData, period_end: e.target.value || null })}
            required={formData.status === 'completed'}
            disabled={formData.status === 'feeding'}
            min={formData.period_start || undefined}
            max={new Date().toISOString().split('T')[0]}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base appearance-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        {/* Rating */}
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-gray-700 mb-2">
            평점 (1-5)
          </label>
          <input
            id="rating"
            type="number"
            min="1"
            max="5"
            step="0.1"
            value={formData.rating || ''}
            onChange={(e) => setFormData({ ...formData, rating: e.target.value ? Number(e.target.value) : null })}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base"
          />
        </div>

        {/* Palatability Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            기호성 (1-5)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setFormData({ ...formData, palatability_score: formData.palatability_score === score ? null : score })}
                className={`px-2 py-2.5 rounded-xl border-2 transition-colors text-center ${
                  formData.palatability_score === score
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-sm font-semibold">{score}점</div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {score === 1 && '거부'}
                  {score === 2 && '싫어함'}
                  {score === 3 && '보통'}
                  {score === 4 && '좋아함'}
                  {score === 5 && '아주좋아함'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Digestibility Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            소화율 (1-5)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setFormData({ ...formData, digestibility_score: formData.digestibility_score === score ? null : score })}
                className={`px-2 py-2.5 rounded-xl border-2 transition-colors text-center ${
                  formData.digestibility_score === score
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-sm font-semibold">{score}점</div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {score === 1 && '매우나쁨'}
                  {score === 2 && '나쁨'}
                  {score === 3 && '보통'}
                  {score === 4 && '좋음'}
                  {score === 5 && '매우좋음'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Coat Quality Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            털 상태 (1-5)
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setFormData({ ...formData, coat_quality_score: formData.coat_quality_score === score ? null : score })}
                className={`px-2 py-2.5 rounded-xl border-2 transition-colors text-center ${
                  formData.coat_quality_score === score
                    ? 'border-violet-500 bg-violet-50 text-violet-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-sm font-semibold">{score}점</div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {score === 1 && '매우나쁨'}
                  {score === 2 && '나쁨'}
                  {score === 3 && '보통'}
                  {score === 4 && '좋음'}
                  {score === 5 && '윤기남'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Recommend */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            추천 여부
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, recommend: true })}
              className={`flex-1 px-4 py-3 rounded-xl border-2 transition-colors ${
                formData.recommend === true
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              👍 추천
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, recommend: false })}
              className={`flex-1 px-4 py-3 rounded-xl border-2 transition-colors ${
                formData.recommend === false
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              👎 비추천
            </button>
          </div>
        </div>

        {/* SAFI 안전성 평가 */}
        <div className="pt-2 pb-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-gray-900">안전성 평가 (SAFI)</span>
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded-full">선택</span>
          </div>
          <p className="text-xs text-gray-500">급여 중 관찰한 반응을 기록하면 브랜드 안전성 점수에 반영됩니다</p>
        </div>

        {/* Stool Score */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            변 상태 점수
          </label>
          <div className="grid grid-cols-5 gap-2">
            {[1, 2, 3, 4, 5].map((score) => (
              <button
                key={score}
                type="button"
                onClick={() => setFormData({ ...formData, stool_score: formData.stool_score === score ? null : score })}
                className={`px-2 py-2.5 rounded-xl border-2 transition-colors text-center ${
                  formData.stool_score === score
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <div className="text-sm font-semibold">{score}점</div>
                <div className="text-[10px] text-gray-500 mt-0.5">
                  {score === 1 && '매우나쁨'}
                  {score === 2 && '나쁨'}
                  {score === 3 && '보통'}
                  {score === 4 && '좋음'}
                  {score === 5 && '매우좋음'}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Appetite Change */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            식욕 변화
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { value: 'INCREASED', label: '증가', emoji: '📈' },
              { value: 'NORMAL', label: '정상', emoji: '✅' },
              { value: 'DECREASED', label: '감소', emoji: '📉' },
              { value: 'REFUSED', label: '거부', emoji: '❌' }
            ].map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, appetite_change: formData.appetite_change === option.value ? null : option.value })}
                className={`px-3 py-2.5 rounded-xl border-2 transition-colors text-sm ${
                  formData.appetite_change === option.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-300 text-gray-700 hover:border-gray-400'
                }`}
              >
                <span className="text-base">{option.emoji}</span>
                <div className="mt-0.5 font-medium text-xs">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Vomiting */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            구토 발생 여부
          </label>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, vomiting: formData.vomiting === true ? null : true })}
              className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-colors text-sm ${
                formData.vomiting === true
                  ? 'border-red-500 bg-red-50 text-red-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              🤢 발생함
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, vomiting: formData.vomiting === false ? null : false })}
              className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-colors text-sm ${
                formData.vomiting === false
                  ? 'border-green-500 bg-green-50 text-green-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              ✅ 발생 안 함
            </button>
          </div>
        </div>

        {/* Allergy Symptoms */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            알레르기 증상
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={allergyInput}
              onChange={(e) => setAllergyInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  if (allergyInput.trim() && !(formData.allergy_symptoms || []).includes(allergyInput.trim())) {
                    setFormData({ ...formData, allergy_symptoms: [...(formData.allergy_symptoms || []), allergyInput.trim()] })
                    setAllergyInput('')
                  }
                }
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base"
              placeholder="예: 가려움, 발진, 눈물"
            />
            <button
              type="button"
              onClick={() => {
                if (allergyInput.trim() && !(formData.allergy_symptoms || []).includes(allergyInput.trim())) {
                  setFormData({ ...formData, allergy_symptoms: [...(formData.allergy_symptoms || []), allergyInput.trim()] })
                  setAllergyInput('')
                }
              }}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm"
            >
              추가
            </button>
          </div>
          {formData.allergy_symptoms && formData.allergy_symptoms.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.allergy_symptoms.map((symptom) => (
                <span
                  key={symptom}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs border border-orange-200"
                >
                  {symptom}
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, allergy_symptoms: (formData.allergy_symptoms || []).filter(s => s !== symptom) })}
                    className="hover:text-orange-900"
                    aria-label={`${symptom} 제거`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Continue Reasons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            계속하는 이유
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={continueReasonInput}
              onChange={(e) => setContinueReasonInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddContinueReason()
                }
              }}
              disabled={(formData.continue_reasons || []).length >= 5}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="예: 변 상태 개선"
            />
            <button
              type="button"
              onClick={handleAddContinueReason}
              disabled={(formData.continue_reasons || []).length >= 5}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              추가
            </button>
          </div>
          {formData.continue_reasons && formData.continue_reasons.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.continue_reasons.map((reason) => (
                <span
                  key={reason}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 rounded-full text-xs"
                >
                  {reason}
                  <button
                    type="button"
                    onClick={() => handleRemoveContinueReason(reason)}
                    className="hover:text-emerald-900"
                    aria-label={`${reason} 제거`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Stop Reasons */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            중지하는 이유
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={stopReasonInput}
              onChange={(e) => setStopReasonInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  handleAddStopReason()
                }
              }}
              disabled={(formData.stop_reasons || []).length >= 5}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
              placeholder="예: 알러지 의심"
            />
            <button
              type="button"
              onClick={handleAddStopReason}
              disabled={(formData.stop_reasons || []).length >= 5}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              추가
            </button>
          </div>
          {formData.stop_reasons && formData.stop_reasons.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.stop_reasons.map((reason) => (
                <span
                  key={reason}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-rose-50 text-rose-700 rounded-full text-xs"
                >
                  {reason}
                  <button
                    type="button"
                    onClick={() => handleRemoveStopReason(reason)}
                    className="hover:text-rose-900"
                    aria-label={`${reason} 제거`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Excerpt */}
        <div>
          <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-2">
            후기 요약 <span className="text-red-500">*</span>
          </label>
          <textarea
            id="excerpt"
            value={formData.excerpt || ''}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            required
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base resize-none"
            placeholder="2-3줄로 간단히 요약해주세요"
          />
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-2">
            상세 메모 (선택사항)
          </label>
          <textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value || null })}
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base resize-none"
            placeholder="급여 이유, 관찰된 변화, 수의사 코멘트 등을 자세히 적어주세요"
          />
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            disabled={isLoading}
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex-1 px-4 py-3 bg-[#3056F5] text-white rounded-xl font-medium hover:bg-[#2648e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>{editData ? '수정 중...' : '작성 중...'}</span>
              </>
            ) : (
              <span>{editData ? '수정하기' : '작성하기'}</span>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}

