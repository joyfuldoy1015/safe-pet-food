'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  Edit, 
  Plus,
  Calendar,
  PawPrint,
  Heart,
  Star,
  Clock,
  TrendingUp,
  Eye,
  MessageCircle,
  ThumbsUp,
  Package,
  Filter
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

interface FeedingRecord {
  id: string
  productName: string
  category: '사료' | '간식' | '영양제' | '화장실'
  brand: string
  startDate: string
  endDate?: string
  status: '급여중' | '급여완료' | '급여중지'
  duration: string
  palatability: number
  satisfaction: number
  repurchaseIntent: boolean
  comment?: string
  price?: string
  purchaseLocation?: string
  sideEffects?: string[]
  benefits?: string[]
}

interface PetLogPost {
  id: string
  petName: string
  petBreed: string
  petAge: string
  petWeight: string
  ownerName: string
  ownerId: string
  ownerAvatar: string
  petAvatar: string
  petSpecies: 'dog' | 'cat'
  createdAt: string
  updatedAt: string
  totalRecords: number
  feedingRecords: FeedingRecord[]
  views: number
  likes: number
  comments: number
  isLiked: boolean
}

const categoryConfig = {
  '사료': { icon: '🍽️', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  '간식': { icon: '🦴', color: 'text-green-600 bg-green-50 border-green-200' },
  '영양제': { icon: '💊', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  '화장실': { icon: '🚽', color: 'text-orange-600 bg-orange-50 border-orange-200' }
}

const statusConfig = {
  '급여중': { color: 'text-green-700 bg-green-100 border-green-300' },
  '급여완료': { color: 'text-gray-700 bg-gray-100 border-gray-300' },
  '급여중지': { color: 'text-red-700 bg-red-100 border-red-300' }
}

export default function PetDetailPage() {
  const params = useParams()
  const router = useRouter()
  const petId = params.petId as string
  
  const [pet, setPet] = useState<PetProfile | null>(null)
  const [posts, setPosts] = useState<PetLogPost[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'oldest'>('recent')
  const [viewMode, setViewMode] = useState<'list' | 'timeline'>('list')

  // 반려동물 프로필 불러오기
  useEffect(() => {
    try {
      const savedPets = JSON.parse(localStorage.getItem('petProfiles') || '[]')
      const foundPet = savedPets.find((p: PetProfile) => p.id === petId)
      if (foundPet) {
        setPet(foundPet)
      }
    } catch (error) {
      console.error('반려동물 프로필 로드 중 오류:', error)
    }
  }, [petId])

  // 급여 기록 불러오기
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const response = await fetch(`/api/pet-log/posts?petProfileId=${petId}`)
        const apiPosts = await response.json()
        
        if (apiPosts && apiPosts.length > 0) {
          const formattedPosts = apiPosts.map((post: any) => ({
            ...post,
            petName: post.pet_name,
            petBreed: post.pet_breed,
            petAge: post.pet_age,
            petWeight: post.pet_weight,
            ownerName: post.owner_name,
            ownerId: post.user_id,
            ownerAvatar: post.owner_avatar,
            petAvatar: post.pet_avatar,
            petSpecies: post.pet_species,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
            totalRecords: post.total_records,
            views: post.views,
            likes: post.likes,
            comments: post.totalComments || post.comments?.length || 0,
            isLiked: post.is_liked,
            feedingRecords: (post.feedingRecords || []).map((record: any) => ({
              ...record,
              productName: record.product_name,
              startDate: record.start_date,
              endDate: record.end_date,
              repurchaseIntent: record.repurchase_intent,
              sideEffects: record.side_effects || [],
              benefits: record.benefits || []
            }))
          }))
          setPosts(formattedPosts)
        } else {
          // localStorage fallback
          const savedPosts = JSON.parse(localStorage.getItem('petLogPosts') || '[]')
          const petPosts = savedPosts.filter((p: any) => p.petProfileId === petId)
          setPosts(petPosts)
        }
      } catch (error) {
        console.error('급여 기록 로드 중 오류:', error)
        // localStorage fallback
        const savedPosts = JSON.parse(localStorage.getItem('petLogPosts') || '[]')
        const petPosts = savedPosts.filter((p: any) => p.petProfileId === petId)
        setPosts(petPosts)
      } finally {
        setLoading(false)
      }
    }

    if (petId) {
      fetchPosts()
    }
  }, [petId])

  // 필터링 및 정렬
  const filteredAndSortedPosts = posts
    .filter(post => {
      if (selectedCategory === 'all') return true
      return post.feedingRecords.some(record => record.category === selectedCategory)
    })
    .sort((a, b) => {
      if (sortBy === 'recent') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      } else {
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      }
    })

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
          <p className="mt-4 text-gray-600">급여 기록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!pet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">반려동물을 찾을 수 없습니다</h2>
          <Link href="/pet-log/pets" className="text-blue-500 hover:text-blue-600">
            반려동물 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/pet-log/pets"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="h-5 w-5" />
            <span>반려동물 목록</span>
          </Link>
          
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-3xl">
                  {pet.species === 'cat' ? '🐱' : '🐕'}
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-1">{pet.name}</h1>
                  <p className="text-gray-600">{pet.breed}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <span>{pet.age}</span>
                    <span>•</span>
                    <span>{pet.weight}</span>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => router.push(`/pet-log/posts/write?petId=${pet.id}`)}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="h-4 w-4" />
                  <span>급여 기록 추가</span>
                </button>
                <Link
                  href={`/pet-log/pets/${pet.id}/edit`}
                  className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  <Edit className="h-5 w-5 text-gray-600" />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* 필터 및 정렬 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4 flex-1">
              <div className="flex items-center gap-2">
                <Filter className="h-5 w-5 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">카테고리:</span>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">전체</option>
                  <option value="사료">🍽️ 사료</option>
                  <option value="간식">🦴 간식</option>
                  <option value="영양제">💊 영양제</option>
                  <option value="화장실">🚽 화장실</option>
                </select>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700">정렬:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'recent' | 'oldest')}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="recent">최신순</option>
                  <option value="oldest">과거순</option>
                </select>
              </div>
            </div>
            
            <div className="flex items-center gap-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'list'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                목록 보기
              </button>
              <button
                onClick={() => setViewMode('timeline')}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'timeline'
                    ? 'bg-white text-purple-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                타임라인
              </button>
            </div>
          </div>
        </div>

        {/* 급여 기록 목록 */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            급여 기록 ({filteredAndSortedPosts.length}개)
          </h2>

          {filteredAndSortedPosts.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">급여 기록이 없습니다</h3>
              <p className="text-gray-600 mb-6">첫 급여 기록을 추가해보세요!</p>
              <button
                onClick={() => router.push(`/pet-log/posts/write?petId=${pet.id}`)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                <span>급여 기록 추가</span>
              </button>
            </div>
          ) : viewMode === 'list' ? (
            <div className="grid gap-6">
              {filteredAndSortedPosts.map((post) => (
                <Link
                  key={post.id}
                  href={`/pet-log/posts/${post.id}`}
                  className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-2xl">{post.petAvatar}</span>
                          <h3 className="text-xl font-bold text-gray-900">{post.petName}</h3>
                        </div>
                        <p className="text-sm text-gray-600">{post.createdAt}</p>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.views}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-4 w-4" />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>

                    {/* 급여 기록들 */}
                    <div className="space-y-3">
                      {post.feedingRecords.map((record) => (
                        <div
                          key={record.id}
                          className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex items-center gap-3">
                              <span className="text-2xl">{categoryConfig[record.category].icon}</span>
                              <div>
                                <h4 className="font-bold text-gray-900">{record.productName}</h4>
                                <p className="text-sm text-gray-600">{record.brand}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${categoryConfig[record.category].color}`}>
                                {record.category}
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[record.status].color}`}>
                                {record.status}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              <span>{record.startDate}</span>
                              {record.endDate && <span> ~ {record.endDate}</span>}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4" />
                              <span>{record.duration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <span>기호성:</span>
                              {renderStars(record.palatability)}
                            </div>
                            <div className="flex items-center gap-1">
                              <span>만족도:</span>
                              {renderStars(record.satisfaction)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="relative">
              {/* 타임라인 */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-gray-200"></div>
              <div className="space-y-8 pl-16">
                {filteredAndSortedPosts.map((post, index) => (
                  <div key={post.id} className="relative">
                    {/* 타임라인 점 */}
                    <div className="absolute -left-9 top-6 w-4 h-4 bg-purple-500 rounded-full border-4 border-white shadow-lg"></div>
                    
                    <Link
                      href={`/pet-log/posts/${post.id}`}
                      className="block bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow"
                    >
                      <div className="p-6">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="h-5 w-5 text-purple-500" />
                          <span className="text-lg font-bold text-gray-900">{post.createdAt}</span>
                        </div>
                        
                        {/* 급여 기록들 */}
                        <div className="space-y-3">
                          {post.feedingRecords.map((record) => (
                            <div
                              key={record.id}
                              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                  <span className="text-2xl">{categoryConfig[record.category].icon}</span>
                                  <div>
                                    <h4 className="font-bold text-gray-900">{record.productName}</h4>
                                    <p className="text-sm text-gray-600">{record.brand}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${categoryConfig[record.category].color}`}>
                                    {record.category}
                                  </span>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[record.status].color}`}>
                                    {record.status}
                                  </span>
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-4 text-sm text-gray-600 mt-2 flex-wrap">
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-4 w-4" />
                                  <span>{record.startDate}</span>
                                  {record.endDate && <span> ~ {record.endDate}</span>}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{record.duration}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>기호성:</span>
                                  {renderStars(record.palatability)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <span>만족도:</span>
                                  {renderStars(record.satisfaction)}
                                </div>
                              </div>
                              
                              {record.comment && (
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                  <p className="text-sm text-gray-700">{record.comment}</p>
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                        
                        {/* 포스트 통계 */}
                        <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-200 text-sm text-gray-600">
                          <div className="flex items-center gap-1">
                            <Eye className="h-4 w-4" />
                            <span>{post.views} 조회</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <ThumbsUp className="h-4 w-4" />
                            <span>{post.likes} 추천</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments} 댓글</span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

