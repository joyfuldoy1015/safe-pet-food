'use client'

import React, { useState, useEffect } from 'react'
import { 
  Calculator, 
  TrendingUp, 
  Shield, 
  Star, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  BarChart3,
  Target,
  Award,
  AlertCircle,
  Info,
  ChevronRight,
  RotateCcw,
  Download,
  Share2,
  Search,
  Leaf,
  Eye,
  Heart,
  BookOpen,
  Zap
} from 'lucide-react'

interface FeedAnalysisInput {
  ingredient_quality: 'premium' | 'high' | 'medium' | 'low'
  ingredient_transparency: 'premium' | 'high' | 'medium' | 'low'
  safety_record: 'premium' | 'high' | 'medium' | 'low'
  nutritional_standards: 'premium' | 'high' | 'medium' | 'low'
  preservative_type: 'premium' | 'high' | 'medium' | 'low'
}

interface FeedGradeResult {
  overall_grade: string
  overall_score: number
  grade_color: string
  grade_description: string
  breakdown: Array<{
    criterion: string
    level: string
    score: number
    weight: number
    weighted_score: number
    color: string
    description: string
  }>
  recommendations: string[]
  strengths: string[]
  weaknesses: string[]
}

const criteriaOptions = {
  ingredient_quality: {
    name: '원료 생육',
    options: [
      { 
        value: 'premium', 
        label: '생육', 
        description: '모든 원료가 생육 상태로 사용됨',
        examples: {
          good: '닭고기, 소고기, 생선, 계란 등 신선한 원료',
          bad: '육분, 계육분, 어분 등 건조/가공된 원료'
        }
      },
      { 
        value: 'high', 
        label: '생육 + 건조', 
        description: '주요 원료는 생육, 일부 건조 원료 포함',
        examples: {
          good: '닭고기, 쌀, 닭육분 (주요 원료는 생육)',
          bad: '육분, 계육분이 주요 원료인 경우'
        }
      },
      { 
        value: 'medium', 
        label: '혼합', 
        description: '생육과 건조 원료가 혼합됨',
        examples: {
          good: '닭고기, 옥수수, 닭육분, 쌀',
          bad: '육분, 계육분이 상위에 있는 경우'
        }
      },
      { 
        value: 'low', 
        label: '건조 위주', 
        description: '대부분 건조 원료 사용',
        examples: {
          good: '닭육분, 계육분, 옥수수, 밀',
          bad: '육분, 계육분, 어분 등이 주요 원료'
        }
      }
    ]
  },
  ingredient_transparency: {
    name: '상세성분표기 여부',
    options: [
      { 
        value: 'premium', 
        label: '꼼수없는 표기', 
        description: '원료를 분할하지 않고 정직하게 표기',
        examples: {
          good: '닭고기, 쌀, 옥수수, 닭지방 (명확하고 단순)',
          bad: '닭고기, 완두콩단백질, 완두콩섬유질, 완두, 핀토콩, 핀토콩단백질 (콩을 여러 개로 분할)',
          warning: '1번이 동물성인데 2,3,4번이 모두 콩/곡물이면 실제로는 콩이 더 많을 가능성 높음'
        }
      },
      { 
        value: 'high', 
        label: '상세 표기', 
        description: '대부분 성분이 상세히 표기됨',
        examples: {
          good: '닭고기, 닭육분, 쌀, 옥수수, 닭지방',
          bad: '동물성 부산물, 곡물류 등 모호한 표기'
        }
      },
      { 
        value: 'medium', 
        label: '일반 표기', 
        description: '기본적인 성분만 표기됨',
        examples: {
          good: '닭고기, 쌀, 옥수수, 동물성 지방',
          bad: '육류, 곡물, 지방 등 너무 일반적인 표기'
        }
      },
      { 
        value: 'low', 
        label: '모호한 표기', 
        description: '성분 표기가 모호하거나 불완전함',
        examples: {
          good: '닭고기, 쌀, 옥수수',
          bad: '동물성 부산물, 곡물류, 식물성 지방 등'
        }
      }
    ]
  },
  safety_record: {
    name: '안전성',
    options: [
      { 
        value: 'premium', 
        label: '10년 내 리콜 없음', 
        description: '최근 10년간 리콜 이력 없음',
        examples: {
          good: '로얄캐닌, 힐스 등 대형 브랜드',
          bad: '리콜 이력이 있는 브랜드'
        }
      },
      { 
        value: 'high', 
        label: '5년 내 리콜 없음', 
        description: '최근 5년간 리콜 이력 없음',
        examples: {
          good: '안정적인 브랜드',
          bad: '최근 리콜이 있었던 브랜드'
        }
      },
      { 
        value: 'medium', 
        label: '3년 내 리콜 없음', 
        description: '최근 3년간 리콜 이력 없음',
        examples: {
          good: '일반적인 브랜드',
          bad: '최근 리콜이 있었던 브랜드'
        }
      },
      { 
        value: 'low', 
        label: '최근 리콜 있음', 
        description: '최근 리콜 이력 있음',
        examples: {
          good: '없음',
          bad: '살모넬라, 비타민D 과다, 금속 이물질 등 리콜 이력'
        }
      }
    ]
  },
  nutritional_standards: {
    name: '영양협회 기준 만족',
    options: [
      { 
        value: 'premium', 
        label: '모든 기준 만족', 
        description: 'AAFCO, NRC 등 모든 영양 기준 만족',
        examples: {
          good: 'AAFCO, NRC, EU 기준 모두 만족',
          bad: '기준 미달 또는 불명확한 영양 정보'
        }
      },
      { 
        value: 'high', 
        label: '주요 기준 만족', 
        description: '대부분의 영양 기준 만족',
        examples: {
          good: 'AAFCO 기준 만족',
          bad: '일부 영양소 기준 미달'
        }
      },
      { 
        value: 'medium', 
        label: '기본 기준 만족', 
        description: '최소한의 영양 기준 만족',
        examples: {
          good: '기본 영양 기준 충족',
          bad: '영양 기준 불명확'
        }
      },
      { 
        value: 'low', 
        label: '기준 미달', 
        description: '영양 기준을 충족하지 못함',
        examples: {
          good: '없음',
          bad: '영양 기준 미달 또는 불명확'
        }
      }
    ]
  },
  preservative_type: {
    name: '보존제 종류',
    options: [
      { 
        value: 'premium', 
        label: '천연 보존제', 
        description: '비타민 E, 로즈마리 추출물 등 천연 보존제 사용',
        examples: {
          good: '비타민 E, 로즈마리 추출물, 토코페롤',
          bad: 'BHA, BHT, 에톡시퀸 등 합성 보존제'
        }
      },
      { 
        value: 'high', 
        label: '안전한 합성 보존제', 
        description: 'BHA, BHT 등 안전한 합성 보존제 사용',
        examples: {
          good: 'BHA, BHT (소량 사용)',
          bad: '에톡시퀸, 과도한 합성 보존제'
        }
      },
      { 
        value: 'medium', 
        label: '일반 합성 보존제', 
        description: '일반적인 합성 보존제 사용',
        examples: {
          good: 'BHA, BHT, 에톡시퀸',
          bad: '과도한 합성 보존제 사용'
        }
      },
      { 
        value: 'low', 
        label: '위험한 보존제', 
        description: '잠재적으로 위험한 보존제 사용',
        examples: {
          good: '없음',
          bad: '과도한 BHA, BHT, 에톡시퀸 사용'
        }
      }
    ]
  }
}

export default function FeedGradeAnalyzer() {
  const [formData, setFormData] = useState<FeedAnalysisInput>({
    ingredient_quality: 'medium',
    ingredient_transparency: 'medium',
    safety_record: 'medium',
    nutritional_standards: 'medium',
    preservative_type: 'medium'
  })

  const [result, setResult] = useState<FeedGradeResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState<'search' | 'input' | 'result'>('search')
  const [showShareModal, setShowShareModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showManualInput, setShowManualInput] = useState(false)

  // 모의 사료 데이터베이스
  const feedDatabase = [
    {
      id: 'royal-canin-golden',
      name: '로얄캐닌 골든 리트리버 어덜트',
      brand: '로얄캐닌',
      grade: 'A',
      score: 85,
      description: '골든 리트리버 전용 사료로 관절 건강과 피모 관리에 특화',
      analysis: {
        ingredient_quality: 'high',
        ingredient_transparency: 'premium',
        safety_record: 'premium',
        nutritional_standards: 'premium',
        preservative_type: 'high'
      }
    },
    {
      id: 'hills-science-diet',
      name: '힐스 사이언스 다이어트 어덜트',
      brand: '힐스',
      grade: 'A',
      score: 82,
      description: '과학적 영양 연구를 바탕으로 한 균형잡힌 영양 사료',
      analysis: {
        ingredient_quality: 'high',
        ingredient_transparency: 'high',
        safety_record: 'premium',
        nutritional_standards: 'premium',
        preservative_type: 'high'
      }
    },
    {
      id: 'purina-pro-plan',
      name: '푸리나 프로플랜 어덜트',
      brand: '푸리나',
      grade: 'B',
      score: 75,
      description: '균형잡힌 영양과 소화 건강을 위한 사료',
      analysis: {
        ingredient_quality: 'medium',
        ingredient_transparency: 'high',
        safety_record: 'high',
        nutritional_standards: 'high',
        preservative_type: 'medium'
      }
    },
    {
      id: 'wellness-core',
      name: '웰니스 코어 어덜트',
      brand: '웰니스',
      grade: 'A',
      score: 88,
      description: '천연 원료와 고품질 단백질을 사용한 프리미엄 사료',
      analysis: {
        ingredient_quality: 'premium',
        ingredient_transparency: 'premium',
        safety_record: 'high',
        nutritional_standards: 'premium',
        preservative_type: 'premium'
      }
    }
  ]

  const handleSearch = (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      return
    }
    
    const results = feedDatabase.filter(feed => 
      feed.name.toLowerCase().includes(query.toLowerCase()) ||
      feed.brand.toLowerCase().includes(query.toLowerCase())
    )
    setSearchResults(results)
  }

  const handleSelectFeed = (feed: any) => {
    setFormData(feed.analysis)
    setActiveTab('result')
    // 모의 분석 결과 생성
    const mockResult = {
      overall_grade: feed.grade,
      overall_score: feed.score,
      grade_description: feed.description,
      grade_color: feed.grade === 'A' ? '#10B981' : feed.grade === 'B' ? '#F59E0B' : '#EF4444',
      breakdown: [
        {
          criterion: '원료 품질',
          level: feed.analysis.ingredient_quality === 'premium' ? '최고급' : 
                 feed.analysis.ingredient_quality === 'high' ? '고급' : '일반',
          score: feed.analysis.ingredient_quality === 'premium' ? 20 : 
                 feed.analysis.ingredient_quality === 'high' ? 18 : 15,
          weight: 0.3,
          weighted_score: feed.analysis.ingredient_quality === 'premium' ? 6 : 
                         feed.analysis.ingredient_quality === 'high' ? 5.4 : 4.5,
          color: feed.analysis.ingredient_quality === 'premium' ? '#10B981' : 
                 feed.analysis.ingredient_quality === 'high' ? '#10B981' : '#F59E0B',
          description: '원료의 품질과 신선도를 평가합니다'
        },
        {
          criterion: '성분 투명성',
          level: feed.analysis.ingredient_transparency === 'premium' ? '완전 투명' : 
                 feed.analysis.ingredient_transparency === 'high' ? '투명' : '일반',
          score: feed.analysis.ingredient_transparency === 'premium' ? 20 : 
                 feed.analysis.ingredient_transparency === 'high' ? 18 : 15,
          weight: 0.25,
          weighted_score: feed.analysis.ingredient_transparency === 'premium' ? 5 : 
                         feed.analysis.ingredient_transparency === 'high' ? 4.5 : 3.75,
          color: feed.analysis.ingredient_transparency === 'premium' ? '#10B981' : 
                 feed.analysis.ingredient_transparency === 'high' ? '#10B981' : '#F59E0B',
          description: '성분 표기의 투명성과 구체성을 평가합니다'
        }
      ],
      strengths: ['고품질 원료 사용', '투명한 성분 표기'],
      weaknesses: [],
      recommendations: ['지속적인 급여를 권장합니다']
    }
    setResult(mockResult)
  }

  const handleInputChange = (criterion: keyof FeedAnalysisInput, value: string) => {
    setFormData(prev => ({
      ...prev,
      [criterion]: value as any
    }))
  }

  const handleAnalyze = async () => {
    setIsAnalyzing(true)
    try {
      const response = await fetch('/api/feed-grade/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          analysis_input: formData
        })
      })

      if (!response.ok) {
        throw new Error('분석 요청 실패')
      }

      const data = await response.json()
      setResult(data)
      setActiveTab('result')
      
      // 결과 탭으로 전환 후 결과 섹션으로 스크롤
      setTimeout(() => {
        const resultSection = document.getElementById('analysis-result')
        if (resultSection) {
          resultSection.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          })
        }
      }, 100)
    } catch (error) {
      console.error('Analysis error:', error)
      alert('분석 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const resetForm = () => {
    setFormData({
      ingredient_quality: 'medium',
      ingredient_transparency: 'medium',
      safety_record: 'medium',
      nutritional_standards: 'medium',
      preservative_type: 'medium'
    })
    setResult(null)
    setActiveTab('input')
    setShowShareModal(false)
  }

  const handleShare = () => {
    setShowShareModal(true)
  }

  const generateShareUrl = () => {
    return `${window.location.origin}/feed-grade-analyzer?grade=${result?.overall_grade}&score=${result?.overall_score}`
  }

  const handleSNSShare = (platform: string) => {
    if (!result) return

    const shareText = `🔍 사료 등급 분석 결과: ${result.overall_grade}등급 (${result.overall_score}점)! 5가지 핵심 기준으로 사료의 품질을 과학적으로 분석했습니다. 🐾`
    const shareUrl = generateShareUrl()

    const urls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      instagram: `https://www.instagram.com/`,
      threads: `https://www.threads.net/intent/post?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`,
      kakao: `https://story.kakao.com/share?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    }

    if (platform === 'instagram') {
      // 인스타그램은 직접 링크만 제공
      navigator.clipboard.writeText(shareText + ' ' + shareUrl).then(() => {
        alert('인스타그램에 공유할 내용이 클립보드에 복사되었습니다!')
      })
    } else {
      window.open(urls[platform as keyof typeof urls], '_blank', 'width=600,height=400')
    }
  }

  const copyToClipboard = () => {
    if (!result) return
    
    const shareText = `🔍 사료 등급 분석 결과\n\n등급: ${result.overall_grade}등급 (${result.overall_score}점)\n설명: ${result.grade_description}\n\n주요 분석 결과:\n${result.breakdown.slice(0, 3).map(item => `• ${item.criterion}: ${item.level} (${item.score}점)`).join('\n')}\n\nSafe Pet Food 사료 등급 분석기\n${generateShareUrl()}`
    
    navigator.clipboard.writeText(shareText).then(() => {
      alert('결과가 클립보드에 복사되었습니다!')
    })
  }

  const getGradeIcon = (grade: string) => {
    switch (grade) {
      case 'S': return <Award className="w-6 h-6 text-purple-600" />
      case 'A': return <Star className="w-6 h-6 text-green-600" />
      case 'B': return <CheckCircle className="w-6 h-6 text-blue-600" />
      case 'C': return <AlertTriangle className="w-6 h-6 text-yellow-600" />
      case 'D': return <XCircle className="w-6 h-6 text-orange-600" />
      case 'F': return <XCircle className="w-6 h-6 text-red-600" />
      default: return <Target className="w-6 h-6 text-gray-600" />
    }
  }

  // 각 항목별 고유 색상 정의
  const getCriterionColor = (key: string) => {
    switch (key) {
      case 'ingredient_quality':
        return {
          gradient: 'from-green-500 to-emerald-500',
          border: 'border-l-green-500',
          bg: 'from-green-50 to-emerald-50',
          check: 'from-green-500 to-emerald-500',
          icon: 'from-green-500 to-emerald-500'
        }
      case 'ingredient_transparency':
        return {
          gradient: 'from-blue-500 to-cyan-500',
          border: 'border-l-blue-500',
          bg: 'from-blue-50 to-cyan-50',
          check: 'from-blue-500 to-cyan-500',
          icon: 'from-blue-500 to-cyan-500'
        }
      case 'safety_record':
        return {
          gradient: 'from-red-500 to-pink-500',
          border: 'border-l-red-500',
          bg: 'from-red-50 to-pink-50',
          check: 'from-red-500 to-pink-500',
          icon: 'from-red-500 to-pink-500'
        }
      case 'nutritional_standards':
        return {
          gradient: 'from-purple-500 to-indigo-500',
          border: 'border-l-purple-500',
          bg: 'from-purple-50 to-indigo-50',
          check: 'from-purple-500 to-indigo-500',
          icon: 'from-purple-500 to-indigo-500'
        }
      case 'preservative_type':
        return {
          gradient: 'from-orange-500 to-amber-500',
          border: 'border-l-orange-500',
          bg: 'from-orange-50 to-amber-50',
          check: 'from-orange-500 to-amber-500',
          icon: 'from-orange-500 to-amber-500'
        }
      default:
        return {
          gradient: 'from-gray-500 to-gray-600',
          border: 'border-l-gray-500',
          bg: 'from-gray-50 to-gray-100',
          check: 'from-gray-500 to-gray-600',
          icon: 'from-gray-500 to-gray-600'
        }
    }
  }

  // 각 항목별 고유 아이콘 정의
  const getCriterionIcon = (key: string) => {
    switch (key) {
      case 'ingredient_quality':
        return <Leaf className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      case 'ingredient_transparency':
        return <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      case 'safety_record':
        return <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      case 'nutritional_standards':
        return <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      case 'preservative_type':
        return <Zap className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
      default:
        return <Shield className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section - Mobile Optimized */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">
            사료 등급 분석기 🔍
              </h1>
          <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 px-4 leading-relaxed">
                5가지 핵심 기준으로 사료의 등급을 과학적으로 분석합니다
              </p>
          
          {/* Action Buttons - Only show when no result */}
          {!result && (
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 px-4">
              <button
                onClick={resetForm}
                className="flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base w-full sm:w-auto justify-center"
              >
                <RotateCcw className="w-4 h-4" />
                초기화
              </button>
            </div>
          )}
      </div>

        {/* Tab Navigation - Mobile Optimized */}
        <div className="flex space-x-1 bg-white p-1 rounded-2xl shadow-xl border border-gray-100 mb-6 sm:mb-8">
          <button
            onClick={() => setActiveTab('search')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-3 sm:px-6 rounded-xl transition-all duration-200 ${
              activeTab === 'search'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Search className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">사료 검색</span>
          </button>
          <button
            onClick={() => setActiveTab('input')}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-3 sm:px-6 rounded-xl transition-all duration-200 ${
              activeTab === 'input'
                ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            }`}
          >
            <Calculator className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">직접 입력</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('result')
              if (result) {
                setTimeout(() => {
                  const resultSection = document.getElementById('analysis-result')
                  if (resultSection) {
                    resultSection.scrollIntoView({ 
                      behavior: 'smooth', 
                      block: 'start' 
                    })
                  }
                }, 100)
              }
            }}
            disabled={!result}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2 py-3 sm:py-4 px-3 sm:px-6 rounded-xl transition-all duration-200 ${
              activeTab === 'result'
                ? 'bg-gradient-to-r from-green-500 to-teal-500 text-white shadow-lg'
                : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
            } ${!result ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="text-xs sm:text-sm font-medium">분석 결과</span>
          </button>
        </div>

        {/* Search Section - Mobile Optimized */}
        {activeTab === 'search' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Search Input */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-8 hover:shadow-2xl transition-all duration-300">
              <div className="text-center mb-6 sm:mb-8">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <Search className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">사료 브랜드 검색</h2>
                <p className="text-base sm:text-lg text-gray-600 mb-4 sm:mb-6 px-4 leading-relaxed">
                  검색하면 즉시 분석 결과를 확인할 수 있습니다
                </p>
              </div>
              
              <div className="relative mb-6 sm:mb-8">
                <Search className="absolute left-3 sm:left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 sm:h-6 sm:w-6" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value)
                    handleSearch(e.target.value)
                  }}
                  placeholder="사료 브랜드명을 입력하세요"
                  className="w-full pl-10 sm:pl-12 pr-4 py-3 sm:py-4 text-base sm:text-lg border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              {/* Search Results - Mobile Optimized */}
              {searchResults.length > 0 && (
                <div className="space-y-3 sm:space-y-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4 px-2">검색 결과</h3>
                  {searchResults.map((feed) => (
                    <div
                      key={feed.id}
                      onClick={() => handleSelectFeed(feed)}
                      className="bg-gradient-to-r from-gray-50 to-blue-50 border-2 border-gray-200 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-200 cursor-pointer hover:border-purple-300"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
                        <div className="flex-1 min-w-0">
                          <h4 className="text-base sm:text-lg font-bold text-gray-900 mb-2 leading-tight break-words">{feed.name}</h4>
                          <p className="text-sm sm:text-base text-gray-600 mb-3 leading-relaxed">{feed.description}</p>
                          <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <span className="text-xs sm:text-sm text-gray-500">브랜드: {feed.brand}</span>
                            <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-semibold w-fit ${
                              feed.grade === 'A' ? 'bg-green-100 text-green-800' : 
                              feed.grade === 'B' ? 'bg-yellow-100 text-yellow-800' : 
                              'bg-red-100 text-red-800'
                            }`}>
                              {feed.grade}등급 ({feed.score}점)
                            </span>
                          </div>
                        </div>
                        <div className="flex justify-center sm:justify-end">
                          <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                            <span className="text-white font-bold text-base sm:text-lg">{feed.grade}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* No Results - Mobile Optimized */}
              {searchQuery && searchResults.length === 0 && (
                <div className="text-center py-6 sm:py-8 px-4">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <Search className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">다른 키워드로 검색하거나 직접 입력해보세요</p>
                  <button
                    onClick={() => setActiveTab('input')}
                    className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
                  >
                    직접 입력하기
                  </button>
                </div>
              )}

              {/* Manual Input Option - Mobile Optimized */}
              {!searchQuery && (
                <div className="text-center py-6 sm:py-8 border-t border-gray-200 px-4">
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">💡 더 정확한 분석을 원하시나요?</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed">
                    사료 성분표를 직접 확인하고 입력하면<br />
                    더 정확하고 상세한 분석이 가능합니다
                  </p>
                  <button
                    onClick={() => setActiveTab('input')}
                    className="px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 font-semibold text-sm sm:text-base w-full sm:w-auto"
                  >
                    직접 성분 입력하기
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Input Form - Mobile Optimized */}
        {activeTab === 'input' && (
          <div className="space-y-6 sm:space-y-8">
            {/* Learning Motivation Section - Mobile Optimized */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-2xl shadow-xl border border-blue-200 p-4 sm:p-8 hover:shadow-2xl transition-all duration-300">
              <div className="text-center">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 shadow-lg">
                  <Info className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                </div>
                <h2 className="text-lg sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 px-2">💡 사료 성분표 읽는 법</h2>
                <p className="text-sm sm:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed px-2">
                  직접 확인하면 더 정확한 분석이 가능해요!<br />
                  사료 포장지의 성분표를 확인하고 아래 항목들을 선택해주세요.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 text-xs sm:text-sm">
                  <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
                    <div className="font-semibold text-blue-600 mb-1 sm:mb-2 text-sm sm:text-base">🔍 원료 품질</div>
                    <div className="text-gray-600 text-xs sm:text-sm">첫 번째 원료가 고기인지 확인</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm">
                    <div className="font-semibold text-green-600 mb-1 sm:mb-2 text-sm sm:text-base">📋 성분 투명성</div>
                    <div className="text-gray-600 text-xs sm:text-sm">원료의 구체적인 정보 제공</div>
                  </div>
                  <div className="bg-white rounded-xl p-3 sm:p-4 shadow-sm sm:col-span-2 lg:col-span-1">
                    <div className="font-semibold text-purple-600 mb-1 sm:mb-2 text-sm sm:text-base">🛡️ 안전성</div>
                    <div className="text-gray-600 text-xs sm:text-sm">리콜 이력과 보존료 종류</div>
                  </div>
                </div>
              </div>
            </div>
            {Object.entries(criteriaOptions).map(([key, criterion]) => {
              const colors = getCriterionColor(key)
              return (
              <div key={key} className={`bg-white rounded-2xl shadow-xl border-l-4 ${colors.border} p-4 sm:p-8 hover:shadow-2xl transition-all duration-300`}>
                <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 flex items-center gap-2 sm:gap-3">
                  <div className={`w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r ${colors.icon} rounded-2xl flex items-center justify-center flex-shrink-0`}>
                    {getCriterionIcon(key)}
                  </div>
                  <span className={`break-words bg-gradient-to-r ${colors.gradient} bg-clip-text text-transparent`}>
                  {criterion.name}
                  </span>
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  {criterion.options.map((option) => (
                    <label
                      key={option.value}
                      className={`relative flex flex-col p-4 sm:p-6 rounded-2xl border-2 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                        formData[key as keyof FeedAnalysisInput] === option.value
                          ? `border-2 ${colors.border.replace('border-l-', 'border-')} bg-gradient-to-br ${colors.bg} shadow-lg`
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <input
                        type="radio"
                        name={key}
                        value={option.value}
                        checked={formData[key as keyof FeedAnalysisInput] === option.value}
                        onChange={(e) => handleInputChange(key as keyof FeedAnalysisInput, e.target.value)}
                        className="sr-only"
                      />
                      <div className="flex items-center justify-between mb-2 sm:mb-3">
                        <span className="font-semibold text-gray-900 text-sm sm:text-base break-words">{option.label}</span>
                        {formData[key as keyof FeedAnalysisInput] === option.value && (
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-r ${colors.check} rounded-full flex items-center justify-center flex-shrink-0`}>
                            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                          </div>
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-2 sm:mb-3">{option.description}</p>
                      
                      {/* Examples - Mobile Optimized */}
                      {option.examples && (
                        <div className="space-y-1.5 sm:space-y-2 text-xs">
                          {option.examples.good && (
                            <div className="bg-green-50 p-2 sm:p-2 rounded">
                              <div className="font-medium text-green-800 mb-1 text-xs">✅ 좋은 예:</div>
                              <div className="text-green-700 text-xs leading-relaxed">{option.examples.good}</div>
                            </div>
                          )}
                          {option.examples.bad && (
                            <div className="bg-red-50 p-2 sm:p-2 rounded">
                              <div className="font-medium text-red-800 mb-1 text-xs">❌ 나쁜 예:</div>
                              <div className="text-red-700 text-xs leading-relaxed">{option.examples.bad}</div>
                            </div>
                          )}
                           {'warning' in option.examples && option.examples.warning && (
                             <div className="bg-yellow-50 p-2 sm:p-2 rounded">
                               <div className="font-medium text-yellow-800 mb-1 text-xs">⚠️ 주의:</div>
                               <div className="text-yellow-700 text-xs leading-relaxed">{option.examples.warning}</div>
                             </div>
                           )}
                        </div>
                      )}
                    </label>
                  ))}
                </div>
              </div>
              )
            })}

            {/* Analyze Button - Mobile Optimized */}
            <div className="flex justify-center px-4">
              <button
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                className="flex items-center gap-2 sm:gap-3 px-6 sm:px-10 py-3 sm:py-5 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold text-base sm:text-lg rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 transform hover:scale-105 shadow-xl hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none w-full sm:w-auto justify-center"
              >
                {isAnalyzing ? (
                  <>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    분석 중...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6" />
                    등급 분석하기
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Results - Mobile Optimized */}
        {activeTab === 'result' && result && (
          <div id="analysis-result" className="space-y-6 sm:space-y-8">
            {/* Overall Grade - Mobile Optimized */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-10 text-center hover:shadow-2xl transition-all duration-300">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 mb-4 sm:mb-6">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
                {getGradeIcon(result.overall_grade)}
                </div>
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2" style={{ color: result.grade_color }}>
                  {result.overall_grade}등급
                </h2>
                  <div className="text-xl sm:text-3xl font-bold text-gray-700">
                  {result.overall_score}점
                  </div>
                </div>
              </div>
              <p className="text-sm sm:text-xl text-gray-600 leading-relaxed px-2">{result.grade_description}</p>
            </div>

            {/* Breakdown - Mobile Optimized */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-8 hover:shadow-2xl transition-all duration-300">
              <h3 className="text-lg sm:text-2xl font-semibold text-gray-900 mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                </div>
                <span className="break-words">세부 분석 결과</span>
              </h3>
              <div className="space-y-4 sm:space-y-6">
                {result.breakdown.map((item, index) => (
                  <div key={index} className="border-2 border-gray-100 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition-all duration-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-3 sm:mb-4">
                      <h4 className="text-base sm:text-lg font-semibold text-gray-900 break-words">{item.criterion}</h4>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-3">
                        <span className="text-xs sm:text-sm text-gray-600 bg-gray-100 px-2 sm:px-3 py-1 rounded-full">가중치: {item.weight}%</span>
                        <span 
                          className="font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm shadow-sm"
                          style={{ 
                            backgroundColor: `${item.color}20`, 
                            color: item.color,
                            border: `2px solid ${item.color}40`
                          }}
                        >
                          {item.score}점
                        </span>
                      </div>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4 mb-3 sm:mb-4">
                      <span className="text-xs sm:text-sm font-medium text-gray-600 bg-gray-50 px-2 sm:px-3 py-1 rounded-lg w-fit">{item.level}</span>
                      <span className="text-xs sm:text-sm font-bold text-gray-700 bg-blue-50 px-2 sm:px-3 py-1 rounded-lg w-fit">
                        가중 점수: {item.weighted_score}점
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 leading-relaxed">{item.description}</p>
                    <div className="w-full bg-gray-200 rounded-full h-3 shadow-inner">
                      <div
                        className="h-3 rounded-full transition-all duration-700 shadow-sm"
                        style={{
                          width: `${item.score}%`,
                          backgroundColor: item.color
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Strengths */}
              {result.strengths.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
                  <h3 className="text-xl font-semibold text-green-700 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-white" />
                    </div>
                    강점
                  </h3>
                  <ul className="space-y-4">
                    {result.strengths.map((strength, index) => (
                      <li key={index} className="flex items-start gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Weaknesses */}
              {result.weaknesses.length > 0 && (
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
                  <h3 className="text-xl font-semibold text-red-700 mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center">
                      <AlertTriangle className="w-5 h-5 text-white" />
                    </div>
                    개선점
                  </h3>
                  <ul className="space-y-4">
                    {result.weaknesses.map((weakness, index) => (
                      <li key={index} className="flex items-start gap-3 p-4 bg-red-50 rounded-xl border border-red-200">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <AlertTriangle className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-gray-700 font-medium">{weakness}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Recommendations */}
            {result.recommendations.length > 0 && (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 hover:shadow-2xl transition-all duration-300">
                <h3 className="text-xl font-semibold text-blue-700 mb-6 flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                    <Info className="w-5 h-5 text-white" />
                  </div>
                  개선 권장사항
                </h3>
                <ul className="space-y-4">
                  {result.recommendations.map((recommendation, index) => (
                    <li key={index} className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-white font-bold text-sm">{index + 1}</span>
                      </div>
                      <span className="text-gray-700 font-medium leading-relaxed">{recommendation}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Action Buttons - Mobile Optimized */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4 mt-6 sm:mt-8 px-4">
              <button
                onClick={resetForm}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 text-gray-700 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md text-sm sm:text-base w-full sm:w-auto"
              >
                <RotateCcw className="w-4 h-4" />
                다시 분석하기
              </button>
              <button 
                onClick={handleShare}
                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-xl hover:from-blue-600 hover:to-purple-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base w-full sm:w-auto"
              >
                <Share2 className="w-4 h-4" />
                공유하기
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Share Modal - Mobile Optimized */}
      {showShareModal && result && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[95vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex justify-between items-center mb-4 sm:mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">분석 결과 공유</h3>
                <button
                  onClick={() => setShowShareModal(false)}
                  className="text-gray-500 hover:text-gray-700 text-lg sm:text-xl p-1"
                >
                  ✕
                </button>
              </div>
              
              {/* Preview Card - Mobile Optimized */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-3 sm:p-4 mb-4 sm:mb-6">
                <div className="text-center p-4 sm:p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl border-2 border-blue-200">
                  <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                      {getGradeIcon(result.overall_grade)}
                    </div>
                    <div>
                      <div className="text-xl sm:text-2xl font-bold mb-1" style={{ color: result.grade_color }}>
                        {result.overall_grade}등급
                      </div>
                      <div className="text-base sm:text-lg font-semibold text-gray-700">
                        {result.overall_score}점
                      </div>
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4 leading-relaxed">
                    {result.grade_description}
                  </div>
                  
                  {/* Top 3 Components */}
                  <div className="space-y-2 mb-4">
                    {result.breakdown
                      .sort((a, b) => b.score - a.score)
                      .slice(0, 3)
                      .map((item, index) => (
                        <div key={index} className="flex justify-between items-center bg-white px-3 py-2 rounded-lg text-sm">
                          <span className="font-medium">
                            {item.criterion}: {item.level}
                          </span>
                          <span className="font-bold text-blue-600">
                            {item.score}점
                          </span>
                        </div>
                      ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 border-t pt-3">
                    🔍 Safe Pet Food 사료 등급 분석기
                  </div>
                </div>
              </div>
              
              {/* Share Options - Mobile Optimized */}
              <div className="space-y-2 sm:space-y-3">
                <button
                  onClick={copyToClipboard}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                >
                  📋 결과 복사하기
                </button>
                
                <button
                  onClick={() => handleSNSShare('instagram')}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                >
                  📸 인스타그램으로 공유하기
                </button>
                
                <button
                  onClick={() => handleSNSShare('threads')}
                  className="w-full bg-black hover:bg-gray-800 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                >
                  🧵 쓰레드로 공유하기
                </button>
                
                <button
                  onClick={() => handleSNSShare('facebook')}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                >
                  📘 페이스북으로 공유하기
                </button>
                
                <button
                  onClick={() => handleSNSShare('kakao')}
                  className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-200 text-sm sm:text-base"
                >
                  💬 카카오톡으로 공유하기
                </button>
              </div>
              
              <div className="mt-4 sm:mt-6 text-xs text-gray-500 text-center leading-relaxed px-2">
                분석 결과는 일반적인 참고용이며, 개체차이가 있을 수 있습니다.<br/>
                특별한 건강 상태가 있다면 수의사와 상담하세요.
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
