'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Filter, 
  Star, 
  Users, 
  Package,
  ArrowLeft,
  TrendingUp,
  Award,
  Eye
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
}

// Mock data
const mockProducts: Product[] = [
  {
    id: '1',
    name: '로얄캐닌 골든리트리버 어덜트',
    brand: '로얄캐닌',
    category: 'food',
    averagePalatability: 4.8,
    averageRepurchase: 4.5,
    totalReviews: 156,
    activeUsers: 89,
    price: 45000
  },
  {
    id: '2',
    name: '힐스 라지브리드 어덜트',
    brand: '힐스',
    category: 'food',
    averagePalatability: 4.2,
    averageRepurchase: 4.0,
    totalReviews: 98,
    activeUsers: 45,
    price: 52000
  },
  {
    id: '3',
    name: '오리젠 어덜트 독',
    brand: '오리젠',
    category: 'food',
    averagePalatability: 4.9,
    averageRepurchase: 4.7,
    totalReviews: 234,
    activeUsers: 123,
    price: 89000
  },
  {
    id: '4',
    name: '덴탈츄 대형견용',
    brand: '덴탈츄',
    category: 'treat',
    averagePalatability: 4.6,
    averageRepurchase: 4.3,
    totalReviews: 67,
    activeUsers: 34
  },
  {
    id: '5',
    name: '츄르 참치맛',
    brand: '이나바',
    category: 'treat',
    averagePalatability: 4.9,
    averageRepurchase: 4.8,
    totalReviews: 189,
    activeUsers: 156
  },
  {
    id: '6',
    name: '글루코사민 관절 영양제',
    brand: '뉴트리나',
    category: 'supplement',
    averagePalatability: 3.8,
    averageRepurchase: 4.2,
    totalReviews: 45,
    activeUsers: 23,
    price: 35000
  }
]

export default function ProductsPage() {
  const [products] = useState<Product[]>(mockProducts)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'popularity' | 'rating' | 'reviews'>('popularity')

  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.brand.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory
      return matchesSearch && matchesCategory
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.averagePalatability - a.averagePalatability
        case 'reviews':
          return b.totalReviews - a.totalReviews
        case 'popularity':
        default:
          return b.activeUsers - a.activeUsers
      }
    })

  const getCategoryText = (category: string) => {
    switch (category) {
      case 'food': return '사료'
      case 'treat': return '간식'
      case 'supplement': return '영양제'
      default: return '전체'
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center space-x-4">
            <Link href="/pet-log" className="text-gray-500 hover:text-gray-700">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Package className="h-6 w-6 text-blue-500" />
                제품 둘러보기
              </h1>
              <p className="text-gray-600">다른 반려인들이 사용한 제품들을 둘러보고 후기를 확인해보세요</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">등록된 제품</p>
                <p className="text-2xl font-bold text-gray-900">{products.length}개</p>
              </div>
              <Package className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 리뷰 수</p>
                <p className="text-2xl font-bold text-gray-900">
                  {products.reduce((sum, product) => sum + product.totalReviews, 0)}개
                </p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">평균 평점</p>
                <p className="text-2xl font-bold text-gray-900">
                  {(products.reduce((sum, product) => sum + product.averagePalatability, 0) / products.length).toFixed(1)}점
                </p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">인기 제품</p>
                <p className="text-2xl font-bold text-gray-900">
                  {Math.max(...products.map(p => p.activeUsers))}명 사용
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <input
                  type="text"
                  placeholder="제품명이나 브랜드로 검색하세요..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="flex gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">전체 카테고리</option>
                <option value="food">🍽️ 사료</option>
                <option value="treat">🦴 간식</option>
                <option value="supplement">💊 영양제</option>
              </select>
              
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="popularity">인기순</option>
                <option value="rating">평점순</option>
                <option value="reviews">리뷰순</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/pet-log/products/${product.id}`}
              className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="text-2xl">{getCategoryIcon(product.category)}</div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(product.category)}`}>
                    {getCategoryText(product.category)}
                  </span>
                </div>
                <Eye className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
              </div>

              <div className="mb-4">
                <h3 className="text-lg font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                  {product.name}
                </h3>
                <p className="text-sm text-gray-600">{product.brand}</p>
                {product.price && (
                  <p className="text-sm font-medium text-gray-900 mt-1">{formatPrice(product.price)}</p>
                )}
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">기호성</span>
                  <div className="flex items-center space-x-1">
                    {renderStars(Math.round(product.averagePalatability))}
                    <span className="text-sm font-medium text-gray-900 ml-1">
                      {product.averagePalatability.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">재구매 의향</span>
                  <div className="flex items-center space-x-1">
                    {renderStars(Math.round(product.averageRepurchase))}
                    <span className="text-sm font-medium text-gray-900 ml-1">
                      {product.averageRepurchase.toFixed(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{product.totalReviews}개 리뷰</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <TrendingUp className="h-4 w-4" />
                    <span>{product.activeUsers}명 사용 중</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">검색 결과가 없습니다</h3>
            <p className="text-gray-500">다른 검색어나 필터를 시도해보세요.</p>
          </div>
        )}
      </div>
    </div>
  )
}
