'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { 
  Plus, 
  Edit, 
  Trash2, 
  PawPrint,
  Calendar,
  Heart,
  AlertCircle,
  User
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

export default function PetsPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated'
  const [pets, setPets] = useState<PetProfile[]>([])
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [showLoginModal, setShowLoginModal] = useState(false)

  // 로컬 스토리지에서 반려동물 프로필 불러오기
  useEffect(() => {
    try {
      const savedPets = JSON.parse(localStorage.getItem('petProfiles') || '[]')
      setPets(savedPets)
    } catch (error) {
      console.error('반려동물 프로필 로드 중 오류:', error)
    }
  }, [])

  // 반려동물 등록 버튼 클릭 핸들러
  const handleNewPetClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
    } else {
      router.push('/pet-log/pets/new')
    }
  }

  // 급여 기록 작성 버튼 클릭 핸들러
  const handleWriteRecordClick = (petId: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
    } else {
      router.push(`/pet-log/posts/write?petId=${petId}`)
    }
  }

  // 반려동물 삭제
  const handleDelete = (petId: string) => {
    try {
      const updatedPets = pets.filter(pet => pet.id !== petId)
      localStorage.setItem('petProfiles', JSON.stringify(updatedPets))
      setPets(updatedPets)
      setDeleteConfirmId(null)
    } catch (error) {
      console.error('반려동물 삭제 중 오류:', error)
      alert('반려동물 삭제 중 오류가 발생했습니다.')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <PawPrint className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">내 반려동물 관리</h1>
          </div>
          <p className="text-base sm:text-lg text-gray-600">
            등록된 반려동물의 정보를 관리하고 급여 기록을 작성할 수 있습니다
          </p>
        </div>

        {/* 반려동물 목록 */}
        {pets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 sm:p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PawPrint className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">등록된 반려동물이 없습니다</h3>
            <p className="text-gray-600 mb-6">
              반려동물을 등록하고 급여 기록을 관리해보세요
            </p>
            <div className="flex flex-col gap-3 items-center">
              <button
                onClick={handleNewPetClick}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Plus className="h-5 w-5" />
                첫 반려동물 등록하기
              </button>
              {/* 새 반려동물 등록 버튼 */}
              <button
                onClick={handleNewPetClick}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white border-2 border-purple-500 text-purple-600 rounded-xl font-semibold transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <Plus className="h-5 w-5" />
                새 반려동물 등록하기
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* 새 반려동물 등록 버튼 */}
            <div className="mb-6">
              <button
                onClick={handleNewPetClick}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                <Plus className="h-5 w-5" />
                새 반려동물 등록하기
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div key={pet.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 hover:shadow-2xl transition-all duration-300">
                {/* 헤더 */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl ${
                      pet.species === 'cat' ? 'bg-gradient-to-r from-pink-100 to-purple-100' : 'bg-gradient-to-r from-blue-100 to-cyan-100'
                    }`}>
                      {pet.species === 'cat' ? '🐱' : '🐕'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{pet.name}</h3>
                      <p className="text-sm text-gray-600">{pet.breed}</p>
                    </div>
                  </div>
                </div>

                {/* 정보 */}
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>{pet.age}</span>
                  </div>
                  {pet.weight && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Heart className="h-4 w-4" />
                      <span>{pet.weight}</span>
                    </div>
                  )}
                  {pet.allergies.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>알레르기: {pet.allergies.slice(0, 2).join(', ')}{pet.allergies.length > 2 ? '...' : ''}</span>
                    </div>
                  )}
                  {pet.healthConditions.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-orange-600">
                      <AlertCircle className="h-4 w-4" />
                      <span>건강 상태: {pet.healthConditions.slice(0, 2).join(', ')}{pet.healthConditions.length > 2 ? '...' : ''}</span>
                    </div>
                  )}
                </div>

                {/* 액션 버튼 */}
                <div className="flex gap-2 mt-6">
                  <button
                    onClick={() => handleWriteRecordClick(pet.id)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                  >
                    급여 기록 작성
                  </button>
                  <Link
                    href={`/pet-log/pets/${pet.id}`}
                    className="px-4 py-2 bg-purple-100 hover:bg-purple-200 text-purple-700 rounded-lg transition-colors"
                    title="급여 기록 보기"
                  >
                    <PawPrint className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => router.push(`/pet-log/pets/${pet.id}/edit`)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirmId(pet.id)}
                    className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
            </div>
          </>
        )}

        {/* 삭제 확인 모달 */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <AlertCircle className="h-6 w-6 text-red-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  반려동물 삭제
                </h3>
                <p className="text-sm text-gray-600 mb-6">
                  정말로 이 반려동물 정보를 삭제하시겠습니까?<br />
                  삭제된 정보는 복구할 수 없습니다.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setDeleteConfirmId(null)}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={() => handleDelete(deleteConfirmId)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    삭제하기
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 로그인 필요 모달 */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4 sm:mb-6 shadow-lg">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  로그인이 필요합니다
                </h3>
                
                <p className="text-sm sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  반려동물 등록, 급여 기록 작성 등의 기능을 이용하려면<br className="hidden sm:block" />
                  먼저 로그인해주세요.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm sm:text-lg font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    로그인하기
                  </Link>
                  
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-4 bg-gray-100 text-gray-700 text-sm sm:text-lg font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    취소
                  </button>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6">
                  아직 계정이 없으신가요? 
                  <Link href="/signup" className="text-purple-600 hover:text-purple-700 ml-1 font-semibold">
                    회원가입
                  </Link>
                </p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

