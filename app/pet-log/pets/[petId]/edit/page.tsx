'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Save, 
  PawPrint,
  Calendar,
  User,
  Heart,
  AlertCircle
} from 'lucide-react'

interface PetProfile {
  id: string
  name: string
  species: 'dog' | 'cat'
  birthYear: number
  age: string
  gender: 'male' | 'female'
  neutered: boolean
  breed: string
  weight: string
  allergies: string[]
  healthConditions: string[]
  specialNotes: string
  createdAt: string
  updatedAt: string
  ownerId: string
  ownerName: string
}

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

export default function EditPetPage() {
  const router = useRouter()
  const params = useParams()
  const petId = params?.petId as string

  const [loading, setLoading] = useState(true)
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

  // 반려동물 정보 로드
  useEffect(() => {
    if (!petId) return

    try {
      const savedPets = JSON.parse(localStorage.getItem('petProfiles') || '[]')
      const pet = savedPets.find((p: PetProfile) => p.id === petId)

      if (!pet) {
        alert('반려동물 정보를 찾을 수 없습니다.')
        router.push('/pet-log/pets')
        return
      }

      // weight에서 'kg' 제거하고 숫자만 추출
      const weightValue = pet.weight ? parseFloat(pet.weight.replace('kg', '').trim()) : ''

      setFormData({
        name: pet.name || '',
        species: pet.species || '',
        birthYear: pet.birthYear || '',
        gender: pet.gender || '',
        neutered: pet.neutered || false,
        breed: pet.breed || '',
        weight: weightValue,
        allergies: pet.allergies || [],
        healthConditions: pet.healthConditions || [],
        specialNotes: pet.specialNotes || ''
      })

      setLoading(false)
    } catch (error) {
      console.error('반려동물 정보 로드 중 오류:', error)
      alert('반려동물 정보를 불러오는 중 오류가 발생했습니다.')
      router.push('/pet-log/pets')
    }
  }, [petId, router])

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
      // 기존 반려동물 정보 로드
      const savedPets = JSON.parse(localStorage.getItem('petProfiles') || '[]')
      const petIndex = savedPets.findIndex((p: PetProfile) => p.id === petId)

      if (petIndex === -1) {
        alert('반려동물 정보를 찾을 수 없습니다.')
        router.push('/pet-log/pets')
        return
      }

      // 나이 계산 (출생연도 기준)
      const age = formData.birthYear ? (new Date().getFullYear() - formData.birthYear) : 0
      const ageString = age > 0 ? `${age}세` : '0세'
      
      // 반려동물 프로필 데이터 업데이트
      const updatedPet: PetProfile = {
        ...savedPets[petIndex],
        name: formData.name,
        species: formData.species as 'dog' | 'cat',
        birthYear: formData.birthYear as number,
        age: ageString,
        gender: formData.gender as 'male' | 'female',
        neutered: formData.neutered,
        breed: formData.breed || '미상',
        weight: formData.weight ? `${formData.weight}kg` : '',
        allergies: formData.allergies,
        healthConditions: formData.healthConditions,
        specialNotes: formData.specialNotes,
        updatedAt: new Date().toISOString().split('T')[0]
      }
      
      // 업데이트된 반려동물 목록 저장
      savedPets[petIndex] = updatedPet
      localStorage.setItem('petProfiles', JSON.stringify(savedPets))
      
      console.log('반려동물 프로필이 업데이트되었습니다:', updatedPet)
      
      // 성공 시 반려동물 관리 페이지로 리다이렉트
      router.push('/pet-log/pets')
    } catch (error) {
      console.error('Error updating pet:', error)
      alert('반려동물 정보 업데이트 중 오류가 발생했습니다.')
    } finally {
      setSaving(false)
    }
  }

  const handleAllergyToggle = (allergy: string) => {
    setFormData(prev => ({
      ...prev,
      allergies: prev.allergies.includes(allergy)
        ? prev.allergies.filter(a => a !== allergy)
        : [...prev.allergies, allergy]
    }))
  }

  const handleHealthConditionToggle = (condition: string) => {
    setFormData(prev => ({
      ...prev,
      healthConditions: prev.healthConditions.includes(condition)
        ? prev.healthConditions.filter(c => c !== condition)
        : [...prev.healthConditions, condition]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <PawPrint className="w-8 h-8 text-white" />
          </div>
          <p className="text-gray-600">정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-xl border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center gap-4">
            <Link 
              href="/pet-log/pets" 
              className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
            >
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <PawPrint className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 flex items-center gap-2">
                  반려동물 정보 수정
                </h1>
                <p className="text-gray-600 mt-1">반려동물의 정보를 수정할 수 있습니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              기본 정보
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.name ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="우리 아이의 이름을 입력하세요"
                />
                {errors.name && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.name}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  종류 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.species}
                  onChange={(e) => setFormData(prev => ({ ...prev, species: e.target.value as 'dog' | 'cat' | '' }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.species ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">선택하세요</option>
                  <option value="dog">강아지 🐕</option>
                  <option value="cat">고양이 🐱</option>
                </select>
                {errors.species && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.species}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  출생연도 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.birthYear}
                  onChange={(e) => setFormData(prev => ({ ...prev, birthYear: e.target.value ? parseInt(e.target.value) : '' }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.birthYear ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">선택하세요</option>
                  {years.map(year => (
                    <option key={year} value={year}>{year}년</option>
                  ))}
                </select>
                {errors.birthYear && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.birthYear}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  성별 <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' | '' }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.gender ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                >
                  <option value="">선택하세요</option>
                  <option value="male">수컷</option>
                  <option value="female">암컷</option>
                </select>
                {errors.gender && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.gender}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">품종</label>
                <input
                  type="text"
                  value={formData.breed}
                  onChange={(e) => setFormData(prev => ({ ...prev, breed: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="예: 골든리트리버, 페르시안 등"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">체중 (kg)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  max="100"
                  value={formData.weight}
                  onChange={(e) => setFormData(prev => ({ ...prev, weight: e.target.value ? parseFloat(e.target.value) : '' }))}
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 ${
                    errors.weight ? 'border-red-300 bg-red-50' : 'border-gray-200'
                  }`}
                  placeholder="0.0"
                />
                {errors.weight && (
                  <p className="mt-2 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {errors.weight}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.neutered}
                  onChange={(e) => setFormData(prev => ({ ...prev, neutered: e.target.checked }))}
                  className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm font-medium text-gray-700">중성화 수술을 받았어요</span>
              </label>
            </div>
          </div>

          {/* Health Information */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 hover:shadow-2xl transition-all duration-300">
            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              건강 정보
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">알레르기</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {commonAllergies.map(allergy => (
                    <label 
                      key={allergy} 
                      className="flex items-center space-x-2 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={formData.allergies.includes(allergy)}
                        onChange={() => handleAllergyToggle(allergy)}
                        className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">{allergy}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">건강 상태</label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {commonHealthConditions.map(condition => (
                    <label 
                      key={condition} 
                      className="flex items-center space-x-2 cursor-pointer p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-100"
                    >
                      <input
                        type="checkbox"
                        checked={formData.healthConditions.includes(condition)}
                        onChange={() => handleHealthConditionToggle(condition)}
                        className="w-5 h-5 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
                      />
                      <span className="text-sm text-gray-700">{condition}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">특이사항</label>
                <textarea
                  value={formData.specialNotes}
                  onChange={(e) => setFormData(prev => ({ ...prev, specialNotes: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  placeholder="우리 아이만의 특별한 점이나 주의사항을 적어주세요"
                />
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex flex-col sm:flex-row justify-end gap-4">
            <Link
              href="/pet-log/pets"
              className="px-6 py-3 text-gray-700 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all duration-200 font-semibold text-center"
            >
              취소
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <Save className="h-5 w-5" />
              {saving ? '저장 중...' : '수정 완료'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

