'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { 
  Plus, 
  Calendar, 
  Star, 
  Heart, 
  BookOpen,
  PawPrint,
  TrendingUp,
  Clock,
  Award,
  Users,
  Eye,
  MessageCircle,
  ThumbsUp,
  Filter,
  Search,
  User,
  Bookmark,
  BookmarkCheck
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
  price?: string
  purchaseLocation?: string
  sideEffects?: string[]
  benefits?: string[]
}

// 커뮤니티 포스트 데이터 구조 (업그레이드됨)
interface DetailedPetLogPost {
  id: string
  petName: string
  petBreed: string
  petAge: string
  petWeight: string
  ownerName: string
  ownerId: string
  ownerAvatar: string
  petAvatar: string
  petSpecies: 'dog' | 'cat'
  createdAt: string
  updatedAt: string
  totalRecords: number
  feedingRecords: FeedingRecord[]
  views: number
  likes: number
  comments: number
  isLiked: boolean
}

// 카테고리 설정 (상세 페이지와 동일)
const categoryConfig = {
  '사료': { icon: '🍽️', color: 'text-blue-600 bg-blue-50 border-blue-200' },
  '간식': { icon: '🦴', color: 'text-green-600 bg-green-50 border-green-200' },
  '영양제': { icon: '💊', color: 'text-purple-600 bg-purple-50 border-purple-200' },
  '화장실': { icon: '🚽', color: 'text-orange-600 bg-orange-50 border-orange-200' }
}

// 상태 설정 (상세 페이지와 동일)
const statusConfig = {
  '급여중': { color: 'text-green-700 bg-green-100 border-green-300' },
  '급여완료': { color: 'text-gray-700 bg-gray-100 border-gray-300' },
  '급여중지': { color: 'text-red-700 bg-red-100 border-red-300' }
}

// Mock data - 상세한 펫 로그 포스트들
const detailedPosts: DetailedPetLogPost[] = [
  {
    id: 'post-1',
    petName: '뽀미',
    petBreed: '골든 리트리버',
    petAge: '3세',
    petWeight: '28kg',
    ownerName: '김집사',
    ownerId: 'owner-1',
    ownerAvatar: '👨‍💼',
    petAvatar: '🐕',
    petSpecies: 'dog',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    totalRecords: 8,
    views: 1247,
    likes: 89,
    comments: 23,
    isLiked: false,
    feedingRecords: [
      {
        id: 'record-1',
        productName: '힐스 어덜트 라지 브리드',
        category: '사료',
        brand: '힐스',
        startDate: '2024-01-16',
        status: '급여중',
        duration: '5일',
        palatability: 4,
        satisfaction: 4,
        repurchaseIntent: true,
        comment: '로얄캐닌에서 바꿨는데 적응 기간이 필요해 보여요. 그래도 잘 먹고 있어요.',
        price: '89,000원 (15kg)',
        purchaseLocation: '온라인 펫샵',
        benefits: ['털 윤기 개선', '소화 잘됨']
      },
      {
        id: 'record-2',
        productName: '로얄캐닌 골든 리트리버 어덜트',
        category: '사료',
        brand: '로얄캐닌',
        startDate: '2023-10-01',
        endDate: '2024-01-15',
        status: '급여완료',
        duration: '3개월 15일',
        palatability: 5,
        satisfaction: 5,
        repurchaseIntent: true,
        comment: '우리 뽀미가 정말 잘 먹어요. 털도 윤기가 좋아졌고 변 상태도 완벽해요!',
        price: '95,000원 (12kg)',
        purchaseLocation: '동물병원',
        benefits: ['기호성 우수', '털 윤기', '변 상태 좋음']
      },
      {
        id: 'record-3',
        productName: '네츄럴발란스 트레이닝 트릿',
        category: '간식',
        brand: '네츄럴발란스',
        startDate: '2024-01-10',
        status: '급여중',
        duration: '11일',
        palatability: 5,
        satisfaction: 4,
        repurchaseIntent: true,
        comment: '훈련용으로 사용 중인데 정말 좋아해요. 크기도 적당하고 부드러워요.',
        price: '12,000원 (200g)',
        purchaseLocation: '펫샵',
        benefits: ['훈련 효과', '소화 잘됨']
      }
    ]
  },
  {
    id: 'post-2',
    petName: '모모',
    petBreed: '페르시안',
    petAge: '7세',
    petWeight: '4.2kg',
    ownerName: '김지은',
    ownerId: 'owner-2',
    ownerAvatar: '👩',
    petAvatar: '🐱',
    petSpecies: 'cat',
    createdAt: '2024-12-18',
    updatedAt: '2024-12-18',
    totalRecords: 5,
    views: 892,
    likes: 67,
    comments: 15,
    isLiked: true,
    feedingRecords: [
      {
        id: 'record-4',
        productName: '로얄캐닌 페르시안 어덜트',
        category: '사료',
        brand: '로얄캐닌',
        startDate: '2024-10-01',
        status: '급여중',
        duration: '2개월 18일',
        palatability: 5,
        satisfaction: 5,
        repurchaseIntent: true,
        comment: '페르시안 고양이 전용 사료라서 그런지 우리 모모가 정말 잘 먹어요! 털도 더 윤기나고 소화도 잘 되는 것 같아요.',
        price: '45,000원 (2kg)',
        purchaseLocation: '동물병원',
        benefits: ['페르시안 전용', '장모종 케어', '소화 잘됨', '털 윤기']
      }
    ]
  },
  {
    id: 'post-3',
    petName: '코코',
    petBreed: '래브라도 리트리버',
    petAge: '4세',
    petWeight: '32kg',
    ownerName: '이수진',
    ownerId: 'owner-3',
    ownerAvatar: '👩‍🦰',
    petAvatar: '🐕',
    petSpecies: 'dog',
    createdAt: '2024-12-16',
    updatedAt: '2024-12-16',
    totalRecords: 6,
    views: 743,
    likes: 52,
    comments: 18,
    isLiked: false,
    feedingRecords: [
      {
        id: 'record-5',
        productName: '덴탈츄 대형견용',
        category: '간식',
        brand: '그린리스',
        startDate: '2024-11-01',
        status: '급여중',
        duration: '1개월 16일',
        palatability: 5,
        satisfaction: 4,
        repurchaseIntent: true,
        comment: '치아 건강을 위해 구매했는데 코코가 너무 좋아해요! 씹는 재미도 있고 실제로 치석도 줄어든 것 같습니다.',
        price: '18,000원 (300g)',
        purchaseLocation: '펫샵',
        benefits: ['치아 건강', '치석 제거', '기호성 우수'],
        sideEffects: ['조금 딱딱함']
      }
    ]
  },
  {
    id: 'post-4',
    petName: '루이',
    petBreed: '시바견',
    petAge: '2세',
    petWeight: '8.5kg',
    ownerName: '박민수',
    ownerId: 'owner-4',
    ownerAvatar: '👨‍🎓',
    petAvatar: '🐕',
    petSpecies: 'dog',
    createdAt: '2024-01-10',
    updatedAt: '2024-01-18',
    totalRecords: 4,
    views: 456,
    likes: 34,
    comments: 12,
    isLiked: false,
    feedingRecords: [
      {
        id: 'record-6',
        productName: '오리젠 오리지널',
        category: '사료',
        brand: '오리젠',
        startDate: '2024-01-05',
        status: '급여중',
        duration: '13일',
        palatability: 5,
        satisfaction: 5,
        repurchaseIntent: true,
        comment: '고품질 원료로 만든 사료라서 믿고 급여하고 있어요. 루이가 정말 잘 먹어요!',
        price: '120,000원 (11.4kg)',
        purchaseLocation: '온라인 펫샵',
        benefits: ['고품질 원료', '기호성 우수', '털 윤기', '소화 잘됨']
      }
    ]
  },
  {
    id: 'post-5',
    petName: '나비',
    petBreed: '러시안 블루',
    petAge: '5세',
    petWeight: '3.8kg',
    ownerName: '이지영',
    ownerId: 'owner-5',
    ownerAvatar: '👩‍💻',
    petAvatar: '🐱',
    petSpecies: 'cat',
    createdAt: '2024-01-08',
    updatedAt: '2024-01-15',
    totalRecords: 6,
    views: 678,
    likes: 45,
    comments: 8,
    isLiked: false,
    feedingRecords: [
      {
        id: 'record-7',
        productName: '아카나 그라스랜드',
        category: '사료',
        brand: '아카나',
        startDate: '2023-12-20',
        status: '급여중',
        duration: '29일',
        palatability: 4,
        satisfaction: 4,
        repurchaseIntent: true,
        comment: '러시안 블루 고양이에게 딱 맞는 사료인 것 같아요. 털도 부드러워졌어요.',
        price: '85,000원 (5.4kg)',
        purchaseLocation: '펫샵',
        benefits: ['털 윤기', '소화 잘됨', '기호성 좋음']
      }
    ]
  },
  {
    id: 'post-6',
    petName: '멍멍이',
    petBreed: '포메라니안',
    petAge: '1세',
    petWeight: '2.1kg',
    ownerName: '최수진',
    ownerId: 'owner-6',
    ownerAvatar: '👩‍🎨',
    petAvatar: '🐕',
    petSpecies: 'dog',
    createdAt: '2024-01-12',
    updatedAt: '2024-01-19',
    totalRecords: 3,
    views: 234,
    likes: 28,
    comments: 5,
    isLiked: false,
    feedingRecords: [
      {
        id: 'record-8',
        productName: '로얄캐닌 포메라니안 퍼피',
        category: '사료',
        brand: '로얄캐닌',
        startDate: '2024-01-01',
        status: '급여중',
        duration: '19일',
        palatability: 5,
        satisfaction: 5,
        repurchaseIntent: true,
        comment: '강아지 전용 사료라서 그런지 정말 잘 먹어요! 성장에도 도움이 될 것 같아요.',
        price: '65,000원 (3kg)',
        purchaseLocation: '동물병원',
        benefits: ['강아지 전용', '성장 도움', '기호성 우수', '소화 잘됨']
      }
    ]
  },
  {
    id: 'post-7',
    petName: '야옹이',
    petBreed: '코리안 숏헤어',
    petAge: '4세',
    petWeight: '4.5kg',
    ownerName: '정현우',
    ownerId: 'owner-7',
    ownerAvatar: '👨‍🔬',
    petAvatar: '🐱',
    petSpecies: 'cat',
    createdAt: '2024-01-05',
    updatedAt: '2024-01-17',
    totalRecords: 7,
    views: 567,
    likes: 41,
    comments: 15,
    isLiked: false,
    feedingRecords: [
      {
        id: 'record-9',
        productName: '힐스 프리스크립션 다이어트',
        category: '사료',
        brand: '힐스',
        startDate: '2023-11-15',
        status: '급여중',
        duration: '2개월 4일',
        palatability: 3,
        satisfaction: 4,
        repurchaseIntent: true,
        comment: '다이어트용 사료라서 맛은 조금 아쉽지만, 체중 관리에는 효과가 있어요.',
        price: '95,000원 (5kg)',
        purchaseLocation: '동물병원',
        benefits: ['체중 관리', '다이어트 효과', '소화 잘됨'],
        sideEffects: ['기호성 보통']
      }
    ]
  },
  {
    id: 'post-8',
    petName: '바둑이',
    petBreed: '진돗개',
    petAge: '6세',
    petWeight: '25kg',
    ownerName: '김철수',
    ownerId: 'owner-8',
    ownerAvatar: '👨‍🌾',
    petAvatar: '🐕',
    petSpecies: 'dog',
    createdAt: '2024-01-03',
    updatedAt: '2024-01-16',
    totalRecords: 5,
    views: 789,
    likes: 67,
    comments: 22,
    isLiked: false,
    feedingRecords: [
      {
        id: 'record-10',
        productName: '네츄럴발란스 리미티드 인그리디언트',
        category: '사료',
        brand: '네츄럴발란스',
        startDate: '2023-12-01',
        status: '급여중',
        duration: '1개월 16일',
        palatability: 4,
        satisfaction: 4,
        repurchaseIntent: true,
        comment: '한국 토종견인 바둑이에게 딱 맞는 사료인 것 같아요. 건강해 보여요!',
        price: '75,000원 (12kg)',
        purchaseLocation: '온라인 펫샵',
        benefits: ['한국 토종견용', '건강 증진', '기호성 좋음', '소화 잘됨']
      }
    ]
  },
  {
    id: 'post-9',
    petName: '초코',
    petBreed: '비글',
    petAge: '3세',
    petWeight: '12kg',
    ownerName: '한소희',
    ownerId: 'owner-9',
    ownerAvatar: '👩‍⚕️',
    petAvatar: '🐕',
    petSpecies: 'dog',
    createdAt: '2024-01-20',
    updatedAt: '2024-01-22',
    totalRecords: 5,
    views: 623,
    likes: 51,
    comments: 14,
    isLiked: false,
    feedingRecords: [
      {
        id: 'record-11',
        productName: '퍼피나스 그레인프리',
        category: '사료',
        brand: '퍼피나스',
        startDate: '2024-01-10',
        status: '급여중',
        duration: '12일',
        palatability: 5,
        satisfaction: 4.5,
        repurchaseIntent: true,
        comment: '그레인프리라서 알레르기가 있는 우리 초코에게 완벽해요! 식이 섬유도 풍부해서 소화도 잘 되고 있어요.',
        price: '98,000원 (10kg)',
        purchaseLocation: '온라인 펫샵',
        benefits: ['그레인프리', '알레르기 대응', '소화 개선', '기호성 우수']
      }
    ]
  },
  {
    id: 'post-10',
    petName: '토끼',
    petBreed: '먼치킨',
    petAge: '2세',
    petWeight: '3.2kg',
    ownerName: '서민지',
    ownerId: 'owner-10',
    ownerAvatar: '👩‍🏫',
    petAvatar: '🐱',
    petSpecies: 'cat',
    createdAt: '2024-01-18',
    updatedAt: '2024-01-21',
    totalRecords: 4,
    views: 412,
    likes: 38,
    comments: 9,
    isLiked: false,
    feedingRecords: [
      {
        id: 'record-12',
        productName: '캣챠 프리미엄',
        category: '사료',
        brand: '캣챠',
        startDate: '2024-01-05',
        status: '급여중',
        duration: '16일',
        palatability: 4.5,
        satisfaction: 4.5,
        repurchaseIntent: true,
        comment: '먼치킨 고양이의 건강을 위해 선택했어요. 작은 알갱이라 먹기도 편하고 소화도 잘 되는 것 같아요.',
        price: '52,000원 (3kg)',
        purchaseLocation: '펫샵',
        benefits: ['작은 알갱이', '소화 개선', '기호성 좋음', '건강 증진']
      }
    ]
  }
]

// 유틸리티 함수들
const getCategoryText = (category: ProductCategory) => {
  switch (category) {
    case '사료': return '사료'
    case '간식': return '간식'
    case '영양제': return '영양제'
    case '화장실': return '화장실'
    default: return '기타'
  }
}

const getStatusText = (status: FeedingStatus) => {
  switch (status) {
    case '급여중': return '급여중'
    case '급여완료': return '급여완료'
    case '급여중지': return '급여중지'
    default: return '상태불명'
  }
}

const renderStars = (rating: number) => {
  return Array.from({ length: 5 }, (_, i) => (
    <Star
      key={i}
      className={`h-4 w-4 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
    />
  ))
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = Math.abs(now.getTime() - date.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 1) return '오늘'
  if (diffDays === 2) return '어제'
  if (diffDays <= 7) return `${diffDays - 1}일 전`
  return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' })
}

// 포스트의 주요 급여 기록 추출 (급여중 > 급여중지 > 급여완료 순)
const getMainFeedingRecord = (post: DetailedPetLogPost): FeedingRecord | null => {
  if (post.feedingRecords.length === 0) return null
  
  // 우선순위: 급여중 > 급여중지 > 급여완료
  const ongoing = post.feedingRecords.filter(record => record.status === '급여중')
  if (ongoing.length > 0) {
    return ongoing.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
  }
  
  const stopped = post.feedingRecords.filter(record => record.status === '급여중지')
  if (stopped.length > 0) {
    return stopped.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
  }
  
  return post.feedingRecords.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())[0]
}

// 평균 평점 계산
const getAverageRating = (records: FeedingRecord[], type: 'palatability' | 'satisfaction') => {
  if (records.length === 0) return 0
  const sum = records.reduce((acc, record) => acc + record[type], 0)
  return Math.round((sum / records.length) * 10) / 10
}

export default function PetLogPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  // 로그인 상태 관리 - NextAuth 세션 사용
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated'
  const [selectedSpecies, setSelectedSpecies] = useState<string>('all')
  const [displayedPostsCount, setDisplayedPostsCount] = useState(4)
  const [bookmarkedPosts, setBookmarkedPosts] = useState<Set<string>>(new Set())
  const [sortBy, setSortBy] = useState<'likes' | 'updated' | 'created'>('likes')
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set())
  const [allPosts, setAllPosts] = useState<DetailedPetLogPost[]>([])

  // 로컬 스토리지에서 저장된 포스트 불러오기
  useEffect(() => {
    try {
      const savedPosts = JSON.parse(localStorage.getItem('petLogPosts') || '[]')
      // 로컬 스토리지의 포스트와 mock 데이터 병합
      const mergedPosts = [...savedPosts, ...detailedPosts]
      setAllPosts(mergedPosts)
    } catch (error) {
      console.error('포스트 로드 중 오류:', error)
      // 오류 발생 시 mock 데이터만 사용
      setAllPosts(detailedPosts)
    }
  }, [])

  // 필터링된 포스트들
  const filteredPosts = (allPosts.length > 0 ? allPosts : detailedPosts).filter(post => {
    const mainRecord = getMainFeedingRecord(post)
    const matchesSearch = 
      post.petName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mainRecord && mainRecord.productName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      post.feedingRecords.some(record => 
        record.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        record.brand.toLowerCase().includes(searchTerm.toLowerCase())
      )
    
    const matchesCategory = selectedCategory === 'all' || 
      post.feedingRecords.some(record => record.category === selectedCategory)
    
    const matchesSpecies = selectedSpecies === 'all' || post.petSpecies === selectedSpecies
    
    return matchesSearch && matchesCategory && matchesSpecies
  }).sort((a, b) => {
    if (sortBy === 'likes') return b.likes - a.likes
    if (sortBy === 'updated') return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  })

  
  // 표시할 포스트들 (더보기 버튼용)
  const displayedPosts = filteredPosts.slice(0, displayedPostsCount)
  const hasMorePosts = filteredPosts.length > displayedPostsCount
  
  // 더보기 버튼 클릭 시 10개씩 추가
  const handleLoadMore = () => {
    setDisplayedPostsCount(prev => prev + 10)
  }
  
  // 필터나 검색 변경 시 표시 개수 리셋
  useEffect(() => {
    setDisplayedPostsCount(4)
  }, [searchTerm, selectedCategory, selectedSpecies, sortBy])

  // 즐겨찾기 토글 함수
  const handleBookmarkToggle = (postId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    
    setBookmarkedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  // 후기 텍스트 더보기/접기 토글 함수
  const handleCommentToggle = (postId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setExpandedComments(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  // 텍스트가 클램프가 필요한지 확인하는 함수 (대략 3줄 기준)
  const needsClamp = (text: string): boolean => {
    return text.length > 80 // 대략 3줄 기준
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg">
              <BookOpen className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">
              펫 로그 커뮤니티
            </h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            다른 반려집사들의 급여 경험을 둘러보고 나만의 기록도 남겨보세요
          </p>
        </div>
        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 mb-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <Search className="w-5 h-5 text-white" />
              </div>
              <h2 className="text-xl font-bold text-gray-900">급여 기록 찾기</h2>
            </div>
            <div className="flex items-center gap-2 sm:gap-3">
              <Link
                href="/pet-log/pets"
                className="px-3 sm:px-4 py-2.5 sm:py-3 bg-white hover:bg-gray-50 text-gray-700 rounded-xl font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 shadow-sm hover:shadow-md border border-gray-200 whitespace-nowrap text-sm sm:text-base h-[44px] sm:h-auto"
              >
                <PawPrint className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span>내 반려동물</span>
              </Link>
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    window.location.href = '/pet-log/posts/write'
                  } else {
                    setShowLoginModal(true)
                  }
                }}
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold flex items-center justify-center gap-1.5 sm:gap-2 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 whitespace-nowrap text-sm sm:text-base h-[44px] sm:h-auto flex-1 sm:flex-initial"
              >
                <Plus className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="hidden sm:inline">급여 기록 공유하기</span>
                <span className="sm:inline">공유하기</span>
              </button>
            </div>
          </div>
          
          <div className="flex flex-col gap-6">
            <div className="w-full">
              <div className="relative flex">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5 z-10" />
                <input
                  type="text"
                  placeholder="제품명, 집사명으로 검색"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value)
                  }}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      // 엔터키로 검색 실행 (이미 실시간 검색이므로 추가 동작 없음)
                    }
                  }}
                  className="pl-12 pr-20 py-4 w-full border-2 border-gray-200 rounded-l-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 text-base sm:text-lg placeholder:text-gray-400"
                />
                <button
                  onClick={() => {
                    // 검색 실행 (이미 실시간 검색이므로 현재 상태 유지)
                  }}
                  className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-r-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2 whitespace-nowrap"
                >
                  <Search className="h-5 w-5" />
                  검색
                </button>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value)
                }}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 flex-1 text-lg"
              >
                <option value="all">전체 카테고리</option>
                <option value="사료">🍽️ 사료</option>
                <option value="간식">🦴 간식</option>
                <option value="영양제">💊 영양제</option>
                <option value="화장실">🚽 화장실</option>
              </select>
              <select
                value={selectedSpecies}
                onChange={(e) => {
                  setSelectedSpecies(e.target.value)
                }}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 flex-1 text-lg"
              >
                <option value="all">전체 반려동물</option>
                <option value="dog">🐕 강아지</option>
                <option value="cat">🐱 고양이</option>
              </select>
              <select
                value={sortBy}
                onChange={(e) => {
                  const v = e.target.value as 'likes' | 'updated' | 'created'
                  setSortBy(v)
                }}
                className="px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 flex-1 text-lg"
              >
                <option value="likes">추천순</option>
                <option value="updated">최신 등록 순</option>
                <option value="created">신규 등록 순</option>
              </select>
            </div>
          </div>
        </div>

        {/* All Posts */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {searchTerm || selectedCategory !== 'all' || selectedSpecies !== 'all' ? '검색 결과' : '모든 급여 후기'}
              </h2>
              <p className="text-sm text-gray-500">
                {searchTerm || selectedCategory !== 'all' || selectedSpecies !== 'all' 
                  ? `총 ${filteredPosts.length}개의 급여 기록을 찾았습니다` 
                  : `${sortBy === 'likes' ? '추천순' : sortBy === 'updated' ? '최신 등록 순' : '신규 등록 순'}으로 정렬됨`
                }
              </p>
            </div>
          </div>

          {/* No Results Message */}
          {filteredPosts.length === 0 && (searchTerm || selectedCategory !== 'all' || selectedSpecies !== 'all') && (
            <div className="text-center py-12 bg-white rounded-2xl shadow-xl border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">검색 결과가 없습니다</h3>
              <p className="text-gray-600 mb-6">
                다른 검색어나 필터를 사용해보세요
              </p>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setSelectedCategory('all')
                  setSelectedSpecies('all')
                }}
                className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                필터 초기화
              </button>
            </div>
          )}

          {/* Posts List - Only show if there are results */}
          {filteredPosts.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
              {displayedPosts.map((post) => {
              const mainRecord = getMainFeedingRecord(post)
              const avgPalatability = getAverageRating(post.feedingRecords, 'palatability')
              const avgSatisfaction = getAverageRating(post.feedingRecords, 'satisfaction')
              
              return (
                <Link key={post.id} href={`/pet-log/posts/${post.id}`} className="block h-full">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300 cursor-pointer overflow-hidden h-full flex flex-col min-h-[350px]">
                    <div className="flex flex-col md:flex-row flex-1 h-full">
                      {/* Pet Image - Left Side */}
                      <div className="w-full md:w-48 flex-shrink-0 bg-[#E8E8F8] flex items-center justify-center p-4">
                        <div className="text-9xl bg-white rounded-xl p-4 shadow-sm">
                          {post.petAvatar}
                        </div>
                      </div>
                      
                      {/* Content - Right Side */}
                      <div className="flex-1 p-6 flex flex-col h-full">
                        {/* Main Title - Product Name */}
                        <div className="mb-3">
                          <h2 className="text-xl font-bold text-gray-900 mb-1 line-clamp-2">
                            {mainRecord?.productName || '급여 기록'}
                          </h2>
                          <p className="text-xs text-gray-500">
                            업데이트: {formatDate(post.updatedAt)}
                          </p>
                        </div>
                        
                        {/* Satisfaction Rating */}
                        <div className="mb-3">
                          <div className="flex items-center space-x-1">
                            {mainRecord ? renderStars(Math.round(avgSatisfaction)) : renderStars(0)}
                            <span className="ml-2 text-base font-bold text-gray-900">
                              {avgSatisfaction.toFixed(1)}
                            </span>
                          </div>
                        </div>
                        
                        {/* Feeding Review Text - In Gray Box */}
                        <div className="mb-4">
                          {mainRecord?.comment ? (
                            <div className="bg-gray-100 rounded-lg p-3">
                              <p 
                                className={`text-sm text-gray-700 leading-relaxed ${
                                  expandedComments.has(post.id) || !needsClamp(mainRecord.comment)
                                    ? '' 
                                    : 'line-clamp-3'
                                }`}
                                style={{
                                  minHeight: '48px',
                                  maxHeight: expandedComments.has(post.id) ? 'none' : '72px',
                                  overflow: expandedComments.has(post.id) ? 'visible' : 'hidden'
                                }}
                              >
                                {mainRecord.comment}
                              </p>
                              {needsClamp(mainRecord.comment) && (
                                <button
                                  onClick={(e) => handleCommentToggle(post.id, e)}
                                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
                                >
                                  {expandedComments.has(post.id) ? '접기' : '더보기'}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="bg-gray-100 rounded-lg p-3 h-[72px] flex items-center">
                              <p className="text-sm text-gray-400 italic">급여 후기가 없습니다.</p>
                            </div>
                          )}
                        </div>
                        
                        {/* Metadata Tags */}
                        <div className="flex flex-wrap gap-2 mb-3">
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-400 rounded-full text-black shadow-sm">
                            <User className="h-3.5 w-3.5" />
                            <span className="text-xs font-semibold">
                              나이 {post.petAge}{post.petSpecies === 'dog' ? '(강아지)' : '(고양이)'}
                            </span>
                          </div>
                          {mainRecord && (
                            <div className="flex items-center gap-1 px-3 py-1.5 bg-yellow-400 rounded-full text-black shadow-sm">
                              <Calendar className="h-3.5 w-3.5" />
                              <span className="text-xs font-semibold">
                                급여 {mainRecord.duration}
                              </span>
                            </div>
                          )}
                        </div>
                        
                        {/* Engagement Metrics */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                            <Eye className="h-3.5 w-3.5 text-gray-600" />
                            <span className="text-xs text-gray-700">
                              {post.views.toLocaleString()} 조회
                            </span>
                          </div>
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                            <ThumbsUp className="h-3.5 w-3.5 text-gray-600" />
                            <span className="text-xs text-gray-700">
                              추천 {post.likes}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200">
                            <MessageCircle className="h-3.5 w-3.5 text-gray-600" />
                            <span className="text-xs text-gray-700">
                              댓글 {post.comments}
                            </span>
                          </div>
                        </div>
                        
                        {/* Action Button */}
                        <div className="mt-auto">
                          <button className="w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors">
                            <span>자세히 보기</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              )
            })}
            </div>
          )}

          {/* 더보기 버튼 */}
          {filteredPosts.length > 0 && hasMorePosts && (
            <div className="flex items-center justify-center mt-8">
              <button
                onClick={handleLoadMore}
                className="px-8 py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex items-center gap-2"
              >
                <span>더보기</span>
                <TrendingUp className="h-5 w-5" />
              </button>
            </div>
          )}
          
          {/* 모든 포스트를 본 경우 메시지 */}
          {filteredPosts.length > 0 && !hasMorePosts && displayedPosts.length > 4 && (
            <div className="text-center py-6 mt-4">
              <p className="text-gray-500 text-sm">
                모든 급여 후기를 확인했습니다. ({filteredPosts.length}개)
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-purple-100 mb-4">
                <User className="h-6 w-6 text-purple-600" />
              </div>
              
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                로그인이 필요합니다
              </h3>
              
              <p className="text-sm text-gray-600 mb-6">
                급여 기록을 공유하려면 먼저 로그인해주세요.<br />
                로그인 후에 다양한 기능을 이용할 수 있습니다.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-lg hover:bg-purple-700 transition-colors"
                >
                  로그인하기
                </Link>
                
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="inline-flex items-center justify-center px-4 py-2 bg-gray-100 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-200 transition-colors"
                >
                  취소
                </button>
              </div>
              
              <p className="text-xs text-gray-500 mt-4">
                아직 계정이 없으신가요? 
                <Link href="/signup" className="text-purple-600 hover:text-purple-700 ml-1">
                  회원가입
                </Link>
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
