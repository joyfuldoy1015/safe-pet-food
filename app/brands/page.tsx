'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Star, Shield, AlertTriangle, CheckCircle, Users, ArrowLeft, Search, Filter, BarChart3, MessageSquare } from 'lucide-react'
import { calculateSafiScore, getSafiLevelColor, getSafiLevelLabel, type SafiResult } from '@/lib/safi-calculator'
import { mockReviewLogs } from '@/lib/mock/review-log'

interface Brand {
  id: string
  name: string
  manufacturer: string
  description?: string
  recall_history: Array<{
    date: string
    reason: string
    severity: string
    resolved: boolean
  }>
  overall_rating: number
  product_lines: string[]
  products_count?: number // products 테이블의 실제 제품 개수
  established_year: number
  country: string
  certifications: string[]
  transparency_score?: number // 100점 만점
  safiScore?: SafiResult
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'transparency'>('rating')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchBrands()
  }, [])

  // Calculate SAFI scores for each brand
  const brandsWithSafi = useMemo(() => {
    return brands.map(brand => {
      // Get reviews for this brand
      const brandReviews = mockReviewLogs.filter(review => review.brand === brand.name)
      
      // SAFI 계산을 위한 리뷰 데이터 변환
      const safiReviews = brandReviews.map(review => ({
        stoolScore: review.stool_score ?? null,
        allergySymptoms: review.allergy_symptoms ? ['allergy'] : null,
        vomiting: review.vomiting ?? null,
        appetiteChange: review.appetite_change 
          ? (review.appetite_change.toUpperCase() as 'INCREASED' | 'DECREASED' | 'NORMAL' | 'REFUSED')
          : null
      }))

      // 브랜드 리콜 이력
      const recallHistory = brand.recall_history.map(recall => ({
        date: recall.date,
        severity: (recall.severity === 'high' ? 'high' : recall.severity === 'medium' ? 'medium' : 'low') as 'high' | 'medium' | 'low'
      }))

      // 제품들의 원재료 정보 (현재는 product_lines만 있으므로 빈 배열로 처리)
      // 실제로는 브랜드 상세 페이지에서 제품 정보를 가져와야 함
      const allIngredients: string[] = []

      // SAFI 점수 계산
      const safiResult = calculateSafiScore({
        reviews: safiReviews,
        recallHistory,
        ingredients: allIngredients
      })

      return {
        ...brand,
        safiScore: safiResult
      }
    })
  }, [brands])

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      // API 응답이 배열인지 확인
      if (Array.isArray(data)) {
        setBrands(data)
      } else if (data.error) {
        console.error('API error:', data.error)
        setBrands([])
      } else {
        // 예상치 못한 응답 형식
        console.warn('Unexpected API response format:', data)
        setBrands([])
      }
    } catch (error) {
      console.error('Failed to fetch brands:', error)
      setBrands([])
    } finally {
      setLoading(false)
    }
  }

  // 투명성 점수는 Supabase의 transparency_score 필드를 사용 (100점 만점)
  // getTransparencyScore 함수는 제거하고 brand.transparency_score 직접 사용

  const filteredAndSortedBrands = brandsWithSafi
    .filter(brand => 
      brand.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      brand.manufacturer.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.overall_rating - a.overall_rating
        case 'name':
          return a.name.localeCompare(b.name)
        case 'transparency':
          return (b.transparency_score || 75) - (a.transparency_score || 75)
        default:
          return 0
      }
    })

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < Math.floor(rating) 
            ? 'text-yellow-400 fill-current' 
            : i < rating 
              ? 'text-yellow-400 fill-current opacity-50'
              : 'text-gray-300'
        }`}
      />
    ))
  }

  const getTransparencyBadge = (brand: Brand) => {
    const transparencyScore = brand.transparency_score || 75 // 100점 만점 기준
    if (transparencyScore >= 80) {
      return { color: 'bg-green-100 text-green-800 border border-green-200', icon: CheckCircle, text: '매우 투명' }
    } else if (transparencyScore >= 60) {
      return { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: Shield, text: '보통 투명' }
    } else {
      return { color: 'bg-red-100 text-red-800 border border-red-200', icon: AlertTriangle, text: '투명성 부족' }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-500"></div>
            <p className="mt-4 text-gray-600">브랜드 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Title Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            사료 브랜드 투명성 평가 🏆
          </h2>
          <p className="text-lg text-gray-600 mb-6">
            다양한 브랜드의 투명성과 품질을 비교하고 신뢰할 수 있는 선택을 하세요
          </p>
          
          {/* 새로운 기능 링크 */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link 
              href="/brands/compare"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors shadow-sm"
            >
              <BarChart3 className="h-4 w-4" />
              <span>브랜드 비교하기</span>
            </Link>
            <Link 
              href="/community/qa-forum"
              className="inline-flex items-center space-x-2 px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors shadow-sm"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Q&A 포럼</span>
            </Link>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-8">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-lg p-6 space-y-6 border border-gray-100 sticky top-24">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  필터 및 정렬
                </h3>
                
                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    브랜드 검색
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:border-transparent"
                      placeholder="브랜드명 또는 제조사"
                    />
                  </div>
                </div>

                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    정렬 기준
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'rating', label: '평점 높은 순' },
                      { value: 'transparency', label: '투명성 높은 순' },
                      { value: 'name', label: '이름 순' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setSortBy(option.value as 'rating' | 'name' | 'transparency')}
                        className={`w-full text-left px-4 py-3 rounded-xl transition-colors ${
                          sortBy === option.value
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="pt-6 border-t border-gray-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-yellow-600">{brands.length}</div>
                    <div className="text-sm text-gray-600">등록된 브랜드</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Brands Grid */}
          <div className="lg:col-span-3">
            {filteredAndSortedBrands.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-12 w-12 text-gray-400" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
                <p className="text-gray-600">다른 검색어를 시도해보세요</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-6">
                {filteredAndSortedBrands.map((brand) => {
                  const transparencyBadge = getTransparencyBadge(brand)
                  const TransparencyIcon = transparencyBadge.icon
                  const transparencyScore = brand.transparency_score || 75 // 100점 만점
                  
                  return (
                    <Link
                      key={brand.id}
                      href={`/brands/${encodeURIComponent(brand.name)}`}
                      className="block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 group"
                    >
                      <div className="p-6">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex-1">
                            <h3 className="text-xl font-bold text-gray-900 mb-1 group-hover:text-yellow-600 transition-colors">
                              {brand.name}
                            </h3>
                            <p className="text-sm text-gray-600">{brand.manufacturer}</p>
                          </div>
                          <div className={`flex items-center space-x-1 px-3 py-1 rounded-full text-xs font-medium ${transparencyBadge.color}`}>
                            <TransparencyIcon className="h-3 w-3" />
                            <span>{transparencyBadge.text}</span>
                          </div>
                        </div>

                        {/* Description */}
                        {brand.description && (
                          <div className="mb-4">
                            <p className="text-sm text-gray-700 line-clamp-3 leading-relaxed">
                              {brand.description}
                            </p>
                          </div>
                        )}

                        {/* Rating */}
                        <div className="flex items-center space-x-2 mb-4">
                          <div className="flex items-center">
                            {renderStars(brand.overall_rating)}
                          </div>
                          <span className="text-sm font-medium text-gray-700">
                            {brand.overall_rating.toFixed(1)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({Math.floor(Math.random() * 100) + 50}개 리뷰)
                          </span>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">설립년도</div>
                            <div className="font-semibold text-gray-900">{brand.established_year}년</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">원산지</div>
                            <div className="font-semibold text-gray-900">{brand.country}</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">제품 라인</div>
                            <div className="font-semibold text-gray-900">
                              {brand.products_count !== undefined 
                                ? `${brand.products_count}개` 
                                : `${brand.product_lines.length}개`}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">투명성 점수</div>
                            <div className="font-semibold text-gray-900">{transparencyScore}/100</div>
                          </div>
                        </div>

                        {/* SAFI Score */}
                        {brand.safiScore && (
                          <div className="mb-4 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <Shield className="h-4 w-4 text-blue-600" />
                                <span className="text-sm font-medium text-gray-700">SAFI 안전성 점수</span>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-semibold border ${getSafiLevelColor(brand.safiScore.level)}`}>
                                {getSafiLevelLabel(brand.safiScore.level)}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-2">
                              <span className="text-2xl font-bold text-gray-900">{brand.safiScore.overallScore.toFixed(1)}</span>
                              <span className="text-sm text-gray-500">/ 100</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                              <div 
                                className={`h-2 rounded-full transition-all duration-500 ${
                                  brand.safiScore.level === 'SAFE' ? 'bg-green-500' :
                                  brand.safiScore.level === 'NORMAL' ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${brand.safiScore.overallScore}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Recall Info */}
                        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                          <div className="flex items-center text-sm text-gray-600">
                            <AlertTriangle className="h-4 w-4 mr-1" />
                            <span>리콜 이력 {brand.recall_history.length}건</span>
                          </div>
                          <div className="flex items-center text-sm font-medium text-yellow-600 group-hover:text-yellow-700">
                            <span>자세히 보기</span>
                            <svg className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </Link>
                  )
                })}
              </div>
            )}

            {/* CTA Section */}
            <div className="mt-12">
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 text-center border border-yellow-200">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  우리 아이 사료도 분석해보세요! 🔍
                </h3>
                <p className="text-gray-600 mb-6">
                  현재 먹이고 있는 사료의 칼로리를 계산하고 적정 급여량을 확인하세요!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/calorie-calculator"
                    className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-bold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    칼로리 계산하기
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 