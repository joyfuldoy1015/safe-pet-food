'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'

interface PetAddModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

/**
 * Modal for adding a new pet
 */
export default function PetAddModal({ isOpen, onClose, onSuccess }: PetAddModalProps) {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    name: '',
    species: 'dog' as 'dog' | 'cat',
    birthDate: '',
    weightKg: '',
    tags: [] as string[]
  })

  const [tagInput, setTagInput] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setError(null)
    setIsLoading(true)

    try {
      const supabase = getBrowserClient()

      const { data, error: insertError } = await supabase
        .from('pets')
        .insert({
          owner_id: user.id,
          name: formData.name,
          species: formData.species,
          birth_date: formData.birthDate,
          weight_kg: formData.weightKg ? parseFloat(formData.weightKg) : null,
          tags: formData.tags.length > 0 ? formData.tags : null
        } as any)
        .select()
        .single()

      if (insertError) {
        setError(insertError.message || '반려동물 추가에 실패했습니다.')
        setIsLoading(false)
        return
      }

      // Reset form
      setFormData({
        name: '',
        species: 'dog',
        birthDate: '',
        weightKg: '',
        tags: []
      })
      setTagInput('')
      onSuccess()
      onClose()
    } catch (err) {
      setError('예상치 못한 오류가 발생했습니다.')
      setIsLoading(false)
    }
  }

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...formData.tags, tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const handleRemoveTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(t => t !== tag)
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
          className="relative bg-white rounded-3xl shadow-2xl w-full max-w-md p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">반려동물 추가</h2>
            <p className="text-sm text-gray-600">새로운 반려동물 정보를 입력해주세요</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base"
                placeholder="예: 뽀미"
              />
            </div>

            {/* Species */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종류 <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, species: 'dog' })}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 transition-colors ${
                    formData.species === 'dog'
                      ? 'border-[#3056F5] bg-blue-50 text-[#3056F5]'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  🐕 강아지
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, species: 'cat' })}
                  className={`flex-1 px-4 py-3 rounded-xl border-2 transition-colors ${
                    formData.species === 'cat'
                      ? 'border-[#3056F5] bg-blue-50 text-[#3056F5]'
                      : 'border-gray-300 text-gray-700 hover:border-gray-400'
                  }`}
                >
                  🐱 고양이
                </button>
              </div>
            </div>

            {/* Birth Date */}
            <div>
              <label htmlFor="birthDate" className="block text-sm font-medium text-gray-700 mb-2">
                생년월일 <span className="text-red-500">*</span>
              </label>
              <input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => setFormData({ ...formData, birthDate: e.target.value })}
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base"
              />
            </div>

            {/* Weight */}
            <div>
              <label htmlFor="weightKg" className="block text-sm font-medium text-gray-700 mb-2">
                체중 (kg)
              </label>
              <input
                id="weightKg"
                type="number"
                step="0.1"
                min="0"
                value={formData.weightKg}
                onChange={(e) => setFormData({ ...formData, weightKg: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base"
                placeholder="예: 6.5"
              />
            </div>

            {/* Tags */}
            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-2">
                태그 (선택사항)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  id="tags"
                  type="text"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddTag()
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base"
                  placeholder="예: 알러지-닭고기"
                />
                <button
                  type="button"
                  onClick={handleAddTag}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm"
                >
                  추가
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag) => (
                    <span
                      key={tag}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => handleRemoveTag(tag)}
                        className="hover:text-blue-900"
                      >
                        ×
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
                    <span>추가 중...</span>
                  </>
                ) : (
                  <span>추가하기</span>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

