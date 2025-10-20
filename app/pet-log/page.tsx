'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Plus, 
  Calendar, 
  Star, 
  Heart, 
  BookOpen,
  PawPrint,
  TrendingUp,
  Clock,
  Award,
  Users,
  Eye,
  MessageCircle,
  ThumbsUp,
  Filter,
  Search,
  User
} from 'lucide-react'

// 제품 카테고리 타입
type ProductCategory = '사료' | '간식' | '영양제' | '화장실'

// 급여 상태 타입
type FeedingStatus = '급여중' | '급여완료' | '급여중지'

// 급여 기록 인터페이스
interface FeedingRecord {
  id: string
  productName: string
  category: ProductCategory
  brand: string
  startDate: string
  endDate?: string
  status: FeedingStatus
  duration: string
  palatability: number // 1-5
  satisfaction: number // 1-5
  repurchaseIntent: boolean
  comment?: string
  price?: string
  purchaseLocation?: string
  sideEffects?: string[]
  benefits?: string[]
}

// 커뮤니티 포스트 데이터 구조 (업그레이드됨)
interface DetailedPetLogPost {
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

// 카테고리 설정 (상세 페이지와 동일)
const categoryConfig = {
  '사료': { icon: '🍽️', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  '간식': { icon: '🦴', color: 'text-green-600 bg-green-50 border-green-200' },
  '영양제': { icon: '💊', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  '화장실': { icon: '🚽', color: 'text-orange-600 bg-orange-50 border-orange-200' }
}

// 상태 설정 (상세 페이지와 동일)
const statusConfig = {
  '급여중': { color: 'text-green-700 bg-green-100 border-green-300' },
  '급여완료': { color: 'text-gray-700 bg-gray-100 border-gray-300' },
  '급여중지': { color: 'text-red-700 bg-red-100 border-red-300' }
}

// Mock data - 상세한 펫 로그 포스트들
const detailedPosts: DetailedPetLogPost[] = [
  {
    id: 'post-1',
    petName: '뽀미',
    petBreed: '골든 리트리버',
    petAge: '3세',
    petWeight: '28kg',
    ownerName: '김집사',
    ownerId: 'owner-1',
    ownerAvatar: '👨‍💼',
    petAvatar: '🐕',
    petSpecies: 'dog',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    totalRecords: 8,
    views: 1247,
    likes: 89,
    comments: 23,
    isLiked: false,
    feedingRecords: [
      {
        id: 'record-1',
        productName: '힐스 어덜트 라지 브리드',
        category: '사료',
        brand: '힐스',
        startDate: '2024-01-16',
        status: '급여중',
        duration: '5일',
        palatability: 4,
        satisfaction: 4,
        repurchaseIntent: true,
        comment: '로얄캐닌에서 바꿨는데 적응 기간이 필요해 보여요. 그래도 잘 먹고 있어요.',
        price: '89,000원 (15kg)',
        purchaseLocation: '온라인 펫샵',
        benefits: ['털 윤기 개선', '소화 잘됨']
      },
      {
        id: 'record-2',
        productName: '로얄캐닌 골든 리트리버 어덜트',
        category: '사료',
        brand: '로얄캐닌',
        startDate: '2023-10-01',
        endDate: '2024-01-15',
        status: '급여완료',
        duration: '3개월 15일',
        palatability: 5,
        satisfaction: 5,
        repurchaseIntent: true,
        comment: '우리 뽀미가 정말 잘 먹어요. 털도 윤기가 좋아졌고 변 상태도 완벽해요!',
        price: '95,000원 (12kg)',
        purchaseLocation: '동물병원',
        benefits: ['기호성 우수', '털 윤기', '변 상태 좋음']
      },
      {
        id: 'record-3',
        productName: '네츄럴발란스 트레이닝 트릿',
        category: '간식',
        brand: '네츄럴발란스',
        startDate: '2024-01-10',
        status: '급여중',
        duration: '11일',
        palatability: 5,
        satisfaction: 4,
        repurchaseIntent: true,
        comment: '훈련용으로 사용 중인데 정말 좋아해요. 크기도 적당하고 부드러워요.',
        price: '12,000원 (200g)',
        purchaseLocation: '펫샵',
        benefits: ['훈련 효과', '소화 잘됨']
      }
    ]
  },
  {
    id: 'post-2',
    petName: '모모',
    petBreed: '페르시안',
    petAge: '7세',
    petWeight: '4.2kg',
    ownerName: '김지은',
    ownerId: 'owner-2',
    ownerAvatar: '👩',
    petAvatar: '🐱',
    petSpecies: 'cat',
    createdAt: '2024-12-18',
    updatedAt: '2024-12-18',
    totalRecords: 5,
    views: 892,
    likes: 67,
    comments: 15,
    isLiked: true,
    feedingRecords: [
      {
        id: 'record-4',
        productName: '로얄캐닌 페르시안 어덜트',
        category: '사료',
        brand: '로얄캐닌',
        startDate: '2024-10-01',
        status: '급여중',
        duration: '2개월 18일',
        palatability: 5,
        satisfaction: 5,
        repurchaseIntent: true,
        comment: '페르시안 고양이 전용 사료라서 그런지 우리 모모가 정말 잘 먹어요! 털도 더 윤기나고 소화도 잘 되는 것 같아요.',
        price: '45,000원 (2kg)',
        purchaseLocation: '동물병원',
        benefits: ['페르시안 전용', '장모종 케어', '소화 잘됨', '털 윤기']
      }
    ]
  },
  {
    id: 'post-3',
    petName: '코코',
    petBreed: '래브라도 리트리버',
    petAge: '4세',
    petWeight: '32kg',
    ownerName: '이수진',
    ownerId: 'owner-3',
    ownerAvatar: '👩‍🦰',
    petAvatar: '🐕',
    petSpecies: 'dog',
    createdAt: '2024-12-16',
    updatedAt: '2024-12-16',
    totalRecords: 6,
    views: 743,
    likes: 52,
    comments: 18,
    isLiked: false,
    feedingRecords: [
      {
        id: 'record-5',
        productName: '덴탈츄 대형견용',
        category: '간식',
        brand: '그린리스',
        startDate: '2024-11-01',
        status: '급여중',
        duration: '1개월 16일',
        palatability: 5,
        satisfaction: 4,
        repurchaseIntent: true,
        comment: '치아 건강을 위해 구매했는데 코코가 너무 좋아해요! 씹는 재미도 있고 실제로 치석도 줄어든 것 같습니다.',
        price: '18,000원 (300g)',
        purchaseLocation: '펫샵',
        benefits: ['치아 건강', '치석 제거', '기호성 우수'],
        sideEffects: ['조금 딱딱함']
      }
    ]
  }
]

// 유틸리티 함수들
const getCategoryText = (category: ProductCategory) => {
  switch (category) {
    case '사료': return '사료'
    case '간식': return '간식'
    case '영양제': return '영양제'
    case '화장실': return '화장실'
    default: return '기타'
  }
}

const getStatusText = (status: FeedingStatus) => {
  switch (status) {
    case '급여중': return '급여중'
    case '급여완료': return '급여완료'
    case '급여중지': return '급여중지'
    default: return '상태불명'
  }
}

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
    />
  ))
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '오늘'
  if (diffDays === 2) return '어제'
  if (diffDays <= 7) return `${diffDays - 1}일 전`
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

// 포스트의 주요 급여 기록 추출 (급여중 > 급여중지 > 급여완료 순)
const getMainFeedingRecord = (post: DetailedPetLogPost): FeedingRecord | null => {
  if (post.feedingRecords.length === 0) return null
  
  // 우선순위: 급여중 > 급여중지 > 급여완료
  const ongoing = post.feedingRecords.filter(record => record.status === '급여중')
  if (ongoing.length > 0) {
    return ongoing.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
  }
  
  const stopped = post.feedingRecords.filter(record => record.status === '급여중지')
  if (stopped.length > 0) {
    return stopped.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
  }
  
  return post.feedingRecords.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
}

// 평균 평점 계산
const getAverageRating = (records: FeedingRecord[], type: 'palatability' | 'satisfaction') => {
  if (records.length === 0) return 0
  const sum = records.reduce((acc, record) => acc + record[type], 0)
  return Math.round((sum / records.length) * 10) / 10
}

export default function PetLogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  // 로그인 상태 관리 (실제 배포 시에는 NextAuth.js, 세션, 또는 인증 컨텍스트에서 가져와야 함)
  // 예: const { data: session } = useSession() 또는 const { user } = useAuth()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all')

  // 필터링된 포스트들
  const filteredPosts = detailedPosts.filter(post => {
    const mainRecord = getMainFeedingRecord(post)
    const matchesSearch = 
      post.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mainRecord && mainRecord.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      post.feedingRecords.some(record => 
        record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.brand.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesCategory = selectedCategory === 'all' || 
      post.feedingRecords.some(record => record.category === selectedCategory)
    
    const matchesSpecies = selectedSpecies === 'all' || post.petSpecies === selectedSpecies
    
    return matchesSearch && matchesCategory && matchesSpecies
  })

  // 인기 포스트 (조회수 기준 상위 3개)
  const topPosts = [...detailedPosts]
    .sort((a, b) => b.views - a.views)
    .slice(0, 3)

  // 최신 포스트들
  const recentPosts = [...detailedPosts]
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            펫 로그 커뮤니티 📖
          </h1>
          <p className="text-lg text-gray-600">
            다른 반려집사들의 급여 경험을 둘러보고 나만의 기록도 남겨보세요
          </p>
        </div>
        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 space-y-3 sm:space-y-0">
            <h2 className="text-lg font-bold text-gray-900">급여 기록 찾기</h2>
            <button
              onClick={() => {
                if (isLoggedIn) {
                  window.location.href = '/pet-log/posts/write'
                } else {
                  setShowLoginModal(true)
                }
              }}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors whitespace-nowrap"
            >
              <Plus className="h-4 w-4" />
              급여 기록 공유하기
            </button>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="w-full">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="제품명, 반려동물 이름, 집사 이름으로 검색..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent flex-1"
              >
                <option value="all">전체 카테고리</option>
                <option value="사료">🍽️ 사료</option>
                <option value="간식">🦴 간식</option>
                <option value="영양제">💊 영양제</option>
                <option value="화장실">🚽 화장실</option>
              </select>
              <select
                value={selectedSpecies}
                onChange={(e) => setSelectedSpecies(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent flex-1"
              >
                <option value="all">전체 반려동물</option>
                <option value="dog">🐕 강아지</option>
                <option value="cat">🐱 고양이</option>
              </select>
            </div>
          </div>
        </div>

        {/* Top 3 Popular Posts */}
        <div className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h2 className="text-xl font-bold text-gray-900">인기 급여 후기 TOP 3</h2>
            <span className="text-sm text-gray-500">조회수 기준</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {topPosts.map((post, index) => {
              const mainRecord = getMainFeedingRecord(post)
              const avgPalatability = getAverageRating(post.feedingRecords, 'palatability')
              const avgSatisfaction = getAverageRating(post.feedingRecords, 'satisfaction')
              
              return (
                <Link key={post.id} href={`/pet-log/posts/${post.id}`} className="block">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow group cursor-pointer">
                    <div className="p-6">
                      {/* Ranking Badge */}
                      <div className="flex items-center justify-between mb-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                          index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : 'bg-orange-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex items-center space-x-2 text-sm text-gray-500">
                          <Eye className="h-4 w-4" />
                          <span>{post.views.toLocaleString()}</span>
                        </div>
                      </div>

                      {/* User Info */}
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {post.ownerAvatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{post.ownerName}</p>
                          <div className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
                            <span className="whitespace-nowrap">{post.petAvatar} {post.petName}</span>
                            <span>•</span>
                            <span className="whitespace-nowrap">{post.petAge}</span>
                            <span>•</span>
                            <span className="whitespace-nowrap">{post.petWeight}</span>
                          </div>
                        </div>
                      </div>

                      {/* Main Product Info */}
                      {mainRecord && (
                        <div className="mb-4">
                          <div className="flex items-start space-x-2 mb-2">
                            <span className="text-lg flex-shrink-0">{categoryConfig[mainRecord.category].icon}</span>
                            <h3 className="font-bold text-gray-900 group-hover:text-purple-600 transition-colors break-words flex-1 min-w-0">
                              {mainRecord.productName}
                            </h3>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${categoryConfig[mainRecord.category].color}`}>
                              {getCategoryText(mainRecord.category)}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${statusConfig[mainRecord.status].color}`}>
                              {getStatusText(mainRecord.status)}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Ratings */}
                      <div className="mb-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">기호성</span>
                          <div className="flex items-center space-x-1">
                            {renderStars(Math.round(avgPalatability))}
                            <span className="text-sm font-medium text-gray-900 ml-1">{avgPalatability}</span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">만족도</span>
                          <div className="flex items-center space-x-1">
                            {renderStars(Math.round(avgSatisfaction))}
                            <span className="text-sm font-medium text-gray-900 ml-1">{avgSatisfaction}</span>
                          </div>
                        </div>
                      </div>

                      {/* Records Summary */}
                      <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                          총 {post.totalRecords}개 제품 급여 기록
                        </p>
                        {mainRecord?.comment && (
                          <p className="text-gray-700 text-sm break-words line-clamp-2">
                            &ldquo;{mainRecord.comment}&rdquo;
                          </p>
                        )}
                      </div>

                      {/* Benefits Tags */}
                      {mainRecord?.benefits && mainRecord.benefits.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-4">
                          {mainRecord.benefits.slice(0, 3).map((benefit, tagIndex) => (
                            <span key={tagIndex} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                              {benefit}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Footer */}
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="flex items-center space-x-4 text-sm text-gray-500">
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className={`h-4 w-4 ${post.isLiked ? 'text-blue-500' : ''}`} />
                            <span>{post.likes}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <MessageCircle className="h-4 w-4" />
                            <span>{post.comments}</span>
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Recent Posts */}
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Clock className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-bold text-gray-900">최신 급여 후기</h2>
            <span className="text-sm text-gray-500">최근 등록·수정순</span>
          </div>

          <div className="space-y-6">
            {filteredPosts.map((post) => {
              const mainRecord = getMainFeedingRecord(post)
              const avgPalatability = getAverageRating(post.feedingRecords, 'palatability')
              const avgSatisfaction = getAverageRating(post.feedingRecords, 'satisfaction')
              const ongoingCount = post.feedingRecords.filter(r => r.status === '급여중').length
              const completedCount = post.feedingRecords.filter(r => r.status === '급여완료').length
              
              return (
                <Link key={post.id} href={`/pet-log/posts/${post.id}`} className="block">
                  <div className="bg-white rounded-xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow p-6 cursor-pointer">
                    {/* Header */}
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-4 space-y-3 lg:space-y-0">
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                          {post.ownerAvatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-gray-900 truncate">{post.ownerName}</p>
                          <div className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
                            <span className="whitespace-nowrap">{post.petAvatar} {post.petName}</span>
                            <span>•</span>
                            <span className="whitespace-nowrap">{post.petBreed}</span>
                            <span>•</span>
                            <span className="whitespace-nowrap">{post.petAge}</span>
                            <span>•</span>
                            <span className="whitespace-nowrap">{post.petWeight}</span>
                            <span>•</span>
                            <span className="whitespace-nowrap">{formatDate(post.updatedAt)}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3 lg:space-x-4 text-sm text-gray-500 flex-shrink-0">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{post.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ThumbsUp className={`h-4 w-4 ${post.isLiked ? 'text-blue-500' : ''}`} />
                          <span>{post.likes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{post.comments}</span>
                        </div>
                      </div>
                    </div>

                    {/* Records Summary */}
                    <div className="mb-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 space-y-2 sm:space-y-0">
                        <h3 className="text-lg font-bold text-gray-900">급여 기록 요약</h3>
                        <div className="flex flex-wrap items-center gap-2 text-sm">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full font-medium whitespace-nowrap">
                            총 {post.totalRecords}개 제품
                          </span>
                          {ongoingCount > 0 && (
                            <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs whitespace-nowrap">
                              급여중 {ongoingCount}개
                            </span>
                          )}
                          {completedCount > 0 && (
                            <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs whitespace-nowrap">
                              완료 {completedCount}개
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Category breakdown */}
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(
                          post.feedingRecords.reduce((acc, record) => {
                            acc[record.category] = (acc[record.category] || 0) + 1
                            return acc
                          }, {} as Record<ProductCategory, number>)
                        ).map(([category, count]) => (
                          <span key={category} className={`px-2 py-1 text-xs font-medium rounded-full border ${categoryConfig[category as ProductCategory].color}`}>
                            {categoryConfig[category as ProductCategory].icon} {category} {count}개
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Main Product Highlight */}
                    {mainRecord && (
                      <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-3 lg:space-y-0">
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-2">
                              <span className="text-lg">{categoryConfig[mainRecord.category].icon}</span>
                              <h4 className="font-bold text-gray-900 truncate flex-1 min-w-0">{mainRecord.productName}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full border whitespace-nowrap ${statusConfig[mainRecord.status].color}`}>
                                {getStatusText(mainRecord.status)}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">
                              {mainRecord.brand} • {mainRecord.duration} 급여
                            </p>
                            {mainRecord.comment && (
                              <p className="text-sm text-gray-700 italic break-words">&ldquo;{mainRecord.comment}&rdquo;</p>
                            )}
                          </div>
                          <div className="lg:ml-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">기호성</span>
                              <div className="flex items-center space-x-1">
                                {renderStars(mainRecord.palatability)}
                              </div>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-600">만족도</span>
                              <div className="flex items-center space-x-1">
                                {renderStars(mainRecord.satisfaction)}
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Benefits & Side Effects */}
                        <div className="mt-3">
                          {mainRecord.benefits && mainRecord.benefits.length > 0 && (
                            <div className="flex flex-wrap gap-1 mb-2">
                              {mainRecord.benefits.slice(0, 4).map((benefit, index) => (
                                <span key={index} className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                                  ✓ {benefit}
                                </span>
                              ))}
                            </div>
                          )}
                          {mainRecord.sideEffects && mainRecord.sideEffects.length > 0 && (
                            <div className="flex flex-wrap gap-1">
                              {mainRecord.sideEffects.slice(0, 2).map((sideEffect, index) => (
                                <span key={index} className="px-2 py-1 text-xs bg-red-100 text-red-700 rounded-full">
                                  ⚠ {sideEffect}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Update Info */}
                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500 text-center">
                        마지막 업데이트: {formatDate(post.updatedAt)}
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {filteredPosts.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-500">다른 검색어나 필터를 시도해보세요.</p>
            </div>
          )}
        </div>
      </main>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                로그인이 필요합니다
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                급여 기록을 공유하려면 먼저 로그인해주세요.<br />
                로그인 후에 다양한 기능을 이용할 수 있습니다.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  로그인하기
                </Link>
                
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                아직 계정이 없으신가요? 
                <Link href="/signup" className="text-purple-600 hover:text-purple-700 ml-1">
                  회원가입
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
