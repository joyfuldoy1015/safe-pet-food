'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, ThumbsUp, MessageCircle } from 'lucide-react'

interface Product {
  id: string
  name: string
  brand: string
  imageUrl: string
  overallRating: number
  reviewCount: number
  priceInfo?: {
    price?: number
    unit?: string
  }
  treatType?: string
  mainIngredient?: string
  functionality?: string[]
}

interface Review {
  id: string
  userName: string
  userAvatar: string
  overallRating: number
  title: string
  pros: string
  cons: string
  content: string
  createdAt: string
  helpfulCount: number
}

export default function CatTreatDetailPage({ params }: { params: { productId: string } }) {
  const [product, setProduct] = useState<Product | null>(null)
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // API 호출
        const response = await fetch(`/api/cat-treats/${params.productId}`)
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('제품을 찾을 수 없습니다.')
          } else {
            setError(`서버 오류: ${response.status}`)
          }
          return
        }
        
        const data = await response.json()
        
        if (!data || !data.product) {
          setError('제품 데이터를 불러올 수 없습니다.')
          return
        }
        
        setProduct(data.product)
        setReviews(data.reviews || [])
      } catch (err) {
        console.error('데이터 로딩 중 오류:', err)
        setError('네트워크 오류가 발생했습니다.')
      } finally {
        setLoading(false)
      }
    }

    if (params.productId) {
      fetchData()
    }
  }, [params.productId])

  const renderStars = (rating: number) => {
    const safeRating = Math.max(0, Math.min(5, rating || 0))
    return (
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-5 w-5 ${
              star <= safeRating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-2 text-sm text-gray-600">({safeRating.toFixed(1)})</span>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="h-96 bg-gray-200 rounded-lg"></div>
              <div className="space-y-4">
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">
            {error || '제품을 찾을 수 없습니다'}
          </h1>
          <p className="text-gray-600 mb-4">요청하신 제품 ID: {params.productId}</p>
          <Link 
            href="/reviews/cat-treats" 
            className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
          >
            간식 리뷰 목록으로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Product Info */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <img
              src={product.imageUrl || '/images/placeholder-product.jpg'}
              alt={product.name || '제품 이미지'}
              className="w-full h-96 object-cover rounded-lg shadow-lg"
              onError={(e) => {
                e.currentTarget.src = '/images/placeholder-product.jpg'
              }}
            />
          </div>
          
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name || '제품명 없음'}
              </h1>
              <p className="text-xl text-gray-600 mb-4">
                {product.brand || '브랜드 정보 없음'}
              </p>
              {renderStars(product.overallRating)}
              <p className="text-sm text-gray-500 mt-1">
                {(product.reviewCount || 0).toLocaleString()}개의 리뷰
              </p>
            </div>

            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">제품 정보</h3>
              <div className="space-y-3">
                {product.priceInfo?.price && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">가격:</span>
                    <span className="font-semibold">
                      {product.priceInfo.price.toLocaleString()}원
                      {product.priceInfo.unit && ` (${product.priceInfo.unit})`}
                    </span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">간식 유형:</span>
                  <span className="font-semibold">{product.treatType || '정보 없음'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">주원료:</span>
                  <span className="font-semibold">{product.mainIngredient || '정보 없음'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">기능성:</span>
                  <span className="font-semibold">
                    {product.functionality && product.functionality.length > 0 
                      ? product.functionality.join(', ') 
                      : '정보 없음'
                    }
                  </span>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button className="flex-1 bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors">
                리뷰 작성하기
              </button>
              <button className="flex items-center justify-center px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <ThumbsUp className="h-5 w-5 mr-2" />
                추천
              </button>
            </div>
          </div>
        </div>

        {/* Reviews Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">리뷰</h2>
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600">{reviews.length}개</span>
            </div>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">아직 리뷰가 없습니다</h3>
              <p className="text-gray-600">첫 번째 리뷰를 작성해보세요!</p>
            </div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border-b border-gray-200 last:border-b-0 pb-6 last:pb-0">
                  <div className="flex items-start space-x-4">
                    <img
                      src={review.userAvatar || '/images/default-avatar.jpg'}
                      alt={review.userName}
                      className="h-12 w-12 rounded-full"
                      onError={(e) => {
                        e.currentTarget.src = '/images/default-avatar.jpg'
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h4 className="font-semibold text-gray-900">{review.userName}</h4>
                          {renderStars(review.overallRating)}
                        </div>
                        <span className="text-sm text-gray-500">{review.createdAt}</span>
                      </div>
                      
                      <h5 className="font-medium text-gray-900 mb-2">{review.title}</h5>
                      
                      <div className="space-y-2 mb-4">
                        {review.pros && (
                          <div className="text-sm">
                            <span className="font-medium text-green-600">장점:</span>
                            <span className="text-gray-700 ml-1">{review.pros}</span>
                          </div>
                        )}
                        {review.cons && (
                          <div className="text-sm">
                            <span className="font-medium text-red-600">단점:</span>
                            <span className="text-gray-700 ml-1">{review.cons}</span>
                          </div>
                        )}
                      </div>
                      
                      <p className="text-gray-700 mb-4">{review.content}</p>
                      
                      <div className="flex items-center space-x-4">
                        <button className="flex items-center space-x-1 text-sm text-gray-600 hover:text-gray-900">
                          <ThumbsUp className="h-4 w-4" />
                          <span>도움돼요 ({review.helpfulCount})</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 