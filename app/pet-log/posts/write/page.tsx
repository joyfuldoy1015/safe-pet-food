'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  ArrowLeft, 
  Plus, 
  Minus, 
  Star, 
  Calendar,
  MapPin,
  DollarSign,
  Package,
  Heart,
  AlertCircle,
  CheckCircle,
  Upload,
  X
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

// 포스트 데이터 인터페이스
interface PostData {
  petName: string
  petBreed: string
  petAge: string
  petWeight: string
  ownerName: string
  feedingRecords: FeedingRecord[]
}

// 반려동물 프로필 인터페이스
interface PetProfile {
  id: string
  name: string
  species: 'dog' | 'cat'
  birthYear: number
  age: string
  gender: 'male' | 'female'
  neutered: boolean
  breed: string
  weight: string
  allergies: string[]
  healthConditions: string[]
  specialNotes: string
  createdAt: string
  updatedAt: string
  ownerId: string
  ownerName: string
}

export default function WritePostPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedPetId = searchParams.get('petId')
  
  // 등록된 반려동물 프로필 목록
  const [petProfiles, setPetProfiles] = useState<PetProfile[]>([])
  const [selectedPetProfile, setSelectedPetProfile] = useState<string>('')
  
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
  const [useNewPet, setUseNewPet] = useState(false)

  // 로컬 스토리지에서 반려동물 프로필 불러오기
  useEffect(() => {
    try {
      const savedPets = JSON.parse(localStorage.getItem('petProfiles') || '[]')
      setPetProfiles(savedPets)
      
      // URL 파라미터로 선택된 반려동물이 있으면 해당 반려동물 선택
      if (selectedPetId) {
        const pet = savedPets.find((p: PetProfile) => p.id === selectedPetId)
        if (pet) {
          setSelectedPetProfile(selectedPetId)
          loadPetInfo(pet)
          setUseNewPet(false)
        }
      } else if (savedPets.length > 0) {
        // 기본적으로 첫 번째 반려동물 선택
        setSelectedPetProfile(savedPets[0].id)
        loadPetInfo(savedPets[0])
        setUseNewPet(false)
      } else {
        // 등록된 반려동물이 없으면 새로 입력 모드
        setUseNewPet(true)
      }
    } catch (error) {
      console.error('반려동물 프로필 로드 중 오류:', error)
      setUseNewPet(true)
    }
  }, [selectedPetId])

  // 선택한 반려동물 프로필에서 정보 로드
  const loadPetInfo = (pet: PetProfile) => {
    setPetInfo({
      petName: pet.name,
      petBreed: pet.breed,
      petAge: pet.age,
      petWeight: pet.weight,
      ownerName: pet.ownerName
    })
  }

  // 반려동물 선택 변경
  const handlePetSelect = (petId: string) => {
    if (petId === 'new') {
      setUseNewPet(true)
      setPetInfo({
        petName: '',
        petBreed: '',
        petAge: '',
        petWeight: '',
        ownerName: ''
      })
    } else {
      const pet = petProfiles.find(p => p.id === petId)
      if (pet) {
        setSelectedPetProfile(petId)
        loadPetInfo(pet)
        setUseNewPet(false)
      }
    }
  }

  // 카테고리 설정
  const categoryConfig = {
    '사료': { icon: '🍽️', color: 'text-blue-600 bg-blue-50 border-blue-200' },
    '간식': { icon: '🦴', color: 'text-green-600 bg-green-50 border-green-200' },
    '영양제': { icon: '💊', color: 'text-purple-600 bg-purple-50 border-purple-200' },
    '화장실': { icon: '🚽', color: 'text-orange-600 bg-orange-50 border-orange-200' }
  }

  // 상태 설정
  const statusConfig = {
    '급여중': { color: 'text-green-700 bg-green-100 border-green-300' },
    '급여완료': { color: 'text-gray-700 bg-gray-100 border-gray-300' },
    '급여중지': { color: 'text-red-700 bg-red-100 border-red-300' }
  }

  // 별점 렌더링
  const renderStars = (rating: number, onRate?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 cursor-pointer transition-colors ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'
        }`}
        onClick={() => onRate && onRate(i + 1)}
      />
    ))
  }

  // 혜택 추가
  const addBenefit = () => {
    if (newBenefit.trim() && currentRecord.benefits && !currentRecord.benefits.includes(newBenefit.trim())) {
      setCurrentRecord({
        ...currentRecord,
        benefits: [...(currentRecord.benefits || []), newBenefit.trim()]
      })
      setNewBenefit('')
    }
  }

  // 부작용 추가
  const addSideEffect = () => {
    if (newSideEffect.trim() && currentRecord.sideEffects && !currentRecord.sideEffects.includes(newSideEffect.trim())) {
      setCurrentRecord({
        ...currentRecord,
        sideEffects: [...(currentRecord.sideEffects || []), newSideEffect.trim()]
      })
      setNewSideEffect('')
    }
  }

  // 혜택 제거
  const removeBenefit = (benefit: string) => {
    setCurrentRecord({
      ...currentRecord,
      benefits: currentRecord.benefits?.filter(b => b !== benefit) || []
    })
  }

  // 부작용 제거
  const removeSideEffect = (sideEffect: string) => {
    setCurrentRecord({
      ...currentRecord,
      sideEffects: currentRecord.sideEffects?.filter(s => s !== sideEffect) || []
    })
  }

  // 날짜 차이를 계산하여 급여 기간 문자열로 변환
  const calculateDuration = (startDate: string, endDate?: string): string => {
    if (!startDate) return ''
    
    // 종료일이 없으면 오늘 날짜 사용 (급여중인 경우)
    const end = endDate ? new Date(endDate) : new Date()
    const start = new Date(startDate)
    
    if (isNaN(start.getTime()) || isNaN(end.getTime())) return ''
    if (end < start) return '' // 종료일이 시작일보다 이전이면 빈 문자열
    
    const diffTime = Math.abs(end.getTime() - start.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // 일 단위 계산
    const years = Math.floor(diffDays / 365)
    const months = Math.floor((diffDays % 365) / 30)
    const days = diffDays % 30
    
    // 결과 문자열 생성
    const parts: string[] = []
    if (years > 0) {
      parts.push(`${years}년`)
    }
    if (months > 0) {
      parts.push(`${months}개월`)
    }
    if (days > 0 && years === 0 && months === 0) {
      parts.push(`${days}일`)
    } else if (days > 0 && (years > 0 || months > 0)) {
      // 1년 이상이거나 1개월 이상이면 일은 표시하지 않음
    }
    
    return parts.length > 0 ? parts.join(' ') : `${diffDays}일`
  }

  // 시작일/종료일 변경 시 급여 기간 자동 계산
  useEffect(() => {
    if (currentRecord.startDate) {
      // 종료일이 입력되어 있으면 그 날짜 사용, 없으면 상태에 따라 처리
      let endDate: string | undefined = currentRecord.endDate || undefined
      
      if (!endDate) {
        // 종료일이 없을 때 상태에 따라 처리
        if (currentRecord.status === '급여완료' || currentRecord.status === '급여중지') {
          // 완료/중지 상태인데 종료일이 없으면 오늘까지 계산
          endDate = undefined // calculateDuration에서 오늘 날짜 사용
        } else if (currentRecord.status === '급여중') {
          // 급여중이면 오늘까지 계산
          endDate = undefined // calculateDuration에서 오늘 날짜 사용
        }
      }
      
      const calculatedDuration = calculateDuration(
        currentRecord.startDate,
        endDate
      )
      
      if (calculatedDuration) {
        setCurrentRecord(prev => ({
          ...prev,
          duration: calculatedDuration
        }))
      }
    } else {
      // 시작일이 없으면 duration 초기화
      setCurrentRecord(prev => ({
        ...prev,
        duration: ''
      }))
    }
  }, [currentRecord.startDate, currentRecord.endDate, currentRecord.status])

  // 급여 기록 추가
  const addFeedingRecord = () => {
    if (currentRecord.productName && currentRecord.brand) {
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
        repurchaseIntent: currentRecord.repurchaseIntent || true,
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
  }

  // 급여 기록 제거
  const removeFeedingRecord = (recordId: string) => {
    setFeedingRecords(feedingRecords.filter(record => record.id !== recordId))
  }

  // 다음 단계
  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1)
    }
  }

  // 이전 단계
  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  // 포스트 제출
  const submitPost = async () => {
    // 포스트 ID 생성 (타임스탬프 기반)
    const postId = `post-${Date.now()}`
    const now = new Date().toISOString().split('T')[0]
    
    // 포스트 데이터 구성
    const postData = {
      id: postId,
      petName: petInfo.petName,
      petBreed: petInfo.petBreed,
      petAge: petInfo.petAge,
      petWeight: petInfo.petWeight,
      ownerName: petInfo.ownerName,
      ownerId: 'current-user', // 실제로는 세션에서 가져옴
      ownerAvatar: '👤',
      petAvatar: selectedPetProfile && !useNewPet && petProfiles.length > 0
        ? (petProfiles.find(p => p.id === selectedPetProfile)?.species === 'cat' ? '🐱' : '🐕')
        : (petInfo.petBreed.includes('고양이') || petInfo.petBreed.includes('cat') ? '🐱' : '🐕'),
      petSpecies: selectedPetProfile && !useNewPet && petProfiles.length > 0
        ? (petProfiles.find(p => p.id === selectedPetProfile)?.species || 'dog')
        : (petInfo.petBreed.includes('고양이') || petInfo.petBreed.includes('cat') ? 'cat' : 'dog'),
      petProfileId: selectedPetProfile && !useNewPet ? selectedPetProfile : undefined,
      createdAt: now,
      updatedAt: now,
      totalRecords: feedingRecords.length,
      views: 0,
      likes: 0,
      comments: 0,
      isLiked: false,
      feedingRecords: feedingRecords
    }
    
    try {
      // Supabase API로 저장 시도
      try {
        const response = await fetch('/api/pet-log/posts', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            post: {
              id: postData.id,
              petName: postData.petName,
              petBreed: postData.petBreed,
              petAge: postData.petAge,
              petWeight: postData.petWeight,
              ownerName: postData.ownerName,
              ownerId: postData.ownerId,
              ownerAvatar: postData.ownerAvatar,
              petAvatar: postData.petAvatar,
              petSpecies: postData.petSpecies,
            },
            feedingRecords: feedingRecords.map(record => ({
              id: record.id,
              productName: record.productName,
              category: record.category,
              brand: record.brand,
              startDate: record.startDate,
              endDate: record.endDate,
              status: record.status,
              duration: record.duration,
              palatability: record.palatability,
              satisfaction: record.satisfaction,
              repurchaseIntent: record.repurchaseIntent,
              comment: record.comment,
              price: record.price,
              purchaseLocation: record.purchaseLocation,
              sideEffects: record.sideEffects || [],
              benefits: record.benefits || []
            }))
          }),
        })

        if (response.ok) {
          console.log('✅ Supabase에 포스트가 저장되었습니다:', postData.id)
        } else {
          const errorData = await response.json()
          console.warn('⚠️ Supabase 저장 실패, localStorage로 fallback:', errorData)
        }
      } catch (apiError) {
        console.warn('⚠️ Supabase API 오류, localStorage로 fallback:', apiError)
      }

      // 로컬 스토리지에도 저장 (fallback)
      const existingPosts = JSON.parse(localStorage.getItem('petLogPosts') || '[]')
      const updatedPosts = [postData, ...existingPosts]
      localStorage.setItem('petLogPosts', JSON.stringify(updatedPosts))
      console.log('✅ localStorage에 포스트가 저장되었습니다:', postData.id)
    } catch (error) {
      console.error('❌ 포스트 저장 중 오류:', error)
      alert('포스트 저장 중 오류가 발생했습니다.')
      return
    }
    
    // 상세 페이지로 리다이렉트
    router.push(`/pet-log/posts/${postId}?created=true`)
  }

  // 단계별 검증
  const canProceedToStep2 = petInfo.petName && petInfo.petBreed && petInfo.petAge && petInfo.petWeight && petInfo.ownerName
  const canProceedToStep3 = feedingRecords.length > 0

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/pet-log" className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">커뮤니티 포스트 작성</h1>
                <p className="text-gray-600">우리 아이의 급여 경험을 다른 집사들과 공유해보세요</p>
              </div>
            </div>
            
            {/* 단계 표시 */}
            <div className="flex items-center space-x-2">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step === currentStep 
                      ? 'bg-purple-600 text-white' 
                      : step < currentStep 
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step < currentStep ? <CheckCircle className="h-4 w-4" /> : step}
                  </div>
                  {step < 3 && (
                    <div className={`w-8 h-0.5 mx-2 ${
                      step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 단계 1: 반려동물 정보 */}
        {currentStep === 1 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">반려동물 정보</h2>
              {petProfiles.length > 0 && (
                <Link
                  href="/pet-log/pets/new"
                  className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                >
                  + 새 반려동물 등록
                </Link>
              )}
            </div>
            
            {/* 등록된 반려동물 선택 */}
            {petProfiles.length > 0 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  등록된 반려동물 선택
                </label>
                <select
                  value={useNewPet ? 'new' : selectedPetProfile}
                  onChange={(e) => handlePetSelect(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  {petProfiles.map(pet => (
                    <option key={pet.id} value={pet.id}>
                      {pet.name} ({pet.breed}, {pet.age})
                    </option>
                  ))}
                  <option value="new">+ 새 반려동물 정보 입력</option>
                </select>
              </div>
            )}
            
            {/* 반려동물 정보 입력 폼 */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${petProfiles.length > 0 && !useNewPet ? 'opacity-60' : ''}`}>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  반려동물 이름 *
                </label>
                <input
                  type="text"
                  value={petInfo.petName}
                  onChange={(e) => setPetInfo({...petInfo, petName: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    !useNewPet && petProfiles.length > 0 ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="예: 뽀미"
                  disabled={!useNewPet && petProfiles.length > 0}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  품종 *
                </label>
                <input
                  type="text"
                  value={petInfo.petBreed}
                  onChange={(e) => setPetInfo({...petInfo, petBreed: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    !useNewPet && petProfiles.length > 0 ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="예: 골든 리트리버"
                  disabled={!useNewPet && petProfiles.length > 0}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  나이 *
                </label>
                <input
                  type="text"
                  value={petInfo.petAge}
                  onChange={(e) => setPetInfo({...petInfo, petAge: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    !useNewPet && petProfiles.length > 0 ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="예: 3세"
                  disabled={!useNewPet && petProfiles.length > 0}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  체중 *
                </label>
                <input
                  type="text"
                  value={petInfo.petWeight}
                  onChange={(e) => setPetInfo({...petInfo, petWeight: e.target.value})}
                  className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                    !useNewPet && petProfiles.length > 0 ? 'bg-gray-50 cursor-not-allowed' : ''
                  }`}
                  placeholder="예: 28kg"
                  disabled={!useNewPet && petProfiles.length > 0}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  집사 이름 *
                </label>
                <input
                  type="text"
                  value={petInfo.ownerName}
                  onChange={(e) => setPetInfo({...petInfo, ownerName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="예: 김집사"
                  disabled={!useNewPet && petProfiles.length > 0}
                />
              </div>
            </div>
            
            {petProfiles.length === 0 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-blue-700">
                  💡 <strong>팁:</strong> 반려동물을 먼저 등록하면 다음 급여 기록 작성 시 자동으로 정보가 입력됩니다.{' '}
                  <Link href="/pet-log/pets/new" className="underline font-medium">
                    새 반려동물 등록하기
                  </Link>
                </p>
              </div>
            )}
            
            <div className="flex justify-end mt-8">
              <button
                onClick={nextStep}
                disabled={!canProceedToStep2}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  canProceedToStep2
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                다음 단계
              </button>
            </div>
          </div>
        )}

        {/* 단계 2: 급여 기록 */}
        {currentStep === 2 && (
          <div className="space-y-6">
            {/* 기존 급여 기록들 */}
            {feedingRecords.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">등록된 급여 기록 ({feedingRecords.length}개)</h2>
                
                <div className="space-y-4">
                  {feedingRecords.map((record) => (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{categoryConfig[record.category].icon}</span>
                          <div>
                            <h3 className="font-bold text-gray-900">{record.productName}</h3>
                            <p className="text-sm text-gray-600">{record.brand}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => removeFeedingRecord(record.id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${categoryConfig[record.category].color}`}>
                          {record.category}
                        </span>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[record.status].color}`}>
                          {record.status}
                        </span>
                        <div className="flex items-center space-x-1">
                          <span>기호성:</span>
                          {renderStars(record.palatability)}
                        </div>
                        <div className="flex items-center space-x-1">
                          <span>만족도:</span>
                          {renderStars(record.satisfaction)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 급여 기록 추가 폼 */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">급여 기록 추가</h2>
                {!showRecordForm && (
                  <button
                    onClick={() => setShowRecordForm(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                  >
                    <Plus className="h-4 w-4" />
                    <span>기록 추가</span>
                  </button>
                )}
              </div>

              {showRecordForm && (
                <div className="space-y-6">
                  {/* 기본 정보 */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        제품명 *
                      </label>
                      <input
                        type="text"
                        value={currentRecord.productName}
                        onChange={(e) => setCurrentRecord({...currentRecord, productName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="예: 힐스 어덜트 라지 브리드"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        브랜드 *
                      </label>
                      <input
                        type="text"
                        value={currentRecord.brand}
                        onChange={(e) => setCurrentRecord({...currentRecord, brand: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="예: 힐스"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        카테고리
                      </label>
                      <select
                        value={currentRecord.category}
                        onChange={(e) => setCurrentRecord({...currentRecord, category: e.target.value as ProductCategory})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="사료">🍽️ 사료</option>
                        <option value="간식">🦴 간식</option>
                        <option value="영양제">💊 영양제</option>
                        <option value="화장실">🚽 화장실</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        급여 상태
                      </label>
                      <select
                        value={currentRecord.status}
                        onChange={(e) => setCurrentRecord({...currentRecord, status: e.target.value as FeedingStatus})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      >
                        <option value="급여중">🟢 급여중</option>
                        <option value="급여완료">⚫ 급여완료</option>
                        <option value="급여중지">🔴 급여중지</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        급여 시작일 *
                      </label>
                      <input
                        type="date"
                        value={currentRecord.startDate}
                        onChange={(e) => setCurrentRecord({...currentRecord, startDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        급여 종료일 <span className="text-xs text-gray-500 font-normal">(선택)</span>
                      </label>
                      <input
                        type="date"
                        value={currentRecord.endDate || ''}
                        onChange={(e) => setCurrentRecord({...currentRecord, endDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        min={currentRecord.startDate || undefined} // 시작일 이후만 선택 가능
                        max={new Date().toISOString().split('T')[0]} // 오늘 이후 날짜 선택 불가
                        disabled={!currentRecord.startDate} // 시작일이 없으면 비활성화
                      />
                      {!currentRecord.startDate && (
                        <p className="mt-1 text-xs text-gray-500">시작일을 먼저 입력해주세요</p>
                      )}
                      {currentRecord.status === '급여중' && currentRecord.endDate && (
                        <p className="mt-1 text-xs text-amber-600">급여중 상태에서는 종료일이 있어도 오늘까지 계산됩니다</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        급여 기간 <span className="text-xs text-gray-500 font-normal">(자동 계산)</span>
                      </label>
                      <input
                        type="text"
                        value={currentRecord.duration || ''}
                        readOnly
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
                        placeholder={currentRecord.startDate ? '날짜를 입력하면 자동으로 계산됩니다' : '예: 3개월, 1년 2개월'}
                      />
                      {currentRecord.startDate && !currentRecord.duration && (
                        <p className="mt-1 text-xs text-gray-500">
                          종료일을 입력하면 기간이 자동으로 계산됩니다
                        </p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        가격 (선택)
                      </label>
                      <input
                        type="text"
                        value={currentRecord.price}
                        onChange={(e) => setCurrentRecord({...currentRecord, price: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="예: 50,000원"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        구매처 (선택)
                      </label>
                      <input
                        type="text"
                        value={currentRecord.purchaseLocation}
                        onChange={(e) => setCurrentRecord({...currentRecord, purchaseLocation: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="예: 동물병원, 온라인몰"
                      />
                    </div>
                  </div>

                  {/* 평가 */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        기호성
                      </label>
                      <div className="flex items-center space-x-1">
                        {renderStars(currentRecord.palatability || 5, (rating) => 
                          setCurrentRecord({...currentRecord, palatability: rating})
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        만족도
                      </label>
                      <div className="flex items-center space-x-1">
                        {renderStars(currentRecord.satisfaction || 5, (rating) => 
                          setCurrentRecord({...currentRecord, satisfaction: rating})
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        재구매 의사
                      </label>
                      <div className="flex items-center space-x-4">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={currentRecord.repurchaseIntent === true}
                            onChange={() => setCurrentRecord({...currentRecord, repurchaseIntent: true})}
                            className="mr-2"
                          />
                          <span>예</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            checked={currentRecord.repurchaseIntent === false}
                            onChange={() => setCurrentRecord({...currentRecord, repurchaseIntent: false})}
                            className="mr-2"
                          />
                          <span>아니오</span>
                        </label>
                      </div>
                    </div>
                  </div>

                  {/* 혜택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      좋은 점/효과 (선택)
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={newBenefit}
                        onChange={(e) => setNewBenefit(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="예: 털 윤기 개선, 소화 잘됨"
                        onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
                      />
                      <button
                        onClick={addBenefit}
                        className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                      >
                        추가
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(currentRecord.benefits || []).map((benefit, index) => (
                        <span
                          key={index}
                          className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                        >
                          <CheckCircle className="h-3 w-3" />
                          <span>{benefit}</span>
                          <button
                            onClick={() => removeBenefit(benefit)}
                            className="ml-1 text-green-600 hover:text-green-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 부작용 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      부작용/단점 (선택)
                    </label>
                    <div className="flex items-center space-x-2 mb-2">
                      <input
                        type="text"
                        value={newSideEffect}
                        onChange={(e) => setNewSideEffect(e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="예: 가격이 비쌈, 알레르기 반응"
                        onKeyPress={(e) => e.key === 'Enter' && addSideEffect()}
                      />
                      <button
                        onClick={addSideEffect}
                        className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        추가
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {(currentRecord.sideEffects || []).map((sideEffect, index) => (
                        <span
                          key={index}
                          className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm"
                        >
                          <AlertCircle className="h-3 w-3" />
                          <span>{sideEffect}</span>
                          <button
                            onClick={() => removeSideEffect(sideEffect)}
                            className="ml-1 text-red-600 hover:text-red-800"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 상세 후기 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      상세 후기 (선택)
                    </label>
                    <textarea
                      value={currentRecord.comment}
                      onChange={(e) => setCurrentRecord({...currentRecord, comment: e.target.value})}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="이 제품에 대한 자세한 경험과 느낀 점을 공유해주세요..."
                    />
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => setShowRecordForm(false)}
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      취소
                    </button>
                    <button
                      onClick={addFeedingRecord}
                      disabled={!currentRecord.productName || !currentRecord.brand}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        currentRecord.productName && currentRecord.brand
                          ? 'bg-purple-600 text-white hover:bg-purple-700'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      기록 추가
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 네비게이션 */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>이전 단계</span>
              </button>
              
              <button
                onClick={nextStep}
                disabled={!canProceedToStep3}
                className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                  canProceedToStep3
                    ? 'bg-purple-600 text-white hover:bg-purple-700'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                미리보기
              </button>
            </div>
          </div>
        )}

        {/* 단계 3: 미리보기 */}
        {currentStep === 3 && (
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">포스트 미리보기</h2>
              
              {/* 반려동물 정보 */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-4">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                    <span className="text-2xl">🐕</span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{petInfo.petName}</h3>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{petInfo.petBreed}</span>
                      <span>•</span>
                      <span>{petInfo.petAge}</span>
                      <span>•</span>
                      <span>{petInfo.petWeight}</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-1">집사: {petInfo.ownerName}</p>
                  </div>
                </div>
              </div>

              {/* 급여 기록들 */}
              <div className="space-y-6">
                {Object.entries(
                  feedingRecords.reduce((acc, record) => {
                    if (!acc[record.category]) acc[record.category] = []
                    acc[record.category].push(record)
                    return acc
                  }, {} as Record<ProductCategory, FeedingRecord[]>)
                ).map(([category, records]) => (
                  <div key={category}>
                    <div className="flex items-center space-x-2 mb-4">
                      <span className="text-2xl">{categoryConfig[category as ProductCategory].icon}</span>
                      <h3 className="text-lg font-bold text-gray-900">{category}</h3>
                      <span className="text-sm text-gray-500">({records.length}개)</span>
                    </div>

                    <div className="space-y-4">
                      {records
                        .sort((a, b) => {
                          // 급여중 우선, 그 다음 날짜순
                          if (a.status !== b.status) {
                            return a.status === '급여중' ? -1 : 1
                          }
                          return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                        })
                        .map((record) => (
                          <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-bold text-gray-900">{record.productName}</h4>
                                <p className="text-sm text-gray-600">{record.brand}</p>
                              </div>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[record.status].color}`}>
                                {record.status}
                              </span>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                              <div>
                                <span className="text-gray-600">급여 기간:</span>
                                <p className="font-medium">{record.duration}</p>
                              </div>
                              <div>
                                <span className="text-gray-600">기호성:</span>
                                <div className="flex items-center space-x-1">
                                  {renderStars(record.palatability)}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">만족도:</span>
                                <div className="flex items-center space-x-1">
                                  {renderStars(record.satisfaction)}
                                </div>
                              </div>
                              <div>
                                <span className="text-gray-600">재구매:</span>
                                <p className={`font-medium ${record.repurchaseIntent ? 'text-green-600' : 'text-red-600'}`}>
                                  {record.repurchaseIntent ? '의사 있음' : '의사 없음'}
                                </p>
                              </div>
                            </div>

                            {(record.benefits && record.benefits.length > 0) && (
                              <div className="mb-3">
                                <span className="text-sm text-gray-600 block mb-1">좋은 점:</span>
                                <div className="flex flex-wrap gap-1">
                                  {record.benefits.map((benefit, index) => (
                                    <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                      {benefit}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {(record.sideEffects && record.sideEffects.length > 0) && (
                              <div className="mb-3">
                                <span className="text-sm text-gray-600 block mb-1">부작용/단점:</span>
                                <div className="flex flex-wrap gap-1">
                                  {record.sideEffects.map((sideEffect, index) => (
                                    <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                      {sideEffect}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}

                            {record.comment && (
                              <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-sm text-gray-700">{record.comment}</p>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 네비게이션 */}
            <div className="flex items-center justify-between">
              <button
                onClick={prevStep}
                className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                <span>이전 단계</span>
              </button>
              
              <button
                onClick={submitPost}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
              >
                포스트 게시하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
