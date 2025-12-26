'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2, Plus, X as XIcon } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'
import type { Database } from '@/lib/types/database'

type ReviewLog = Database['public']['Tables']['review_logs']['Row']
type ReviewLogInsert = Database['public']['Tables']['review_logs']['Insert']
type Pet = Database['public']['Tables']['pets']['Row']

interface ReviewLogFormProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  editData?: ReviewLog | null
  pets: Pet[]
}

/**
 * Form for creating/editing review logs
 */
export default function ReviewLogForm({
  isOpen,
  onClose,
  onSuccess,
  editData,
  pets
}: ReviewLogFormProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState<Partial<ReviewLogInsert>>({
    pet_id: '',
    category: 'feed',
    brand: '',
    product: '',
    product_id: null,  // 🆕 제품 ID
    status: 'feeding',
    period_start: new Date().toISOString().split('T')[0],
    period_end: null,
    rating: null,
    palatability_score: null,  // 🆕 기호성
    digestibility_score: null,  // 🆕 소화력
    coat_quality_score: null,  // 🆕 털 상태
    stool_quality_score: null,  // 🆕 변 상태
    recommend: null,
    continue_reasons: [],
    stop_reasons: [],
    excerpt: '',
    notes: null
  })

  const [continueReasonInput, setContinueReasonInput] = useState('')
  const [stopReasonInput, setStopReasonInput] = useState('')

  // Load edit data
  useEffect(() => {
    if (editData) {
      setFormData({
        pet_id: editData.pet_id,
        category: editData.category,
        brand: editData.brand,
        product: editData.product,
        product_id: editData.product_id || null,
        status: editData.status,
        period_start: editData.period_start,
        period_end: editData.period_end || null,
        rating: editData.rating || null,
        palatability_score: editData.palatability_score || null,
        digestibility_score: editData.digestibility_score || null,
        coat_quality_score: editData.coat_quality_score || null,
        stool_quality_score: editData.stool_quality_score || null,
        recommend: editData.recommend ?? null,
        continue_reasons: editData.continue_reasons || [],
        stop_reasons: editData.stop_reasons || [],
        excerpt: editData.excerpt,
        notes: editData.notes || null
      })
    } else {
      // Reset form
      setFormData({
        pet_id: pets.length > 0 ? pets[0].id : '',
        category: 'feed',
        brand: '',
        product: '',
        product_id: null,
        status: 'feeding',
        period_start: new Date().toISOString().split('T')[0],
        period_end: null,
        rating: null,
        palatability_score: null,
        digestibility_score: null,
        coat_quality_score: null,
        stool_quality_score: null,
        recommend: null,
        continue_reasons: [],
        stop_reasons: [],
        excerpt: '',
        notes: null
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
        product_id: formData.product_id || null,  // 🆕 제품 ID
        status: formData.status as 'feeding' | 'paused' | 'completed',
        period_start: formData.period_start as string,
        period_end: formData.period_end || null,
        duration_days: durationDays,
        rating: formData.rating ? Number(formData.rating) : null,
        palatability_score: formData.palatability_score ? Number(formData.palatability_score) : null,  // 🆕
        digestibility_score: formData.digestibility_score ? Number(formData.digestibility_score) : null,  // 🆕
        coat_quality_score: formData.coat_quality_score ? Number(formData.coat_quality_score) : null,  // 🆕
        stool_quality_score: formData.stool_quality_score ? Number(formData.stool_quality_score) : null,  // 🆕
        recommend: formData.recommend ?? null,
        continue_reasons: formData.continue_reasons && formData.continue_reasons.length > 0 ? formData.continue_reasons : null,
        stop_reasons: formData.stop_reasons && formData.stop_reasons.length > 0 ? formData.stop_reasons : null,
        excerpt: formData.excerpt as string,
        notes: formData.notes || null,
        likes: editData?.likes || 0,
        views: editData?.views || 0,
        comments_count: editData?.comments_count || 0
      }

      if (editData) {
        // Update
        const { error: updateError } = await supabase
          .from('review_logs')
          .update(data)
          .eq('id', editData.id)

        if (updateError) {
          setError(updateError.message || '수정에 실패했습니다.')
          setIsLoading(false)
          return
        }
      } else {
        // Insert
        const { error: insertError } = await supabase
          .from('review_logs')
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
      if (!reasons.includes(continueReasonInput.trim())) {
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
      if (!reasons.includes(stopReasonInput.trim())) {
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

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm"
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
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm"
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
                min={formData.period_start || undefined}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm"
              />
            </div>

            {/* 세부 평가 항목 */}
            <div className="space-y-4 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-100">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <span className="text-white text-sm font-bold">⭐</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900">세부 평가</h3>
                <span className="text-xs text-gray-500 ml-auto">제품 상세 페이지에 반영됩니다</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-4 rounded-lg">
                {/* 기호성 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    🍖 기호성
                  </label>
                  <p className="text-xs text-gray-500 mb-3">반려동물이 잘 먹나요?</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, palatability_score: star })}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <span className={`text-3xl ${
                          formData.palatability_score && star <= formData.palatability_score
                            ? 'filter-none'
                            : 'opacity-30'
                        }`}>
                          ⭐
                        </span>
                      </button>
                    ))}
                  </div>
                  {formData.palatability_score && (
                    <p className="text-sm font-medium text-blue-600 mt-2">
                      {formData.palatability_score}.0 / 5.0
                    </p>
                  )}
                </div>

                {/* 소화력 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💚 소화력
                  </label>
                  <p className="text-xs text-gray-500 mb-3">소화를 잘 시키나요?</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, digestibility_score: star })}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <span className={`text-3xl ${
                          formData.digestibility_score && star <= formData.digestibility_score
                            ? 'filter-none'
                            : 'opacity-30'
                        }`}>
                          ⭐
                        </span>
                      </button>
                    ))}
                  </div>
                  {formData.digestibility_score && (
                    <p className="text-sm font-medium text-blue-600 mt-2">
                      {formData.digestibility_score}.0 / 5.0
                    </p>
                  )}
                </div>

                {/* 털 상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    ✨ 털 상태
                  </label>
                  <p className="text-xs text-gray-500 mb-3">털이 윤기나고 건강한가요?</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, coat_quality_score: star })}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <span className={`text-3xl ${
                          formData.coat_quality_score && star <= formData.coat_quality_score
                            ? 'filter-none'
                            : 'opacity-30'
                        }`}>
                          ⭐
                        </span>
                      </button>
                    ))}
                  </div>
                  {formData.coat_quality_score && (
                    <p className="text-sm font-medium text-blue-600 mt-2">
                      {formData.coat_quality_score}.0 / 5.0
                    </p>
                  )}
                </div>

                {/* 변 상태 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    💩 변 상태
                  </label>
                  <p className="text-xs text-gray-500 mb-3">변이 건강한가요?</p>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setFormData({ ...formData, stool_quality_score: star })}
                        className="transition-transform hover:scale-110 focus:outline-none"
                      >
                        <span className={`text-3xl ${
                          formData.stool_quality_score && star <= formData.stool_quality_score
                            ? 'filter-none'
                            : 'opacity-30'
                        }`}>
                          ⭐
                        </span>
                      </button>
                    ))}
                  </div>
                  {formData.stool_quality_score && (
                    <p className="text-sm font-medium text-blue-600 mt-2">
                      {formData.stool_quality_score}.0 / 5.0
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* 전체 만족도 */}
            <div className="p-6 bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl border-2 border-yellow-100">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ⭐ 전체 만족도
              </label>
              <p className="text-xs text-gray-500 mb-3">전반적으로 만족하시나요?</p>
              <div className="flex gap-3 justify-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData({ ...formData, rating: star })}
                    className="transition-transform hover:scale-110 focus:outline-none"
                  >
                    <span className={`text-5xl ${
                      formData.rating && star <= formData.rating
                        ? 'filter-none'
                        : 'opacity-30'
                    }`}>
                      ⭐
                    </span>
                  </button>
                ))}
              </div>
              {formData.rating && (
                <p className="text-lg font-bold text-orange-600 mt-4 text-center">
                  {formData.rating}.0 / 5.0
                </p>
              )}
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm"
                  placeholder="예: 변 상태 개선"
                />
                <button
                  type="button"
                  onClick={handleAddContinueReason}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm"
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
                      >
                        <XIcon className="h-3 w-3" />
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
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm"
                  placeholder="예: 알러지 의심"
                />
                <button
                  type="button"
                  onClick={handleAddStopReason}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm"
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
                      >
                        <XIcon className="h-3 w-3" />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm resize-none"
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
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm resize-none"
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
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

