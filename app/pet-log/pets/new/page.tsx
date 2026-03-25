'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  PawPrint,
  Calendar,
  User,
  Heart,
  AlertCircle
} from 'lucide-react'

interface PetFormData {
  name: string
  species: 'dog' | 'cat' | ''
  birthYear: number | ''
  gender: 'male' | 'female' | ''
  neutered: boolean
  breed: string
  weight: number | ''
  allergies: string[]
  healthConditions: string[]
  specialNotes: string
}

export default function NewPetPage() {
  const router = useRouter()
  const [formData, setFormData] = useState<PetFormData>({
    name: '',
    species: '',
    birthYear: '',
    gender: '',
    neutered: false,
    breed: '',
    weight: '',
    allergies: [],
    healthConditions: [],
    specialNotes: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 25 }, (_, i) => currentYear - i)

  const commonAllergies = [
    '닭고기', '쇠고기', '돼지고기', '양고기', '생선', '달걀', '유제품', 
    '밀', '옥수수', '콩', '견과류', '특정 첨가물'
  ]

  const commonHealthConditions = [
    '비만', '당뇨', '신장질환', '심장질환', '관절염', '알레르기성 피부염',
    '소화기 질환', '갑상선 질환', '간질환', '요로결석', '치주질환'
  ]

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = '반려동물 이름을 입력해주세요.'
    }

    if (!formData.species) {
      newErrors.species = '반려동물 종류를 선택해주세요.'
    }

    if (!formData.birthYear) {
      newErrors.birthYear = '출생연도를 선택해주세요.'
    } else if (formData.birthYear > currentYear || formData.birthYear < currentYear - 25) {
      newErrors.birthYear = '올바른 출생연도를 선택해주세요.'
    }

    if (!formData.gender) {
      newErrors.gender = '성별을 선택해주세요.'
    }

    if (formData.weight && (formData.weight <= 0 || formData.weight > 100)) {
      newErrors.weight = '올바른 체중을 입력해주세요. (0.1kg ~ 100kg)'
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
      // 반려동물 프로필 ID 생성
      const petId = `pet-${Date.now()}`
      const now = new Date().toISOString().split('T')[0]
      
      // 나이 계산 (출생연도 기준)
      const age = formData.birthYear ? (new Date().getFullYear() - formData.birthYear) : 0
      const ageString = age > 0 ? `${age}세` : '0세'
      
      // 반려동물 프로필 데이터 구성
      const petProfile = {
        id: petId,
        name: formData.name,
        species: formData.species,
        birthYear: formData.birthYear,
        age: ageString,
        gender: formData.gender,
        neutered: formData.neutered,
        breed: formData.breed || '미상',
        weight: formData.weight ? `${formData.weight}kg` : '',
        allergies: formData.allergies,
        healthConditions: formData.healthConditions,
        specialNotes: formData.specialNotes,
        createdAt: now,
        updatedAt: now,
        ownerId: 'current-user', // 실제로는 세션에서 가져옴
        ownerName: '현재 사용자' // 실제로는 세션에서 가져옴
      }
      
      // 로컬 스토리지에 저장
      try {
        const existingPets = JSON.parse(localStorage.getItem('petProfiles') || '[]')
        const updatedPets = [...existingPets, petProfile]
        localStorage.setItem('petProfiles', JSON.stringify(updatedPets))
      } catch (storageError) {
        console.error('저장 중 오류:', storageError)
        alert('반려동물 정보 저장 중 오류가 발생했습니다.')
        setSaving(false)
        return
      }
      
      // 성공 시 급여 기록 작성 페이지로 리다이렉트 (선택한 반려동물과 함께)
      router.push(`/pet-log/posts/write?petId=${petId}`)
    } catch (error) {
      console.error('Error saving pet:', error)
      alert('반려동물 등록 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleAllergyToggle = (allergy: string) => {
    setFormData(prev => {
      if (allergy === '없음') {
        // '없음' 클릭 시: 이미 있으면 제거, 없으면 다른 모든 항목 제거하고 '없음'만 추가
        return {
          ...prev,
          allergies: prev.allergies.includes('없음') ? [] : ['없음']
        }
      } else {
        // 다른 항목 클릭 시: '없음' 제거하고 해당 항목 토글
        const withoutNone = prev.allergies.filter(a => a !== '없음')
        return {
          ...prev,
          allergies: withoutNone.includes(allergy)
            ? withoutNone.filter(a => a !== allergy)
            : [...withoutNone, allergy]
        }
      }
    })
  }

  const handleHealthConditionToggle = (condition: string) => {
    setFormData(prev => {
      if (condition === '없음') {
        // '없음' 클릭 시: 이미 있으면 제거, 없으면 다른 모든 항목 제거하고 '없음'만 추가
        return {
          ...prev,
          healthConditions: prev.healthConditions.includes('없음') ? [] : ['없음']
        }
      } else {
        // 다른 항목 클릭 시: '없음' 제거하고 해당 항목 토글
        const withoutNone = prev.healthConditions.filter(c => c !== '없음')
        return {
          ...prev,
          healthConditions: withoutNone.includes(condition)
            ? withoutNone.filter(c => c !== condition)
            : [...withoutNone, condition]
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/pet-log" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <PawPrint className="h-6 w-6 text-purple-500" />
                새 반려동물 등록
              </h1>
              <p className="text-gray-600">우리 아이의 정보를 등록하고 급여 이력을 관리해보세요</p>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-500" />
              기본 정보
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="우리 아이의 이름을 입력하세요"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  종류 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.species}
                  onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value as 'dog' | 'cat' | '' }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.species ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">선택하세요</option>
                  <option value="dog">강아지 🐕</option>
                  <option value="cat">고양이 🐱</option>
                </select>
                {errors.species && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.species}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  출생연도 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.birthYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthYear: e.target.value ? parseInt(e.target.value) : '' }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.birthYear ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">선택하세요</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}년</option>
                  ))}
                </select>
                {errors.birthYear && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.birthYear}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  성별 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | '' }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.gender ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">선택하세요</option>
                  <option value="male">수컷</option>
                  <option value="female">암컷</option>
                </select>
                {errors.gender && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.gender}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">품종</label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="예: 골든리트리버, 페르시안 등"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">체중 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value ? parseFloat(e.target.value) : '' }))}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    errors.weight ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="0.0"
                />
                {errors.weight && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.weight}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={formData.neutered}
                  onChange={(e) => setFormData(prev => ({ ...prev, neutered: e.target.checked }))}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700">중성화 수술을 받았어요</span>
              </label>
            </div>
          </div>

          {/* Health Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="h-5 w-5 text-red-500" />
              건강 정보
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">알레르기</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {commonAllergies.map(allergy => (
                    <label key={allergy} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.allergies.includes(allergy)}
                        onChange={() => handleAllergyToggle(allergy)}
                        className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">{allergy}</span>
                    </label>
                  ))}
                  {/* 없음 체크박스 - 맨 마지막 */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.allergies.includes('없음')}
                      onChange={() => handleAllergyToggle('없음')}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">없음</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">건강 상태</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                  {commonHealthConditions.map(condition => (
                    <label key={condition} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.healthConditions.includes(condition)}
                        onChange={() => handleHealthConditionToggle(condition)}
                        className="w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{condition}</span>
                    </label>
                  ))}
                  {/* 없음 체크박스 - 맨 마지막 */}
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.healthConditions.includes('없음')}
                      onChange={() => handleHealthConditionToggle('없음')}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <span className="text-sm text-gray-700 font-medium">없음</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">특이사항</label>
                <textarea
                  value={formData.specialNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialNotes: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="우리 아이만의 특별한 점이나 주의사항을 적어주세요"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-6 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              취소
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-purple-400 transition-colors flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {saving ? '저장 중...' : '등록하기'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
