'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Star, 
  Calendar,
  DollarSign,
  Package,
  AlertCircle,
  CheckCircle,
  X,
  Loader2
} from 'lucide-react'

// 제품 카테고리 타입
type ProductCategory = '사료' | '간식' | '영양제' | '화장실'

// 급여 상태 타입
type FeedingStatus = '급여중' | '급여완료' | '급여중지'

// 급여 기록 인터페이스
interface FeedingRecord {
  id: string
  productName: string
  category: ProductCategory
  brand: string
  startDate: string
  endDate?: string
  status: FeedingStatus
  duration: string
  palatability: number // 1-5
  satisfaction: number // 1-5
  repurchaseIntent: boolean
  comment?: string
  imageUrl?: string
  price?: string
  purchaseLocation?: string
  sideEffects?: string[]
  benefits?: string[]
}

export default function EditPostPage() {
  const router = useRouter()
  const params = useParams()
  const postId = params.postId as string
  
  const { user, profile } = useAuth()
  
  // 반려동물 정보
  const [petInfo, setPetInfo] = useState({
    petName: '',
    petBreed: '',
    petAge: '',
    petWeight: '',
    ownerName: ''
  })

  // 급여 기록들
  const [feedingRecords, setFeedingRecords] = useState<FeedingRecord[]>([])
  
  // 현재 작성 중인 기록
  const [currentRecord, setCurrentRecord] = useState<Partial<FeedingRecord>>({
    productName: '',
    category: '사료',
    brand: '',
    startDate: '',
    endDate: '',
    status: '급여중',
    duration: '',
    palatability: 5,
    satisfaction: 5,
    repurchaseIntent: true,
    comment: '',
    price: '',
    purchaseLocation: '',
    sideEffects: [],
    benefits: []
  })

  // UI 상태
  const [showRecordForm, setShowRecordForm] = useState(false)
  const [currentStep, setCurrentStep] = useState(1) // 1: 반려동물 정보, 2: 급여 기록, 3: 미리보기
  const [newBenefit, setNewBenefit] = useState('')
  const [newSideEffect, setNewSideEffect] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // 기존 포스트 데이터 로드
  useEffect(() => {
    const loadPost = async () => {
      try {
        setIsLoading(true)
        
        // API에서 포스트 데이터 가져오기
        const res = await fetch(`/api/pet-log/posts/${postId}`)
        
        if (!res.ok) {
          throw new Error('Failed to load post')
        }
        
        const data = await res.json()
        
        // 반려동물 정보 설정
        setPetInfo({
          petName: data.pet_name || '',
          petBreed: data.pet_breed || '',
          petAge: data.pet_age || '',
          petWeight: data.pet_weight || '',
          ownerName: data.owner_name || ''
        })
        
        // 급여 기록 설정
        if (data.feedingRecords && data.feedingRecords.length > 0) {
          const records = data.feedingRecords.map((record: any) => ({
            id: record.id,
            productName: record.product_name,
            category: record.category,
            brand: record.brand || '',
            startDate: record.start_date,
            endDate: record.end_date || '',
            status: record.status,
            duration: record.duration || '',
            palatability: record.palatability || 5,
            satisfaction: record.satisfaction || 5,
            repurchaseIntent: record.repurchase_intent || false,
            comment: record.comment || '',
            price: record.price || '',
            purchaseLocation: record.purchase_location || '',
            sideEffects: record.side_effects || [],
            benefits: record.benefits || []
          }))
          
          setFeedingRecords(records)
        }
      } catch (error) {
        console.error('Failed to load post:', error)
        alert('포스트를 불러오는데 실패했습니다.')
        router.push('/pet-log')
      } finally {
        setIsLoading(false)
      }
    }
    
    if (postId) {
      loadPost()
    }
  }, [postId, router])

  // 카테고리 설정
  const categoryConfig = {
    '사료': { icon: '🍽️', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    '간식': { icon: '🦴', color: 'text-green-600 bg-green-50 border-green-200' },
    '영양제': { icon: '💊', color: 'text-purple-600 bg-purple-50 border-purple-200' },
    '화장실': { icon: '🚽', color: 'text-orange-600 bg-orange-50 border-orange-200' }
  }

  // 상태 설정
  const statusConfig = {
    '급여중': { color: 'bg-blue-100 text-blue-700 border-blue-300' },
    '급여완료': { color: 'bg-green-100 text-green-700 border-green-300' },
    '급여중지': { color: 'bg-gray-100 text-gray-700 border-gray-300' }
  }

  // 별점 렌더링
  const renderStars = (value: number, onChange: (value: number) => void) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110"
          >
            <Star
              className={`h-6 w-6 ${
                star <= value ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    )
  }

  // 급여 기록 추가
  const handleAddRecord = () => {
    if (!currentRecord.productName || !currentRecord.brand) {
      alert('제품명과 브랜드는 필수입니다.')
      return
    }

    const newRecord: FeedingRecord = {
      id: `record-${Date.now()}`,
      productName: currentRecord.productName || '',
      category: currentRecord.category || '사료',
      brand: currentRecord.brand || '',
      startDate: currentRecord.startDate || '',
      endDate: currentRecord.endDate,
      status: currentRecord.status || '급여중',
      duration: currentRecord.duration || '',
      palatability: currentRecord.palatability || 5,
      satisfaction: currentRecord.satisfaction || 5,
      repurchaseIntent: currentRecord.repurchaseIntent || false,
      comment: currentRecord.comment,
      price: currentRecord.price,
      purchaseLocation: currentRecord.purchaseLocation,
      sideEffects: currentRecord.sideEffects || [],
      benefits: currentRecord.benefits || []
    }

    setFeedingRecords([...feedingRecords, newRecord])
    
    // 폼 초기화
    setCurrentRecord({
      productName: '',
      category: '사료',
      brand: '',
      startDate: '',
      endDate: '',
      status: '급여중',
      duration: '',
      palatability: 5,
      satisfaction: 5,
      repurchaseIntent: true,
      comment: '',
      price: '',
      purchaseLocation: '',
      sideEffects: [],
      benefits: []
    })
    setShowRecordForm(false)
  }

  // 급여 기록 삭제
  const handleRemoveRecord = (id: string) => {
    setFeedingRecords(feedingRecords.filter(record => record.id !== id))
  }

  // 장점 추가
  const handleAddBenefit = () => {
    if (newBenefit.trim() && currentRecord.benefits) {
      setCurrentRecord({
        ...currentRecord,
        benefits: [...currentRecord.benefits, newBenefit.trim()]
      })
      setNewBenefit('')
    }
  }

  // 부작용 추가
  const handleAddSideEffect = () => {
    if (newSideEffect.trim() && currentRecord.sideEffects) {
      setCurrentRecord({
        ...currentRecord,
        sideEffects: [...currentRecord.sideEffects, newSideEffect.trim()]
      })
      setNewSideEffect('')
    }
  }

  // 포스트 수정 제출
  const handleSubmit = async () => {
    // 유효성 검사
    if (!petInfo.petName || !petInfo.petBreed) {
      alert('반려동물 이름과 품종은 필수입니다.')
      setCurrentStep(1)
      return
    }

    if (feedingRecords.length === 0) {
      alert('최소 1개 이상의 급여 기록을 추가해주세요.')
      setCurrentStep(2)
      return
    }

    if (!user) {
      alert('로그인이 필요합니다.')
      router.push('/login?redirect=/pet-log')
      return
    }

    setIsSaving(true)

    try {
      const postData = {
        post: {
          petName: petInfo.petName,
          petBreed: petInfo.petBreed,
          petAge: petInfo.petAge,
          petWeight: petInfo.petWeight,
          ownerName: petInfo.ownerName || profile?.nickname || user.email || '사용자',
          ownerId: user.id
        },
        feedingRecords: feedingRecords
      }

      const response = await fetch(`/api/pet-log/posts/${postId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      })

      if (!response.ok) {
        throw new Error('Failed to update post')
      }

      alert('수정되었습니다!')
      router.push(`/pet-log/posts/${postId}`)
    } catch (error) {
      console.error('Failed to update post:', error)
      alert('포스트 수정에 실패했습니다. 다시 시도해주세요.')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">포스트를 불러오는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 to-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-start space-x-4 mb-6">
          <Link href={`/pet-log/posts/${postId}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors mt-1">
            <ArrowLeft className="h-5 w-5 text-gray-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">급여 후기 수정</h1>
            <p className="text-sm text-gray-600 mt-1">
              기존 내용을 수정하세요
            </p>
          </div>
        </div>

        {/* 진행 상태 표시 */}
        <div className="mb-8">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {[
              { step: 1, label: '반려동물 정보' },
              { step: 2, label: '급여 기록' },
              { step: 3, label: '미리보기' }
            ].map((item, index) => (
              <div key={item.step} className="flex items-center flex-1">
                <div className="flex flex-col items-center flex-1">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors ${
                    currentStep >= item.step
                      ? 'bg-purple-600 text-white'
                      : 'bg-gray-200 text-gray-500'
                  }`}>
                    {item.step}
                  </div>
                  <span className={`mt-2 text-sm font-medium ${
                    currentStep >= item.step ? 'text-purple-600' : 'text-gray-500'
                  }`}>
                    {item.label}
                  </span>
                </div>
                {index < 2 && (
                  <div className={`h-1 flex-1 mx-4 ${
                    currentStep > item.step ? 'bg-purple-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: 반려동물 정보 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 max-w-2xl mx-auto">
            <h2 className="text-xl font-bold text-gray-900 mb-6">반려동물 정보</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  이름 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={petInfo.petName}
                  onChange={(e) => setPetInfo({ ...petInfo, petName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="예: 뽀미"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  품종 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={petInfo.petBreed}
                  onChange={(e) => setPetInfo({ ...petInfo, petBreed: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="예: 골든 리트리버"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">나이</label>
                  <input
                    type="text"
                    value={petInfo.petAge}
                    onChange={(e) => setPetInfo({ ...petInfo, petAge: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="예: 3세"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">몸무게</label>
                  <input
                    type="text"
                    value={petInfo.petWeight}
                    onChange={(e) => setPetInfo({ ...petInfo, petWeight: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="예: 28kg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button
                onClick={() => {
                  if (petInfo.petName && petInfo.petBreed) {
                    setCurrentStep(2)
                  } else {
                    alert('이름과 품종은 필수입니다.')
                  }
                }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
              >
                다음 단계
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 급여 기록 */}
        {currentStep === 2 && (
          <div className="max-w-4xl mx-auto space-y-6">
            {/* 기존 급여 기록 목록 */}
            {feedingRecords.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  급여 기록 ({feedingRecords.length}개)
                </h3>
                
                <div className="space-y-4">
                  {feedingRecords.map((record) => (
                    <div
                      key={record.id}
                      className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 transition-colors"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${categoryConfig[record.category].color}`}>
                              {categoryConfig[record.category].icon} {record.category}
                            </span>
                            <span className={`px-3 py-1 rounded-full text-sm font-medium border ${statusConfig[record.status].color}`}>
                              {record.status}
                            </span>
                          </div>
                          
                          <h4 className="font-semibold text-gray-900 text-lg mb-1">
                            {record.productName}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {record.brand}
                          </p>
                          
                          {record.comment && (
                            <p className="text-sm text-gray-700 mb-2">
                              {record.comment}
                            </p>
                          )}
                          
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>기호성: {'⭐'.repeat(record.palatability)}</span>
                            <span>만족도: {'⭐'.repeat(record.satisfaction)}</span>
                            <span>재구매: {record.repurchaseIntent ? '✅' : '❌'}</span>
                          </div>
                        </div>
                        
                        <button
                          onClick={() => handleRemoveRecord(record.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="삭제"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 급여 기록 추가 버튼 */}
            {!showRecordForm && (
              <button
                onClick={() => setShowRecordForm(true)}
                className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-purple-500 hover:text-purple-600 transition-colors flex items-center justify-center gap-2"
              >
                <Plus className="h-5 w-5" />
                급여 기록 추가
              </button>
            )}

            {/* 급여 기록 추가 폼 */}
            {showRecordForm && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4">새 급여 기록</h3>
                
                {/* 폼 내용은 write 페이지와 동일하므로 생략 (실제로는 전체 폼 포함) */}
                <div className="space-y-4">
                  {/* 카테고리 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리 <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {Object.entries(categoryConfig).map(([cat, config]) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => setCurrentRecord({ ...currentRecord, category: cat as ProductCategory })}
                          className={`p-3 rounded-lg border-2 transition-colors ${
                            currentRecord.category === cat
                              ? `${config.color} border-opacity-100`
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="text-2xl mb-1">{config.icon}</div>
                          <div className="text-xs font-medium">{cat}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 제품명 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      제품명 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentRecord.productName}
                      onChange={(e) => setCurrentRecord({ ...currentRecord, productName: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="예: 로얄캐닌 골든 리트리버 어덜트"
                    />
                  </div>

                  {/* 브랜드 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      브랜드 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={currentRecord.brand}
                      onChange={(e) => setCurrentRecord({ ...currentRecord, brand: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      placeholder="예: 로얄캐닌"
                    />
                  </div>

                  {/* 기호성 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      기호성
                    </label>
                    {renderStars(currentRecord.palatability || 5, (value) =>
                      setCurrentRecord({ ...currentRecord, palatability: value })
                    )}
                  </div>

                  {/* 만족도 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      만족도
                    </label>
                    {renderStars(currentRecord.satisfaction || 5, (value) =>
                      setCurrentRecord({ ...currentRecord, satisfaction: value })
                    )}
                  </div>

                  {/* 코멘트 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      코멘트
                    </label>
                    <textarea
                      value={currentRecord.comment}
                      onChange={(e) => setCurrentRecord({ ...currentRecord, comment: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                      rows={4}
                      placeholder="급여 경험을 자유롭게 작성해주세요..."
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 mt-6">
                  <button
                    onClick={() => setShowRecordForm(false)}
                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    취소
                  </button>
                  <button
                    onClick={handleAddRecord}
                    className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    추가
                  </button>
                </div>
              </div>
            )}

            {/* 네비게이션 버튼 */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                이전
              </button>
              <button
                onClick={() => {
                  if (feedingRecords.length > 0) {
                    setCurrentStep(3)
                  } else {
                    alert('최소 1개 이상의 급여 기록을 추가해주세요.')
                  }
                }}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                다음
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 미리보기 & 제출 */}
        {currentStep === 3 && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">미리보기</h2>
              
              {/* 반려동물 정보 */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">반려동물 정보</h3>
                <p className="text-gray-700">
                  <strong>{petInfo.petName}</strong> • {petInfo.petBreed} • {petInfo.petAge} • {petInfo.petWeight}
                </p>
              </div>

              {/* 급여 기록 */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-4">급여 기록 ({feedingRecords.length}개)</h3>
                <div className="space-y-4">
                  {feedingRecords.map((record) => (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${categoryConfig[record.category].color}`}>
                          {categoryConfig[record.category].icon} {record.category}
                        </span>
                      </div>
                      <h4 className="font-semibold text-gray-900">{record.productName}</h4>
                      <p className="text-sm text-gray-600">{record.brand}</p>
                      {record.comment && <p className="text-sm text-gray-700 mt-2">{record.comment}</p>}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* 제출 버튼 */}
            <div className="flex justify-between">
              <button
                onClick={() => setCurrentStep(2)}
                disabled={isSaving}
                className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                이전
              </button>
              <button
                onClick={handleSubmit}
                disabled={isSaving}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:from-purple-700 hover:to-pink-700 transition-colors font-semibold disabled:opacity-50 flex items-center gap-2"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    수정 중...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5" />
                    수정 완료
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
