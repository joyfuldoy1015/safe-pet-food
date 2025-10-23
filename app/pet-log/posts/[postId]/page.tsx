'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Star, Heart, MessageCircle, Calendar, Award, Send, User, Reply, ThumbsUp } from 'lucide-react'
import { useState } from 'react'

// 제품 카테고리 타입
type ProductCategory = '사료' | '간식' | '영양제' | '화장실'

// 급여 상태 타입
type FeedingStatus = '급여중' | '급여완료' | '급여중지'

// 댓글 인터페이스
interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  likes: number
  replies: Reply[]
  isLiked: boolean
}

// 답글 인터페이스
interface Reply {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  createdAt: string
  likes: number
  isLiked: boolean
}

// 급여 기록 인터페이스
interface FeedingRecord {
  id: string
  productName: string
  category: ProductCategory
  brand: string
  startDate: string
  endDate?: string
  status: FeedingStatus
  duration: string // "3개월", "1년 2개월" 등
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

// 펫 로그 포스트 인터페이스
interface DetailedPetLogPost {
  id: string
  petName: string
  petBreed: string
  petAge: string
  petWeight: string
  ownerName: string
  ownerId: string
  createdAt: string
  updatedAt: string
  totalRecords: number
  feedingRecords: FeedingRecord[]
  comments: Comment[]
  totalComments: number
}

// Mock data for detailed pet log posts
const mockDetailedPosts: Record<string, DetailedPetLogPost> = {
  'post-1': {
    id: 'post-1',
    petName: '뽀미',
    petBreed: '골든 리트리버',
    petAge: '3세',
    petWeight: '28kg',
    ownerName: '김집사',
    ownerId: 'owner-1',
    createdAt: '2024-01-15',
    updatedAt: '2024-01-20',
    totalRecords: 9,
    feedingRecords: [
      // 사료
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
      // 간식
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
      },
      {
        id: 'record-4',
        productName: '덴탈케어 껌',
        category: '간식',
        brand: '그린리스',
        startDate: '2023-12-01',
        endDate: '2024-01-05',
        status: '급여완료',
        duration: '1개월 5일',
        palatability: 3,
        satisfaction: 4,
        repurchaseIntent: false,
        comment: '치석 제거에는 도움이 되는 것 같은데 너무 딱딱해서 잘 안 먹어요.',
        price: '25,000원 (30개)',
        purchaseLocation: '온라인',
        benefits: ['치석 제거'],
        sideEffects: ['기호성 낮음']
      },
      {
        id: 'record-9',
        productName: '프리미엄 육포 간식',
        category: '간식',
        brand: '네이처스',
        startDate: '2023-12-15',
        endDate: '2023-12-25',
        status: '급여중지',
        duration: '10일',
        palatability: 2,
        satisfaction: 1,
        repurchaseIntent: false,
        comment: '처음엔 잘 먹었는데 갑자기 설사를 해서 중단했어요. 아마 소화가 안 되는 것 같아요.',
        price: '18,000원 (150g)',
        purchaseLocation: '펫마트',
        benefits: [],
        sideEffects: ['설사', '소화불량']
      },
      // 영양제
      {
        id: 'record-5',
        productName: '관절 건강 글루코사민',
        category: '영양제',
        brand: '뉴트리벳',
        startDate: '2023-11-01',
        status: '급여중',
        duration: '2개월 20일',
        palatability: 4,
        satisfaction: 5,
        repurchaseIntent: true,
        comment: '대형견이라 관절 건강이 걱정되어 시작했어요. 활동량이 늘어난 것 같아요.',
        price: '45,000원 (60정)',
        purchaseLocation: '동물병원',
        benefits: ['관절 건강', '활동량 증가']
      },
      {
        id: 'record-6',
        productName: '오메가3 피쉬오일',
        category: '영양제',
        brand: '펫헬스',
        startDate: '2023-08-01',
        endDate: '2023-10-31',
        status: '급여완료',
        duration: '3개월',
        palatability: 2,
        satisfaction: 4,
        repurchaseIntent: false,
        comment: '털 윤기에는 도움이 되었지만 비린내 때문에 잘 안 먹으려고 해요.',
        price: '35,000원 (90정)',
        purchaseLocation: '온라인',
        benefits: ['털 윤기 개선'],
        sideEffects: ['비린내', '기호성 낮음']
      },
      // 화장실
      {
        id: 'record-7',
        productName: '벤토나이트 고양이모래',
        category: '화장실',
        brand: '에버클린',
        startDate: '2024-01-01',
        status: '급여중',
        duration: '20일',
        palatability: 5, // 화장실 용품의 경우 사용성으로 대체
        satisfaction: 4,
        repurchaseIntent: true,
        comment: '응고력이 좋고 냄새 차단도 잘 되네요. 먼지가 조금 있지만 만족해요.',
        price: '18,000원 (10L)',
        purchaseLocation: '대형마트',
        benefits: ['응고력 우수', '냄새 차단']
      },
      {
        id: 'record-8',
        productName: '두부 모래',
        category: '화장실',
        brand: '네이처코어',
        startDate: '2023-09-01',
        endDate: '2023-12-31',
        status: '급여완료',
        duration: '4개월',
        palatability: 3,
        satisfaction: 3,
        repurchaseIntent: false,
        comment: '친환경이라 좋긴 한데 응고력이 아쉽고 자주 갈아줘야 해요.',
        price: '22,000원 (7L)',
        purchaseLocation: '펫샵',
        benefits: ['친환경', '먼지 적음'],
        sideEffects: ['응고력 부족', '교체 빈도 높음']
      }
    ],
    comments: [
      {
        id: 'comment-1',
        userId: 'user-1',
        userName: '박집사',
        content: '우와 정말 자세하게 기록하셨네요! 저도 골든 리트리버 키우는데 로얄캐닌 어떠셨나요? 저희 아이는 알레르기가 있어서 고민이에요.',
        createdAt: '2024-01-21T10:30:00Z',
        likes: 3,
        isLiked: false,
        replies: [
          {
            id: 'reply-1',
            userId: 'owner-1',
            userName: '김집사',
            content: '로얄캐닌 정말 좋았어요! 알레르기가 있으시다면 수의사와 상담 후 처방식을 추천드려요. 저희 뽀미도 처음엔 알레르기 때문에 처방식부터 시작했거든요.',
            createdAt: '2024-01-21T14:20:00Z',
            likes: 2,
            isLiked: false
          }
        ]
      },
      {
        id: 'comment-2',
        userId: 'user-2',
        userName: '이집사',
        content: '영양제 정보 감사해요! 관절 건강 글루코사민 효과가 정말 있나요? 저희 13살 골든도 관절이 안좋아져서 고민중이에요.',
        createdAt: '2024-01-22T09:15:00Z',
        likes: 1,
        isLiked: false,
        replies: []
      },
      {
        id: 'comment-3',
        userId: 'user-3',
        userName: '최집사',
        content: '모래 후기도 도움이 되네요. 벤토나이트 모래 먼지 정말 많이 날리나요? 아이가 호흡기가 약해서 걱정이에요.',
        createdAt: '2024-01-22T16:45:00Z',
        likes: 0,
        isLiked: false,
        replies: []
      }
    ],
    totalComments: 6
  }
}

// 카테고리별 아이콘 및 색상
const categoryConfig = {
  '사료': { icon: '🥘', color: 'bg-blue-100 text-blue-800', bgColor: 'bg-blue-50' },
  '간식': { icon: '🦴', color: 'bg-green-100 text-green-800', bgColor: 'bg-green-50' },
  '영양제': { icon: '💊', color: 'bg-purple-100 text-purple-800', bgColor: 'bg-purple-50' },
  '화장실': { icon: '🚽', color: 'bg-orange-100 text-orange-800', bgColor: 'bg-orange-50' }
}

// 상태별 색상
const statusConfig = {
  '급여중': { color: 'bg-green-100 text-green-800', icon: '🟢' },
  '급여완료': { color: 'bg-gray-100 text-gray-800', icon: '⚫' },
  '급여중지': { color: 'bg-red-100 text-red-800', icon: '🔴' }
}

export default function PetLogPostDetail() {
  const params = useParams()
  const router = useRouter()
  const postId = params.postId as string

  const post = mockDetailedPosts[postId as keyof typeof mockDetailedPosts]
  
  // 댓글 관련 상태
  const [comments, setComments] = useState<Comment[]>(post?.comments || [])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  // 임시 로그인 상태 (실제로는 context나 auth 시스템에서 가져와야 함)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentUser, setCurrentUser] = useState<{id: string, name: string} | null>(null)

  // 댓글 작성 함수
  const handleSubmitComment = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    
    if (!newComment.trim()) return
    
    const comment: Comment = {
      id: `comment-${Date.now()}`,
      userId: currentUser?.id || 'temp-user',
      userName: currentUser?.name || '임시사용자',
      content: newComment,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false,
      replies: []
    }
    
    setComments([...comments, comment])
    setNewComment('')
  }

  // 답글 작성 함수
  const handleSubmitReply = (commentId: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    
    if (!replyContent.trim()) return
    
    const reply: Reply = {
      id: `reply-${Date.now()}`,
      userId: currentUser?.id || 'temp-user',
      userName: currentUser?.name || '임시사용자',
      content: replyContent,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
    }
    
    setComments(comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    ))
    
    setReplyContent('')
    setReplyingTo(null)
  }

  // 좋아요 토글 함수
  const handleToggleLike = (commentId: string, isReply: boolean = false, replyId?: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }

    if (isReply && replyId) {
      setComments(comments.map(comment => ({
        ...comment,
        replies: comment.replies.map(reply => 
          reply.id === replyId
            ? { 
                ...reply, 
                likes: reply.isLiked ? reply.likes - 1 : reply.likes + 1,
                isLiked: !reply.isLiked 
              }
            : reply
        )
      })))
    } else {
      setComments(comments.map(comment => 
        comment.id === commentId
          ? { 
              ...comment, 
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !comment.isLiked 
            }
          : comment
      ))
    }
  }

  // 로그인 페이지로 이동
  const handleLogin = () => {
    window.location.href = '/login'
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">게시글을 찾을 수 없습니다</h2>
          <Link href="/pet-log" className="text-blue-500 hover:text-blue-600">
            펫 로그로 돌아가기
          </Link>
        </div>
      </div>
    )
  }

  // 카테고리별로 기록 분류 및 정렬 (급여중 먼저, 그 다음 최신순)
  const categorizeAndSortRecords = (records: FeedingRecord[]) => {
    const categories: Record<ProductCategory, FeedingRecord[]> = {
      '사료': [],
      '간식': [],
      '영양제': [],
      '화장실': []
    }

    records.forEach(record => {
      categories[record.category].push(record)
    })

    // 각 카테고리별로 정렬 (급여중 먼저, 그 다음 시작일 최신순)
    Object.keys(categories).forEach(category => {
      categories[category as ProductCategory].sort((a, b) => {
        // 1. 급여중인 것을 먼저, 그 다음 급여중지, 마지막에 급여완료
        const statusOrder = { '급여중': 0, '급여중지': 1, '급여완료': 2 }
        const statusDiff = statusOrder[a.status] - statusOrder[b.status]
        if (statusDiff !== 0) return statusDiff
        
        // 2. 같은 상태면 시작일 최신순
        return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
      })
    })

    return categories
  }

  const categorizedRecords = categorizeAndSortRecords(post.feedingRecords)

  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="ml-1 text-sm text-gray-600">({rating}/5)</span>
      </div>
    )
  }

  const renderRecord = (record: FeedingRecord) => (
    <div key={record.id} className={`border border-gray-200 rounded-xl p-6 ${categoryConfig[record.category].bgColor}`}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-start mb-2">
            <span className="text-xl mr-2 flex-shrink-0">{categoryConfig[record.category].icon}</span>
            <h3 className="font-semibold text-gray-900 text-lg leading-tight break-words">{record.productName}</h3>
          </div>
          <p className="text-sm text-gray-600 mb-1">{record.brand}</p>
          {record.price && (
            <p className="text-sm text-gray-500">{record.price} · {record.purchaseLocation}</p>
          )}
        </div>
        <div className="flex flex-col items-end">
          <span className={`px-3 py-1 rounded-full text-xs font-medium mb-2 ${statusConfig[record.status].color}`}>
            {statusConfig[record.status].icon} {record.status}
          </span>
          <div className="flex items-center text-xs text-gray-500">
            <Clock className="h-3 w-3 mr-1" />
            {record.duration}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1 font-medium">급여 기간</p>
          <p className="text-sm font-semibold text-gray-900">
            {record.startDate} ~ {record.endDate || '현재'}
          </p>
        </div>
        <div className="bg-white/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-1 font-medium">재구매 의향</p>
          <div className="flex items-center">
            {record.repurchaseIntent ? (
              <span className="text-green-700 flex items-center font-medium">
                <Heart className="h-4 w-4 mr-1 fill-current" />
                있음
              </span>
            ) : (
              <span className="text-gray-600 flex items-center font-medium">
                <Heart className="h-4 w-4 mr-1" />
                없음
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="bg-white/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-2 font-medium">
            {record.category === '화장실' ? '사용성' : '기호성'}
          </p>
          <div className="flex items-center justify-between">
            {renderStars(record.palatability)}
            <span className="text-xs text-gray-600 ml-2">
              {record.palatability}/5점
            </span>
          </div>
        </div>
        <div className="bg-white/50 rounded-lg p-3">
          <p className="text-xs text-gray-500 mb-2 font-medium">만족도</p>
          <div className="flex items-center justify-between">
            {renderStars(record.satisfaction)}
            <span className="text-xs text-gray-600 ml-2">
              {record.satisfaction}/5점
            </span>
          </div>
        </div>
      </div>

      {(record.benefits && record.benefits.length > 0) && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">장점</p>
          <div className="flex flex-wrap gap-1">
            {record.benefits.map((benefit, index) => (
              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                ✓ {benefit}
              </span>
            ))}
          </div>
        </div>
      )}

      {(record.sideEffects && record.sideEffects.length > 0) && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-2">단점</p>
          <div className="flex flex-wrap gap-1">
            {record.sideEffects.map((effect, index) => (
              <span key={index} className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                ! {effect}
              </span>
            ))}
          </div>
        </div>
      )}

      {record.comment && (
        <div className="bg-white rounded-lg p-4 border border-gray-200">
          <div className="flex items-start">
            <MessageCircle className="h-4 w-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
            <p className="text-sm text-gray-700">{record.comment}</p>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Link
          href="/pet-log"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          돌아가기
        </Link>

        {/* Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
          <div className="md:flex md:items-start md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                {post.petName}의 급여 기록
              </h1>
              <div className="flex flex-col sm:flex-row sm:items-center text-sm text-gray-500 sm:space-x-6 space-y-1 sm:space-y-0">
                <span className="flex items-center">
                  🐕 {post.petBreed} · {post.petAge} · {post.petWeight}
                </span>
                <span className="flex items-center">
                  👤 {post.ownerName}
                </span>
                <span className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {post.updatedAt} 업데이트
                </span>
              </div>
            </div>
            
            {/* Desktop: 오른쪽에 표시 */}
            <div className="hidden md:flex items-center space-x-4">
              <div className="text-right">
                <div className="bg-blue-50 rounded-lg p-3">
                  <div className="text-2xl font-bold text-blue-600">{post.totalRecords}</div>
                  <div className="text-xs text-blue-600">총 기록</div>
                </div>
              </div>
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    window.location.href = '/pet-log/posts/write'
                  } else {
                    setShowLoginModal(true)
                  }
                }}
                className="flex items-center space-x-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                <Award className="h-4 w-4" />
                <span>내 경험 공유하기</span>
              </button>
            </div>
          </div>
          
          {/* Mobile: 아래쪽에 표시 (767px 이하) */}
          <div className="flex md:hidden items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div className="bg-blue-50 rounded-lg p-3">
              <div className="text-xl font-bold text-blue-600">{post.totalRecords}</div>
              <div className="text-xs text-blue-600">총 기록</div>
            </div>
            <button
              onClick={() => {
                if (isLoggedIn) {
                  window.location.href = '/pet-log/posts/write'
                } else {
                  setShowLoginModal(true)
                }
              }}
              className="flex items-center space-x-2 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm min-h-[44px] touch-manipulation"
            >
              <Award className="h-5 w-5" />
              <span>내 경험 공유하기</span>
            </button>
          </div>
        </div>

        {/* Category Sections */}
        <div className="space-y-8">
          {(['사료', '간식', '영양제', '화장실'] as ProductCategory[]).map(category => {
            const records = categorizedRecords[category]
            if (records.length === 0) return null

            const activeCount = records.filter(r => r.status === '급여중').length
            const completedCount = records.filter(r => r.status === '급여완료').length

            return (
              <div key={category}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <span className="text-2xl mr-3">{categoryConfig[category].icon}</span>
                    <h2 className="text-2xl font-bold text-gray-900">{category}</h2>
                    <span className={`ml-3 px-3 py-1 rounded-full text-sm font-medium ${categoryConfig[category].color}`}>
                      {records.length}개 제품
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    {activeCount > 0 && <span className="text-green-600">사용중 {activeCount}개</span>}
                    {activeCount > 0 && completedCount > 0 && <span className="mx-2">·</span>}
                    {completedCount > 0 && <span>완료 {completedCount}개</span>}
                  </div>
                </div>
                
                <div className="space-y-4">
                  {records.map(renderRecord)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mt-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 flex items-center">
              <MessageCircle className="h-6 w-6 mr-2" />
              질문하기
              <span className="ml-2 px-2 py-1 bg-gray-100 text-gray-600 text-sm rounded-full">
                {comments.length + comments.reduce((sum, comment) => sum + comment.replies.length, 0)}
              </span>
            </h2>
            {isLoggedIn && (
              <div className="text-sm text-gray-500">
                {currentUser?.name}님으로 로그인됨
              </div>
            )}
          </div>

          {/* Comment Form */}
          <div className="mb-8">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
              </div>
              <div className="flex-1">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onFocus={() => {
                    console.log('Textarea focused, isLoggedIn:', isLoggedIn)
                    if (!isLoggedIn) {
                      console.log('Showing login modal')
                      setShowLoginModal(true)
                    }
                  }}
                  onClick={() => {
                    console.log('Textarea clicked, isLoggedIn:', isLoggedIn)
                    if (!isLoggedIn) {
                      console.log('Showing login modal')
                      setShowLoginModal(true)
                    }
                  }}
                  placeholder={isLoggedIn ? `${post.ownerName}님에게 질문해보세요...` : "로그인 후 질문할 수 있습니다."}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none cursor-pointer"
                  rows={3}
                  disabled={!isLoggedIn}
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    급여 경험이나 제품에 대해 궁금한 점을 물어보세요.
                  </p>
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || !isLoggedIn}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-lg text-sm font-medium transition-colors min-h-[44px] touch-manipulation ${
                      isLoggedIn && newComment.trim()
                        ? 'bg-blue-500 text-white hover:bg-blue-600 active:bg-blue-700'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="h-5 w-5" />
                    <span>질문하기</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-100 pb-6 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold text-gray-900">{comment.userName}</span>
                      {comment.userId === post.ownerId && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          작성자
                        </span>
                      )}
                      <span className="text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3">{comment.content}</p>
                    
                    <div className="flex items-center space-x-4">
                      <button
                        onClick={() => handleToggleLike(comment.id)}
                        className={`flex items-center space-x-1 text-sm transition-colors px-3 py-2 rounded-lg min-h-[36px] touch-manipulation ${
                          comment.isLiked 
                            ? 'text-blue-600 bg-blue-50 hover:bg-blue-100' 
                            : 'text-gray-500 hover:text-blue-600 hover:bg-gray-50'
                        }`}
                      >
                        <ThumbsUp className={`h-4 w-4 ${comment.isLiked ? 'fill-current' : ''}`} />
                        <span className="font-medium">{comment.likes}</span>
                      </button>
                      
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="flex items-center space-x-1 text-sm text-gray-500 hover:text-blue-600 hover:bg-gray-50 transition-colors px-3 py-2 rounded-lg min-h-[36px] touch-manipulation"
                      >
                        <Reply className="h-4 w-4" />
                        <span>답글</span>
                      </button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200">
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-3 w-3 text-gray-500" />
                            </div>
                          </div>
                          <div className="flex-1">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="답글을 작성하세요..."
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                              rows={2}
                            />
                            <div className="flex justify-end space-x-2 mt-2">
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700"
                              >
                                취소
                              </button>
                              <button
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={!replyContent.trim()}
                                className={`px-3 py-1 text-sm rounded transition-colors ${
                                  replyContent.trim()
                                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                                    : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                }`}
                              >
                                답글 작성
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Replies */}
                    {comment.replies.length > 0 && (
                      <div className="mt-4 pl-4 border-l-2 border-gray-200 space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                reply.userId === post.ownerId ? 'bg-green-100' : 'bg-gray-200'
                              }`}>
                                <User className={`h-3 w-3 ${
                                  reply.userId === post.ownerId ? 'text-green-600' : 'text-gray-500'
                                }`} />
                              </div>
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900 text-sm">{reply.userName}</span>
                                {reply.userId === post.ownerId && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                    작성자
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {new Date(reply.createdAt).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                              <p className="text-gray-700 text-sm mb-2">{reply.content}</p>
                              <button
                                onClick={() => handleToggleLike(comment.id, true, reply.id)}
                                className={`flex items-center space-x-1 text-xs transition-colors ${
                                  reply.isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                                }`}
                              >
                                <ThumbsUp className={`h-3 w-3 ${reply.isLiked ? 'fill-current' : ''}`} />
                                <span>{reply.likes}</span>
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Empty State */}
          {comments.length === 0 && (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">아직 질문이 없습니다.</p>
              <p className="text-sm text-gray-400">
                {post.ownerName}님에게 급여 경험에 대해 질문해보세요!
              </p>
            </div>
          )}
        </div>

        {/* Login Modal */}
        {console.log('showLoginModal state:', showLoginModal)}
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
                  댓글 작성, 좋아요, 경험 공유 등의 기능을 이용하려면<br />
                  먼저 로그인해주세요.
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
    </div>
  )
}