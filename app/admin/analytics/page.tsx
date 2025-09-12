'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Eye, 
  Star, 
  Package,
  ArrowLeft,
  Calendar,
  Download,
  RefreshCw,
  Filter
} from 'lucide-react'

interface AnalyticsData {
  visitors: {
    total: number
    growth: string
    data: { date: string; count: number }[]
  }
  popularProducts: {
    id: string
    name: string
    category: string
    views: number
    reviews: number
    rating: number
  }[]
  userActivity: {
    newUsers: number
    activeUsers: number
    retention: string
  }
  pageViews: {
    page: string
    views: number
    growth: number
  }[]
}

const sampleData: AnalyticsData = {
  visitors: {
    total: 12400,
    growth: '+15%',
    data: [
      { date: '2024-12-14', count: 1200 },
      { date: '2024-12-15', count: 1350 },
      { date: '2024-12-16', count: 1100 },
      { date: '2024-12-17', count: 1450 },
      { date: '2024-12-18', count: 1600 },
      { date: '2024-12-19', count: 1800 },
      { date: '2024-12-20', count: 1900 }
    ]
  },
  popularProducts: [
    {
      id: '1',
      name: '로얄캐닌 키튼 사료',
      category: '사료',
      views: 2840,
      reviews: 156,
      rating: 4.8
    },
    {
      id: '2',
      name: '힐스 프리스크립션 다이어트',
      category: '사료',
      views: 2156,
      reviews: 89,
      rating: 4.6
    },
    {
      id: '3',
      name: '베네풀 고양이 모래',
      category: '모래',
      views: 1923,
      reviews: 234,
      rating: 4.2
    }
  ],
  userActivity: {
    newUsers: 245,
    activeUsers: 1840,
    retention: '68%'
  },
  pageViews: [
    { page: '메인 페이지', views: 8950, growth: 12 },
    { page: '사료 성분 계산기', views: 3420, growth: 8 },
    { page: '브랜드 평가', views: 2890, growth: -2 },
    { page: '건강검진표 분석기', views: 2340, growth: 25 },
    { page: '리뷰 페이지', views: 1980, growth: 5 }
  ]
}

export default function AdminAnalyticsPage() {
  const [data] = useState<AnalyticsData>(sampleData)
  const [timeRange, setTimeRange] = useState('7days')

  const getRatingStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/admin" className="text-gray-500 hover:text-gray-700">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart3 className="h-6 w-6 text-indigo-500" />
                  통계 분석
                </h1>
                <p className="text-gray-600">사이트 이용 통계 및 인기 제품 분석</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="7days">최근 7일</option>
                <option value="30days">최근 30일</option>
                <option value="90days">최근 90일</option>
              </select>
              <button className="p-2 text-gray-500 hover:text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50">
                <RefreshCw className="h-4 w-4" />
              </button>
              <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2">
                <Download className="h-4 w-4" />
                내보내기
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">총 방문자</p>
                <p className="text-2xl font-bold text-gray-900">{data.visitors.total.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3" />
                  {data.visitors.growth}
                </p>
              </div>
              <Eye className="h-8 w-8 text-blue-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">신규 사용자</p>
                <p className="text-2xl font-bold text-gray-900">{data.userActivity.newUsers}</p>
                <p className="text-sm text-blue-600 mt-1">이번 주</p>
              </div>
              <Users className="h-8 w-8 text-green-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">활성 사용자</p>
                <p className="text-2xl font-bold text-gray-900">{data.userActivity.activeUsers}</p>
                <p className="text-sm text-gray-500 mt-1">일일 평균</p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">사용자 유지율</p>
                <p className="text-2xl font-bold text-gray-900">{data.userActivity.retention}</p>
                <p className="text-sm text-gray-500 mt-1">7일 기준</p>
              </div>
              <Star className="h-8 w-8 text-yellow-500" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Visitor Chart */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">일별 방문자 수</h3>
            <div className="h-64 flex items-end justify-between gap-2">
              {data.visitors.data.map((item, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div
                    className="w-full bg-indigo-500 rounded-t"
                    style={{
                      height: `${(item.count / Math.max(...data.visitors.data.map(d => d.count))) * 200}px`
                    }}
                  ></div>
                  <p className="text-xs text-gray-500 mt-2">{item.date.slice(-2)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Popular Products */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 mb-4">인기 제품</h3>
            <div className="space-y-4">
              {data.popularProducts.map((product, index) => (
                <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-6 h-6 bg-indigo-100 text-indigo-600 rounded-full text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                          {product.category}
                        </span>
                        <div className="flex items-center gap-1">
                          {getRatingStars(product.rating)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{product.views.toLocaleString()} 조회</p>
                    <p className="text-xs text-gray-500">{product.reviews} 리뷰</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Page Views */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-4">페이지별 조회수</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    페이지
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    조회수
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    성장률
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {data.pageViews.map((page, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {page.page}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {page.views.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className={`flex items-center gap-1 ${page.growth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {page.growth >= 0 ? (
                          <TrendingUp className="h-4 w-4" />
                        ) : (
                          <TrendingDown className="h-4 w-4" />
                        )}
                        {Math.abs(page.growth)}%
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

