'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, User } from 'lucide-react'

interface WriteReviewModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    brand: string
    productName: string
    category: '사료' | '간식' | '영양제' | '화장실'
    rating: number
    status: '급여중' | '급여완료' | '급여중지'
    summary: string
    petInfo: {
      species: 'dog' | 'cat'
      breed: string
      age: string
      weight: string
    }
    isRecommended: boolean
  }) => void
}

export default function WriteReviewModal({
  isOpen,
  onClose,
  onSubmit
}: WriteReviewModalProps) {
  const [brand, setBrand] = useState('')
  const [productName, setProductName] = useState('')
  const [category, setCategory] = useState<'사료' | '간식' | '영양제' | '화장실'>('사료')
  const [rating, setRating] = useState(5)
  const [status, setStatus] = useState<'급여중' | '급여완료' | '급여중지'>('급여중')
  const [summary, setSummary] = useState('')
  const [petSpecies, setPetSpecies] = useState<'dog' | 'cat'>('dog')
  const [petBreed, setPetBreed] = useState('')
  const [petAge, setPetAge] = useState('')
  const [petWeight, setPetWeight] = useState('')
  const [isRecommended, setIsRecommended] = useState(true)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!brand.trim() || !productName.trim() || !summary.trim()) {
      return
    }

    onSubmit({
      brand: brand.trim(),
      productName: productName.trim(),
      category,
      rating,
      status,
      summary: summary.trim(),
      petInfo: {
        species: petSpecies,
        breed: petBreed.trim(),
        age: petAge.trim(),
        weight: petWeight.trim()
      },
      isRecommended
    })

    // Reset form
    setBrand('')
    setProductName('')
    setCategory('사료')
    setRating(5)
    setStatus('급여중')
    setSummary('')
    setPetSpecies('dog')
    setPetBreed('')
    setPetAge('')
    setPetWeight('')
    setIsRecommended(true)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-strong pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">후기 작성</h2>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Brand & Product */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      브랜드 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={brand}
                      onChange={(e) => setBrand(e.target.value)}
                      placeholder="예: 로얄캐닌"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5]"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제품명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                      placeholder="예: 어덜트 라지 브리드"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5]"
                      required
                    />
                  </div>
                </div>

                {/* Category & Status */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value as typeof category)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5]"
                      required
                    >
                      <option value="사료">🍽️ 사료</option>
                      <option value="간식">🦴 간식</option>
                      <option value="영양제">💊 영양제</option>
                      <option value="화장실">🚽 화장실</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      급여 상태 <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={status}
                      onChange={(e) => setStatus(e.target.value as typeof status)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5]"
                      required
                    >
                      <option value="급여중">급여중</option>
                      <option value="급여완료">급여완료</option>
                      <option value="급여중지">급여중지</option>
                    </select>
                  </div>
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    평점 <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setRating(i + 1)}
                        className="focus:outline-none"
                      >
                        <Star
                          className={`h-8 w-8 transition-colors ${
                            i < rating
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-lg font-bold text-gray-900">{rating}.0</span>
                  </div>
                </div>

                {/* Pet Info */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      반려동물 종류
                    </label>
                    <select
                      value={petSpecies}
                      onChange={(e) => setPetSpecies(e.target.value as typeof petSpecies)}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5]"
                    >
                      <option value="dog">🐕 강아지</option>
                      <option value="cat">🐱 고양이</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      품종
                    </label>
                    <input
                      type="text"
                      value={petBreed}
                      onChange={(e) => setPetBreed(e.target.value)}
                      placeholder="예: 골든 리트리버"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      나이
                    </label>
                    <input
                      type="text"
                      value={petAge}
                      onChange={(e) => setPetAge(e.target.value)}
                      placeholder="예: 3세"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      체중
                    </label>
                    <input
                      type="text"
                      value={petWeight}
                      onChange={(e) => setPetWeight(e.target.value)}
                      placeholder="예: 28kg"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5]"
                    />
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    후기 내용 <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="급여 경험을 자세히 작성해주세요..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] resize-none"
                    required
                  />
                </div>

                {/* Recommendation */}
                <div className="flex items-center space-x-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isRecommended}
                      onChange={(e) => setIsRecommended(e.target.checked)}
                      className="h-4 w-4 text-[#3056F5] focus:ring-[#3056F5] border-gray-300 rounded"
                    />
                    <span className="text-sm text-gray-700">이 제품을 추천합니다</span>
                  </label>
                </div>

                {/* Actions */}
                <div className="flex space-x-3 pt-4 border-t border-gray-200">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={onClose}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium"
                  >
                    취소
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="flex-1 px-4 py-3 bg-[#3056F5] text-white rounded-xl hover:bg-[#2545D4] transition-colors font-medium"
                  >
                    후기 등록
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
