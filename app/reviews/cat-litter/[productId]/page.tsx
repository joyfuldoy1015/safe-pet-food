'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  Star, ArrowLeft, ThumbsUp, MessageCircle, Share2, 
  Camera, User, ShoppingCart, Heart, 
  BarChart3, Award
} from 'lucide-react'

interface Product {
  id: string
  name: string
  brand: string
  imageUrl: string
  litterType: string
  keyFeatures: string[]
  priceInfo: number
  priceUnit: string
  overallRating: number
  reviewCount: number
  detailedRatings: {
    dust: number
    clumping: number
    odorControl: number
    tracking: number
  }
  aiSummary: {
    pros: string[]
    cons: string[]
    summary: string
  }
  recommendationStats: {
    totalRecommendations: number
    recommendationRate: number
  }
  usageStats: {
    averageUsageDays: number
    repurchaseRate: number
  }
}

interface Review {
  id: string
  productId: string
  userId: string
  userName: string
  userAvatar: string
  overallRating: number
  detailedRatings: {
    dust: number
    clumping: number
    odorControl: number
    tracking: number
  }
  title: string
  content: string
  media: string[]
  petProfile: {
    numberOfCats: number
    litterBoxType: string
  }
  helpfulCount: number
  createdAt: string
  hasPhotos: boolean
  wouldRecommend: boolean
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params.productId as string
  
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewFilter, setReviewFilter] = useState<'all' | 'photos' | 'rating' | 'recommended'>('all')
  const [showFullReview, setShowFullReview] = useState<{ [key: string]: boolean }>({})
  const [helpfulClicked, setHelpfulClicked] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    if (productId) {
      fetchProductData()
    }
  }, [productId])

  const fetchProductData = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/cat-litter/${productId}`)
      const data = await response.json()
      setProduct(data.product)
      setReviews(data.reviews)
    } catch (error) {
      console.error('Failed to fetch product data:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClass = size === 'sm' ? 'h-3 w-3' : size === 'lg' ? 'h-6 w-6' : 'h-4 w-4'
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`${sizeClass} ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300'
        }`}
      />
    ))
  }

  const renderRatingBar = (label: string, rating: number, icon: React.ReactNode) => {
    const percentage = (rating / 5) * 100
    return (
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex items-center space-x-2 w-24">
          {icon}
          <span className="text-sm font-medium text-gray-700">{label}</span>
        </div>
        <div className="flex-1 bg-gray-200 rounded-full h-3">
          <div 
            className="bg-gradient-to-r from-yellow-400 to-orange-400 h-3 rounded-full transition-all duration-500"
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <span className="text-sm font-bold text-gray-900 w-8">{rating.toFixed(1)}</span>
      </div>
    )
  }

  const toggleHelpful = (reviewId: string) => {
    setHelpfulClicked(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

  const toggleFullReview = (reviewId: string) => {
    setShowFullReview(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }))
  }

  const filteredReviews = reviews.filter(review => {
    if (reviewFilter === 'photos') return review.hasPhotos
    if (reviewFilter === 'rating') return review.overallRating >= 4
    if (reviewFilter === 'recommended') return review.wouldRecommend
    return true
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="grid lg:grid-cols-2 gap-12 mb-12">
              <div className="aspect-square bg-gray-200 rounded-2xl"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded"></div>
                <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">제품을 찾을 수 없습니다</h2>
            <Link href="/reviews/cat-litter" className="text-yellow-600 hover:text-yellow-700 font-medium">
              목록으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Summary */}
        <div className="grid lg:grid-cols-2 gap-12 mb-12">
          {/* Product Image */}
          <div>
            <div className="aspect-square bg-gray-100 rounded-2xl flex items-center justify-center">
              <div className="text-8xl">🐱</div>
            </div>
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <span className="text-lg text-gray-600">{product.brand}</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                  {product.litterType}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
              
              <div className="flex items-center space-x-2 mb-4">
                {renderStars(product.overallRating, 'lg')}
                <span className="text-2xl font-bold text-gray-900 ml-2">
                  {product.overallRating.toFixed(1)}
                </span>
                <span className="text-gray-600">
                  ({product.reviewCount.toLocaleString()}개 리뷰)
                </span>
              </div>

              {/* Recommendation Stats */}
              <div className="bg-green-50 rounded-xl p-4 mb-6 border border-green-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-2xl">👍</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-green-800">
                        {product.recommendationStats.recommendationRate}%
                      </div>
                      <div className="text-sm text-green-700">
                        집사들이 추천해요
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      {product.recommendationStats.totalRecommendations}명
                    </div>
                    <div className="text-sm text-gray-600">
                      추천한 집사
                    </div>
                  </div>
                </div>
              </div>

              {/* Usage Stats */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-lg">🔄</span>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-blue-800">
                        {product.usageStats.repurchaseRate}%
                      </div>
                      <div className="text-sm text-blue-700">
                        재구매 의사
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-lg">📅</span>
                    </div>
                    <div>
                      <div className="text-xl font-bold text-purple-800">
                        {product.usageStats.averageUsageDays}일
                      </div>
                      <div className="text-sm text-purple-700">
                        평균 사용 기간
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="text-3xl font-bold text-gray-900 mb-6">
                {product.priceInfo.toLocaleString()}원
                <span className="text-lg text-gray-600 font-normal ml-2">
                  / {product.priceUnit}
                </span>
              </div>
            </div>

            {/* Key Features */}
            <div>
              <h3 className="font-bold text-gray-900 mb-3">주요 특징</h3>
              <div className="flex flex-wrap gap-2">
                {product.keyFeatures.map((feature, index) => (
                  <span key={index} className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* AI Summary */}
            <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200">
              <h3 className="font-bold text-gray-900 mb-3 flex items-center">
                <Award className="h-5 w-5 mr-2 text-yellow-600" />
                AI 리뷰 요약
              </h3>
              <p className="text-gray-700 mb-4">{product.aiSummary.summary}</p>
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium text-green-800 mb-2">👍 장점</h4>
                  <div className="flex flex-wrap gap-1">
                    {product.aiSummary.pros.map((pro, index) => (
                      <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {pro}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-red-800 mb-2">👎 단점</h4>
                  <div className="flex flex-wrap gap-1">
                    {product.aiSummary.cons.map((con, index) => (
                      <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                        {con}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4">
              <button className="flex-1 bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-bold py-3 px-6 rounded-xl transition-all duration-200 flex items-center justify-center">
                <ShoppingCart className="h-5 w-5 mr-2" />
                최저가 구매
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                찜하기
              </button>
              <button className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors">
                <Share2 className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Review Stats */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border border-gray-100">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
            <BarChart3 className="h-6 w-6 mr-2 text-blue-500" />
            상세 평가
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              {renderRatingBar(
                '먼지',
                product.detailedRatings.dust,
                <div className="w-5 h-5 bg-blue-100 rounded flex items-center justify-center">
                  <span className="text-xs">💨</span>
                </div>
              )}
              {renderRatingBar(
                '응고력',
                product.detailedRatings.clumping,
                <div className="w-5 h-5 bg-green-100 rounded flex items-center justify-center">
                  <span className="text-xs">🪨</span>
                </div>
              )}
            </div>
            <div>
              {renderRatingBar(
                '탈취력',
                product.detailedRatings.odorControl,
                <div className="w-5 h-5 bg-purple-100 rounded flex items-center justify-center">
                  <span className="text-xs">🌸</span>
                </div>
              )}
              {renderRatingBar(
                '사막화',
                product.detailedRatings.tracking,
                <div className="w-5 h-5 bg-orange-100 rounded flex items-center justify-center">
                  <span className="text-xs">👣</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="h-6 w-6 mr-2 text-green-500" />
              사용자 리뷰 ({reviews.length})
            </h2>
            <button className="bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2 px-4 rounded-lg transition-colors">
              리뷰 작성하기
            </button>
          </div>

          {/* Review Filters */}
          <div className="flex space-x-4 mb-6">
            <button
              onClick={() => setReviewFilter('all')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reviewFilter === 'all'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              전체 ({reviews.length})
            </button>
            <button
              onClick={() => setReviewFilter('photos')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                reviewFilter === 'photos'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Camera className="h-4 w-4 mr-1" />
              사진 있는 리뷰 ({reviews.filter(r => r.hasPhotos).length})
            </button>
            <button
              onClick={() => setReviewFilter('rating')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                reviewFilter === 'rating'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              고평점 리뷰 ({reviews.filter(r => r.overallRating >= 4).length})
            </button>
            <button
              onClick={() => setReviewFilter('recommended')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center ${
                reviewFilter === 'recommended'
                  ? 'bg-green-100 text-green-800'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              👍 추천 리뷰 ({reviews.filter(r => r.wouldRecommend).length})
            </button>
          </div>

          {/* Reviews List */}
          <div className="space-y-6">
            {filteredReviews.map((review) => (
              <div key={review.id} className="bg-gray-50 rounded-xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-black" />
                    </div>
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">{review.userName}</span>
                        {review.wouldRecommend && (
                          <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full flex items-center">
                            👍 추천
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {review.petProfile.numberOfCats}마리 • {review.petProfile.litterBoxType} • {review.createdAt}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-1">
                    {renderStars(review.overallRating, 'sm')}
                    <span className="text-sm font-medium text-gray-900 ml-1">
                      {review.overallRating}
                    </span>
                  </div>
                </div>

                <h4 className="font-bold text-gray-900 mb-3">{review.title}</h4>

                {/* Detailed Ratings */}
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">먼지</div>
                    <div className="flex justify-center">{renderStars(review.detailedRatings.dust, 'sm')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">응고력</div>
                    <div className="flex justify-center">{renderStars(review.detailedRatings.clumping, 'sm')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">탈취력</div>
                    <div className="flex justify-center">{renderStars(review.detailedRatings.odorControl, 'sm')}</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xs text-gray-500 mb-1">사막화</div>
                    <div className="flex justify-center">{renderStars(review.detailedRatings.tracking, 'sm')}</div>
                  </div>
                </div>

                {/* Review Content */}
                <div className="text-gray-700 leading-relaxed mb-4">
                  {showFullReview[review.id] || review.content.length <= 200 
                    ? review.content 
                    : `${review.content.substring(0, 200)}...`
                  }
                  {review.content.length > 200 && (
                    <button
                      onClick={() => toggleFullReview(review.id)}
                      className="text-yellow-600 hover:text-yellow-700 font-medium ml-2"
                    >
                      {showFullReview[review.id] ? '접기' : '더보기'}
                    </button>
                  )}
                </div>

                {/* Media */}
                {review.media.length > 0 && (
                  <div className="flex space-x-2 mb-4">
                    {review.media.slice(0, 3).map((media, index) => (
                      <div key={index} className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <Camera className="h-6 w-6 text-gray-400" />
                      </div>
                    ))}
                    {review.media.length > 3 && (
                      <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                        <span className="text-sm text-gray-600">+{review.media.length - 3}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => toggleHelpful(review.id)}
                    className={`flex items-center space-x-1 px-3 py-1 rounded-lg transition-colors ${
                      helpfulClicked[review.id]
                        ? 'bg-blue-100 text-blue-800'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <ThumbsUp className="h-4 w-4" />
                    <span className="text-sm">
                      도움돼요 ({review.helpfulCount + (helpfulClicked[review.id] ? 1 : 0)})
                    </span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors">
                    <MessageCircle className="h-4 w-4" />
                    <span className="text-sm">댓글</span>
                  </button>
                  <button className="flex items-center space-x-1 text-gray-600 hover:bg-gray-100 px-3 py-1 rounded-lg transition-colors">
                    <Share2 className="h-4 w-4" />
                    <span className="text-sm">공유</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredReviews.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📝</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">해당하는 리뷰가 없습니다</h3>
              <p className="text-gray-600">다른 필터를 선택해보세요</p>
            </div>
          )}
        </div>

        {/* CTA Section */}
        <div className="mt-12">
          <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 text-center border border-yellow-200">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              다른 고양이 모래도 비교해보세요! 🔍
            </h3>
            <p className="text-gray-600 mb-6">
              우리 아이에게 딱 맞는 모래를 찾기 위해 다양한 제품을 비교해보세요
            </p>
            <Link
              href="/reviews/cat-litter"
              className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-bold py-3 px-6 rounded-xl transition-all duration-200"
            >
              다른 제품 보기
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
} 