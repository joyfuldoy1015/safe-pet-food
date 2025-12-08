'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Shield, Loader2, LogIn } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'

interface SafiEvaluationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  brandName: string
  productName?: string
  onSuccess?: () => void
}

interface SafiFormData {
  stoolScore: number | null
  allergySymptoms: string[]
  vomiting: boolean | null
  appetiteChange: 'INCREASED' | 'NORMAL' | 'DECREASED' | 'REFUSED' | null
}

/**
 * SAFI 평가 전용 다이얼로그
 * 로그인한 회원만 평가할 수 있음
 */
export default function SafiEvaluationDialog({
  open,
  onOpenChange,
  brandName,
  productName,
  onSuccess
}: SafiEvaluationDialogProps) {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [allergySymptomInput, setAllergySymptomInput] = useState('')

  const [formData, setFormData] = useState<SafiFormData>({
    stoolScore: null,
    allergySymptoms: [],
    vomiting: null,
    appetiteChange: null
  })

  const handleClose = () => {
    setFormData({
      stoolScore: null,
      allergySymptoms: [],
      vomiting: null,
      appetiteChange: null
    })
    setAllergySymptomInput('')
    setError(null)
    onOpenChange(false)
  }

  const handleAddAllergySymptom = () => {
    if (allergySymptomInput.trim() && !formData.allergySymptoms.includes(allergySymptomInput.trim())) {
      setFormData({
        ...formData,
        allergySymptoms: [...formData.allergySymptoms, allergySymptomInput.trim()]
      })
      setAllergySymptomInput('')
    }
  }

  const handleRemoveAllergySymptom = (symptom: string) => {
    setFormData({
      ...formData,
      allergySymptoms: formData.allergySymptoms.filter(s => s !== symptom)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      setError('로그인이 필요합니다.')
      return
    }

    setError(null)
    setIsLoading(true)

    try {
      // TODO: API 호출로 SAFI 평가 데이터 저장
      // 현재는 로컬에서만 처리
      console.log('SAFI 평가 제출:', {
        brandName,
        productName,
        ...formData
      })

      // 성공 처리
      if (onSuccess) {
        onSuccess()
      }
      
      handleClose()
      
      // 성공 메시지 (실제로는 토스트 사용)
      alert('SAFI 평가가 등록되었습니다. 감사합니다!')
    } catch (err) {
      console.error('SAFI 평가 등록 오류:', err)
      setError('평가 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLoginClick = () => {
    handleClose()
    router.push(`/login?redirect=/brands/${encodeURIComponent(brandName)}`)
  }

  if (!open) return null

  // 로그인 체크
  const showLoginRequired = !authLoading && !user

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
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col p-6 sm:p-8"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="닫기"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          {authLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#3056F5]" />
            </div>
          ) : showLoginRequired ? (
            // Login Required View
            <div className="text-center py-8">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                <LogIn className="h-8 w-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                로그인이 필요합니다
              </h2>
              <p className="text-sm text-gray-600 mb-6">
                SAFI 평가를 하려면 로그인이 필요합니다.
              </p>
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
            // SAFI Evaluation Form
            <div className="flex-1 overflow-y-auto -mx-6 sm:-mx-8 px-6 sm:px-8">
              <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Shield className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                      SAFI 안전성 평가
                    </h2>
                    <p className="text-sm text-gray-600">
                      {brandName} {productName && `· ${productName}`}
                    </p>
                  </div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  제품의 안전성을 평가하는 데 도움이 됩니다. 정확한 평가를 위해 실제 경험을 바탕으로 작성해주세요.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Stool Score */}
                <div>
                  <label htmlFor="stool_score" className="block text-sm font-medium text-gray-700 mb-2">
                    변 상태 점수 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">급여 기간 동안의 평균적인 변 상태를 평가해주세요</p>
                  <div className="space-y-2">
                    {[1, 2, 3, 4, 5].map((score) => (
                      <button
                        key={score}
                        type="button"
                        onClick={() => setFormData({ ...formData, stoolScore: score })}
                        className={`w-full px-4 py-3 rounded-xl border-2 transition-colors text-sm font-medium flex items-center justify-between ${
                          formData.stoolScore === score
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">{score}점</span>
                          {score === 1 && <span className="text-xs text-gray-500">매우 나쁨</span>}
                          {score === 2 && <span className="text-xs text-gray-500">나쁨</span>}
                          {score === 3 && <span className="text-xs text-gray-500">보통</span>}
                          {score === 4 && <span className="text-xs text-gray-500">좋음</span>}
                          {score === 5 && <span className="text-xs text-gray-500">매우 좋음</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Appetite Change */}
                <div>
                  <label htmlFor="appetite_change" className="block text-sm font-medium text-gray-700 mb-2">
                    식욕 변화 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">이 제품 급여 후 식욕 변화를 선택해주세요</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'INCREASED', label: '증가함', emoji: '📈' },
                      { value: 'NORMAL', label: '정상', emoji: '✅' },
                      { value: 'DECREASED', label: '감소함', emoji: '📉' },
                      { value: 'REFUSED', label: '거부함', emoji: '❌' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setFormData({ ...formData, appetiteChange: option.value as any })}
                        className={`px-4 py-3 rounded-xl border-2 transition-colors text-sm ${
                          formData.appetiteChange === option.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-300 text-gray-700 hover:border-gray-400'
                        }`}
                      >
                        <span className="text-lg">{option.emoji}</span>
                        <div className="mt-1 font-medium">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Vomiting */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    구토 발생 여부 <span className="text-red-500">*</span>
                  </label>
                  <p className="text-xs text-gray-500 mb-3">이 제품 급여 중 구토가 발생했는지 선택해주세요</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, vomiting: true })}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 transition-colors ${
                        formData.vomiting === true
                          ? 'border-red-500 bg-red-50 text-red-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <span className="text-lg">🤢</span>
                      <div className="mt-1 font-medium">발생함</div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, vomiting: false })}
                      className={`flex-1 px-4 py-3 rounded-xl border-2 transition-colors ${
                        formData.vomiting === false
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      <span className="text-lg">✅</span>
                      <div className="mt-1 font-medium">발생 안 함</div>
                    </button>
                  </div>
                </div>

                {/* Allergy Symptoms */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    알레르기 증상 (선택사항)
                  </label>
                  <p className="text-xs text-gray-500 mb-3">발생한 알레르기 증상을 입력해주세요 (예: 가려움, 발진, 눈물)</p>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      value={allergySymptomInput}
                      onChange={(e) => setAllergySymptomInput(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          handleAddAllergySymptom()
                        }
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm"
                      placeholder="예: 가려움, 발진"
                    />
                    <button
                      type="button"
                      onClick={handleAddAllergySymptom}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm"
                    >
                      추가
                    </button>
                  </div>
                  {formData.allergySymptoms.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {formData.allergySymptoms.map((symptom) => (
                        <span
                          key={symptom}
                          className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs border border-orange-200"
                        >
                          {symptom}
                          <button
                            type="button"
                            onClick={() => handleRemoveAllergySymptom(symptom)}
                            className="hover:text-orange-900"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">
                    {error}
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                    disabled={isLoading}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading || formData.stoolScore === null || formData.vomiting === null || formData.appetiteChange === null}
                    className="flex-1 px-4 py-3 bg-[#3056F5] text-white rounded-xl font-medium hover:bg-[#2648e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>등록 중...</span>
                      </>
                    ) : (
                      <span>평가 등록하기</span>
                    )}
                  </button>
                </div>
              </form>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

