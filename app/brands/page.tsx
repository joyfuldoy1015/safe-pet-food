'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Star, Shield, AlertTriangle, CheckCircle, Users, ArrowLeft, Search, Filter, BarChart3, MessageSquare } from 'lucide-react'

interface Brand {
  id: string
  name: string
  manufacturer: string
  recall_history: Array<{
    date: string
    reason: string
    severity: string
    resolved: boolean
  }>
  overall_rating: number
  product_lines: string[]
  established_year: number
  country: string
  certifications: string[]
}

export default function BrandsPage() {
  const [brands, setBrands] = useState<Brand[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'rating' | 'name' | 'transparency'>('rating')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchBrands()
  }, [])

  const fetchBrands = async () => {
    try {
      const response = await fetch('/api/brands')
      const data = await response.json()
      setBrands(data)
    } catch (error) {
      console.error('Failed to fetch brands:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTransparencyScore = (brand: Brand) => {
    const recallCount = brand.recall_history.length
    const highSeverityCount = brand.recall_history.filter(r => r.severity === 'high').length
    const unresolvedCount = brand.recall_history.filter(r => !r.resolved).length
    
    let score = 5
    score -= recallCount * 0.5
    score -= highSeverityCount * 1
    score -= unresolvedCount * 2
    
    return Math.max(0, Math.min(5, score))
  }

  const filteredAndSortedBrands = brands
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
          return getTransparencyScore(b) - getTransparencyScore(a)
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
    const transparencyScore = getTransparencyScore(brand)
    if (transparencyScore >= 4.5) {
      return { color: 'bg-green-100 text-green-800 border border-green-200', icon: CheckCircle, text: '투명' }
    } else if (transparencyScore >= 3) {
      return { color: 'bg-yellow-100 text-yellow-800 border border-yellow-200', icon: Shield, text: '보통' }
    } else {
      return { color: 'bg-red-100 text-red-800 border border-red-200', icon: AlertTriangle, text: '불투명' }
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
                  const transparencyScore = getTransparencyScore(brand)
                  
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
                            <div className="font-semibold text-gray-900">{brand.product_lines.length}개</div>
                          </div>
                          <div className="bg-gray-50 rounded-lg p-3">
                            <div className="text-xs text-gray-500 mb-1">투명성 점수</div>
                            <div className="font-semibold text-gray-900">{transparencyScore.toFixed(1)}/5.0</div>
                          </div>
                        </div>

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
                  현재 먹이고 있는 사료의 영양 성분을 분석하고 칼로리 계산까지 한 번에!
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/nutrition-calculator"
                    className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 text-black font-bold py-3 px-6 rounded-xl transition-all duration-200"
                  >
                    성분 분석하기
                  </Link>
                  <Link
                    href="/calorie-calculator"
                    className="inline-block bg-white hover:bg-gray-50 text-gray-900 font-bold py-3 px-6 rounded-xl border border-gray-200 transition-all duration-200"
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