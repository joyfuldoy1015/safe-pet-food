'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft,
  Star,
  Heart,
  Zap,
  Shield,
  Eye,
  Truck,
  DollarSign,
  ThumbsUp,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Info
} from 'lucide-react'

interface EvaluationData {
  brandName: string
  overall_rating: number
  palatability: number
  digestibility: number
  coat_quality: number
  stool_quality: number
  value_for_money: number
  packaging_quality: number
  availability: number
  brand_trust: number
  ingredient_transparency: number
  customer_service: number
  written_review: string
  recommend: boolean
  pet_info: {
    species: 'dog' | 'cat'
    age: string
    breed: string
    weight: string
    health_conditions: string[]
  }
  purchase_info: {
    product_line: string
    feeding_duration: string
    purchase_frequency: string
    price_range: string
  }
}

const evaluationCategories = [
  {
    key: 'palatability',
    label: '기호성',
    icon: Heart,
    description: '우리 아이가 얼마나 맛있게 먹는지',
    color: 'text-pink-500'
  },
  {
    key: 'digestibility',
    label: '소화력',
    icon: Zap,
    description: '소화 상태와 배변 활동',
    color: 'text-yellow-500'
  },
  {
    key: 'coat_quality',
    label: '모질 개선',
    icon: Star,
    description: '털의 윤기와 건강 상태',
    color: 'text-amber-500'
  },
  {
    key: 'stool_quality',
    label: '변 상태',
    icon: CheckCircle,
    description: '변의 형태와 냄새',
    color: 'text-green-500'
  },
  {
    key: 'value_for_money',
    label: '가성비',
    icon: DollarSign,
    description: '가격 대비 만족도',
    color: 'text-blue-500'
  },
  {
    key: 'packaging_quality',
    label: '포장 품질',
    icon: Shield,
    description: '포장 상태와 보관 편의성',
    color: 'text-purple-500'
  },
  {
    key: 'availability',
    label: '구매 편의성',
    icon: Truck,
    description: '구매처 접근성과 배송',
    color: 'text-indigo-500'
  },
  {
    key: 'brand_trust',
    label: '브랜드 신뢰도',
    icon: Shield,
    description: '브랜드에 대한 전반적 신뢰',
    color: 'text-gray-600'
  },
  {
    key: 'ingredient_transparency',
    label: '성분 투명성',
    icon: Eye,
    description: '원재료 공개 수준',
    color: 'text-teal-500'
  },
  {
    key: 'customer_service',
    label: '고객 서비스',
    icon: MessageCircle,
    description: '고객 지원과 응답성',
    color: 'text-orange-500'
  }
]

export default function ConsumerEvaluationPage() {
  const params = useParams()
  const router = useRouter()
  const brandName = decodeURIComponent(params.brandName as string)
  
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [evaluation, setEvaluation] = useState<EvaluationData>({
    brandName: brandName,
    overall_rating: 0,
    palatability: 0,
    digestibility: 0,
    coat_quality: 0,
    stool_quality: 0,
    value_for_money: 0,
    packaging_quality: 0,
    availability: 0,
    brand_trust: 0,
    ingredient_transparency: 0,
    customer_service: 0,
    written_review: '',
    recommend: false,
    pet_info: {
      species: 'dog',
      age: '',
      breed: '',
      weight: '',
      health_conditions: []
    },
    purchase_info: {
      product_line: '',
      feeding_duration: '',
      purchase_frequency: '',
      price_range: ''
    }
  })

  const totalSteps = 4

  const updateRating = (category: string, rating: number) => {
    setEvaluation(prev => ({
      ...prev,
      [category]: rating
    }))
  }

  const updatePetInfo = (field: string, value: string | string[]) => {
    setEvaluation(prev => ({
      ...prev,
      pet_info: {
        ...prev.pet_info,
        [field]: value
      }
    }))
  }

  const updatePurchaseInfo = (field: string, value: string) => {
    setEvaluation(prev => ({
      ...prev,
      purchase_info: {
        ...prev.purchase_info,
        [field]: value
      }
    }))
  }

  const calculateOverallRating = () => {
    const ratings = [
      evaluation.palatability,
      evaluation.digestibility,
      evaluation.coat_quality,
      evaluation.stool_quality,
      evaluation.value_for_money
    ]
    const validRatings = ratings.filter(r => r > 0)
    return validRatings.length > 0 
      ? Math.round(validRatings.reduce((sum, rating) => sum + rating, 0) / validRatings.length)
      : 0
  }

  const handleSubmit = async () => {
    if (isSubmitting) return
    
    setIsSubmitting(true)
    try {
      const finalEvaluation = {
        ...evaluation,
        overall_rating: calculateOverallRating()
      }

      const response = await fetch(`/api/brands/${brandName}/evaluate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(finalEvaluation),
      })

      if (response.ok) {
        // 성공 시 브랜드 상세 페이지로 이동
        router.push(`/brands/${brandName}?evaluation=success`)
      } else {
        console.error('평가 제출 실패')
      }
    } catch (error) {
      console.error('평가 제출 오류:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStarRating = (category: string, currentRating: number) => {
    return (
      <div className="flex items-center space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => updateRating(category, star)}
            className={`p-1 transition-colors ${
              star <= currentRating 
                ? 'text-yellow-400 hover:text-yellow-500' 
                : 'text-gray-300 hover:text-yellow-300'
            }`}
          >
            <Star className="h-6 w-6 fill-current" />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-600">
          {currentRating > 0 ? `${currentRating}점` : '평가해주세요'}
        </span>
      </div>
    )
  }

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">반려동물 정보</h2>
        <p className="text-gray-600">정확한 평가를 위해 반려동물 정보를 알려주세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">반려동물 종류</label>
          <select
            value={evaluation.pet_info.species}
            onChange={(e) => updatePetInfo('species', e.target.value as 'dog' | 'cat')}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="dog">강아지</option>
            <option value="cat">고양이</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">나이</label>
          <input
            type="text"
            value={evaluation.pet_info.age}
            onChange={(e) => updatePetInfo('age', e.target.value)}
            placeholder="예: 3세 또는 6개월"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">품종</label>
          <input
            type="text"
            value={evaluation.pet_info.breed}
            onChange={(e) => updatePetInfo('breed', e.target.value)}
            placeholder="예: 골든 리트리버, 페르시안"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">체중</label>
          <input
            type="text"
            value={evaluation.pet_info.weight}
            onChange={(e) => updatePetInfo('weight', e.target.value)}
            placeholder="예: 15kg, 4.2kg"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">건강 상태 (해당사항 체크)</label>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {['알레르기', '비만', '관절염', '신장질환', '심장질환', '소화기 문제', '피부 문제', '없음'].map((condition) => (
            <label key={condition} className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={evaluation.pet_info.health_conditions.includes(condition)}
                onChange={(e) => {
                  const conditions = evaluation.pet_info.health_conditions
                  if (e.target.checked) {
                    updatePetInfo('health_conditions', [...conditions, condition])
                  } else {
                    updatePetInfo('health_conditions', conditions.filter(c => c !== condition))
                  }
                }}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">{condition}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">구매 정보</h2>
        <p className="text-gray-600">제품 구매와 급여 경험을 알려주세요</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">제품 라인</label>
          <input
            type="text"
            value={evaluation.purchase_info.product_line}
            onChange={(e) => updatePurchaseInfo('product_line', e.target.value)}
            placeholder="예: 어덜트, 시니어, 퍼피"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">급여 기간</label>
          <select
            value={evaluation.purchase_info.feeding_duration}
            onChange={(e) => updatePurchaseInfo('feeding_duration', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">선택해주세요</option>
            <option value="1주일 미만">1주일 미만</option>
            <option value="1주일-1개월">1주일-1개월</option>
            <option value="1-3개월">1-3개월</option>
            <option value="3-6개월">3-6개월</option>
            <option value="6개월-1년">6개월-1년</option>
            <option value="1년 이상">1년 이상</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">구매 빈도</label>
          <select
            value={evaluation.purchase_info.purchase_frequency}
            onChange={(e) => updatePurchaseInfo('purchase_frequency', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">선택해주세요</option>
            <option value="첫 구매">첫 구매</option>
            <option value="월 1회">월 1회</option>
            <option value="2-3개월에 1회">2-3개월에 1회</option>
            <option value="6개월에 1회">6개월에 1회</option>
            <option value="정기 구매">정기 구매</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">가격대</label>
          <select
            value={evaluation.purchase_info.price_range}
            onChange={(e) => updatePurchaseInfo('price_range', e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">선택해주세요</option>
            <option value="3만원 미만">3만원 미만</option>
            <option value="3-5만원">3-5만원</option>
            <option value="5-8만원">5-8만원</option>
            <option value="8-12만원">8-12만원</option>
            <option value="12만원 이상">12만원 이상</option>
          </select>
        </div>
      </div>
    </div>
  )

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">세부 평가</h2>
        <p className="text-gray-600">각 항목에 대해 별점으로 평가해주세요</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {evaluationCategories.map((category) => {
          const IconComponent = category.icon
          return (
            <div key={category.key} className="p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center space-x-3 mb-3">
                <div className={`p-2 rounded-lg bg-gray-50 ${category.color}`}>
                  <IconComponent className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{category.label}</h3>
                  <p className="text-sm text-gray-600">{category.description}</p>
                </div>
              </div>
              {renderStarRating(category.key, evaluation[category.key as keyof EvaluationData] as number)}
            </div>
          )
        })}
      </div>
    </div>
  )

  const renderStep4 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">종합 평가</h2>
        <p className="text-gray-600">마지막으로 전체적인 의견을 남겨주세요</p>
      </div>

      {/* 전체 평점 */}
      <div className="bg-blue-50 rounded-lg p-6 text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">전체 평점</h3>
        <div className="flex items-center justify-center space-x-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star 
              key={star} 
              className={`h-8 w-8 ${
                star <= calculateOverallRating() 
                  ? 'text-yellow-400 fill-current' 
                  : 'text-gray-300'
              }`} 
            />
          ))}
          <span className="text-xl font-bold text-gray-900 ml-2">
            {calculateOverallRating()}.0
          </span>
        </div>
      </div>

      {/* 추천 여부 */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">이 브랜드를 다른 반려인에게 추천하시겠습니까?</h3>
        <div className="flex space-x-4">
          <button
            onClick={() => setEvaluation(prev => ({ ...prev, recommend: true }))}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              evaluation.recommend 
                ? 'border-green-500 bg-green-50 text-green-700' 
                : 'border-gray-300 hover:border-green-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <ThumbsUp className="h-5 w-5" />
              <span className="font-medium">추천합니다</span>
            </div>
          </button>
          <button
            onClick={() => setEvaluation(prev => ({ ...prev, recommend: false }))}
            className={`flex-1 p-4 rounded-lg border-2 transition-colors ${
              !evaluation.recommend 
                ? 'border-red-500 bg-red-50 text-red-700' 
                : 'border-gray-300 hover:border-red-300'
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              <AlertCircle className="h-5 w-5" />
              <span className="font-medium">추천하지 않습니다</span>
            </div>
          </button>
        </div>
      </div>

      {/* 상세 리뷰 */}
      <div>
        <label className="block text-lg font-semibold text-gray-900 mb-2">상세 리뷰 (선택사항)</label>
        <textarea
          value={evaluation.written_review}
          onChange={(e) => setEvaluation(prev => ({ ...prev, written_review: e.target.value }))}
          placeholder="다른 반려인들에게 도움이 될 구체적인 경험을 공유해주세요..."
          rows={6}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        />
        <p className="text-sm text-gray-500 mt-2">
          예: 급여 전후 변화, 특별한 장점이나 단점, 주의사항 등
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/brands/${brandName}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{brandName} 평가하기</h1>
                <p className="text-gray-600">솔직한 경험을 공유해주세요</p>
              </div>
            </div>
            
            {/* 진행 상황 */}
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">
                {currentStep} / {totalSteps}
              </span>
              <div className="w-20 bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
          {currentStep === 4 && renderStep4()}

          {/* 네비게이션 버튼 */}
          <div className="flex justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
              disabled={currentStep === 1}
              className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              이전
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={() => setCurrentStep(Math.min(totalSteps, currentStep + 1))}
                className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                다음
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center space-x-2 px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-4 w-4" />
                <span>{isSubmitting ? '제출 중...' : '평가 완료'}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
