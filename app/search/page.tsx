'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { Search, Filter, ArrowLeft } from 'lucide-react'
import SearchTabs from '@/components/search/SearchTabs'
import ProductSearchResult from '@/components/search/ProductSearchResult'

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
  const [activeTab, setActiveTab] = useState<'brands' | 'products'>('brands')
  const [searchTerm, setSearchTerm] = useState('')
  const [brands, setBrands] = useState<Brand[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  // 🆕 필터 상태
  const [gradeFilter, setGradeFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('rating')

  useEffect(() => {
    fetchData()
  }, [])
  
  // 🆕 URL 파라미터에서 탭 읽기
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search)
      const tab = params.get('tab')
      if (tab === 'products') {
        setActiveTab('products')
      }
    }
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // 브랜드 데이터 가져오기
      const brandsRes = await fetch('/api/brands')
      if (brandsRes.ok) {
        const brandsData = await brandsRes.json()
        setBrands(Array.isArray(brandsData) ? brandsData : [])
      }

      // 제품 데이터 가져오기
      const productsRes = await fetch('/api/products')
      if (productsRes.ok) {
        const productsData = await productsRes.json()
        setProducts(Array.isArray(productsData) ? productsData : [])
      }
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

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
    result = [...result].sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return (b.consumer_ratings?.overall_satisfaction || 0) - (a.consumer_ratings?.overall_satisfaction || 0)
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
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">브랜드 & 제품 검색</h1>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 검색 입력 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="브랜드명 또는 제품명을 검색하세요..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <button className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-2">
              <Filter className="h-5 w-5" />
              <span>필터</span>
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="bg-white rounded-t-xl shadow-sm border border-gray-200 border-b-0">
          <div className="px-6">
            <SearchTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              brandCount={filteredBrands.length}
              productCount={filteredAndSortedProducts.length}
            />
          </div>
        </div>

        {/* 검색 결과 */}
        <div className="bg-white rounded-b-xl shadow-sm border border-gray-200 p-6">
          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-600">데이터를 불러오는 중...</p>
            </div>
          ) : (
            <>
              {/* 브랜드 탭 */}
              {activeTab === 'brands' && (
                <div className="space-y-4">
                  {filteredBrands.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg font-medium mb-2">검색 결과가 없습니다</p>
                      <p className="text-sm">다른 검색어를 입력해보세요.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredBrands.map((brand) => (
                        <Link
                          key={brand.id}
                          href={`/brands/${brand.name}`}
                          className="block bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg hover:border-blue-300 transition-all"
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-1">
                                {brand.name}
                              </h3>
                              <p className="text-sm text-gray-600">
                                {brand.manufacturer}
                              </p>
                            </div>
                            {brand.transparency_score && (
                              <div className="text-right">
                                <div className="text-2xl font-bold text-blue-600">
                                  {brand.transparency_score}
                                </div>
                                <div className="text-xs text-gray-600">투명성</div>
                              </div>
                            )}
                          </div>

                          {brand.description && (
                            <p className="text-sm text-gray-600 line-clamp-2 mb-4">
                              {brand.description}
                            </p>
                          )}

                          <div className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">
                              {brand.country} • {brand.established_year}년
                            </span>
                            {brand.products_count !== undefined && (
                              <span className="text-blue-600 font-medium">
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
                <div className="space-y-4">
                  {/* 🆕 필터 & 정렬 */}
                  <div className="flex flex-wrap gap-4 pb-4 border-b border-gray-200">
                    {/* 등급 필터 */}
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">등급:</span>
                      <div className="flex gap-2">
                        {['all', 'A', 'B', 'C', 'D', 'F'].map((grade) => (
                          <button
                            key={grade}
                            onClick={() => setGradeFilter(grade)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                              gradeFilter === grade
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                          >
                            {grade === 'all' ? '전체' : grade}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    {/* 정렬 */}
                    <div className="flex items-center gap-2 ml-auto">
                      <span className="text-sm font-medium text-gray-700">정렬:</span>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="rating">평점 높은순</option>
                        <option value="name">이름순</option>
                      </select>
                    </div>
                  </div>
                  
                  {filteredAndSortedProducts.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <p className="text-lg font-medium mb-2">
                        {products.length === 0 ? '등록된 제품이 없습니다' : '검색 결과가 없습니다'}
                      </p>
                      <p className="text-sm">
                        {products.length === 0 
                          ? '제품 데이터가 추가되면 여기에 표시됩니다.' 
                          : '다른 검색어나 필터를 시도해보세요.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="text-sm text-gray-600 mb-4">
                        총 {filteredAndSortedProducts.length}개 제품
                      </div>
                      {filteredAndSortedProducts.map((product) => (
                        <ProductSearchResult key={product.id} product={product} />
                      ))}
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
