'use client'

import { Suspense, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import { FeedingRecord, PetProfile, PetInfo } from './types'
import WriteStep1PetInfo from './WriteStep1PetInfo'
import WriteStep2Records from './WriteStep2Records'
import WriteStep3Preview from './WriteStep3Preview'

export default function WritePostPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-violet-500" />
      </div>
    }>
      <WritePostContent />
    </Suspense>
  )
}

function WritePostContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const selectedPetId = searchParams.get('petId')
  
  // 로그인한 사용자 정보 가져오기
  const { user, profile, loading: authLoading } = useAuth()
  
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login?redirect=%2Fpet-log%2Fposts%2Fwrite')
    }
  }, [authLoading, user, router])

  // 등록된 반려동물 프로필 목록
  const [petProfiles, setPetProfiles] = useState<PetProfile[]>([])
  const [selectedPetProfile, setSelectedPetProfile] = useState<string>('')
  
  // 반려동물 정보
  const [petInfo, setPetInfo] = useState<PetInfo>({
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

  // Supabase에서 반려동물 프로필 불러오기
  useEffect(() => {
    const loadPets = async () => {
      if (!user) {
        setUseNewPet(true)
        return
      }

      try {
        const supabase = getBrowserClient()
        const { data: petsData, error } = await supabase
          .from('pets')
          .select('*')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('반려동물 목록 로드 실패:', error)
          setUseNewPet(true)
          return
        }

        if (!petsData || petsData.length === 0) {
          setUseNewPet(true)
          return
        }

        // Supabase 데이터를 PetProfile 형식으로 변환
        const pets: PetProfile[] = petsData.map((pet: any) => {
          const birthYear = pet.birth_date ? new Date(pet.birth_date).getFullYear() : new Date().getFullYear()
          const currentYear = new Date().getFullYear()
          const ageYears = currentYear - birthYear
          
          return {
            id: pet.id,
            name: pet.name,
            species: pet.species || 'dog',
            birthYear: birthYear,
            age: `${ageYears}세`,
            gender: pet.gender || 'male',
            neutered: pet.neutered || false,
            breed: pet.breed || '믹스',
            weight: pet.weight_kg ? `${pet.weight_kg}kg` : '미등록',
            allergies: pet.allergies || [],
            healthConditions: pet.health_conditions || [],
            specialNotes: pet.special_notes || '',
            createdAt: pet.created_at,
            updatedAt: pet.updated_at,
            ownerId: pet.owner_id,
            ownerName: profile?.nickname || user.email?.split('@')[0] || '사용자'
          }
        })

        setPetProfiles(pets)

        // URL 파라미터로 선택된 반려동물이 있으면 해당 반려동물 선택
        if (selectedPetId) {
          const pet = pets.find((p: PetProfile) => p.id === selectedPetId)
          if (pet) {
            setSelectedPetProfile(selectedPetId)
            loadPetInfo(pet)
            setUseNewPet(false)
          } else {
            // 선택된 펫을 찾지 못하면 첫 번째 펫 선택
            setSelectedPetProfile(pets[0].id)
            loadPetInfo(pets[0])
            setUseNewPet(false)
          }
        } else {
          // 기본적으로 첫 번째 반려동물 선택
          setSelectedPetProfile(pets[0].id)
          loadPetInfo(pets[0])
          setUseNewPet(false)
        }
      } catch (error) {
        console.error('반려동물 프로필 로드 중 오류:', error)
        setUseNewPet(true)
      }
    }

    loadPets()
  }, [selectedPetId, user, profile])

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
    
    // 로그인 확인
    if (!user) {
      alert('로그인이 필요합니다.')
      router.push('/login?redirect=%2Fpet-log%2Fposts%2Fwrite')
      return
    }

    // 포스트 데이터 구성
    const postData = {
      id: postId,
      petName: petInfo.petName,
      petBreed: petInfo.petBreed,
      petAge: petInfo.petAge,
      petWeight: petInfo.petWeight,
      ownerName: profile?.nickname || user.email || '사용자',
      ownerId: user.id,
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

        if (!response.ok) {
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
    } catch (error) {
      console.error('❌ 포스트 저장 중 오류:', error)
      alert('포스트 저장 중 오류가 발생했습니다.')
      return
    }
    
    // 상세 페이지로 리다이렉트
    router.push(`/pet-log/posts/${postId}?created=true`)
  }

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-violet-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-4">
        <div className="flex items-center gap-3 mb-4">
          <Link href="/pet-log" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ArrowLeft className="h-4 w-4 text-gray-500" />
          </Link>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">급여 후기 작성</h1>
            <p className="text-xs text-gray-500">우리 아이의 급여 경험을 공유해보세요</p>
          </div>
        </div>
        
        {/* 단계 표시 */}
        <div className="flex items-center justify-center gap-2 py-3 bg-white rounded-2xl shadow-sm border border-gray-100">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
                step === currentStep 
                  ? 'bg-violet-500 text-white' 
                  : step < currentStep 
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-100 text-gray-400'
              }`}>
                {step < currentStep ? <CheckCircle className="h-3.5 w-3.5" /> : step}
              </div>
              {step < 3 && (
                <div className={`w-8 h-0.5 mx-1.5 ${
                  step < currentStep ? 'bg-green-500' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        {currentStep === 1 && (
          <WriteStep1PetInfo
            petProfiles={petProfiles}
            selectedPetProfile={selectedPetProfile}
            petInfo={petInfo}
            setPetInfo={setPetInfo}
            useNewPet={useNewPet}
            onPetSelect={handlePetSelect}
            onNext={nextStep}
          />
        )}

        {currentStep === 2 && (
          <WriteStep2Records
            feedingRecords={feedingRecords}
            showRecordForm={showRecordForm}
            setShowRecordForm={setShowRecordForm}
            currentRecord={currentRecord}
            setCurrentRecord={setCurrentRecord}
            newBenefit={newBenefit}
            setNewBenefit={setNewBenefit}
            newSideEffect={newSideEffect}
            setNewSideEffect={setNewSideEffect}
            addBenefit={addBenefit}
            removeBenefit={removeBenefit}
            addSideEffect={addSideEffect}
            removeSideEffect={removeSideEffect}
            addFeedingRecord={addFeedingRecord}
            removeFeedingRecord={removeFeedingRecord}
            onNext={nextStep}
            onPrev={prevStep}
          />
        )}

        {currentStep === 3 && (
          <WriteStep3Preview
            petInfo={petInfo}
            feedingRecords={feedingRecords}
            onSubmit={submitPost}
            onPrev={prevStep}
          />
        )}
      </div>
    </div>
  )
}
