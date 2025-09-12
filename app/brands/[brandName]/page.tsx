'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { 
  Star, 
  Calendar, 
  AlertTriangle, 
  CheckCircle, 
  Shield, 
  User, 
  MessageSquare, 
  Award, 
  Building, 
  Globe, 
  Package,
  MapPin,
  Factory,
  TestTube,
  Heart,
  TrendingUp,
  Zap,
  Eye,
  EyeOff,
  Minus,
  ArrowLeft,
  ThumbsUp,
  ThumbsDown,
  Flag,
  HelpCircle
} from 'lucide-react'

interface Brand {
  id: string
  name: string
  logo: string
  manufacturer: string
  country_of_origin: string
  manufacturing_locations: string[]
  established_year: number
  certifications: string[]
  recall_history: Array<{
    date: string
    reason: string
    severity: 'low' | 'medium' | 'high'
    resolved: boolean
  }>
  transparency_score: number
  ingredient_disclosure: {
    fully_disclosed: number
    partially_disclosed: number
    not_disclosed: number
  }
  nutrition_analysis: {
    protein: number
    fat: number
    carbohydrates: number
    fiber: number
    moisture: number
    calories_per_100g: number
  }
  consumer_ratings: {
    palatability: number
    digestibility: number
    coat_quality: number
    stool_quality: number
    overall_satisfaction: number
  }
  expert_reviews: Array<{
    expert_name: string
    rating: number
    comment: string
    date: string
  }>
  ingredients: Array<{
    name: string
    percentage?: number
    source?: string
    disclosure_level: 'full' | 'partial' | 'none'
  }>
  community_feedback: {
    recommend_yes: number
    recommend_no: number
    total_votes: number
  }
}

const getBrandData = (brandName: string): Brand => {
  const brands: Record<string, Brand> = {
    'royal-canin': {
      id: 'royal-canin',
      name: '로얄캐닌',
      logo: '👑',
      manufacturer: 'Mars Petcare',
      country_of_origin: '프랑스',
      manufacturing_locations: ['프랑스 아이메르그', '한국 김천', '미국 오클라호마'],
      established_year: 1968,
      certifications: ['HACCP', 'AAFCO', 'ISO 22000', 'FEDIAF'],
      recall_history: [
        {
          date: '2023-03-15',
          reason: '비타민 D 과다 검출',
          severity: 'medium',
          resolved: true
        },
        {
          date: '2022-08-10',
          reason: '살모넬라균 오염 가능성',
          severity: 'high',
          resolved: true
        }
      ],
      transparency_score: 78,
      ingredient_disclosure: {
        fully_disclosed: 65,
        partially_disclosed: 25,
        not_disclosed: 10
      },
      nutrition_analysis: {
        protein: 32,
        fat: 14,
        carbohydrates: 28,
        fiber: 8,
        moisture: 10,
        calories_per_100g: 385
      },
      consumer_ratings: {
        palatability: 4.2,
        digestibility: 4.0,
        coat_quality: 4.3,
        stool_quality: 3.8,
        overall_satisfaction: 4.1
      },
      expert_reviews: [
        {
          expert_name: '김수의 수의사',
          rating: 4.5,
          comment: '영양학적 균형이 잘 잡혀있고, 특히 처방식의 경우 임상 데이터가 풍부합니다.',
          date: '2024-12-10'
        },
        {
          expert_name: '박영양 박사',
          rating: 4.0,
          comment: '품질 관리는 우수하나 원재료 출처 공개가 더 투명해질 필요가 있습니다.',
          date: '2024-11-28'
        }
      ],
      ingredients: [
        { name: '닭고기', percentage: 18, source: '프랑스산', disclosure_level: 'full' },
        { name: '쌀', percentage: 15, source: '미국산', disclosure_level: 'full' },
        { name: '옥수수', percentage: 12, disclosure_level: 'partial' },
        { name: '동물성 지방', percentage: 8, disclosure_level: 'partial' },
        { name: '식물성 단백질', percentage: 6, disclosure_level: 'none' },
        { name: '비트펄프', percentage: 5, source: '유럽산', disclosure_level: 'full' }
      ],
      community_feedback: {
        recommend_yes: 1247,
        recommend_no: 358,
        total_votes: 1605
      }
    },
    'hills': {
      id: 'hills',
      name: '힐스',
      logo: '🏔️',
      manufacturer: "Hill's Pet Nutrition",
      country_of_origin: '미국',
      manufacturing_locations: ['미국 캔자스', '네덜란드 토펜', '체코 프라하'],
      established_year: 1948,
      certifications: ['AAFCO', 'FDA', 'ISO 9001'],
      recall_history: [
        {
          date: '2023-07-22',
          reason: '금속 이물질 검출',
          severity: 'high',
          resolved: true
        }
      ],
      transparency_score: 85,
      ingredient_disclosure: {
        fully_disclosed: 78,
        partially_disclosed: 18,
        not_disclosed: 4
      },
      nutrition_analysis: {
        protein: 30,
        fat: 16,
        carbohydrates: 25,
        fiber: 7,
        moisture: 9,
        calories_per_100g: 392
      },
      consumer_ratings: {
        palatability: 3.9,
        digestibility: 4.4,
        coat_quality: 4.1,
        stool_quality: 4.2,
        overall_satisfaction: 4.2
      },
      expert_reviews: [
        {
          expert_name: '이건강 수의사',
          rating: 4.8,
          comment: '임상 연구 기반의 과학적 접근이 돋보이며, 처방식의 효과가 뛰어납니다.',
          date: '2024-12-05'
        }
      ],
      ingredients: [
        { name: '닭고기분', percentage: 22, source: '미국산', disclosure_level: 'full' },
        { name: '현미', percentage: 16, source: '미국산', disclosure_level: 'full' },
        { name: '보리', percentage: 10, source: '캐나다산', disclosure_level: 'full' },
        { name: '닭지방', percentage: 9, disclosure_level: 'partial' },
        { name: '천연향료', percentage: 3, disclosure_level: 'none' }
      ],
      community_feedback: {
        recommend_yes: 892,
        recommend_no: 201,
        total_votes: 1093
      }
    }
  }
  
  return brands[brandName] || brands['royal-canin']
}

const getTransparencyColor = (score: number) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

const getTransparencyBgColor = (score: number) => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'text-red-600 bg-red-50'
    case 'medium': return 'text-yellow-600 bg-yellow-50'
    case 'low': return 'text-green-600 bg-green-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

const getDisclosureIcon = (level: string) => {
  switch (level) {
    case 'full': return <Eye className="h-4 w-4 text-green-500" />
    case 'partial': return <Minus className="h-4 w-4 text-yellow-500" />
    case 'none': return <EyeOff className="h-4 w-4 text-red-500" />
    default: return <Minus className="h-4 w-4 text-gray-400" />
  }
}

export default function BrandDetailPage() {
  const params = useParams()
  const brandName = decodeURIComponent(params.brandName as string)
  const [brand, setBrand] = useState<Brand | null>(null)
  const [activeTab, setActiveTab] = useState('overview')
  const [showQAForm, setShowQAForm] = useState(false)
  const [showReportForm, setShowReportForm] = useState(false)
  const [showEvaluationSuccess, setShowEvaluationSuccess] = useState(false)
  const [voteData, setVoteData] = useState<{
    recommend_yes: number
    recommend_no: number
    total_votes: number
    recommendation_percentage: number
    user_vote?: 'yes' | 'no' | null
  } | null>(null)
  const [isVoting, setIsVoting] = useState(false)
  const [evaluationData, setEvaluationData] = useState<{
    totalEvaluations: number
    averageRatings: any
    recommendationRate: number
    recentEvaluations: any[]
  } | null>(null)

  useEffect(() => {
    const brandData = getBrandData(brandName)
    setBrand(brandData)
    
    // 투표 데이터 가져오기
    fetchVoteData()
    
    // 평가 데이터 가져오기
    fetchEvaluationData()
    
    // URL 파라미터 확인 (평가 성공 시)
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('evaluation') === 'success') {
      setShowEvaluationSuccess(true)
      // URL에서 파라미터 제거
      window.history.replaceState({}, '', `/brands/${brandName}`)
    }
  }, [brandName])

  const fetchVoteData = async () => {
    try {
      const response = await fetch(`/api/brands/${brandName}/vote`)
      if (response.ok) {
        const data = await response.json()
        setVoteData(data)
      }
    } catch (error) {
      console.error('투표 데이터 로딩 오류:', error)
    }
  }

  const fetchEvaluationData = async () => {
    try {
      const response = await fetch(`/api/brands/${brandName}/evaluate`)
      if (response.ok) {
        const data = await response.json()
        setEvaluationData(data)
      }
    } catch (error) {
      console.error('평가 데이터 가져오기 실패:', error)
    }
  }

  const handleVote = async (vote: 'yes' | 'no') => {
    if (isVoting) return

    setIsVoting(true)
    try {
      // 임시 사용자 ID (실제로는 로그인 시스템에서 가져옴)
      const userId = `user-${Date.now()}`
      
      const response = await fetch(`/api/brands/${brandName}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote, userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setVoteData(data)
      } else {
        console.error('투표 실패')
      }
    } catch (error) {
      console.error('투표 오류:', error)
    } finally {
      setIsVoting(false)
    }
  }

  if (!brand) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600">브랜드 정보를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  const recommendationPercentage = voteData ? voteData.recommendation_percentage : 
    Math.round((brand.community_feedback.recommend_yes / brand.community_feedback.total_votes) * 100)

    return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
              <div className="flex items-center space-x-4">
            <Link href="/brands" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="h-5 w-5 text-gray-600" />
            </Link>
            <div className="flex items-center space-x-3">
              <div className="text-3xl">{brand.logo}</div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{brand.name}</h1>
                <p className="text-gray-600">{brand.manufacturer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 브랜드 프로필 카드 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">브랜드 프로필</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* 제조국 */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Globe className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">원산지</p>
                <p className="font-medium text-gray-900">{brand.country_of_origin}</p>
              </div>
            </div>

            {/* 설립연도 */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-50 rounded-lg">
                <Calendar className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">설립연도</p>
                <p className="font-medium text-gray-900">{brand.established_year}년</p>
              </div>
            </div>

            {/* 제조 공장 */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Factory className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">제조 공장</p>
                <p className="font-medium text-gray-900">{brand.manufacturing_locations.length}개 지역</p>
              </div>
            </div>

            {/* 인증 */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-50 rounded-lg">
                <Shield className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm text-gray-600">인증</p>
                <p className="font-medium text-gray-900">{brand.certifications.length}개 인증</p>
              </div>
            </div>
          </div>

          {/* 제조 공장 상세 */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-900 mb-3">🏭 제조 공장 위치</h3>
            <div className="flex flex-wrap gap-2">
              {brand.manufacturing_locations.map((location, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-700">
                  <MapPin className="h-3 w-3 mr-1" />
                  {location}
                </span>
              ))}
        </div>
      </div>

          {/* 인증 뱃지 */}
          <div className="mt-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">🏆 인증 현황</h3>
            <div className="flex flex-wrap gap-2">
              {brand.certifications.map((cert, index) => (
                <span key={index} className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-700">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  {cert}
                </span>
              ))}
            </div>
          </div>

          {/* 리콜 이력 */}
          {brand.recall_history.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-900 mb-3">⚠️ 리콜 이력</h3>
              <div className="space-y-3">
                {brand.recall_history.map((recall, index) => (
                  <div key={index} className={`p-3 rounded-lg ${getSeverityColor(recall.severity)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">{recall.reason}</span>
                      </div>
                      <span className="text-xs text-gray-600">{recall.date}</span>
                    </div>
                    {recall.resolved && (
                      <div className="mt-1 flex items-center space-x-1">
                        <CheckCircle className="h-3 w-3 text-green-500" />
                        <span className="text-xs text-green-600">해결 완료</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 투명성 점수 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">🔍 투명성 점수</h2>
            
            {/* 전체 점수 */}
            <div className="text-center mb-6">
              <div className={`text-4xl font-bold ${getTransparencyColor(brand.transparency_score)} mb-2`}>
                {brand.transparency_score}점
                </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                <div 
                  className={`h-3 rounded-full ${getTransparencyBgColor(brand.transparency_score)}`}
                  style={{ width: `${brand.transparency_score}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600">
                {brand.transparency_score >= 80 ? '매우 투명' : 
                 brand.transparency_score >= 60 ? '보통 투명' : '투명성 부족'}
              </p>
            </div>

            {/* 공개 상태 분포 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Eye className="h-4 w-4 text-green-500" />
                  <span className="text-sm text-gray-700">완전 공개</span>
                </div>
                <span className="text-sm font-medium text-green-600">
                  {brand.ingredient_disclosure.fully_disclosed}%
                </span>
                </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Minus className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm text-gray-700">부분 공개</span>
                </div>
                <span className="text-sm font-medium text-yellow-600">
                  {brand.ingredient_disclosure.partially_disclosed}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <EyeOff className="h-4 w-4 text-red-500" />
                  <span className="text-sm text-gray-700">미공개</span>
                </div>
                <span className="text-sm font-medium text-red-600">
                  {brand.ingredient_disclosure.not_disclosed}%
                </span>
              </div>
            </div>
          </div>

          {/* 성분 & 영양 성분 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">🧪 성분 & 영양 분석</h2>
            
            {/* 영양 성분 도넛 차트 (간단한 바 차트로 대체) */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">주요 영양 성분 비율</h3>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">단백질</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-500 h-2 rounded-full" style={{width: `${(brand.nutrition_analysis.protein/40)*100}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{brand.nutrition_analysis.protein}%</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">지방</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-green-500 h-2 rounded-full" style={{width: `${(brand.nutrition_analysis.fat/25)*100}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{brand.nutrition_analysis.fat}%</span>
                  </div>
                    </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">탄수화물</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-yellow-500 h-2 rounded-full" style={{width: `${(brand.nutrition_analysis.carbohydrates/40)*100}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{brand.nutrition_analysis.carbohydrates}%</span>
                  </div>
                    </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">섬유질</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-500 h-2 rounded-full" style={{width: `${(brand.nutrition_analysis.fiber/15)*100}%`}}></div>
                    </div>
                    <span className="text-sm font-medium">{brand.nutrition_analysis.fiber}%</span>
                  </div>
                </div>
              </div>
                      </div>
                      
            {/* 칼로리 정보 */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">칼로리</span>
                <span className="text-sm font-medium text-gray-900">
                  {brand.nutrition_analysis.calories_per_100g} kcal/100g
                </span>
                        </div>
                        </div>
                        </div>
                      </div>
                      
        {/* 원재료 리스트 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">📋 주요 원재료</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {brand.ingredients.map((ingredient, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg">
                <div className="flex items-center space-x-3">
                  {getDisclosureIcon(ingredient.disclosure_level)}
                  <div>
                    <p className="font-medium text-gray-900">{ingredient.name}</p>
                    {ingredient.source && (
                      <p className="text-xs text-gray-500">{ingredient.source}</p>
                  )}
                </div>
                </div>
                {ingredient.percentage && (
                  <span className="text-sm font-medium text-gray-600">
                    {ingredient.percentage}%
                  </span>
              )}
            </div>
            ))}
          </div>

          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 text-sm text-blue-700">
              <Eye className="h-4 w-4" />
              <span>완전 공개</span>
              <Minus className="h-4 w-4 ml-4" />
              <span>부분 공개</span>
              <EyeOff className="h-4 w-4 ml-4" />
              <span>미공개</span>
                </div>
                </div>
              </div>

        {/* 소비자 평가 & 전문가 리뷰 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          {/* 소비자 평가 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">⭐ 소비자 평가</h2>
            
            <div className="space-y-4">
              {Object.entries(brand.consumer_ratings).map(([key, rating]) => {
                const labels: Record<string, string> = {
                  palatability: '기호성',
                  digestibility: '소화력', 
                  coat_quality: '모질 개선',
                  stool_quality: '변 상태',
                  overall_satisfaction: '전체 만족도'
                }
                
                return (
                  <div key={key} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{labels[key]}</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star 
                            key={star} 
                            className={`h-4 w-4 ${star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{rating.toFixed(1)}</span>
                    </div>
                  </div>
                )
              })}
                </div>

            {/* 커뮤니티 추천 */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                  {recommendationPercentage}%
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  {voteData ? voteData.total_votes : brand.community_feedback.total_votes}명이 평가
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">
                      {voteData ? voteData.recommend_yes : brand.community_feedback.recommend_yes}
                    </span>
            </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">
                      {voteData ? voteData.recommend_no : brand.community_feedback.recommend_no}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 전문가 리뷰 */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">👨‍⚕️ 전문가 리뷰</h2>
            
            <div className="space-y-4">
              {brand.expert_reviews.map((review, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-900">{review.expert_name}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Star className="h-4 w-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{review.rating}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{review.comment}</p>
                  <p className="text-xs text-gray-400">{review.date}</p>
              </div>
              ))}
            </div>
          </div>
        </div>

        {/* 피드백 버튼 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">💬 커뮤니티 & 피드백</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link 
              href={`/brands/${brandName}/evaluate`}
              className="flex items-center justify-center space-x-2 p-4 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <Star className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-600">이 브랜드 평가하기</span>
            </Link>
            
            <button 
              onClick={() => setShowQAForm(true)}
              className="flex items-center justify-center space-x-2 p-4 border-2 border-blue-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
            >
              <HelpCircle className="h-5 w-5 text-blue-600" />
              <span className="font-medium text-blue-600">브랜드에 질문하기</span>
            </button>
            
            <button 
              onClick={() => setShowReportForm(true)}
              className="flex items-center justify-center space-x-2 p-4 border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
            >
              <Flag className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-600">문제 신고하기</span>
            </button>
          </div>

          {/* 투표 위젯 */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-lg font-medium text-gray-900 mb-4 text-center">
              이 브랜드를 추천하시나요?
            </h3>
            <div className="flex items-center justify-center space-x-4">
              <button 
                onClick={() => handleVote('yes')}
                disabled={isVoting}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                  voteData?.user_vote === 'yes' 
                    ? 'bg-green-600 text-white' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ThumbsUp className="h-4 w-4" />
                <span>{isVoting && voteData?.user_vote !== 'yes' ? '투표 중...' : '추천해요'}</span>
              </button>
              <button 
                onClick={() => handleVote('no')}
                disabled={isVoting}
                className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
                  voteData?.user_vote === 'no' 
                    ? 'bg-red-600 text-white' 
                    : 'bg-red-500 text-white hover:bg-red-600'
                } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ThumbsDown className="h-4 w-4" />
                <span>{isVoting && voteData?.user_vote !== 'no' ? '투표 중...' : '추천 안해요'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Q&A 모달 */}
      {showQAForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">브랜드에 질문하기</h3>
            <textarea 
              className="w-full p-3 border border-gray-300 rounded-lg mb-4" 
              rows={4} 
              placeholder="궁금한 점을 입력해주세요..."
            ></textarea>
            <div className="flex space-x-3">
              <button 
                onClick={() => setShowQAForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                취소
              </button>
              <button 
                onClick={() => setShowQAForm(false)}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                질문 등록
              </button>
                </div>
                </div>
              </div>
      )}

      {/* 신고 모달 */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">문제 신고하기</h3>
            <select className="w-full p-3 border border-gray-300 rounded-lg mb-4">
              <option>허위 정보</option>
              <option>품질 문제</option>
              <option>안전 문제</option>
              <option>기타</option>
                </select>
                <textarea
              className="w-full p-3 border border-gray-300 rounded-lg mb-4" 
                  rows={4}
              placeholder="상세 내용을 입력해주세요..."
            ></textarea>
            <div className="flex space-x-3">
                <button
                onClick={() => setShowReportForm(false)}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  취소
                </button>
                <button
                onClick={() => setShowReportForm(false)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                신고하기
                </button>
              </div>
          </div>
        </div>
      )}

      {/* 평가 성공 모달 */}
      {showEvaluationSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">평가 완료!</h3>
            <p className="text-gray-600 mb-6">
              소중한 평가를 남겨주셔서 감사합니다.<br />
              다른 반려인들에게 큰 도움이 될 것입니다.
            </p>
            <button 
              onClick={() => setShowEvaluationSuccess(false)}
              className="w-full px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              확인
            </button>
          </div>
        </div>
      )}
    </div>
  )
} 