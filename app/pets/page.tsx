'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'
import { Plus, Edit, Trash2, PawPrint, Calendar, Heart, ArrowLeft } from 'lucide-react'
import type { Database } from '@/lib/types/database'

type Pet = Database['public']['Tables']['pets']['Row']

export default function PetsPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const [pets, setPets] = useState<Pet[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  // 로그인하지 않은 경우 로그인 페이지로 리다이렉트
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=/pets')
    }
  }, [user, authLoading, router])

  // 반려동물 목록 불러오기
  useEffect(() => {
    const loadPets = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const supabase = getBrowserClient()
        if (!supabase) {
          setIsLoading(false)
          return
        }

        const { data, error } = await supabase
          .from('pets')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading pets:', error)
        } else {
          setPets(data || [])
        }
      } catch (error) {
        console.error('Unexpected error:', error)
      } finally {
        setIsLoading(false)
      }
    }

    if (user) {
      loadPets()
    }
  }, [user])

  const handleDelete = async (petId: string) => {
    if (!user) return

    try {
      const supabase = getBrowserClient()
      if (!supabase) return

      const { error } = await supabase
        .from('pets')
        .delete()
        .eq('id', petId)
        .eq('owner_id', user.id)

      if (error) {
        console.error('Error deleting pet:', error)
        alert('반려동물 삭제에 실패했습니다.')
        return
      }

      setPets(pets.filter(pet => pet.id !== petId))
      setDeleteConfirmId(null)
      alert('반려동물이 삭제되었습니다.')
    } catch (error) {
      console.error('Unexpected error:', error)
      alert('반려동물 삭제 중 오류가 발생했습니다.')
    }
  }

  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate)
    const now = new Date()
    const years = now.getFullYear() - birth.getFullYear()
    const months = now.getMonth() - birth.getMonth()
    
    if (years > 0) {
      return `${years}세`
    }
    return `${months}개월`
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3056F5] mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back()
              } else {
                router.push('/')
              }
            }}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>돌아가기</span>
          </button>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
                <PawPrint className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">내 반려동물</h1>
                <p className="text-base sm:text-lg text-gray-600 mt-1">
                  등록된 반려동물을 관리하세요
                </p>
              </div>
            </div>
            <Link
              href="/pet-log/pets/new"
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">새 반려동물 등록</span>
              <span className="sm:hidden">등록</span>
            </Link>
          </div>
        </div>

        {/* Pets Grid */}
        {pets.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
            <PawPrint className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">등록된 반려동물이 없습니다</h3>
            <p className="text-gray-600 mb-6">첫 번째 반려동물을 등록해보세요!</p>
            <Link
              href="/pet-log/pets/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              반려동물 등록하기
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Pet Avatar */}
                <div className="h-48 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center relative">
                  {pet.avatar_url ? (
                    <img
                      src={pet.avatar_url}
                      alt={pet.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="text-6xl">
                      {pet.species === 'dog' ? '🐕' : '🐱'}
                    </div>
                  )}
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Link
                      href={`/pet-log/pets/${pet.id}/edit`}
                      className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Edit className="w-4 h-4 text-gray-700" />
                    </Link>
                    <button
                      onClick={() => setDeleteConfirmId(pet.id)}
                      className="w-8 h-8 bg-white/90 rounded-full flex items-center justify-center hover:bg-white transition-colors"
                    >
                      <Trash2 className="w-4 h-4 text-red-600" />
                    </button>
                  </div>
                </div>

                {/* Pet Info */}
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">{pet.name}</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">종류:</span>
                      <span>{pet.species === 'dog' ? '강아지' : '고양이'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{calculateAge(pet.birth_date)}</span>
                    </div>
                    {pet.weight_kg && (
                      <div className="flex items-center gap-2">
                        <span className="font-medium">체중:</span>
                        <span>{pet.weight_kg}kg</span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/owners/${user.id}/pets/${pet.id}`}
                      className="flex-1 px-3 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors text-center text-sm font-medium"
                    >
                      상세보기
                    </Link>
                    <Link
                      href={`/pet-log/posts/write?petId=${pet.id}`}
                      className="flex-1 px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center text-sm font-medium"
                    >
                      기록 작성
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirmId && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">반려동물 삭제</h3>
              <p className="text-gray-600 mb-6">
                정말로 이 반려동물을 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => {
                    handleDelete(deleteConfirmId)
                  }}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  삭제
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

