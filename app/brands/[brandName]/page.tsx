'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  AlertTriangle, 
  CheckCircle, 
  ArrowLeft,
  ThumbsUp,
} from 'lucide-react'
import { calculateSafiScore, type SafiResult } from '@/lib/safi-calculator'
import ProductsListSection from '@/components/brand/ProductsListSection'
import IngredientTransparencySection from '@/components/brand/IngredientTransparencySection'
import BrandProfileCard from '@/components/brand/BrandProfileCard'
import SAFIScoreSection from '@/components/brand/SAFIScoreSection'
import { getBrowserClient } from '@/lib/supabase-client'
import type { Brand } from '@/components/brand/types'

export default function BrandDetailPage() {
  const params = useParams()
  const router = useRouter()
  const brandName = decodeURIComponent(params.brandName as string)
  const [brand, setBrand] = useState<Brand | null>(null)
  const [loadError, setLoadError] = useState<'not_found' | 'error' | null>(null)
  const [showReportForm, setShowReportForm] = useState(false)
  const [showEvaluationSuccess, setShowEvaluationSuccess] = useState(false)
  const [safiScore, setSafiScore] = useState<SafiResult | null>(null)
  const [safiReviewCount, setSafiReviewCount] = useState(0)

  useEffect(() => {
    const fetchBrandData = async () => {
      try {
        const response = await fetch(`/api/brands/${encodeURIComponent(brandName)}`)
        
        if (response.ok) {
          const apiData = await response.json()
          
          if (apiData && !apiData.error) {
            const apiProducts = apiData.products && Array.isArray(apiData.products) && apiData.products.length > 0 
              ? apiData.products 
              : null
            
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
              representative_product: apiData.representative_product || '',
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
            setLoadError('not_found')
          }
        } else if (response.status === 404) {
          console.error('브랜드를 찾을 수 없습니다:', brandName)
          setBrand(null)
          setLoadError('not_found')
        } else {
          console.error('브랜드 데이터 로딩 실패:', response.status)
          setBrand(null)
          setLoadError('error')
        }
      } catch (error) {
        console.error('브랜드 데이터 로딩 오류:', error)
        setBrand(null)
        setLoadError('error')
      }
    }

    fetchBrandData()
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

  const calculateSafiForBrand = async () => {
    if (!brand) return

    let safiReviews: Array<{
      stoolScore: number | null
      allergySymptoms: string[] | null
      vomiting: boolean | null
      appetiteChange: 'INCREASED' | 'DECREASED' | 'NORMAL' | 'REFUSED' | null
    }> = []

    try {
      const supabase = getBrowserClient()
      const { data, error } = await supabase
        .from('review_logs')
        .select('stool_score, allergy_symptoms, vomiting, appetite_change')
        .ilike('brand', brand.name)

      if (error) {
        console.error('SAFI review_logs 조회 오류:', error)
      }

      safiReviews = (data || [])
        .filter((r: any) => r.stool_score !== null || r.vomiting !== null || r.appetite_change !== null)
        .map((r: any) => ({
          stoolScore: r.stool_score ?? null,
          allergySymptoms: r.allergy_symptoms && r.allergy_symptoms.length > 0 ? r.allergy_symptoms : null,
          vomiting: r.vomiting ?? null,
          appetiteChange: r.appetite_change
            ? (r.appetite_change.toUpperCase() as 'INCREASED' | 'DECREASED' | 'NORMAL' | 'REFUSED')
            : null
        }))

      setSafiReviewCount(safiReviews.length)
    } catch (err) {
      console.error('SAFI 데이터 조회 실패:', err)
    }

    if (safiReviews.length === 0) {
      setSafiScore(null)
      return
    }

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

  if (!brand && loadError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">{loadError === 'not_found' ? '🔍' : '⚠️'}</div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {loadError === 'not_found' ? '브랜드를 찾을 수 없습니다' : '정보를 불러올 수 없습니다'}
          </h2>
          <p className="text-gray-600 mb-6">
            {loadError === 'not_found'
              ? `"${brandName}" 브랜드가 등록되어 있지 않거나 삭제되었습니다.`
              : '일시적인 오류가 발생했습니다. 잠시 후 다시 시도해주세요.'}
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
            >
              이전 페이지
            </button>
            <button
              onClick={() => router.push('/brands')}
              className="px-4 py-2 text-white bg-green-500 rounded-lg hover:bg-green-600 transition"
            >
              브랜드 목록
            </button>
            {loadError === 'error' && (
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 text-green-600 border border-green-300 rounded-lg hover:bg-green-50 transition"
              >
                다시 시도
              </button>
            )}
          </div>
        </div>
      </div>
    )
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
        <BrandProfileCard brand={brand} />

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

        {/* 원료 투명성 점수 */}
        <IngredientTransparencySection brand={brand} />

        {/* SAFI 안전성 점수 섹션 */}
        <SAFIScoreSection safiScore={safiScore} safiReviewCount={safiReviewCount} />

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

    </div>
  )
}
