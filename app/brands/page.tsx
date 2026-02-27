'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { Star, Shield, AlertTriangle, CheckCircle, Users, ArrowLeft, Search, Filter, BarChart3, MessageSquare, ChevronDown } from 'lucide-react'
import { calculateSafiScore, getSafiLevelColor, getSafiLevelLabel, type SafiResult } from '@/lib/safi-calculator'
import { getBrowserClient } from '@/lib/supabase-client'

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
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const sortDropdownRef = useRef<HTMLDivElement>(null)
  const [safiReviewsByBrand, setSafiReviewsByBrand] = useState<Record<string, any[]>>({})

  // 드롭다운 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  useEffect(() => {
    fetchBrands()
  }, [])

  // review_logs에서 SAFI 데이터 조회
  useEffect(() => {
    const fetchSafiReviews = async () => {
      if (brands.length === 0) return
      try {
        const supabase = getBrowserClient()
        const { data, error } = await supabase
          .from('review_logs')
          .select('brand, stool_score, allergy_symptoms, vomiting, appetite_change')

        if (error || !data) return

        const grouped: Record<string, any[]> = {}
        data
          .filter((r: any) => r.stool_score !== null || r.vomiting !== null || r.appetite_change !== null)
          .forEach((r: any) => {
            const key = (r.brand || '').toLowerCase()
            if (!grouped[key]) grouped[key] = []
            grouped[key].push({
              stoolScore: r.stool_score ?? null,
              allergySymptoms: r.allergy_symptoms && r.allergy_symptoms.length > 0 ? r.allergy_symptoms : null,
              vomiting: r.vomiting ?? null,
              appetiteChange: r.appetite_change
                ? (r.appetite_change.toUpperCase() as 'INCREASED' | 'DECREASED' | 'NORMAL' | 'REFUSED')
                : null
            })
          })

        setSafiReviewsByBrand(grouped)
      } catch (err) {
        console.error('SAFI 리뷰 데이터 조회 실패:', err)
      }
    }

    fetchSafiReviews()
  }, [brands])

  // Calculate SAFI scores for each brand
  const brandsWithSafi = useMemo(() => {
    return brands.map(brand => {
      const brandKey = brand.name.toLowerCase()
      const safiReviews = safiReviewsByBrand[brandKey] || []

      const recallHistory = brand.recall_history.map(recall => ({
        date: recall.date,
        severity: (recall.severity === 'high' ? 'high' : recall.severity === 'medium' ? 'medium' : 'low') as 'high' | 'medium' | 'low'
      }))

      const allIngredients: string[] = []

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
  }, [brands, safiReviewsByBrand])

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
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500"></div>
            <p className="mt-4 text-sm text-gray-500">브랜드 정보를 불러오는 중...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Title Section */}
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            브랜드 둘러보기
          </h1>
          <p className="text-sm text-gray-500">
            다양한 브랜드의 투명성과 품질을 비교하고 신뢰할 수 있는 선택을 하세요
          </p>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          {/* Filter Panel */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-5 space-y-5 border border-gray-100 sticky top-24">
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
                    <Filter className="h-4 w-4 text-gray-600" />
                  </span>
                  필터 및 정렬
                </h3>
                
                {/* Search */}
                <div className="mb-5">
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    브랜드 검색
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                      placeholder="브랜드명 또는 제조사"
                    />
                  </div>
                </div>

                {/* Sort Options - 커스텀 드롭다운 */}
                <div className="relative" ref={sortDropdownRef}>
                  <label className="block text-xs font-medium text-gray-500 mb-2">
                    정렬 기준
                  </label>
                  <button
                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm hover:bg-gray-50 focus:ring-2 focus:ring-violet-500 focus:border-transparent transition-colors"
                  >
                    <span className="font-medium text-gray-900">
                      {sortBy === 'rating' ? '평점 높은 순' : sortBy === 'transparency' ? '투명성 높은 순' : '이름 순'}
                    </span>
                    <ChevronDown className={`h-4 w-4 text-gray-400 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {/* 드롭다운 메뉴 */}
                  {sortDropdownOpen && (
                    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
                      {[
                        { value: 'rating', label: '평점 높은 순' },
                        { value: 'transparency', label: '투명성 높은 순' },
                        { value: 'name', label: '이름 순' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value as 'rating' | 'name' | 'transparency')
                            setSortDropdownOpen(false)
                          }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors ${
                            sortBy === option.value 
                              ? 'bg-violet-50 text-violet-700 font-medium' 
                              : 'text-gray-600'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="pt-5 mt-4 border-t border-gray-100">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-violet-600">{brands.length}</div>
                    <div className="text-xs text-gray-500">등록된 브랜드</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Brands Grid */}
          <div className="lg:col-span-3">
            {filteredAndSortedBrands.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Search className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-base font-semibold text-gray-900 mb-1">검색 결과가 없습니다</h3>
                <p className="text-sm text-gray-500">다른 검색어를 시도해보세요</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {filteredAndSortedBrands.map((brand) => {
                  const transparencyBadge = getTransparencyBadge(brand)
                  const TransparencyIcon = transparencyBadge.icon
                  const transparencyScore = brand.transparency_score || 75 // 100점 만점
                  
                  return (
                    <Link
                      key={brand.id}
                      href={`/brands/${encodeURIComponent(brand.name)}`}
                      className="block bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-200 border border-gray-100 group"
                    >
                      <div className="p-5">
                        {/* Header */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h3 className="text-base font-bold text-gray-900 mb-0.5 group-hover:text-violet-600 transition-colors">
                              {brand.name}
                            </h3>
                            <p className="text-xs text-gray-500">{brand.manufacturer}</p>
                          </div>
                          <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-medium ${transparencyBadge.color}`}>
                            <TransparencyIcon className="h-3 w-3" />
                            <span>{transparencyBadge.text}</span>
                          </div>
                        </div>

                        {/* Description */}
                        {brand.description && (
                          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                            {brand.description}
                          </p>
                        )}

                        {/* Rating */}
                        <div className="flex items-center gap-2 mb-3">
                          <div className="flex items-center">
                            {renderStars(brand.overall_rating)}
                          </div>
                          <span className="text-sm font-semibold text-gray-900">
                            {brand.overall_rating.toFixed(1)}
                          </span>
                        </div>

                        {/* Info Grid */}
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          <div className="text-center p-2 bg-gray-50 rounded-xl">
                            <div className="text-[10px] text-gray-500 mb-0.5">설립</div>
                            <div className="text-xs font-semibold text-gray-900">{brand.established_year}</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-xl">
                            <div className="text-[10px] text-gray-500 mb-0.5">원산지</div>
                            <div className="text-xs font-semibold text-gray-900">{brand.country}</div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-xl">
                            <div className="text-[10px] text-gray-500 mb-0.5">제품</div>
                            <div className="text-xs font-semibold text-gray-900">
                              {brand.products_count !== undefined 
                                ? `${brand.products_count}개` 
                                : `${brand.product_lines.length}개`}
                            </div>
                          </div>
                          <div className="text-center p-2 bg-gray-50 rounded-xl">
                            <div className="text-[10px] text-gray-500 mb-0.5">투명성</div>
                            <div className="text-xs font-semibold text-gray-900">{transparencyScore}</div>
                          </div>
                        </div>

                        {/* SAFI Score */}
                        {brand.safiScore && (
                          <div className="mb-3 p-3 bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-1.5">
                                <Shield className="h-3.5 w-3.5 text-blue-500" />
                                <span className="text-xs font-medium text-gray-600">SAFI 점수</span>
                              </div>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                brand.safiScore.level === 'SAFE' ? 'bg-green-100 text-green-700' :
                                brand.safiScore.level === 'NORMAL' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                              }`}>
                                {getSafiLevelLabel(brand.safiScore.level)}
                              </span>
                            </div>
                            <div className="flex items-baseline gap-1">
                              <span className="text-lg font-bold text-gray-900">{brand.safiScore.overallScore.toFixed(1)}</span>
                              <span className="text-xs text-gray-400">/ 100</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-1.5 mt-1.5">
                              <div 
                                className={`h-1.5 rounded-full transition-all duration-500 ${
                                  brand.safiScore.level === 'SAFE' ? 'bg-green-500' :
                                  brand.safiScore.level === 'NORMAL' ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${brand.safiScore.overallScore}%` }}
                              ></div>
                            </div>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                          <div className="flex items-center gap-1 text-xs text-gray-500">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            <span>리콜 {brand.recall_history.length}건</span>
                          </div>
                          <div className="flex items-center gap-1 text-xs font-medium text-violet-600 group-hover:text-violet-700">
                            <span>자세히 보기</span>
                            <svg className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="mt-8">
              <div className="bg-white rounded-2xl p-6 text-center border border-gray-100 shadow-sm">
                <h3 className="text-base font-bold text-gray-900 mb-2">
                  우리 아이 사료도 분석해보세요!
                </h3>
                <p className="text-sm text-gray-500 mb-4">
                  현재 먹이고 있는 사료의 칼로리를 계산하고 적정 급여량을 확인하세요
                </p>
                <Link
                  href="/calorie-calculator"
                  className="inline-block bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium py-2.5 px-5 rounded-xl transition-colors"
                >
                  칼로리 계산하기
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 