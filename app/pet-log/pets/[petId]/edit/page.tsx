'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Save,
  Trash2,
  AlertCircle
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'
import type { Database } from '@/lib/types/database'

type Pet = Database['public']['Tables']['pets']['Row']

interface PetFormData {
  name: string
  species: 'dog' | 'cat'
  birth_date: string
  weight_kg: number | null
  tags: string[]
  avatar_url: string | null
}

export default function EditPetPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const petId = params.petId as string

  const [pet, setPet] = useState<Pet | null>(null)
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    species: 'dog',
    birth_date: '',
    weight_kg: null,
    tags: [],
    avatar_url: null
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [isLoadingPet, setIsLoadingPet] = useState(true)
  const [newTag, setNewTag] = useState('')

  // 반려동물 정보 로드
  useEffect(() => {
    const loadPet = async () => {
      setIsLoadingPet(true)
      
      try {
        const supabase = getBrowserClient()
        const { data, error } = await supabase
          .from('pets')
          .select('*')
          .eq('id', petId)
          .single()

        if (error || !data) {
          console.error('Failed to load pet:', error)
          alert('반려동물 정보를 불러올 수 없습니다.')
          router.push('/profile')
          return
        }

        // 소유자 확인
        if (user && data.owner_id !== user.id) {
          alert('이 반려동물 정보를 수정할 권한이 없습니다.')
          router.push('/profile')
          return
        }

        setPet(data)
        setFormData({
          name: data.name,
          species: data.species,
          birth_date: data.birth_date,
          weight_kg: data.weight_kg,
          tags: data.tags || [],
          avatar_url: data.avatar_url
        })
      } catch (error) {
        console.error('Error loading pet:', error)
        alert('반려동물 정보를 불러오는 중 오류가 발생했습니다.')
        router.push('/profile')
      } finally {
        setIsLoadingPet(false)
      }
    }

    if (petId && !authLoading) {
      if (!user) {
        router.push('/login?redirect=' + encodeURIComponent(`/pet-log/pets/${petId}/edit`))
        return
      }
      loadPet()
    }
  }, [petId, user, authLoading, router])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '반려동물 이름을 입력해주세요.'
    }

    if (!formData.birth_date) {
      newErrors.birth_date = '생년월일을 입력해주세요.'
    }

    if (formData.weight_kg && (formData.weight_kg <= 0 || formData.weight_kg > 100)) {
      newErrors.weight_kg = '올바른 체중을 입력해주세요. (0.1kg ~ 100kg)'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    setSaving(true)

    try {
      const supabase = getBrowserClient()
      const { error } = await supabase
        .from('pets')
        .update({
          name: formData.name.trim(),
          species: formData.species,
          birth_date: formData.birth_date,
          weight_kg: formData.weight_kg,
          tags: formData.tags,
          avatar_url: formData.avatar_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', petId)

      if (error) {
        console.error('Failed to update pet:', error)
        alert('반려동물 정보 수정에 실패했습니다.')
        return
      }

      alert('반려동물 정보가 수정되었습니다.')
      router.push(`/pet-log/pets/${petId}`)
    } catch (error) {
      console.error('Error updating pet:', error)
      alert('반려동물 정보 수정 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`정말로 ${pet?.name}의 정보를 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없으며, 관련된 모든 급여 후기도 삭제될 수 있습니다.`)) {
      return
    }

    setDeleting(true)

    try {
      const supabase = getBrowserClient()
      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId)

      if (error) {
        console.error('Failed to delete pet:', error)
        alert('반려동물 정보 삭제에 실패했습니다.')
        return
      }

      alert('반려동물 정보가 삭제되었습니다.')
      router.push('/profile')
    } catch (error) {
      console.error('Error deleting pet:', error)
      alert('반려동물 정보 삭제 중 오류가 발생했습니다.')
    } finally {
      setDeleting(false)
    }
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }))
  }

  // 로딩 중
  if (isLoadingPet || authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!pet) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>돌아가기</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            반려동물 정보 수정
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8">
          <div className="space-y-6">
            {/* 이름 */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                이름 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="반려동물 이름"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* 종류 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                종류 <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, species: 'dog' }))}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.species === 'dog'
                      ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                  }`}
                >
                  🐶 강아지
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, species: 'cat' }))}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    formData.species === 'cat'
                      ? 'border-purple-600 bg-purple-50 text-purple-700 font-semibold'
                      : 'border-gray-300 bg-white text-gray-700 hover:border-purple-300'
                  }`}
                >
                  🐱 고양이
                </button>
              </div>
            </div>

            {/* 생년월일 */}
            <div>
              <label htmlFor="birth_date" className="block text-sm font-medium text-gray-700 mb-2">
                생년월일 <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                id="birth_date"
                value={formData.birth_date}
                onChange={(e) => setFormData(prev => ({ ...prev, birth_date: e.target.value }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.birth_date ? 'border-red-500' : 'border-gray-300'
                }`}
                max={new Date().toISOString().split('T')[0]}
              />
              {errors.birth_date && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.birth_date}
                </p>
              )}
            </div>

            {/* 체중 */}
            <div>
              <label htmlFor="weight_kg" className="block text-sm font-medium text-gray-700 mb-2">
                체중 (kg)
              </label>
              <input
                type="number"
                id="weight_kg"
                step="0.1"
                min="0.1"
                max="100"
                value={formData.weight_kg || ''}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  weight_kg: e.target.value ? parseFloat(e.target.value) : null 
                }))}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                  errors.weight_kg ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="체중 (선택사항)"
              />
              {errors.weight_kg && (
                <p className="mt-1 text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.weight_kg}
                </p>
              )}
            </div>

            {/* 태그 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                태그 (특이사항, 알레르기 등)
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addTag()
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="태그 입력 후 엔터"
                />
                <button
                  type="button"
                  onClick={addTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  추가
                </button>
              </div>
              {formData.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium flex items-center gap-2"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => removeTag(tag)}
                        className="hover:text-purple-900"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3">
            <button
              type="button"
              onClick={() => router.back()}
              disabled={saving || deleting}
              className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving || deleting}
              className="flex-1 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {saving ? '저장 중...' : '저장'}
            </button>
          </div>

          {/* Delete Button */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={handleDelete}
              disabled={saving || deleting}
              className="w-full px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Trash2 className="w-4 h-4" />
              {deleting ? '삭제 중...' : '반려동물 정보 삭제'}
            </button>
            <p className="mt-2 text-sm text-gray-500 text-center">
              삭제된 정보는 복구할 수 없습니다.
            </p>
          </div>
        </form>
      </main>
    </div>
  )
}
