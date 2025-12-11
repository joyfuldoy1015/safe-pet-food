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
  HelpCircle,
  ChevronDown,
  ChevronUp,
  BarChart3
} from 'lucide-react'
import { calculateSafiScore, getSafiLevelColor, getSafiLevelLabel, type SafiResult } from '@/lib/safi-calculator'
// mockReviewLogs 제거 - 실제 Supabase review_logs 테이블에서 데이터 가져옴
import SafiEvaluationDialog from '@/components/safi/SafiEvaluationDialog'

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

// 하드코딩된 레거시 데이터 함수 제거됨 - Supabase에서만 데이터 가져옴

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
  const [newQuestion, setNewQuestion] = useState('')
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false)
  const [expandedProducts, setExpandedProducts] = useState<Record<string, Record<string, boolean>>>({})
  const [defaultVote, setDefaultVote] = useState<'yes' | 'no'>('yes')
  const [safiScore, setSafiScore] = useState<SafiResult | null>(null)
  const [isSafiDialogOpen, setIsSafiDialogOpen] = useState(false)
  const [selectedProductForSafi, setSelectedProductForSafi] = useState<string | null>(null)
  // 리뷰별 '도움됨' 클릭 상태 추적 (reviewId -> isHelpful)
  const [helpfulStates, setHelpfulStates] = useState<Record<string, boolean>>({})
  // 리뷰별 helpful_count 로컬 상태 (optimistic update용)
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    // API에서 브랜드 데이터 가져오기
    const fetchBrandData = async () => {
      try {
        const response = await fetch(`/api/brands/${encodeURIComponent(brandName)}`)
        if (response.ok) {
          const apiData = await response.json()
          
          console.log('[Frontend] API Response:', {
            brandName: brandName,
            hasProducts: !!apiData.products,
            productsLength: apiData.products?.length || 0,
            products: apiData.products
          })
          
          if (apiData && !apiData.error) {
            // Supabase에서 가져온 데이터를 Brand 형식으로 변환
            // API 응답 데이터를 Brand 형식으로 변환
            const apiProducts = apiData.products && Array.isArray(apiData.products) && apiData.products.length > 0 
              ? apiData.products 
              : null
            
            // helpfulCounts 초기화 (각 리뷰의 초기 helpful_count 저장)
            const initialHelpfulCounts: Record<string, number> = {}
            if (apiProducts && Array.isArray(apiProducts)) {
              apiProducts.forEach((product: ProductInfo) => {
                product.consumer_reviews?.forEach((review) => {
                  initialHelpfulCounts[review.id] = review.helpful_count || 0
                })
              })
            }
            setHelpfulCounts(initialHelpfulCounts)
            
            console.log('[Frontend] Products decision:', {
              apiProductsCount: apiProducts?.length || 0,
              willUseApiProducts: !!apiProducts
            })
            
            const brandData: Brand = {
              id: apiData.id || brandName.toLowerCase().replace(/\s+/g, '-'),
              name: apiData.name,
              logo: '🐾', // 기본 로고
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
              qa_section: apiData.qa_section || [],
              products: apiProducts || [] // Supabase에서만 데이터 가져옴
            }
            
            console.log('[Frontend] Final brand data products count:', brandData.products.length)
            setBrand(brandData)
          } else {
            // API에 데이터가 없거나 에러가 있으면 빈 상태 유지 (에러 표시)
            console.error('브랜드 데이터를 찾을 수 없습니다:', apiData.error)
            setBrand(null)
          }
        } else if (response.status === 404) {
          // 404 에러 시 브랜드를 찾을 수 없음
          console.error('브랜드를 찾을 수 없습니다:', brandName)
          setBrand(null)
        } else {
          // 기타 API 오류 시 빈 상태 유지
          console.error('브랜드 데이터 로딩 실패:', response.status)
          setBrand(null)
        }
      } catch (error) {
        console.error('브랜드 데이터 로딩 오류:', error)
        // 에러 시 빈 상태 유지
        setBrand(null)
      }
    }

    fetchBrandData()
    
    // 투표 데이터 가져오기
    fetchVoteData()
    
    // 평가 데이터 가져오기
    fetchEvaluationData()
    
    // SAFI 점수 계산
    calculateSafiForBrand()
    
    // URL 파라미터 확인 (평가 성공 시)
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('evaluation') === 'success') {
      setShowEvaluationSuccess(true)
      // URL에서 파라미터 제거
      window.history.replaceState({}, '', `/brands/${brandName}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brandName])

  // 브랜드 데이터가 로드되면 SAFI 점수 계산
  useEffect(() => {
    if (brand) {
      calculateSafiForBrand()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brand])

  const fetchVoteData = async () => {
    try {
      const response = await fetch(`/api/brands/${encodeURIComponent(brandName)}/vote`)
      if (response.ok) {
        const data = await response.json()
        if (data && !data.error) {
          setVoteData(data)
        }
      } else if (response.status !== 404) {
        // 404는 데이터가 없는 것이므로 정상, 다른 에러만 로깅
        console.warn('투표 데이터 로딩 실패:', response.status)
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
      } else if (response.status !== 404) {
        // 404는 데이터가 없는 것이므로 정상, 다른 에러만 로깅
        console.warn('평가 데이터 가져오기 실패:', response.status)
      }
    } catch (error) {
      console.error('평가 데이터 가져오기 실패:', error)
    }
  }

  const calculateSafiForBrand = async () => {
    if (!brand) return

    // 브랜드의 리뷰 로그 가져오기 (Supabase review_logs 테이블에서 가져옴)
    let brandReviews: any[] = []
    try {
      const response = await fetch(`/api/brands/${encodeURIComponent(brand.name)}`)
      if (response.ok) {
        const data = await response.json()
        // review_logs는 API에서 이미 필터링되어 올 수 있지만, 
        // SAFI 계산을 위해 필요한 필드만 추출
        // 실제로는 review_logs API를 별도로 호출하거나 
        // brands API에서 reviews를 함께 반환해야 함
        // 현재는 빈 배열로 처리 (실제 데이터가 없으면 SAFI 계산 안 함)
      }
    } catch (error) {
      console.error('리뷰 로그 가져오기 실패:', error)
    }
    
    // SAFI 계산을 위한 리뷰 데이터 변환
    const safiReviews = brandReviews.map(review => ({
      stoolScore: review.stool_score ?? null,
      allergySymptoms: review.allergy_symptoms ? ['allergy'] : null,
      vomiting: review.vomiting ?? null,
      appetiteChange: review.appetite_change 
        ? (review.appetite_change.toUpperCase() as 'INCREASED' | 'DECREASED' | 'NORMAL' | 'REFUSED')
        : null
    }))

    // 브랜드 리콜 이력
    const recallHistory = brand.recall_history.map(recall => ({
      date: recall.date,
      severity: (recall.severity === 'high' ? 'high' : recall.severity === 'medium' ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    }))

    // 제품들의 원재료 정보 (모든 제품의 원재료 합치기)
    const allIngredients = brand.products.flatMap(product => product.ingredients || [])

    // SAFI 점수 계산
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
      // 임시 사용자 ID (실제로는 로그인 시스템에서 가져옴)
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
          // 투표 후 기본값 상태 업데이트
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

  const handleSubmitQuestion = async () => {
    if (!newQuestion.trim() || isSubmittingQuestion) return

    setIsSubmittingQuestion(true)
    try {
      // 실제로는 API 호출로 질문을 저장
      // 여기서는 임시로 로컬 상태만 업데이트
      const newQ: BrandQuestion = {
        id: `q-${Date.now()}`,
        user_name: '익명사용자',
        question: newQuestion.trim(),
        date: new Date().toISOString().split('T')[0],
        likes: 0,
        is_answered: false
      }

      if (brand) {
        const updatedBrand = {
          ...brand,
          qa_section: [newQ, ...brand.qa_section]
        }
        setBrand(updatedBrand)
      }

      setNewQuestion('')
      setShowQAForm(false)
      
      // 성공 메시지 표시 (실제로는 토스트 등 사용)
      alert('질문이 등록되었습니다. 브랜드 담당자가 확인 후 답변드릴 예정입니다.')
    } catch (error) {
      console.error('질문 등록 오류:', error)
      alert('질문 등록에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSubmittingQuestion(false)
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

  // '도움됨' 버튼 클릭 핸들러
  const handleHelpfulClick = async (reviewId: string, productId: string, reviewIndex: number) => {
    if (!brand) return

    const isCurrentlyHelpful = helpfulStates[reviewId] || false
    const currentCount = helpfulCounts[reviewId] ?? 
      brand.products.find(p => p.id === productId)?.consumer_reviews[reviewIndex]?.helpful_count ?? 0

    // Optimistic update: 즉시 UI 반영
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

    // API 호출로 서버 업데이트
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
        
        // 실패 시 롤백
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
      // 서버 응답으로 최종 값 업데이트
      setHelpfulCounts(prev => ({
        ...prev,
        [reviewId]: data.likes
      }))
    } catch (error) {
      console.error('Error updating helpful count:', error)
      
      // 에러 시 롤백
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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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

          </div>

          {/* 브랜드 정보 */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-base font-medium text-gray-900 mb-3">📖 {brand.name}에 대해서</h3>
            <p className="text-base text-gray-600 leading-relaxed whitespace-pre-line">{brand.brand_description}</p>
      </div>

          {/* 제조 및 소싱 정보 */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="text-base font-medium text-gray-900 mb-3">🏭 제조 및 소싱에 대해서</h3>
            <p className="text-base text-gray-600 leading-relaxed whitespace-pre-line">{brand.manufacturing_info}</p>
          </div>


          {/* 리콜 이력 */}
          {brand.recall_history.length > 0 && (
            <div className="mt-6 pt-6 border-t border-gray-100">
              <h3 className="text-base font-medium text-gray-900 mb-3">⚠️ 리콜 이력</h3>
              <div className="space-y-3">
                {brand.recall_history.map((recall, index) => (
                  <div key={index} className={`p-3 rounded-lg ${getSeverityColor(recall.severity)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-base font-medium">{recall.reason}</span>
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

          {/* 브랜드 평가 */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* 신뢰하는 이유 */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                  <ThumbsUp className="h-4 w-4 text-green-600 mr-2" />
                  신뢰하는 이유
                </h3>
                <div className="space-y-2">
                  {brand.brand_pros.map((pro, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <p className="text-base text-gray-700">{pro}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* 보완하면 좋은 점 */}
              <div>
                <h3 className="text-base font-medium text-gray-900 mb-3 flex items-center">
                  <AlertTriangle className="h-4 w-4 text-orange-600 mr-2" />
                  보완하면 좋은 점
                </h3>
                <div className="space-y-2">
                  {brand.brand_cons.map((con, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <AlertTriangle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <p className="text-base text-gray-700">{con}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 투명성 점수 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🔍 투명성 점수</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* 전체 점수 */}
            <div className="text-center">
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
        </div>
                      
        {/* 제품군별 상세 정보 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">🧪 제품군별 상세 분석</h2>
          
          <div className="space-y-3">
            {brand.products.map((product) => (
              <div key={product.id} className="border border-gray-200 rounded-lg overflow-hidden">
                {/* 제품 헤더 - 클릭 가능 */}
                <button
                  onClick={() => toggleProduct(product.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate">{product.name}</h3>
                      {/* 데스크톱: 제품명 옆에 인증 마크 표시 */}
                      <div className="hidden md:flex flex-wrap gap-1">
                        {product.certifications.map((cert, idx) => (
                          <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                            <Shield className="h-3 w-3 mr-1" />
                            {cert}
                          </span>
                        ))}
                      </div>
                    </div>
                    {/* 모바일: 제품명 아래에 인증 마크 표시 */}
                    <div className="flex md:hidden flex-wrap gap-1 mt-2">
                      {product.certifications.map((cert, idx) => (
                        <span key={idx} className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-700 font-medium">
                          <Shield className="h-3 w-3 mr-1" />
                          {cert}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="ml-4 flex-shrink-0">
                    {expandedProducts[product.id]?.expanded ? 
                      <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                      <ChevronDown className="h-5 w-5 text-gray-400" />
                    }
                  </div>
                </button>

                {/* 제품 상세 정보 - 드롭다운 */}
                {expandedProducts[product.id]?.expanded && (
                  <div className="border-t border-gray-200 p-6">
                    {/* 제품 설명 */}
                    {product.description && (
                      <p className="text-gray-600 leading-relaxed mb-6">{product.description}</p>
                    )}

                {/* 드롭다운 섹션들 */}
                <div className="space-y-4">
                  {/* 1. 원산지, 제조국, 제조 공장 정보 */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleProductSection(product.id, 'origin')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                  <div className="flex items-center space-x-2">
                        <Globe className="h-5 w-5 text-blue-600" />
                        <span className="font-medium text-gray-900">원산지 & 제조 정보</span>
                    </div>
                      {expandedProducts[product.id]?.origin ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    {expandedProducts[product.id]?.origin && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                          {product.origin_info.country_of_origin && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">원산지</p>
                              <p className="text-sm text-gray-600">{product.origin_info.country_of_origin}</p>
                  </div>
                          )}
                          {product.origin_info.manufacturing_country && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">제조국</p>
                              <p className="text-sm text-gray-600">{product.origin_info.manufacturing_country}</p>
                </div>
                          )}
                          {product.origin_info.manufacturing_facilities && (
                            <div>
                              <p className="text-sm font-medium text-gray-700 mb-1">제조 공장</p>
                              <div className="space-y-1">
                                {product.origin_info.manufacturing_facilities.map((facility, idx) => (
                                  <p key={idx} className="text-sm text-gray-600">{facility}</p>
                                ))}
              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                      </div>
                      
                  {/* 2. 원료명칭 */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleProductSection(product.id, 'ingredients')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <Package className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-gray-900">원료명칭</span>
                      </div>
                      {expandedProducts[product.id]?.ingredients ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    {expandedProducts[product.id]?.ingredients && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-4">
                          {product.ingredients.map((ingredient, idx) => (
                            <span key={idx} className="inline-block px-3 py-1 bg-green-50 text-green-700 text-sm rounded-full">
                              {ingredient}
                </span>
                          ))}
                        </div>
                        </div>
                    )}
                      </div>
                      
                  {/* 3. 등록성분량 */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleProductSection(product.id, 'analysis')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <TestTube className="h-5 w-5 text-purple-600" />
                        <span className="font-medium text-gray-900">등록성분량</span>
                </div>
                      {expandedProducts[product.id]?.analysis ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    {expandedProducts[product.id]?.analysis && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                          {Object.entries(product.guaranteed_analysis).map(([key, value]) => {
                            const labels: Record<string, string> = {
                              protein: '조단백질',
                              fat: '조지방',
                              fiber: '조섬유',
                              moisture: '수분',
                              ash: '조회분',
                              calcium: '칼슘',
                              phosphorus: '인'
                            }
                            return (
                              <div key={key} className="text-center p-3 bg-purple-50 rounded-lg">
                                <p className="text-sm font-medium text-purple-700">{labels[key]}</p>
                                <p className="text-lg font-bold text-purple-900">{value}</p>
                </div>
                            )
                          })}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. 추천 이유 */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleProductSection(product.id, 'pros')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <ThumbsUp className="h-5 w-5 text-green-600" />
                        <span className="font-medium text-gray-900">추천 이유</span>
                      </div>
                      {expandedProducts[product.id]?.pros ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    {expandedProducts[product.id]?.pros && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="space-y-2 mt-4">
                          {product.pros.map((pro, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700">{pro}</p>
            </div>
            ))}
                        </div>
                      </div>
                    )}
          </div>

                  {/* 5. 비추천 이유 */}
                  <div className="border border-gray-200 rounded-lg">
                    <button
                      onClick={() => toggleProductSection(product.id, 'cons')}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center space-x-2">
                        <ThumbsDown className="h-5 w-5 text-red-600" />
                        <span className="font-medium text-gray-900">비추천 이유</span>
                </div>
                      {expandedProducts[product.id]?.cons ? 
                        <ChevronUp className="h-5 w-5 text-gray-400" /> : 
                        <ChevronDown className="h-5 w-5 text-gray-400" />
                      }
                    </button>
                    {expandedProducts[product.id]?.cons && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="space-y-2 mt-4">
                          {product.cons.map((con, idx) => (
                            <div key={idx} className="flex items-start space-x-2">
                              <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                              <p className="text-sm text-gray-700">{con}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                </div>
              </div>

          {/* 소비자 평가 */}
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Star className="h-5 w-5 text-yellow-500 mr-2" />
                    소비자 평가
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* 평가 점수 */}
                    <div>
                      <div className="space-y-3">
                        {Object.entries(product.consumer_ratings).map(([key, rating]) => {
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
                </div>

            {/* 커뮤니티 추천 */}
                    <div className="flex flex-col justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 mb-1">
                          {product.community_feedback.total_votes > 0 
                            ? Math.round((product.community_feedback.recommend_yes / product.community_feedback.total_votes) * 100)
                            : 0}%
                </div>
                <p className="text-sm text-gray-600 mb-3">
                          {product.community_feedback.total_votes}명이 평가
                </p>
                <div className="flex items-center justify-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <ThumbsUp className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">
                              {product.community_feedback.recommend_yes}
                    </span>
            </div>
                  <div className="flex items-center space-x-1">
                    <ThumbsDown className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">
                              {product.community_feedback.recommend_no}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

                  {/* 소비자 리뷰 */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h5 className="text-md font-semibold text-gray-900 mb-4 flex items-center">
                      <MessageSquare className="h-4 w-4 text-blue-500 mr-2" />
                      소비자 리뷰 ({product.consumer_reviews.length})
                    </h5>
            
            <div className="space-y-4">
                      {product.consumer_reviews.map((review, reviewIndex) => {
                        const isHelpful = helpfulStates[review.id] || false
                        const displayCount = helpfulCounts[review.id] ?? review.helpful_count ?? 0
                        
                        return (
                        <div key={review.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="mb-3">
                    {/* 사용자명 */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{review.user_name}</span>
                      </div>
                      <span className="text-xs text-gray-500">{review.date}</span>
                    </div>
                    {/* 별점 */}
                    <div className="flex items-center mb-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                        />
                      ))}
                    </div>
                  </div>
                          {/* 후기 내용 */}
                          <p className="text-sm text-gray-700 mb-2 leading-relaxed">{review.comment}</p>
                          <div className="flex items-center justify-between">
                            <button 
                              onClick={() => handleHelpfulClick(review.id, product.id, reviewIndex)}
                              className={`flex items-center space-x-1 text-xs transition-colors ${
                                isHelpful 
                                  ? 'text-blue-600 hover:text-blue-700' 
                                  : 'text-gray-500 hover:text-blue-500'
                              }`}
                            >
                              <ThumbsUp className={`h-3 w-3 ${isHelpful ? 'fill-current' : ''}`} />
                              <span>도움됨 {displayCount}</span>
                            </button>
                          </div>
              </div>
                        )
                      })}
            </div>
                  </div>
                </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* SAFI 안전성 점수 섹션 */}
        {safiScore && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-50 rounded-lg">
                  <Shield className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">🛡️ SAFI 안전성 점수</h2>
                  <p className="text-sm text-gray-600">Safety & Fit Index - 제품 안전성 종합 평가</p>
                </div>
              </div>
            </div>

            {/* 전체 점수 */}
            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-gray-600 mb-1">종합 안전성 점수</p>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-4xl font-bold text-gray-900">{safiScore.overallScore.toFixed(1)}</span>
                    <span className="text-lg text-gray-500">/ 100</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold border ${getSafiLevelColor(safiScore.level)}`}>
                    <Shield className="h-4 w-4 mr-2" />
                    {getSafiLevelLabel(safiScore.level)}
                  </span>
                </div>
              </div>
              
              {/* 진행 바 */}
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className={`h-3 rounded-full transition-all duration-500 ${
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* A. Side Effect Index */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">A. 부작용 지수</span>
                  <span className="text-xs text-gray-500">35%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{safiScore.detail.A.toFixed(1)}</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-500 h-1.5 rounded-full"
                    style={{ width: `${safiScore.detail.A}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">알레르기·구토 발생률</p>
              </div>

              {/* B. Stool Condition Index */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">B. 변 상태 지수</span>
                  <span className="text-xs text-gray-500">25%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{safiScore.detail.B.toFixed(1)}</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-green-500 h-1.5 rounded-full"
                    style={{ width: `${safiScore.detail.B}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">평균 변 상태 점수</p>
              </div>

              {/* C. Appetite Index */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">C. 식욕 지수</span>
                  <span className="text-xs text-gray-500">10%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{safiScore.detail.C.toFixed(1)}</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-yellow-500 h-1.5 rounded-full"
                    style={{ width: `${safiScore.detail.C}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">식욕 변화 평가</p>
              </div>

              {/* D. Ingredient Safety Index */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">D. 원재료 안전 지수</span>
                  <span className="text-xs text-gray-500">20%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{safiScore.detail.D.toFixed(1)}</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-purple-500 h-1.5 rounded-full"
                    style={{ width: `${safiScore.detail.D}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">원재료 안전성 평가</p>
              </div>

              {/* E. Brand Trust Index */}
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-medium text-gray-600">E. 브랜드 신뢰 지수</span>
                  <span className="text-xs text-gray-500">10%</span>
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-1">{safiScore.detail.E.toFixed(1)}</div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-indigo-500 h-1.5 rounded-full"
                    style={{ width: `${safiScore.detail.E}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-500 mt-1">리콜 이력 기반 평가</p>
              </div>
            </div>

            {/* 평가 기준 안내 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="flex items-start space-x-2 text-sm text-gray-600">
                <BarChart3 className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-700 mb-1">평가 기준</p>
                  <ul className="list-disc list-inside space-y-1 text-xs">
                    <li>80점 이상: 안전 (SAFE) - 안전한 제품으로 평가</li>
                    <li>60~79점: 보통 (NORMAL) - 보통 수준의 안전성</li>
                    <li>60점 미만: 주의 (CAUTION) - 주의가 필요한 제품</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 평가하기 버튼 */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={() => {
                  setSelectedProductForSafi(null)
                  setIsSafiDialogOpen(true)
                }}
                className="w-full px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              >
                <Shield className="h-5 w-5" />
                <span>SAFI 평가하기</span>
              </button>
              <p className="text-xs text-gray-500 text-center mt-2">
                로그인한 회원만 평가할 수 있습니다
              </p>
            </div>
          </div>
        )}

        {/* 브랜드 질문하기 섹션 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">💬 브랜드 질문하기</h2>
            <button 
              onClick={() => setShowQAForm(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              <HelpCircle className="h-4 w-4" />
              <span>질문 등록</span>
            </button>
          </div>

          {/* 질문 목록 */}
          <div className="space-y-6">
            {brand.qa_section.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <MessageSquare className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                <p>아직 등록된 질문이 없습니다.</p>
                <p className="text-sm">첫 번째 질문을 남겨보세요!</p>
              </div>
            ) : (
              brand.qa_section.map((qa) => (
                <div key={qa.id} className="border border-gray-200 rounded-lg p-4">
                  {/* 질문 */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-gray-400" />
                        <span className="text-sm font-medium text-gray-700">{qa.user_name}</span>
                        <span className="text-xs text-gray-500">{qa.date}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors">
                          <Heart className="h-4 w-4" />
                          <span className="text-sm">{qa.likes}</span>
                        </button>
                        {qa.is_answered && (
                          <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                            답변완료
                          </span>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-800 bg-gray-50 p-3 rounded-lg">{qa.question}</p>
                  </div>

                  {/* 답변 */}
                  {qa.answer && (
                    <div className="ml-6 pl-4 border-l-2 border-blue-200">
                      <div className="flex items-center space-x-2 mb-2">
                        <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                          <Building className="h-3 w-3 text-blue-600" />
                        </div>
                        <span className="text-sm font-medium text-blue-700">{qa.answer.answerer}</span>
                        <span className="text-xs text-gray-500">{qa.answer.date}</span>
                      </div>
                      <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{qa.answer.content}</p>
                    </div>
                  )}

                  {/* 답변 대기 중 */}
                  {!qa.is_answered && (
                    <div className="ml-6 pl-4 border-l-2 border-gray-200">
                      <div className="flex items-center space-x-2 text-gray-500">
                        <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center">
                          <Building className="h-3 w-3 text-gray-400" />
                        </div>
                        <span className="text-sm">브랜드 담당자 답변 대기 중...</span>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* 액션 버튼들 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-6 border-t border-gray-100">
            <Link 
              href={`/brands/${brandName}/evaluate`}
              className="flex items-center justify-center space-x-2 p-4 border-2 border-green-200 rounded-lg hover:border-green-300 hover:bg-green-50 transition-colors"
            >
              <Star className="h-5 w-5 text-green-600" />
              <span className="font-medium text-green-600">이 브랜드 평가하기</span>
            </Link>
            
            <button 
              onClick={() => setShowReportForm(true)}
              className="flex items-center justify-center space-x-2 p-4 border-2 border-red-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-colors"
            >
              <Flag className="h-5 w-5 text-red-600" />
              <span className="font-medium text-red-600">문제 신고하기</span>
            </button>

          {/* 투표 위젯 */}
            <div className="flex items-center justify-center space-x-2">
              <button 
                onClick={() => handleVote('yes')}
                disabled={isVoting}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
                  voteData?.user_vote === 'yes' || (!voteData?.user_vote && defaultVote === 'yes')
                    ? 'bg-green-600 text-white' 
                    : 'bg-green-500 text-white hover:bg-green-600'
                } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ThumbsUp className="h-3 w-3" />
                <span className="text-sm">추천</span>
              </button>
              <button 
                onClick={() => handleVote('no')}
                disabled={isVoting}
                className={`flex items-center space-x-1 px-4 py-2 rounded-lg transition-colors ${
                  voteData?.user_vote === 'no' 
                    ? 'bg-red-600 text-white' 
                    : voteData?.user_vote || defaultVote === 'no'
                      ? 'bg-gray-300 text-gray-600 hover:bg-red-500 hover:text-white'
                      : 'bg-gray-300 text-gray-600 hover:bg-red-500 hover:text-white'
                } ${isVoting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ThumbsDown className="h-3 w-3" />
                <span className="text-sm">비추천</span>
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
            <p className="text-sm text-gray-600 mb-4">
              브랜드 담당자가 직접 답변해드립니다. 궁금한 점을 자세히 적어주세요.
            </p>
            <textarea 
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg mb-4 resize-none" 
              rows={4} 
              placeholder="예: 알레르기가 있는 강아지도 안전하게 먹을 수 있나요?"
              maxLength={500}
            />
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs text-gray-500">
                {newQuestion.length}/500자
              </span>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => {
                  setShowQAForm(false)
                  setNewQuestion('')
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmittingQuestion}
              >
                취소
              </button>
              <button 
                onClick={handleSubmitQuestion}
                disabled={!newQuestion.trim() || isSubmittingQuestion}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmittingQuestion ? '등록 중...' : '질문 등록'}
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

      {/* SAFI 평가 다이얼로그 */}
      <SafiEvaluationDialog
        open={isSafiDialogOpen}
        onOpenChange={setIsSafiDialogOpen}
        brandName={brandName}
        productName={selectedProductForSafi || undefined}
        onSuccess={() => {
          // SAFI 점수 재계산
          calculateSafiForBrand()
        }}
      />
    </div>
  )
} 