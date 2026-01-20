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
  Plus,
  ChevronRight
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500 mx-auto mb-4"></div>
          <p className="text-sm text-gray-500">로딩 중...</p>
        </div>
      </div>
    )
  }

  // 에러 발생
  if (error || !pet) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm">돌아가기</span>
          </button>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <PawPrint className="w-6 h-6 text-gray-400" />
            </div>
            <h2 className="text-base font-bold text-gray-900 mb-1">
              {error || '반려동물 정보를 찾을 수 없습니다'}
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              요청하신 반려동물 정보를 불러올 수 없습니다.
            </p>
            <Link
              href="/profile"
              className="inline-block px-4 py-2 bg-violet-500 text-white text-sm rounded-xl hover:bg-violet-600 transition-colors"
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
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => {
              if (window.history.length > 1) {
                router.back()
              } else {
                router.push('/profile')
              }
            }}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <ArrowLeft className="h-4 w-4 text-gray-500" />
          </button>
          <h1 className="text-lg font-bold text-gray-900">{pet.name}</h1>
        </div>

        {/* Pet Profile Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="flex-shrink-0">
              {pet.avatar_url ? (
                <img
                  src={pet.avatar_url}
                  alt={pet.name}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-violet-100"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-violet-100 to-pink-100 rounded-2xl flex items-center justify-center text-3xl border-2 border-violet-100">
                  {petEmoji}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <h2 className="text-base font-bold text-gray-900">{pet.name}</h2>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                  pet.species === 'cat' 
                    ? 'bg-orange-100 text-orange-600' 
                    : 'bg-blue-100 text-blue-600'
                }`}>
                  {pet.species === 'cat' ? '고양이' : '강아지'}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{petAge}</span>
                </div>
                {pet.weight_kg && (
                  <div className="flex items-center gap-1">
                    <PawPrint className="w-3.5 h-3.5" />
                    <span>{pet.weight_kg}kg</span>
                  </div>
                )}
              </div>

              {pet.tags && pet.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {pet.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full text-[10px]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Edit Button - 소유자만 */}
            {isOwner && (
              <Link
                href={`/pet-log/pets/${petId}/edit`}
                className="flex-shrink-0 p-2 bg-violet-50 text-violet-600 rounded-xl hover:bg-violet-100 transition-colors"
              >
                <Edit className="w-4 h-4" />
              </Link>
            )}
          </div>
        </div>

        {/* Recent Posts Section */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center">
                <MessageCircle className="w-3.5 h-3.5 text-blue-500" />
              </span>
              급여 후기
            </h2>
            {isOwner && (
              <Link
                href={`/pet-log/posts/write?petId=${petId}`}
                className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-medium"
              >
                <Plus className="w-3.5 h-3.5" />
                작성
              </Link>
            )}
          </div>

          {isLoadingPosts ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mx-auto mb-2"></div>
              <p className="text-xs text-gray-500">로딩 중...</p>
            </div>
          ) : recentPosts.length > 0 ? (
            <div className="space-y-2">
              {recentPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/pet-log/posts/${post.id}`}
                  className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors group"
                >
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900 mb-0.5 group-hover:text-violet-600 transition-colors">
                      {post.pet_name}의 급여 기록
                    </h3>
                    <div className="flex items-center gap-3 text-[10px] text-gray-400">
                      <span className="flex items-center gap-0.5">
                        <Eye className="w-3 h-3" />
                        {post.views || 0}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <Heart className="w-3 h-3" />
                        {post.likes || 0}
                      </span>
                      <span className="flex items-center gap-0.5">
                        <MessageCircle className="w-3 h-3" />
                        {post.comments_count || 0}
                      </span>
                      <span>{new Date(post.created_at).toLocaleDateString('ko-KR')}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-violet-400 transition-colors" />
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <MessageCircle className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500 mb-3">
                {isOwner 
                  ? '아직 작성한 급여 후기가 없습니다' 
                  : '등록된 급여 후기가 없습니다'}
              </p>
              {isOwner && (
                <Link
                  href={`/pet-log/posts/write?petId=${petId}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-violet-500 text-white text-sm rounded-xl hover:bg-violet-600 transition-colors"
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
          <div className="grid grid-cols-2 gap-3">
            <Link
              href={`/pet-log/posts/write?petId=${petId}`}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
                  <Plus className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-violet-600 transition-colors">급여 후기 작성</h3>
                  <p className="text-[10px] text-gray-500">새로운 급여 기록 추가</p>
                </div>
              </div>
            </Link>
            <Link
              href={`/pet-log/pets/${petId}/edit`}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 rounded-xl flex items-center justify-center">
                  <Edit className="w-5 h-5 text-violet-500" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-900 group-hover:text-violet-600 transition-colors">프로필 수정</h3>
                  <p className="text-[10px] text-gray-500">{pet.name}의 정보 업데이트</p>
                </div>
              </div>
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
