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
  ChevronDown,
  ChevronUp,
  BarChart3
} from 'lucide-react'
import { calculateSafiScore, getSafiLevelColor, getSafiLevelLabel, type SafiResult } from '@/lib/safi-calculator'
import SafiEvaluationDialog from '@/components/safi/SafiEvaluationDialog'
import ProductsListSection from '@/components/brand/ProductsListSection'

interface BrandQuestion {
  id: string
  user_name: string
  question: string
  date: string
  answer?: {
    content: string
    answerer: string
    date: string
  }
  likes: number
  is_answered: boolean
}

interface ProductInfo {
  id: string
  name: string
  image: string
  description: string
  certifications: string[]
  origin_info: {
    country_of_origin?: string
    manufacturing_country?: string
    manufacturing_facilities?: string[]
  }
  ingredients: string[]
  guaranteed_analysis: {
    protein: string
    fat: string
    fiber: string
    moisture: string
    ash?: string
    calcium?: string
    phosphorus?: string
  }
  pros: string[]
  cons: string[]
  consumer_ratings: {
    palatability: number
    digestibility: number
    coat_quality: number
    stool_quality: number
    overall_satisfaction: number
  }
  community_feedback: {
    recommend_yes: number
    recommend_no: number
    total_votes: number
  }
  consumer_reviews: Array<{
    id: string
    user_name: string
    rating: number
    comment: string
    date: string
    helpful_count: number
  }>
  grade?: string
  grade_text?: string
}

interface Brand {
  id: string
  name: string
  logo: string
  manufacturer: string
  country_of_origin: string
  manufacturing_locations: string[]
  established_year: number
  certifications: string[]
  brand_description: string
  manufacturing_info: string
  brand_pros: string[]
  brand_cons: string[]
  product_lines?: string[]
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
  qa_section: BrandQuestion[]
  products: ProductInfo[]
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
  const [expandedProducts, setExpandedProducts] = useState<Record<string, Record<string, boolean>>>({})
  const [defaultVote, setDefaultVote] = useState<'yes' | 'no'>('yes')
  const [safiScore, setSafiScore] = useState<SafiResult | null>(null)
  const [isSafiDialogOpen, setIsSafiDialogOpen] = useState(false)
  const [selectedProductForSafi, setSelectedProductForSafi] = useState<string | null>(null)
  const [helpfulStates, setHelpfulStates] = useState<Record<string, boolean>>({})
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        console.log('[Brand Page] Fetching data for brand:', brandName)
        const response = await fetch(`/api/brands/${encodeURIComponent(brandName)}`)
        console.log('[Brand Page] API response status:', response.status, response.ok)
        
        if (response.ok) {
          const apiData = await response.json()
          console.log('[Brand Page] API data received:', {
            brandName: apiData.name,
            hasProducts: !!(apiData.products && Array.isArray(apiData.products)),
            productsLength: apiData.products?.length || 0,
            products: apiData.products
          })
          
          if (apiData && !apiData.error) {
            const apiProducts = apiData.products && Array.isArray(apiData.products) && apiData.products.length > 0 
              ? apiData.products 
              : null
            
            console.log('[Brand Page] Processing products:', {
              hasApiProducts: !!apiProducts,
              productsCount: apiProducts?.length || 0
            })
            
            const initialHelpfulCounts: Record<string, number> = {}
            if (apiProducts && Array.isArray(apiProducts)) {
              apiProducts.forEach((product: ProductInfo) => {
                product.consumer_reviews?.forEach((review) => {
                  initialHelpfulCounts[review.id] = review.helpful_count || 0
                })
              })
            }
            setHelpfulCounts(initialHelpfulCounts)
            
            const brandData: Brand = {
              id: apiData.id || brandName.toLowerCase().replace(/\s+/g, '-'),
              name: apiData.name,
              logo: '🐾',
              manufacturer: apiData.manufacturer,
              country_of_origin: apiData.country || apiData.country_of_origin,
              manufacturing_locations: apiData.manufacturing_locations || [],
              established_year: apiData.established_year,
              certifications: apiData.certifications || [],
              brand_description: apiData.description || apiData.brand_description || '',
              manufacturing_info: apiData.manufacturing_info || '',
              brand_pros: apiData.brand_pros || [],
              brand_cons: apiData.brand_cons || [],
              product_lines: apiData.product_lines || [],
              transparency_score: apiData.transparency_score || 75,
              recall_history: apiData.recall_history || [],
              ingredient_disclosure: apiData.ingredient_disclosure || {
                fully_disclosed: 0,
                partially_disclosed: 0,
                not_disclosed: 0
              },
              nutrition_analysis: apiData.nutrition_analysis || {
                protein: 0,
                fat: 0,
                carbohydrates: 0,
                fiber: 0,
                moisture: 0,
                calories_per_100g: 0
              },
              consumer_ratings: apiData.consumer_ratings || {
                palatability: 0,
                digestibility: 0,
                coat_quality: 0,
                stool_quality: 0,
                overall_satisfaction: 0
              },
              expert_reviews: apiData.expert_reviews || [],
              ingredients: apiData.ingredients || [],
              community_feedback: apiData.community_feedback || {
                recommend_yes: 0,
                recommend_no: 0,
                total_votes: 0
              },
              qa_section: [],  // Q&A는 별도 API에서 가져옴
              products: apiProducts || []
            }

            console.log('[Brand Page] Brand data created:', {
              brandId: brandData.id,
              brandName: brandData.name,
              productsCount: brandData.products.length
            })

            setBrand(brandData)

            // Q&A 데이터 별도 로드
            try {
              const qaResponse = await fetch(`/api/brands/${encodeURIComponent(brandName)}/questions`)
              if (qaResponse.ok) {
                const qaData = await qaResponse.json()
                if (Array.isArray(qaData)) {
                  setBrand(prev => prev ? { ...prev, qa_section: qaData } : null)
                }
              }
            } catch (qaError) {
              console.error('Q&A 로드 오류:', qaError)
            }
          } else {
            console.error('브랜드 데이터를 찾을 수 없습니다:', apiData.error)
            setBrand(null)
          }
        } else if (response.status === 404) {
          console.error('브랜드를 찾을 수 없습니다:', brandName)
          setBrand(null)
        } else {
          console.error('브랜드 데이터 로딩 실패:', response.status)
          setBrand(null)
        }
      } catch (error) {
        console.error('브랜드 데이터 로딩 오류:', error)
        setBrand(null)
      }
    }

    fetchBrandData()
    fetchVoteData()
    fetchEvaluationData()
    calculateSafiForBrand()
    
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('evaluation') === 'success') {
      setShowEvaluationSuccess(true)
      window.history.replaceState({}, '', `/brands/${brandName}`)
    }
  }, [brandName])

  useEffect(() => {
    if (brand) {
      calculateSafiForBrand()
    }
  }, [brand])

  const fetchVoteData = async () => {
    try {
      const response = await fetch(`/api/brands/${encodeURIComponent(brandName)}/vote`)
      if (response.ok) {
        const data = await response.json()
        if (data && !data.error) {
          setVoteData(data)
        }
      }
    } catch (error) {
      console.error('투표 데이터 로딩 오류:', error)
    }
  }

  const fetchEvaluationData = async () => {
    try {
      const response = await fetch(`/api/brands/${encodeURIComponent(brandName)}/evaluate`)
      if (response.ok) {
        const data = await response.json()
        if (data && !data.error) {
          setEvaluationData(data)
        }
      }
    } catch (error) {
      console.error('평가 데이터 가져오기 실패:', error)
    }
  }

  const calculateSafiForBrand = async () => {
    if (!brand) return

    const brandReviews: any[] = []
    const safiReviews = brandReviews.map(review => ({
      stoolScore: review.stool_score ?? null,
      allergySymptoms: review.allergy_symptoms ? ['allergy'] : null,
      vomiting: review.vomiting ?? null,
      appetiteChange: review.appetite_change 
        ? (review.appetite_change.toUpperCase() as 'INCREASED' | 'DECREASED' | 'NORMAL' | 'REFUSED')
        : null
    }))

    const recallHistory = brand.recall_history.map(recall => ({
      date: recall.date,
      severity: (recall.severity === 'high' ? 'high' : recall.severity === 'medium' ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    }))

    const allIngredients = brand.products.flatMap(product => product.ingredients || [])

    const safiResult = calculateSafiScore({
      reviews: safiReviews,
      recallHistory,
      ingredients: allIngredients
    })

    setSafiScore(safiResult)
  }

  const handleVote = async (vote: 'yes' | 'no') => {
    if (isVoting) return

    setIsVoting(true)
    try {
      const userId = `user-${Date.now()}`
      
      const response = await fetch(`/api/brands/${encodeURIComponent(brandName)}/vote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ vote, userId }),
      })

      if (response.ok) {
        const data = await response.json()
        if (data && !data.error) {
          setVoteData(data)
          setDefaultVote(vote)
        } else {
          alert(data?.error || '투표 처리 중 오류가 발생했습니다.')
        }
      } else {
        const errorData = await response.json().catch(() => ({}))
        alert(errorData.error || '투표에 실패했습니다. 다시 시도해주세요.')
      }
    } catch (error) {
      console.error('투표 오류:', error)
      alert('투표 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsVoting(false)
    }
  }

  const toggleProductSection = (productId: string, section: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        [section]: !prev[productId]?.[section]
      }
    }))
  }

  const toggleProduct = (productId: string) => {
    setExpandedProducts(prev => ({
      ...prev,
      [productId]: {
        ...prev[productId],
        expanded: !prev[productId]?.expanded
      }
    }))
  }

  const handleHelpfulClick = async (reviewId: string, productId: string, reviewIndex: number) => {
    if (!brand) return

    const isCurrentlyHelpful = helpfulStates[reviewId] || false
    const currentCount = helpfulCounts[reviewId] ?? 
      brand.products.find(p => p.id === productId)?.consumer_reviews[reviewIndex]?.helpful_count ?? 0

    const newIsHelpful = !isCurrentlyHelpful
    const increment = newIsHelpful ? 1 : -1
    const newCount = Math.max(0, currentCount + increment)

    setHelpfulStates(prev => ({
      ...prev,
      [reviewId]: newIsHelpful
    }))
    setHelpfulCounts(prev => ({
      ...prev,
      [reviewId]: newCount
    }))

    try {
      const response = await fetch(`/api/review-logs/${reviewId}/helpful`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          increment,
          productId,
          brandName: brand.name
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Failed to update helpful count:', errorData)
        
        setHelpfulStates(prev => ({
          ...prev,
          [reviewId]: isCurrentlyHelpful
        }))
        setHelpfulCounts(prev => ({
          ...prev,
          [reviewId]: currentCount
        }))
        alert('도움됨 업데이트에 실패했습니다. 다시 시도해주세요.')
        return
      }

      const data = await response.json()
      setHelpfulCounts(prev => ({
        ...prev,
        [reviewId]: data.likes
      }))
    } catch (error) {
      console.error('Error updating helpful count:', error)
      
      setHelpfulStates(prev => ({
        ...prev,
        [reviewId]: isCurrentlyHelpful
      }))
      setHelpfulCounts(prev => ({
        ...prev,
        [reviewId]: currentCount
      }))
      alert('도움됨 업데이트 중 오류가 발생했습니다. 다시 시도해주세요.')
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
    brand.community_feedback.total_votes > 0 
      ? Math.round((brand.community_feedback.recommend_yes / brand.community_feedback.total_votes) * 100)
      : 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <Link 
          href="/brands" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-4 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">브랜드 목록</span>
        </Link>
      </div>
        
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {/* ==================== 🔒 보존 영역 시작 ==================== */}
        
        {/* 브랜드 프로필 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-4">
          {/* 브랜드 헤더 */}
          <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl">
              {brand.logo}
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{brand.name}</h1>
              <p className="text-sm text-gray-500">{brand.manufacturer}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-3 mb-5">
            {/* 제조국 */}
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2">
                <Globe className="h-4 w-4 text-blue-500" />
              </div>
              <p className="text-xs text-gray-500 mb-0.5">원산지</p>
              <p className="text-sm font-semibold text-gray-900">{brand.country_of_origin}</p>
            </div>

            {/* 설립연도 */}
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
                <Calendar className="h-4 w-4 text-green-500" />
              </div>
              <p className="text-xs text-gray-500 mb-0.5">설립연도</p>
              <p className="text-sm font-semibold text-gray-900">{brand.established_year}년</p>
            </div>

            {/* 제조 공장 */}
            <div className="text-center p-3 bg-gray-50 rounded-xl">
              <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-2">
                <Factory className="h-4 w-4 text-purple-500" />
              </div>
              <p className="text-xs text-gray-500 mb-0.5">제조 공장</p>
              <p className="text-sm font-semibold text-gray-900">{brand.manufacturing_locations.length}개 지역</p>
            </div>
          </div>

          {/* 브랜드 정보 */}
          <div className="mb-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs">📖</span>
              {brand.name}에 대해서
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{brand.brand_description}</p>
          </div>

          {/* 제조 및 소싱 정보 */}
          <div className="mb-5 pt-5 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-xs">🏭</span>
              제조 및 소싱에 대해서
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{brand.manufacturing_info}</p>
          </div>

          {/* 리콜 이력 */}
          {brand.recall_history.length > 0 && (
            <div className="pt-5 border-t border-gray-100">
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center text-xs">⚠️</span>
                리콜 이력
              </h3>
              <div className="space-y-2">
                {brand.recall_history.map((recall, index) => (
                  <div key={index} className={`p-3 rounded-xl text-sm ${getSeverityColor(recall.severity)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="font-medium">{recall.reason}</span>
                      </div>
                      <span className="text-xs text-gray-500">{recall.date}</span>
                    </div>
                    {recall.resolved && (
                      <div className="mt-1.5 flex items-center gap-1">
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

        {/* 브랜드 평가 카드 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* 신뢰하는 이유 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-green-50 flex items-center justify-center">
                  <ThumbsUp className="h-4 w-4 text-green-500" />
                </span>
                신뢰하는 이유
              </h3>
              <div className="space-y-2">
                {brand.brand_pros.map((pro, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">{pro}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 보완하면 좋은 점 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-orange-50 flex items-center justify-center">
                  <AlertTriangle className="h-4 w-4 text-orange-500" />
                </span>
                보완하면 좋은 점
              </h3>
              <div className="space-y-2">
                {brand.brand_cons.map((con, index) => (
                  <div key={index} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-orange-400 mt-0.5 flex-shrink-0" />
                    <p className="text-gray-600">{con}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* 투명성 점수 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <span className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-xs">🔍</span>
            투명성 점수
          </h2>
          
          <div className="flex items-center gap-6">
            {/* 전체 점수 */}
            <div className="text-center flex-shrink-0">
              <div className={`text-3xl font-bold ${getTransparencyColor(brand.transparency_score)} mb-1`}>
                {brand.transparency_score}
              </div>
              <p className="text-xs text-gray-500">/ 100</p>
            </div>

            {/* 공개 상태 분포 */}
            <div className="flex-1 space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                    <Eye className="h-3 w-3 text-green-500" />
                  </span>
                  <span className="text-xs text-gray-600">완전 공개</span>
                </div>
                <span className="text-xs font-semibold text-green-600">
                  {brand.ingredient_disclosure.fully_disclosed}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-yellow-50 flex items-center justify-center">
                    <Minus className="h-3 w-3 text-yellow-500" />
                  </span>
                  <span className="text-xs text-gray-600">부분 공개</span>
                </div>
                <span className="text-xs font-semibold text-yellow-600">
                  {brand.ingredient_disclosure.partially_disclosed}%
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center">
                    <EyeOff className="h-3 w-3 text-red-500" />
                  </span>
                  <span className="text-xs text-gray-600">미공개</span>
                </div>
                <span className="text-xs font-semibold text-red-600">
                  {brand.ingredient_disclosure.not_disclosed}%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SAFI 안전성 점수 섹션 */}
        {safiScore && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                <Shield className="h-4 w-4 text-blue-500" />
              </span>
              SAFI 안전성 점수
            </h2>

            {/* 전체 점수 */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-xs text-gray-500 mb-1">종합 안전성 점수</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-bold text-gray-900">{safiScore.overallScore.toFixed(1)}</span>
                    <span className="text-sm text-gray-400">/ 100</span>
                  </div>
                </div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                  safiScore.level === 'SAFE' ? 'bg-green-100 text-green-700' :
                  safiScore.level === 'NORMAL' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  <Shield className="h-3.5 w-3.5 mr-1" />
                  {getSafiLevelLabel(safiScore.level)}
                </span>
              </div>
              
              {/* 진행 바 */}
              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div 
                  className={`h-2 rounded-full transition-all duration-500 ${
                    safiScore.level === 'SAFE' ? 'bg-green-500' :
                    safiScore.level === 'NORMAL' ? 'bg-yellow-500' :
                    'bg-red-500'
                  }`}
                  style={{ width: `${safiScore.overallScore}%` }}
                ></div>
              </div>
              <p className="text-xs text-gray-500">
                {safiScore.level === 'SAFE' && '✅ 안전한 제품으로 평가됩니다'}
                {safiScore.level === 'NORMAL' && '⚠️ 보통 수준의 안전성을 가진 제품입니다'}
                {safiScore.level === 'CAUTION' && '⚠️ 주의가 필요한 제품입니다'}
              </p>
            </div>

            {/* 세부 지수 */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {/* A. Side Effect Index */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-500 mb-1">부작용 지수</p>
                <p className="text-lg font-bold text-gray-900">{safiScore.detail.A.toFixed(1)}</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${safiScore.detail.A}%` }}></div>
                </div>
              </div>

              {/* B. Stool Condition Index */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-500 mb-1">변 상태 지수</p>
                <p className="text-lg font-bold text-gray-900">{safiScore.detail.B.toFixed(1)}</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div className="bg-green-500 h-1 rounded-full" style={{ width: `${safiScore.detail.B}%` }}></div>
                </div>
              </div>

              {/* C. Appetite Index */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-500 mb-1">식욕 지수</p>
                <p className="text-lg font-bold text-gray-900">{safiScore.detail.C.toFixed(1)}</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${safiScore.detail.C}%` }}></div>
                </div>
              </div>

              {/* D. Ingredient Safety Index */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-500 mb-1">원재료 안전</p>
                <p className="text-lg font-bold text-gray-900">{safiScore.detail.D.toFixed(1)}</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${safiScore.detail.D}%` }}></div>
                </div>
              </div>

              {/* E. Brand Trust Index */}
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-500 mb-1">브랜드 신뢰</p>
                <p className="text-lg font-bold text-gray-900">{safiScore.detail.E.toFixed(1)}</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${safiScore.detail.E}%` }}></div>
                </div>
              </div>
            </div>

            {/* 평가하기 버튼 */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <button
                onClick={() => {
                  setSelectedProductForSafi(null)
                  setIsSafiDialogOpen(true)
                }}
                className="w-full px-5 py-3 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
              >
                <Shield className="h-4 w-4" />
                <span>SAFI 평가하기</span>
              </button>
            </div>
          </div>
        )}

        {/* ==================== 🔒 보존 영역 끝 ==================== */}

        {/* ==================== 제품 목록 ==================== */}
        <div className="mt-4">
          <ProductsListSection products={brand.products} />
        </div>
      </div>

      {/* 신고 모달 */}
      {showReportForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <h3 className="text-base font-semibold mb-4">문제 신고하기</h3>
            <select className="w-full p-3 border border-gray-200 rounded-xl mb-4 text-sm">
              <option>허위 정보</option>
              <option>품질 문제</option>
              <option>안전 문제</option>
              <option>기타</option>
            </select>
            <textarea
              className="w-full p-3 border border-gray-200 rounded-xl mb-4 text-sm" 
              rows={4}
              placeholder="상세 내용을 입력해주세요..."
            ></textarea>
            <div className="flex gap-3">
              <button
                onClick={() => setShowReportForm(false)}
                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm hover:bg-gray-50"
              >
                취소
              </button>
              <button
                onClick={() => setShowReportForm(false)}
                className="flex-1 px-4 py-2.5 bg-red-500 text-white rounded-xl text-sm hover:bg-red-600"
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center">
            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">평가 완료!</h3>
            <p className="text-sm text-gray-500 mb-6">
              소중한 평가를 남겨주셔서 감사합니다.<br />
              다른 반려인들에게 큰 도움이 될 것입니다.
            </p>
            <button 
              onClick={() => setShowEvaluationSuccess(false)}
              className="w-full px-4 py-2.5 bg-green-500 text-white rounded-xl text-sm font-medium hover:bg-green-600"
            >
              확인
            </button>
          </div>
        </div>
      )}

      {/* SAFI 평가 다이얼로그 */}
      <SafiEvaluationDialog
        open={isSafiDialogOpen}
        onOpenChange={setIsSafiDialogOpen}
        brandName={brandName}
        productName={selectedProductForSafi || undefined}
        onSuccess={() => {
          calculateSafiForBrand()
        }}
      />
    </div>
  )
}
