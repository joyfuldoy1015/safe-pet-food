'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
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
  const [pets, setPets] = useState<PetProfile[]>([])
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // 로컬 스토리지에서 반려동물 프로필 불러오기
  useEffect(() => {
    try {
      const savedPets = JSON.parse(localStorage.getItem('petProfiles') || '[]')
      setPets(savedPets)
    } catch (error) {
      console.error('반려동물 프로필 로드 중 오류:', error)
    }
  }, [])

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
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <PawPrint className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold text-gray-900">내 반려동물 관리</h1>
            </div>
            <Link
              href="/pet-log/pets/new"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              새 반려동물 등록
            </Link>
          </div>
          <p className="text-lg text-gray-600">
            등록된 반려동물의 정보를 관리하고 급여 기록을 작성할 수 있습니다
          </p>
        </div>

        {/* 반려동물 목록 */}
        {pets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-12 text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PawPrint className="w-8 h-8 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">등록된 반려동물이 없습니다</h3>
            <p className="text-gray-600 mb-6">
              반려동물을 등록하고 급여 기록을 관리해보세요
            </p>
            <Link
              href="/pet-log/pets/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Plus className="h-5 w-5" />
              첫 반려동물 등록하기
            </Link>
          </div>
        ) : (
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
                    onClick={() => router.push(`/pet-log/posts/write?petId=${pet.id}`)}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-medium transition-all duration-200 text-sm"
                  >
                    급여 기록 작성
                  </button>
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
      </main>
    </div>
  )
}

