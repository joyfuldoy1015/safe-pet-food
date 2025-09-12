'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Star, 
  Users, 
  TrendingUp,
  Calendar,
  Package,
  Heart,
  MessageSquare,
  BarChart3,
  Award,
  Filter
} from 'lucide-react'

interface Product {
  id: string
  name: string
  brand: string
  category: 'food' | 'treat' | 'supplement'
  averagePalatability: number
  averageRepurchase: number
  totalReviews: number
  activeUsers: number
  price?: number
  description: string
}

interface Review {
  id: string
  petName: string
  petSpecies: 'dog' | 'cat'
  petAge: number
  palatabilityRating: number
  repurchaseIntentRating: number
  startDate: string
  endDate?: string
  notes: string
  isActive: boolean
  createdAt: string
}

// Mock data
const mockProduct: Product = {
  id: '1',
  name: '로얄캐닌 골든리트리버 어덜트',
  brand: '로얄캐닌',
  category: 'food',
  averagePalatability: 4.8,
  averageRepurchase: 4.5,
  totalReviews: 156,
  activeUsers: 89,
  price: 45000,
  description: '골든리트리버 성견을 위해 특별히 개발된 전용 사료입니다. 골든리트리버의 특성을 고려하여 최적의 영양 균형을 제공합니다.'
}

const mockReviews: Review[] = [
  {
    id: '1',
    petName: '뽀삐',
    petSpecies: 'dog',
    petAge: 4,
    palatabilityRating: 5,
    repurchaseIntentRating: 5,
    startDate: '2024-10-01',
    endDate: '2024-12-01',
    notes: '정말 잘 먹어요! 털도 윤기가 나고 소화도 잘 됩니다. 골든리트리버 전용이라 그런지 우리 아이에게 딱 맞는 것 같아요.',
    isActive: false,
    createdAt: '2024-12-01'
  },
  {
    id: '2',
    petName: '골디',
    petSpecies: 'dog',
    petAge: 6,
    palatabilityRating: 4,
    repurchaseIntentRating: 4,
    notes: '괜찮은 사료예요. 가격이 조금 비싸긴 하지만 품질은 좋습니다.',
    startDate: '2024-11-01',
    isActive: true,
    createdAt: '2024-11-15'
  },
  {
    id: '3',
    petName: '럭키',
    petSpecies: 'dog',
    petAge: 3,
    palatabilityRating: 5,
    repurchaseIntentRating: 5,
    notes: '완전 잘 먹어요! 변 상태도 좋고 활력이 넘쳐요. 계속 구매할 예정입니다.',
    startDate: '2024-09-15',
    isActive: true,
    createdAt: '2024-10-01'
  }
]

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.productId as string
  
  const [product] = useState<Product>(mockProduct)
  const [reviews] = useState<Review[]>(mockReviews)
  const [activeTab, setActiveTab] = useState<'reviews' | 'stats'>('reviews')
  const [filterSpecies, setFilterSpecies] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'rating'>('recent')

  const filteredReviews = reviews
    .filter(review => {
      if (filterSpecies === 'all') return true
      return review.petSpecies === filterSpecies
    })
    .sort((a, b) => {
      if (sortBy === 'rating') {
        return b.palatabilityRating - a.palatabilityRating
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'food': return '사료'
      case 'treat': return '간식'
      case 'supplement': return '영양제'
      default: return '기타'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'food': return '🍽️'
      case 'treat': return '🦴'
      case 'supplement': return '💊'
      default: return '📦'
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'food': return 'bg-blue-100 text-blue-800'
      case 'treat': return 'bg-green-100 text-green-800'
      case 'supplement': return 'bg-purple-100 text-purple-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSpeciesText = (species: string) => {
    return species === 'dog' ? '강아지' : '고양이'
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  const formatPrice = (price?: number) => {
    if (!price) return '가격 정보 없음'
    return `${price.toLocaleString()}원`
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('ko-KR')
  }

  const getRatingDistribution = () => {
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
    reviews.forEach(review => {
      const rating = Math.round(review.palatabilityRating)
      distribution[rating as keyof typeof distribution]++
    })
    return distribution
  }

  const getAverageAge = () => {
    if (reviews.length === 0) return 0
    const sum = reviews.reduce((acc, review) => acc + review.petAge, 0)
    return Math.round(sum / reviews.length)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4 mb-4">
            <Link href="/pet-log/products" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{getCategoryIcon(product.category)}</div>
              <span className={`px-3 py-1 text-sm font-medium rounded-full ${getCategoryColor(product.category)}`}>
                {getCategoryText(product.category)}
              </span>
            </div>
          </div>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>
              <p className="text-lg text-gray-600 mb-2">{product.brand}</p>
              {product.price && (
                <p className="text-xl font-bold text-blue-600 mb-4">{formatPrice(product.price)}</p>
              )}
              <p className="text-gray-700">{product.description}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Stats Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Overall Rating */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Award className="h-5 w-5 text-yellow-500" />
                전체 평점
              </h3>
              
              <div className="text-center mb-4">
                <div className="text-4xl font-bold text-gray-900 mb-2">
                  {product.averagePalatability.toFixed(1)}
                </div>
                <div className="flex justify-center mb-2">
                  {renderStars(Math.round(product.averagePalatability))}
                </div>
                <p className="text-sm text-gray-600">{product.totalReviews}개의 리뷰</p>
              </div>

              <div className="space-y-2">
                {Object.entries(getRatingDistribution()).reverse().map(([rating, count]) => (
                  <div key={rating} className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600 w-2">{rating}</span>
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-yellow-400 h-2 rounded-full"
                        style={{ width: `${reviews.length > 0 ? (count / reviews.length) * 100 : 0}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600 w-6">{count}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">주요 통계</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">현재 사용 중</span>
                  <span className="font-bold text-green-600">{product.activeUsers}명</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">재구매 의향</span>
                  <div className="flex items-center space-x-1">
                    <span className="font-bold text-gray-900">{product.averageRepurchase.toFixed(1)}</span>
                    <Star className="h-4 w-4 text-yellow-400 fill-current" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">평균 연령</span>
                  <span className="font-bold text-gray-900">{getAverageAge()}살</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">주 사용 종</span>
                  <span className="font-bold text-gray-900">
                    {reviews.filter(r => r.petSpecies === 'dog').length > reviews.filter(r => r.petSpecies === 'cat').length ? '강아지' : '고양이'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <div className="border-b border-gray-200">
                <nav className="flex">
                  <button
                    onClick={() => setActiveTab('reviews')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'reviews'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <MessageSquare className="h-4 w-4 inline-block mr-2" />
                    사용자 리뷰 ({reviews.length})
                  </button>
                  <button
                    onClick={() => setActiveTab('stats')}
                    className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === 'stats'
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4 inline-block mr-2" />
                    상세 분석
                  </button>
                </nav>
              </div>

              <div className="p-6">
                {activeTab === 'reviews' && (
                  <div>
                    {/* Filters */}
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center space-x-4">
                        <select
                          value={filterSpecies}
                          onChange={(e) => setFilterSpecies(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">모든 반려동물</option>
                          <option value="dog">강아지만</option>
                          <option value="cat">고양이만</option>
                        </select>
                        
                        <select
                          value={sortBy}
                          onChange={(e) => setSortBy(e.target.value as any)}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="recent">최신순</option>
                          <option value="rating">평점순</option>
                        </select>
                      </div>
                      
                      <p className="text-sm text-gray-600">
                        {filteredReviews.length}개의 리뷰
                      </p>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-6">
                      {filteredReviews.map((review) => (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-6">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                {review.petSpecies === 'dog' ? '🐕' : '🐱'}
                              </div>
                              <div>
                                <h4 className="font-medium text-gray-900">{review.petName}</h4>
                                <p className="text-sm text-gray-500">
                                  {getSpeciesText(review.petSpecies)} • {review.petAge}살
                                  {review.isActive && <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">사용 중</span>}
                                </p>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500">{formatDate(review.createdAt)}</p>
                          </div>

                          <div className="flex items-center space-x-6 mb-4">
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">기호성:</span>
                              <div className="flex items-center space-x-1">
                                {renderStars(review.palatabilityRating)}
                                <span className="text-sm font-medium text-gray-900">
                                  {review.palatabilityRating}점
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className="text-sm text-gray-600">재구매:</span>
                              <div className="flex items-center space-x-1">
                                {renderStars(review.repurchaseIntentRating)}
                                <span className="text-sm font-medium text-gray-900">
                                  {review.repurchaseIntentRating}점
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="mb-4">
                            <div className="flex items-center space-x-4 text-sm text-gray-500 mb-2">
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-4 w-4" />
                                <span>{formatDate(review.startDate)}</span>
                                {review.endDate && <span> ~ {formatDate(review.endDate)}</span>}
                              </div>
                            </div>
                          </div>

                          {review.notes && (
                            <div className="bg-gray-50 p-4 rounded-lg">
                              <p className="text-gray-700">{review.notes}</p>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {filteredReviews.length === 0 && (
                      <div className="text-center py-12">
                        <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          {filterSpecies === 'all' ? '아직 리뷰가 없습니다' : '해당 조건의 리뷰가 없습니다'}
                        </h3>
                        <p className="text-gray-500">
                          {filterSpecies === 'all' 
                            ? '첫 번째 리뷰를 남겨보세요!' 
                            : '다른 필터 조건을 시도해보세요.'
                          }
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'stats' && (
                  <div className="space-y-6">
                    <div className="text-center py-12">
                      <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">상세 분석</h3>
                      <p className="text-gray-500">
                        더 많은 데이터가 쌓이면 상세한 분석을 제공해드릴게요!
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
