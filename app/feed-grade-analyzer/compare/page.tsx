'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { 
  BarChart3, 
  TrendingUp, 
  Award, 
  Star, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Target,
  Calculator,
  ArrowLeft,
  Plus,
  Trash2,
  Download,
  Share2
} from 'lucide-react'
import Link from 'next/link'

interface FeedComparison {
  name: string
  brand: string
  analysis: {
    ingredient_quality: 'premium' | 'high' | 'medium' | 'low'
    ingredient_transparency: 'premium' | 'high' | 'medium' | 'low'
    safety_record: 'premium' | 'high' | 'medium' | 'low'
    nutritional_standards: 'premium' | 'high' | 'medium' | 'low'
    preservative_type: 'premium' | 'high' | 'medium' | 'low'
  }
}

interface ComparisonResult {
  analyses: Array<{
    overall_grade: string
    overall_score: number
    grade_color: string
    grade_description: string
    breakdown: Array<{
      criterion: string
      score: number
      color: string
    }>
  }>
  comparison: {
    rankings: Array<{
      index: number
      grade: string
      score: number
      color: string
    }>
    best_feed: number
    worst_feed: number
  }
  summary: {
    total_feeds: number
    best_grade: string
    worst_grade: string
    average_score: number
  }
}

const criteriaOptions = {
  ingredient_quality: { name: '원료 생육', options: ['premium', 'high', 'medium', 'low'] },
  ingredient_transparency: { name: '상세성분표기', options: ['premium', 'high', 'medium', 'low'] },
  safety_record: { name: '안전성', options: ['premium', 'high', 'medium', 'low'] },
  nutritional_standards: { name: '영양기준', options: ['premium', 'high', 'medium', 'low'] },
  preservative_type: { name: '보존제', options: ['premium', 'high', 'medium', 'low'] }
}

export default function FeedComparison() {
  const router = useRouter()
  
  // 페이지 접근 시 홈으로 리다이렉트 (서비스에서 제외됨)
  useEffect(() => {
    router.replace('/')
  }, [router])
  
  // 리다이렉트 중 로딩 화면 표시
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3056F5] mx-auto mb-4"></div>
        <p className="text-gray-600">페이지를 이동하는 중...</p>
      </div>
    </div>
  )
  
  // 아래 코드는 서비스에서 제외되어 실행되지 않음
  /*
  const [feeds, setFeeds] = useState<FeedComparison[]>([
    {
      name: '로얄캐닌 어덜트',
      brand: '로얄캐닌',
      analysis: {
        ingredient_quality: 'premium',
        ingredient_transparency: 'premium',
        safety_record: 'premium',
        nutritional_standards: 'premium',
        preservative_type: 'high'
      }
    },
    {
      name: '힐스 사이언스 다이어트',
      brand: '힐스',
      analysis: {
        ingredient_quality: 'high',
        ingredient_transparency: 'high',
        safety_record: 'premium',
        nutritional_standards: 'premium',
        preservative_type: 'medium'
      }
    }
  ])

  const [result, setResult] = useState<ComparisonResult | null>(null)
  const [isComparing, setIsComparing] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [newFeed, setNewFeed] = useState<Partial<FeedComparison>>({
    name: '',
    brand: '',
    analysis: {
      ingredient_quality: 'medium',
      ingredient_transparency: 'medium',
      safety_record: 'medium',
      nutritional_standards: 'medium',
      preservative_type: 'medium'
    }
  })

  const handleCompare = async () => {
    if (feeds.length < 2) {
      alert('비교할 사료가 2개 이상 필요합니다.')
      return
    }

    setIsComparing(true)
    try {
      const response = await fetch('/api/feed-grade/compare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          feeds: feeds.map(feed => feed.analysis)
        })
      })

      if (!response.ok) {
        throw new Error('비교 분석 실패')
      }

      const data = await response.json()
      setResult(data)
    } catch (error) {
      console.error('Comparison error:', error)
      alert('비교 분석 중 오류가 발생했습니다.')
    } finally {
      setIsComparing(false)
    }
  }

  const addFeed = () => {
    if (!newFeed.name || !newFeed.brand) {
      alert('사료명과 브랜드를 입력해주세요.')
      return
    }

    setFeeds([...feeds, newFeed as FeedComparison])
    setNewFeed({
      name: '',
      brand: '',
      analysis: {
        ingredient_quality: 'medium',
        ingredient_transparency: 'medium',
        safety_record: 'medium',
        nutritional_standards: 'medium',
        preservative_type: 'medium'
      }
    })
    setShowAddForm(false)
  }

  const removeFeed = (index: number) => {
    setFeeds(feeds.filter((_, i) => i !== index))
  }

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'S': return <Award className="w-5 h-5 text-purple-600" />
      case 'A': return <Star className="w-5 h-5 text-green-600" />
      case 'B': return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'C': return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      case 'D': return <XCircle className="w-5 h-5 text-orange-600" />
      case 'F': return <XCircle className="w-5 h-5 text-red-600" />
      default: return <Target className="w-5 h-5 text-gray-600" />
    }
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'premium': return 'text-green-600 bg-green-50'
      case 'high': return 'text-blue-600 bg-blue-50'
      case 'medium': return 'text-yellow-600 bg-yellow-50'
      case 'low': return 'text-red-600 bg-red-50'
      default: return 'text-gray-600 bg-gray-50'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link 
                href="/"
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                홈으로
              </Link>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  사료 등급 비교
                </h1>
                <p className="text-gray-600 mt-2">
                  여러 사료의 등급을 한눈에 비교하고 최적의 선택을 하세요
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              {result && (
                <>
                  <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors">
                    <Download className="w-4 h-4" />
                    결과 다운로드
                  </button>
                  <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    <Share2 className="w-4 h-4" />
                    공유
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Feed List */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">비교할 사료 목록</h2>
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              사료 추가
            </button>
          </div>

          {/* Add Feed Form */}
          {showAddForm && (
            <div className="border rounded-lg p-4 mb-6 bg-gray-50">
              <h3 className="font-medium text-gray-900 mb-4">새 사료 추가</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">사료명</label>
                  <input
                    type="text"
                    value={newFeed.name || ''}
                    onChange={(e) => setNewFeed({...newFeed, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 로얄캐닌 어덜트"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">브랜드</label>
                  <input
                    type="text"
                    value={newFeed.brand || ''}
                    onChange={(e) => setNewFeed({...newFeed, brand: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="예: 로얄캐닌"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                {Object.entries(criteriaOptions).map(([key, criterion]) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {criterion.name}
                    </label>
                    <select
                      value={newFeed.analysis?.[key as keyof typeof newFeed.analysis] || 'medium'}
                      onChange={(e) => setNewFeed({
                        ...newFeed,
                        analysis: {
                          ...newFeed.analysis!,
                          [key]: e.target.value as any
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      {criterion.options.map(option => (
                        <option key={option} value={option}>
                          {option === 'premium' ? '최고' : 
                           option === 'high' ? '높음' :
                           option === 'medium' ? '보통' : '낮음'}
                        </option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={addFeed}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                >
                  추가
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
                >
                  취소
                </button>
              </div>
            </div>
          )}

          {/* Feed List */}
          <div className="space-y-4">
            {feeds.map((feed, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{feed.name}</h3>
                    <p className="text-sm text-gray-600">{feed.brand}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {Object.entries(feed.analysis).map(([key, value]) => (
                      <span
                        key={key}
                        className={`px-2 py-1 rounded text-xs font-medium ${getLevelColor(value)}`}
                      >
                        {criteriaOptions[key as keyof typeof criteriaOptions].name}: {
                          value === 'premium' ? '최고' : 
                          value === 'high' ? '높음' :
                          value === 'medium' ? '보통' : '낮음'
                        }
                      </span>
                    ))}
                    <button
                      onClick={() => removeFeed(index)}
                      className="p-1 text-red-600 hover:text-red-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Compare Button */}
          <div className="flex justify-center mt-6">
            <button
              onClick={handleCompare}
              disabled={isComparing || feeds.length < 2}
              className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-cyan-700 transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isComparing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  비교 분석 중...
                </>
              ) : (
                <>
                  <Calculator className="w-5 h-5" />
                  등급 비교하기
                </>
              )}
            </button>
          </div>
        </div>

        {/* Comparison Results */}
        {result && (
          <div className="space-y-8">
            {/* Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-blue-600" />
                비교 결과 요약
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{result.summary.total_feeds}</div>
                  <div className="text-sm text-gray-600">비교 사료 수</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">{result.summary.best_grade}</div>
                  <div className="text-sm text-gray-600">최고 등급</div>
                </div>
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-600">{result.summary.worst_grade}</div>
                  <div className="text-sm text-gray-600">최저 등급</div>
                </div>
                <div className="text-center p-4 bg-purple-50 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">{result.summary.average_score}</div>
                  <div className="text-sm text-gray-600">평균 점수</div>
                </div>
              </div>
            </div>

            {/* Rankings */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">등급 순위</h3>
              <div className="space-y-4">
                {result.comparison.rankings.map((ranking, index) => {
                  const feed = feeds[ranking.index]
                  const analysis = result.analyses[ranking.index]
                  return (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-full font-bold text-gray-700">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{feed.name}</h4>
                          <p className="text-sm text-gray-600">{feed.brand}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          {getGradeIcon(ranking.grade)}
                          <span className="font-bold" style={{ color: ranking.color }}>
                            {ranking.grade}등급
                          </span>
                        </div>
                        <div className="text-2xl font-bold text-gray-700">
                          {ranking.score}점
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">세부 기준별 비교</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">사료명</th>
                      {Object.values(criteriaOptions).map((criterion, index) => (
                        <th key={index} className="text-center py-3 px-4 font-medium text-gray-700">
                          {criterion.name}
                        </th>
                      ))}
                      <th className="text-center py-3 px-4 font-medium text-gray-700">총점</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.analyses.map((analysis, index) => {
                      const feed = feeds[index]
                      return (
                        <tr key={index} className="border-b">
                          <td className="py-3 px-4">
                            <div>
                              <div className="font-medium text-gray-900">{feed.name}</div>
                              <div className="text-sm text-gray-600">{feed.brand}</div>
                            </div>
                          </td>
                          {analysis.breakdown.map((item, breakdownIndex) => (
                            <td key={breakdownIndex} className="text-center py-3 px-4">
                              <div className="flex flex-col items-center">
                                <div 
                                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                                  style={{ backgroundColor: item.color }}
                                >
                                  {item.score}
                                </div>
                              </div>
                            </td>
                          ))}
                          <td className="text-center py-3 px-4">
                            <div className="flex items-center justify-center gap-2">
                              {getGradeIcon(analysis.overall_grade)}
                              <span className="font-bold text-lg">{analysis.overall_score}</span>
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
  */
}
