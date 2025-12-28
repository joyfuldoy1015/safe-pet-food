'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  PawPrint,
  Calendar,
  Edit,
  Heart,
  MessageCircle,
  Eye,
  Star,
  Plus
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'
import type { Database } from '@/lib/types/database'

type Pet = Database['public']['Tables']['pets']['Row']
type PetLogPost = any

export default function PetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuth()
  const petId = params.petId as string

  const [pet, setPet] = useState<Pet | null>(null)
  const [recentPosts, setRecentPosts] = useState<PetLogPost[]>([])
  const [isLoadingPet, setIsLoadingPet] = useState(true)
  const [isLoadingPosts, setIsLoadingPosts] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 반려동물 정보 로드
  useEffect(() => {
    const loadPet = async () => {
      setIsLoadingPet(true)
      setError(null)
      
      try {
        const supabase = getBrowserClient()
        const { data, error } = await supabase
          .from('pets')
          .select('*')
          .eq('id', petId)
          .single()

        if (error) {
          console.error('Failed to load pet:', error)
          setError('반려동물 정보를 불러올 수 없습니다.')
          return
        }

        if (data) {
          setPet(data)
        }
      } catch (error) {
        console.error('Error loading pet:', error)
        setError('반려동물 정보를 불러오는 중 오류가 발생했습니다.')
      } finally {
        setIsLoadingPet(false)
      }
    }

    if (petId) {
      loadPet()
    }
  }, [petId])

  // 급여 후기 로드
  useEffect(() => {
    const loadPosts = async () => {
      if (!pet) return
      
      setIsLoadingPosts(true)
      
      try {
        const supabase = getBrowserClient()
        const { data, error } = await supabase
          .from('pet_log_posts')
          .select('*')
          .eq('pet_profile_id', petId)
          .order('created_at', { ascending: false })
          .limit(10)

        if (!error && data) {
          setRecentPosts(data)
        }
      } catch (error) {
        console.error('Failed to load posts:', error)
      } finally {
        setIsLoadingPosts(false)
      }
    }

    if (pet) {
      loadPosts()
    }
  }, [pet, petId])

  // 나이 계산
  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate)
    const now = new Date()
    const years = now.getFullYear() - birth.getFullYear()
    const months = now.getMonth() - birth.getMonth()
    
    if (months < 0) {
      return `${years - 1}세`
    }
    if (years > 0) {
      return `${years}세`
    }
    return `${months}개월`
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

  // 에러 발생
  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>돌아가기</span>
          </button>

          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <PawPrint className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {error || '반려동물 정보를 찾을 수 없습니다'}
            </h2>
            <p className="text-gray-600 mb-6">
              요청하신 반려동물 정보를 불러올 수 없습니다.
            </p>
            <Link
              href="/profile"
              className="inline-block px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              마이페이지로 돌아가기
            </Link>
          </div>
        </main>
      </div>
    )
  }

  // 소유자 확인
  const isOwner = user && pet.owner_id === user.id
  const petAge = calculateAge(pet.birth_date)
  const petEmoji = pet.species === 'cat' ? '🐱' : '🐶'

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back()
              } else {
                router.push('/profile')
              }
            }}
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>돌아가기</span>
          </button>
        </div>

        {/* Pet Profile Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {pet.avatar_url ? (
                <img
                  src={pet.avatar_url}
                  alt={pet.name}
                  className="w-24 h-24 rounded-full object-cover border-4 border-purple-100 shadow-lg"
                />
              ) : (
                <div className="w-24 h-24 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-5xl border-4 border-purple-100 shadow-lg">
                  {petEmoji}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  {pet.name}
                </h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                  pet.species === 'cat' 
                    ? 'bg-orange-100 text-orange-700' 
                    : 'bg-blue-100 text-blue-700'
                }`}>
                  {pet.species === 'cat' ? '고양이' : '강아지'}
                </span>
              </div>

              <div className="space-y-2 text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>{petAge}</span>
                  {pet.birth_date && (
                    <span className="text-sm text-gray-500">
                      ({new Date(pet.birth_date).getFullYear()}년생)
                    </span>
                  )}
                </div>
                {pet.weight_kg && (
                  <div className="flex items-center gap-2">
                    <PawPrint className="w-4 h-4" />
                    <span>{pet.weight_kg}kg</span>
                  </div>
                )}
                {pet.tags && pet.tags.length > 0 && (
                  <div className="flex items-start gap-2 mt-3">
                    <div className="flex flex-wrap gap-2">
                      {pet.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-gray-100 text-gray-700 rounded-md text-xs font-medium"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Edit Button - 소유자만 */}
            {isOwner && (
              <Link
                href={`/pet-log/pets/${petId}/edit`}
                className="flex-shrink-0 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                <span>수정</span>
              </Link>
            )}
          </div>
        </div>

        {/* Recent Posts Section */}
        <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-blue-600" />
              {pet.name}의 급여 후기
            </h2>
            {isOwner && (
              <Link
                href={`/pet-log/posts/write?petId=${petId}`}
                className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                <Plus className="w-4 h-4" />
                작성
              </Link>
            )}
          </div>

          {isLoadingPosts ? (
            <p className="text-gray-500 text-center py-8">로딩 중...</p>
          ) : recentPosts.length > 0 ? (
            <div className="space-y-3">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/pet-log/posts/${post.id}`}
                  className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {post.pet_name}의 급여 기록
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        {post.pet_breed} • {post.total_records}개 기록
                      </p>
                      <div className="flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {post.views || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          {post.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          {post.comments_count || 0}
                        </span>
                      </div>
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(post.created_at).toLocaleDateString('ko-KR')}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">
                {isOwner 
                  ? '아직 작성한 급여 후기가 없습니다' 
                  : '등록된 급여 후기가 없습니다'}
              </p>
              {isOwner && (
                <Link
                  href={`/pet-log/posts/write?petId=${petId}`}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  급여 후기 작성하기
                </Link>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        {isOwner && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href={`/pet-log/posts/write?petId=${petId}`}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">급여 후기 작성</h3>
                  <p className="text-sm text-gray-600">새로운 급여 기록 추가</p>
                </div>
              </div>
            </Link>
            <Link
              href={`/pet-log/pets/${petId}/edit`}
              className="bg-white rounded-xl shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Edit className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">프로필 수정</h3>
                  <p className="text-sm text-gray-600">{pet.name}의 정보 업데이트</p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
