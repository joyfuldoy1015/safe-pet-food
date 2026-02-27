'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import { Search, Filter, ArrowLeft, ChevronDown } from 'lucide-react'
import SearchTabs from '@/components/search/SearchTabs'
import ProductSearchResult from '@/components/search/ProductSearchResult'
import { useAsyncData, fetchJSON } from '@/hooks/useAsyncData'

interface Brand {
  id: string
  name: string
  manufacturer: string
  description?: string
  country: string
  established_year: number
  certifications: string[]
  transparency_score?: number
  products_count?: number
}

interface Product {
  id: string
  brand_id: string
  name: string
  description?: string
  grade?: string
  grade_text?: string
  certifications?: string[]
  consumer_ratings?: {
    palatability?: number
    digestibility?: number
    overall_satisfaction?: number
  }
}

export default function SearchPage() {
  const [activeTab, setActiveTab] = useState<'brands' | 'products'>('products')
  const [searchTerm, setSearchTerm] = useState('')

  const {
    data: searchData,
    isLoading: loading,
    error: fetchError,
    refetch: fetchData,
  } = useAsyncData(async () => {
    const [brands, products] = await Promise.all([
      fetchJSON<Brand[]>('/api/brands'),
      fetchJSON<Product[]>('/api/products'),
    ])
    return {
      brands: Array.isArray(brands) ? brands : [],
      products: Array.isArray(products) ? products : [],
    }
  })

  const brands = searchData?.brands ?? []
  const products = searchData?.products ?? []
  
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('grade')
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const sortDropdownRef = useRef<HTMLDivElement>(null)

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
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab === 'products') {
        setActiveTab('products')
      }
    }
  }, [])

  // 검색 필터링
  const filteredBrands = useMemo(() => {
    if (!searchTerm) return brands
    const term = searchTerm.toLowerCase()
    return brands.filter(
      b => b.name.toLowerCase().includes(term) || 
           b.manufacturer.toLowerCase().includes(term)
    )
  }, [brands, searchTerm])

  // 🆕 제품 필터링 & 정렬
  const filteredAndSortedProducts = useMemo(() => {
    let result = products
    
    // 검색어 필터
    if (searchTerm) {
      const term = searchTerm.toLowerCase()
      result = result.filter(
        p => p.name.toLowerCase().includes(term) ||
             p.description?.toLowerCase().includes(term)
      )
    }
    
    // 등급 필터
    if (gradeFilter !== 'all') {
      result = result.filter(p => p.grade === gradeFilter)
    }
    
    // 정렬
    const gradeOrder = ['A', 'B', 'C', 'D', 'F', null, undefined]
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'grade':
          // 등급 높은순 (A > B > C > D > F > 미평가)
          const aIdx = gradeOrder.indexOf(a.grade as any)
          const bIdx = gradeOrder.indexOf(b.grade as any)
          return (aIdx === -1 ? 999 : aIdx) - (bIdx === -1 ? 999 : bIdx)
        case 'name':
          return a.name.localeCompare(b.name)
        default:
          return 0
      }
    })
    
    return result
  }, [products, searchTerm, gradeFilter, sortBy])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="h-4 w-4 text-gray-500" />
          </Link>
          <h1 className="text-lg font-bold text-gray-900">제품 검색</h1>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* 검색 입력 */}
        <div className="mb-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="브랜드명 또는 제품명을 검색하세요..."
              className="w-full pl-11 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="mb-4">
          <SearchTabs
            activeTab={activeTab}
            onTabChange={setActiveTab}
            brandCount={filteredBrands.length}
            productCount={filteredAndSortedProducts.length}
          />
        </div>

        {/* 검색 결과 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          {fetchError ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-3 text-sm">{fetchError}</p>
              <button
                onClick={fetchData}
                className="px-4 py-2 bg-violet-500 text-white rounded-lg text-sm hover:bg-violet-600 transition-colors"
              >
                다시 시도
              </button>
            </div>
          ) : loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-violet-500 mx-auto mb-4"></div>
              <p className="text-sm text-gray-500">데이터를 불러오는 중...</p>
            </div>
          ) : (
            <>
              {/* 브랜드 탭 */}
              {activeTab === 'brands' && (
                <div>
                  {filteredBrands.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">검색 결과가 없습니다</p>
                      <p className="text-xs text-gray-500">다른 검색어를 입력해보세요.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {filteredBrands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/brands/${brand.name}`}
                          className="block bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all group"
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h3 className="text-sm font-bold text-gray-900 mb-0.5 group-hover:text-violet-600 transition-colors">
                                {brand.name}
                              </h3>
                              <p className="text-xs text-gray-500">
                                {brand.manufacturer}
                              </p>
                            </div>
                            {brand.transparency_score && (
                              <div className="text-center p-2 bg-violet-50 rounded-xl">
                                <div className="text-lg font-bold text-violet-600">
                                  {brand.transparency_score}
                                </div>
                                <div className="text-[10px] text-violet-500">투명성</div>
                              </div>
                            )}
                          </div>

                          {brand.description && (
                            <p className="text-xs text-gray-500 line-clamp-2 mb-3">
                              {brand.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-xs">
                            <span className="text-gray-400">
                              {brand.country} • {brand.established_year}년
                            </span>
                            {brand.products_count !== undefined && (
                              <span className="text-violet-600 font-medium">
                                제품 {brand.products_count}개
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* 제품 탭 */}
              {activeTab === 'products' && (
                <div>
                  {/* 필터 & 정렬 */}
                  <div className="flex flex-wrap items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                    {/* 등급 필터 */}
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-gray-500">등급:</span>
                      <div className="flex gap-1">
                        {['all', 'A', 'B', 'C', 'D', 'F'].map((grade) => (
                          <button
                            key={grade}
                            onClick={() => setGradeFilter(grade)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                              gradeFilter === grade
                                ? 'bg-violet-500 text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                          >
                            {grade === 'all' ? '전체' : grade}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* 정렬 - 커스텀 드롭다운 */}
                    <div className="flex items-center gap-2 ml-auto relative" ref={sortDropdownRef}>
                      <span className="text-xs font-medium text-gray-500">정렬:</span>
                      <button
                        onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                        className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 rounded-xl text-xs bg-white hover:bg-gray-50 focus:ring-2 focus:ring-violet-500 focus:border-transparent min-w-[90px] justify-between"
                      >
                        <span className="text-gray-700">{sortBy === 'grade' ? '등급 높은순' : '이름순'}</span>
                        <ChevronDown className={`h-3.5 w-3.5 text-gray-400 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      
                      {/* 드롭다운 메뉴 */}
                      {sortDropdownOpen && (
                        <div className="absolute top-full right-0 mt-1 bg-white border border-gray-100 rounded-xl shadow-lg z-50 min-w-[110px] overflow-hidden">
                          <button
                            onClick={() => { setSortBy('grade'); setSortDropdownOpen(false) }}
                            className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 ${sortBy === 'grade' ? 'bg-violet-50 text-violet-600 font-medium' : 'text-gray-600'}`}
                          >
                            등급 높은순
                          </button>
                          <button
                            onClick={() => { setSortBy('name'); setSortDropdownOpen(false) }}
                            className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 ${sortBy === 'name' ? 'bg-violet-50 text-violet-600 font-medium' : 'text-gray-600'}`}
                          >
                            이름순
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {filteredAndSortedProducts.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Search className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm font-medium text-gray-900 mb-1">
                        {products.length === 0 ? '등록된 제품이 없습니다' : '검색 결과가 없습니다'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {products.length === 0 
                          ? '제품 데이터가 추가되면 여기에 표시됩니다.' 
                          : '다른 검색어나 필터를 시도해보세요.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-xs text-gray-500 mb-3">
                        총 <span className="font-semibold text-gray-700">{filteredAndSortedProducts.length}</span>개 제품
                      </div>
                      <div className="space-y-2">
                        {filteredAndSortedProducts.map((product) => (
                          <ProductSearchResult key={product.id} product={product} />
                        ))}
                      </div>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
