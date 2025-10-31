'use client'

import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Clock, Star, Heart, MessageCircle, Calendar, Award, Send, User, Reply, ThumbsUp, CheckCircle, XCircle } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

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

  const [post, setPost] = useState<DetailedPetLogPost | null>(mockDetailedPosts[postId as keyof typeof mockDetailedPosts] || null)

  // 로컬 스토리지에서 포스트 불러오기
  useEffect(() => {
    try {
      const savedPosts = JSON.parse(localStorage.getItem('petLogPosts') || '[]')
      const savedPost = savedPosts.find((p: any) => p.id === postId)
      
      if (savedPost) {
        // comments 필드 추가 (없을 경우 빈 배열)
        const formattedPost = {
          ...savedPost,
          comments: savedPost.comments || [],
          totalComments: savedPost.totalComments || (savedPost.comments?.length || 0)
        }
        setPost(formattedPost)
      } else if (mockDetailedPosts[postId as keyof typeof mockDetailedPosts]) {
        // mock 데이터에서 찾기
        setPost(mockDetailedPosts[postId as keyof typeof mockDetailedPosts])
      }
    } catch (error) {
      console.error('포스트 로드 중 오류:', error)
    }
  }, [postId])

  // post가 변경될 때 comments 초기화
  useEffect(() => {
    if (post) {
      setComments(post.comments || [])
    }
  }, [post])
  
  // 댓글 관련 상태
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [showLoginModal, setShowLoginModal] = useState(false)
  
  // 로그인 상태 관리 - NextAuth 세션 사용
  const { data: session, status } = useSession()
  const isLoggedIn = status === 'authenticated'
  const currentUser = session?.user ? {
    id: (session.user as any).id || session.user.email || 'unknown',
    name: session.user.name || session.user.email || '사용자'
  } : null

  // 댓글 작성 함수
  const handleSubmitComment = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    
    if (!newComment.trim() || !post) return
    
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
    
    const updatedComments = [...comments, comment]
    setComments(updatedComments)
    setNewComment('')
    
    // 로컬 스토리지에 저장
    try {
      const savedPosts = JSON.parse(localStorage.getItem('petLogPosts') || '[]')
      const postIndex = savedPosts.findIndex((p: any) => p.id === postId)
      
      if (postIndex !== -1) {
        // 저장된 포스트가 있는 경우 업데이트
        savedPosts[postIndex] = {
          ...savedPosts[postIndex],
          comments: updatedComments,
          totalComments: updatedComments.length
        }
        localStorage.setItem('petLogPosts', JSON.stringify(savedPosts))
      } else if (post) {
        // 저장된 포스트가 없는 경우 (mock 데이터) 새로 저장
        const updatedPost = {
          ...post,
          comments: updatedComments,
          totalComments: updatedComments.length
        }
        savedPosts.push(updatedPost)
        localStorage.setItem('petLogPosts', JSON.stringify(savedPosts))
      }
    } catch (error) {
      console.error('댓글 저장 중 오류:', error)
    }
  }

  // 답글 작성 함수
  const handleSubmitReply = (commentId: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }
    
    if (!replyContent.trim() || !post) return
    
    const reply: Reply = {
      id: `reply-${Date.now()}`,
      userId: currentUser?.id || 'temp-user',
      userName: currentUser?.name || '임시사용자',
      content: replyContent,
      createdAt: new Date().toISOString(),
      likes: 0,
      isLiked: false
    }
    
    const updatedComments = comments.map(comment => 
      comment.id === commentId 
        ? { ...comment, replies: [...comment.replies, reply] }
        : comment
    )
    
    setComments(updatedComments)
    setReplyContent('')
    setReplyingTo(null)
    
    // 로컬 스토리지에 저장
    try {
      const savedPosts = JSON.parse(localStorage.getItem('petLogPosts') || '[]')
      const postIndex = savedPosts.findIndex((p: any) => p.id === postId)
      
      if (postIndex !== -1) {
        // 저장된 포스트가 있는 경우 업데이트
        savedPosts[postIndex] = {
          ...savedPosts[postIndex],
          comments: updatedComments,
          totalComments: updatedComments.length
        }
        localStorage.setItem('petLogPosts', JSON.stringify(savedPosts))
      } else if (post) {
        // 저장된 포스트가 없는 경우 (mock 데이터) 새로 저장
        const updatedPost = {
          ...post,
          comments: updatedComments,
          totalComments: updatedComments.length
        }
        savedPosts.push(updatedPost)
        localStorage.setItem('petLogPosts', JSON.stringify(savedPosts))
      }
    } catch (error) {
      console.error('답글 저장 중 오류:', error)
    }
  }

  // 좋아요 토글 함수
  const handleToggleLike = (commentId: string, isReply: boolean = false, replyId?: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return
    }

    let updatedComments: Comment[]
    if (isReply && replyId) {
      updatedComments = comments.map(comment => ({
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
      }))
    } else {
      updatedComments = comments.map(comment => 
        comment.id === commentId
          ? { 
              ...comment, 
              likes: comment.isLiked ? comment.likes - 1 : comment.likes + 1,
              isLiked: !comment.isLiked 
            }
          : comment
      )
    }
    
    setComments(updatedComments)
    
    // 로컬 스토리지에 저장
    if (post) {
      try {
        const savedPosts = JSON.parse(localStorage.getItem('petLogPosts') || '[]')
        const postIndex = savedPosts.findIndex((p: any) => p.id === postId)
        
        if (postIndex !== -1) {
          savedPosts[postIndex] = {
            ...savedPosts[postIndex],
            comments: updatedComments
          }
          localStorage.setItem('petLogPosts', JSON.stringify(savedPosts))
        } else {
          const updatedPost = {
            ...post,
            comments: updatedComments
          }
          savedPosts.push(updatedPost)
          localStorage.setItem('petLogPosts', JSON.stringify(savedPosts))
        }
      } catch (error) {
        console.error('좋아요 저장 중 오류:', error)
      }
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
      <div className="flex items-center space-x-0.5 sm:space-x-1">
        {Array.from({ length: 5 }, (_, i) => (
          <Star
            key={i}
            className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
              i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const renderRecord = (record: FeedingRecord) => (
    <div key={record.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
      {/* Product Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-2">{record.productName}</h3>
          {record.brand && (
            <div className="flex flex-col gap-1 text-xs sm:text-sm text-gray-600">
              <span>{record.brand}</span>
              {record.price && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                  <span>{record.price}</span>
                  {record.purchaseLocation && (
                    <>
                      <span className="hidden sm:inline"> · </span>
                      <span>{record.purchaseLocation}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
          <span className={`px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap ${
            record.status === '급여중' ? 'bg-green-100 text-green-800 border border-green-200' :
            record.status === '급여완료' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
            'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {statusConfig[record.status].icon} {record.status}
          </span>
          <div className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 bg-gray-50 rounded-full border border-gray-200 whitespace-nowrap">
            <Clock className="h-3.5 w-3.5 text-gray-600" />
            <span className="text-xs text-gray-700">{record.duration}</span>
          </div>
        </div>
      </div>

      {/* Main Info Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* 급여 기간 */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1.5 sm:mb-2 font-medium">급여 기간</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 break-words">
            {record.startDate} ~ {record.endDate || '현재'}
          </p>
        </div>
        {/* 재구매 의향 */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1.5 sm:mb-2 font-medium">재구매 의향</p>
          <div className="flex items-center">
            {record.repurchaseIntent ? (
              <span className="text-green-700 flex items-center font-semibold text-sm sm:text-base">
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 fill-current" />
                있음
              </span>
            ) : (
              <span className="text-gray-600 flex items-center font-semibold text-sm sm:text-base">
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                없음
              </span>
            )}
          </div>
        </div>
        {/* 기호성 */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1.5 sm:mb-2 font-medium">
            {record.category === '화장실' ? '사용성' : '기호성'}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {renderStars(record.palatability)}
            <span className="text-sm sm:text-base font-semibold text-gray-900">
              {record.palatability}/5
            </span>
          </div>
        </div>
        {/* 만족도 */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1.5 sm:mb-2 font-medium">만족도</p>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {renderStars(record.satisfaction)}
            <span className="text-sm sm:text-base font-semibold text-gray-900">
              {record.satisfaction}/5
            </span>
          </div>
        </div>
      </div>

      {/* Benefits & Side Effects - 좌우 배치 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* 장점 */}
        {record.benefits && record.benefits.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="text-green-600 text-base sm:text-lg">👍</span>
              <h4 className="text-xs sm:text-sm font-semibold text-green-700">장점</h4>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {record.benefits.map((benefit, index) => (
                <span key={index} className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-green-100 text-green-800 text-xs rounded-full font-medium border border-green-200">
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* 단점 */}
        {record.sideEffects && record.sideEffects.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="text-red-600 text-base sm:text-lg">👎</span>
              <h4 className="text-xs sm:text-sm font-semibold text-red-700">단점</h4>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {record.sideEffects.map((effect, index) => (
                <span key={index} className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-red-100 text-red-800 text-xs rounded-full font-medium border border-red-200">
                  {effect}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comment Section */}
      {record.comment && (
        <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{record.comment}</p>
        </div>
      )}
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
        <Link
          href="/pet-log"
          className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-4 sm:mb-6 px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl hover:bg-white hover:shadow-sm transition-all duration-200 text-sm sm:text-base"
        >
          <ArrowLeft className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1.5 sm:mr-2" />
          돌아가기
        </Link>

        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 hover:shadow-2xl transition-all duration-300">
          {/* Desktop: 한 줄 레이아웃 */}
          <div className="hidden md:flex items-center justify-between gap-6">
            {/* Left Section: Pet Icon & Info */}
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <span className="text-2xl">🐕</span>
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {post.petName}의 급여 기록
                </h1>
                <div className="flex items-center gap-2 text-base text-gray-600">
                  <span>{post.petBreed}</span>
                  <span>•</span>
                  <span>{post.petAge}</span>
                  <span>•</span>
                  <span>{post.petWeight}</span>
                  <span>•</span>
                  <span className="font-semibold">{post.ownerName}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    <span>{post.updatedAt} 업데이트</span>
                  </span>
                </div>
              </div>
            </div>
            
            {/* Right Section: Stats & Action Button */}
            <div className="flex items-center gap-6 flex-shrink-0">
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 text-center">
                <div className="text-3xl font-bold text-blue-600 mb-1">{post.totalRecords}</div>
                <div className="text-sm font-semibold text-blue-600">총 기록</div>
              </div>
              <button
                onClick={() => {
                  if (isLoggedIn) {
                    window.location.href = '/pet-log/posts/write'
                  } else {
                    setShowLoginModal(true)
                  }
                }}
                className="flex items-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 flex-shrink-0"
              >
                <Award className="h-5 w-5" />
                <span className="text-base font-semibold whitespace-nowrap">내 경험 공유하기</span>
              </button>
            </div>
          </div>

          {/* Mobile/Tablet: 세로 레이아웃 */}
          <div className="flex md:hidden flex-col gap-3 sm:gap-4">
            {/* Top: Pet Icon & Info with Total Records */}
            <div className="flex items-start justify-between gap-2 sm:gap-3">
              <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                  <span className="text-lg sm:text-xl">🐕</span>
                </div>
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 mb-1.5 sm:mb-2 leading-tight">
                    {post.petName}의 급여 기록
                  </h1>
                  <div className="flex flex-col gap-1 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span className="whitespace-nowrap">{post.petBreed}</span>
                      <span className="text-gray-400">•</span>
                      <span className="whitespace-nowrap">{post.petAge}</span>
                      <span className="text-gray-400">•</span>
                      <span className="whitespace-nowrap">{post.petWeight}</span>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 flex-wrap">
                      <span className="font-semibold whitespace-nowrap">{post.ownerName}</span>
                      <span className="text-gray-400">•</span>
                      <span className="flex items-center gap-1 whitespace-nowrap">
                        <Calendar className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-gray-500" />
                        <span>{post.updatedAt} 업데이트</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              {/* 총 기록 박스 - 상단 오른쪽 */}
              <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-2.5 sm:p-3 border border-blue-200 text-center w-16 h-16 sm:w-20 sm:h-20 flex flex-col items-center justify-center flex-shrink-0">
                <div className="text-lg sm:text-xl font-bold text-blue-600 mb-0.5">{post.totalRecords}</div>
                <div className="text-xs font-semibold text-blue-600">총 기록</div>
              </div>
            </div>
            
            {/* Bottom: Action Button */}
            <button
              onClick={() => {
                if (isLoggedIn) {
                  window.location.href = '/pet-log/posts/write'
                } else {
                  setShowLoginModal(true)
                }
              }}
              className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm font-semibold justify-center w-full"
            >
              <Award className="h-4 w-4" />
              <span className="whitespace-nowrap">내 경험 공유하기</span>
            </button>
          </div>
        </div>

        {/* Category Sections */}
        <div className="space-y-6 sm:space-y-8">
          {(['사료', '간식', '영양제', '화장실'] as ProductCategory[]).map(category => {
            const records = categorizedRecords[category]
            if (records.length === 0) return null

            const activeCount = records.filter(r => r.status === '급여중').length
            const completedCount = records.filter(r => r.status === '급여완료').length

            return (
              <div key={category} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 hover:shadow-2xl transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex items-center gap-3 sm:gap-4">
                    <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0 ${
                      category === '사료' ? 'bg-gradient-to-r from-blue-500 to-purple-500' :
                      category === '간식' ? 'bg-gradient-to-r from-green-500 to-teal-500' :
                      category === '영양제' ? 'bg-gradient-to-r from-purple-500 to-pink-500' :
                      'bg-gradient-to-r from-orange-500 to-red-500'
                    }`}>
                      <span className="text-lg sm:text-xl">{categoryConfig[category].icon}</span>
                    </div>
                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold text-gray-900">{category}</h2>
                      <div className="flex items-center gap-2 mt-2 flex-wrap">
                        <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-50 text-gray-700 text-xs sm:text-sm rounded-full font-semibold border border-gray-200">
                          {records.length}개 제품
                        </span>
                        {activeCount > 0 && (
                          <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-green-100 text-green-800 text-xs sm:text-sm font-medium rounded-full border border-green-200">
                            사용중 {activeCount}개
                          </span>
                        )}
                        {completedCount > 0 && (
                          <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-100 text-gray-800 text-xs sm:text-sm font-medium rounded-full border border-gray-200">
                            완료 {completedCount}개
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 sm:space-y-6">
                  {records.map(renderRecord)}
                </div>
              </div>
            )
          })}
        </div>

        {/* Comments Section */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 md:p-8 mt-6 sm:mt-8 hover:shadow-2xl transition-all duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex items-center gap-3 sm:gap-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-green-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0">
                <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-gray-900">질문하기</h2>
                <div className="mt-2">
                  <span className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-gray-50 text-gray-700 text-xs sm:text-sm rounded-full font-semibold border border-gray-200">
                    {comments.length + comments.reduce((sum, comment) => sum + comment.replies.length, 0)}개 질문
                  </span>
                </div>
              </div>
            </div>
            {isLoggedIn && (
              <div className="text-xs sm:text-sm text-gray-500">
                {currentUser?.name}님으로 로그인됨
              </div>
            )}
          </div>

          {/* Comment Form */}
          <div className="mb-6 sm:mb-8">
            <div className="flex items-start space-x-2 sm:space-x-3">
              <div className="flex-shrink-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-500" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <textarea
                  value={newComment}
                  onChange={(e) => {
                    if (isLoggedIn) {
                      setNewComment(e.target.value)
                    }
                  }}
                  onFocus={(e) => {
                    if (!isLoggedIn) {
                      e.preventDefault()
                      setShowLoginModal(true)
                      e.currentTarget.blur()
                    }
                  }}
                  onClick={(e) => {
                    if (!isLoggedIn) {
                      e.preventDefault()
                      setShowLoginModal(true)
                      e.currentTarget.blur()
                    }
                  }}
                  onTouchStart={(e) => {
                    if (!isLoggedIn) {
                      e.preventDefault()
                      setShowLoginModal(true)
                    }
                  }}
                  placeholder={isLoggedIn ? `${post.ownerName}님에게 질문해보세요...` : "로그인 후 질문할 수 있습니다."}
                  className={`w-full px-3 sm:px-4 py-2.5 sm:py-3 border-2 border-gray-200 rounded-xl resize-none transition-all duration-200 text-sm sm:text-base ${
                    isLoggedIn 
                      ? 'focus:ring-2 focus:ring-blue-500 focus:border-blue-500 cursor-text' 
                      : 'cursor-pointer bg-gray-50'
                  }`}
                  rows={3}
                  readOnly={!isLoggedIn}
                />
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0 mt-2">
                  <p className="text-xs text-gray-500 hidden sm:block">
                    급여 경험이나 제품에 대해 궁금한 점을 물어보세요.
                  </p>
                  <button
                    onClick={handleSubmitComment}
                    disabled={!newComment.trim() || !isLoggedIn}
                    className={`flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 min-h-[40px] sm:min-h-[44px] touch-manipulation w-full sm:w-auto ${
                      isLoggedIn && newComment.trim()
                        ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    <Send className="h-4 w-4 sm:h-5 sm:w-5" />
                    <span>질문하기</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Comments List */}
          <div className="space-y-4 sm:space-y-6">
            {comments.map((comment) => (
              <div key={comment.id} className="border-b border-gray-100 pb-4 sm:pb-6 last:border-b-0">
                <div className="flex items-start space-x-2 sm:space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-7 h-7 sm:w-8 sm:h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                      <span className="font-semibold text-sm sm:text-base text-gray-900">{comment.userName}</span>
                      {comment.userId === post.ownerId && (
                        <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                          작성자
                        </span>
                      )}
                      <span className="text-xs sm:text-sm text-gray-500">
                        {new Date(comment.createdAt).toLocaleDateString('ko-KR')}
                      </span>
                    </div>
                    <p className="text-sm sm:text-base text-gray-700 mb-2 sm:mb-3 leading-relaxed break-words">{comment.content}</p>
                    
                    <div className="flex items-center gap-1.5 sm:gap-2">
                      <button
                        onClick={() => handleToggleLike(comment.id)}
                        className={`flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm transition-colors border min-h-[32px] sm:min-h-[36px] touch-manipulation ${
                          comment.isLiked 
                            ? 'text-blue-600 bg-blue-50 border-blue-200 hover:bg-blue-100' 
                            : 'text-gray-600 bg-gray-50 border-gray-200 hover:text-blue-600 hover:bg-gray-100'
                        }`}
                      >
                        <ThumbsUp className={`h-3 w-3 sm:h-3.5 sm:w-3.5 ${comment.isLiked ? 'fill-current' : ''}`} />
                        <span className="font-medium text-xs">{comment.likes}</span>
                      </button>
                      
                      <button
                        onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        className="flex items-center gap-1 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm text-gray-600 bg-gray-50 border border-gray-200 hover:text-blue-600 hover:bg-gray-100 transition-colors min-h-[32px] sm:min-h-[36px] touch-manipulation"
                      >
                        <Reply className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
                        <span className="text-xs">답글</span>
                      </button>
                    </div>

                    {/* Reply Form */}
                    {replyingTo === comment.id && (
                      <div className="mt-3 sm:mt-4 pl-2 sm:pl-4 border-l-2 border-gray-200">
                        <div className="flex items-start space-x-2 sm:space-x-3">
                          <div className="flex-shrink-0">
                            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-200 rounded-full flex items-center justify-center">
                              <User className="h-2.5 w-2.5 sm:h-3 sm:w-3 text-gray-500" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <textarea
                              value={replyContent}
                              onChange={(e) => setReplyContent(e.target.value)}
                              placeholder="답글을 작성하세요..."
                              className="w-full px-2.5 sm:px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-xs sm:text-sm"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2 mt-2">
                              <button
                                onClick={() => setReplyingTo(null)}
                                className="px-2.5 sm:px-3 py-1 text-xs sm:text-sm text-gray-500 hover:text-gray-700"
                              >
                                취소
                              </button>
                              <button
                                onClick={() => handleSubmitReply(comment.id)}
                                disabled={!replyContent.trim()}
                                className={`px-2.5 sm:px-3 py-1 text-xs sm:text-sm rounded transition-colors ${
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
                      <div className="mt-3 sm:mt-4 pl-2 sm:pl-4 border-l-2 border-gray-200 space-y-3 sm:space-y-4">
                        {comment.replies.map((reply) => (
                          <div key={reply.id} className="flex items-start space-x-2 sm:space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full flex items-center justify-center ${
                                reply.userId === post.ownerId ? 'bg-green-100' : 'bg-gray-200'
                              }`}>
                                <User className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${
                                  reply.userId === post.ownerId ? 'text-green-600' : 'text-gray-500'
                                }`} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1">
                                <span className="font-medium text-gray-900 text-xs sm:text-sm">{reply.userName}</span>
                                {reply.userId === post.ownerId && (
                                  <span className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                    작성자
                                  </span>
                                )}
                                <span className="text-xs text-gray-500">
                                  {new Date(reply.createdAt).toLocaleDateString('ko-KR')}
                                </span>
                              </div>
                              <p className="text-xs sm:text-sm text-gray-700 mb-1.5 sm:mb-2 leading-relaxed break-words">{reply.content}</p>
                              <button
                                onClick={() => handleToggleLike(comment.id, true, reply.id)}
                                className={`flex items-center gap-1 text-xs transition-colors ${
                                  reply.isLiked ? 'text-blue-600' : 'text-gray-500 hover:text-blue-600'
                                }`}
                              >
                                <ThumbsUp className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${reply.isLiked ? 'fill-current' : ''}`} />
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
            <div className="text-center py-6 sm:py-8">
              <MessageCircle className="h-10 w-10 sm:h-12 sm:w-12 text-gray-300 mx-auto mb-3 sm:mb-4" />
              <p className="text-sm sm:text-base text-gray-500 mb-2">아직 질문이 없습니다.</p>
              <p className="text-xs sm:text-sm text-gray-400">
                {post.ownerName}님에게 급여 경험에 대해 질문해보세요!
              </p>
            </div>
          )}
        </div>

        {/* Login Modal */}
        {showLoginModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 sm:h-16 sm:w-16 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 mb-4 sm:mb-6 shadow-lg">
                  <User className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
                </div>
                
                <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 sm:mb-4">
                  로그인이 필요합니다
                </h3>
                
                <p className="text-sm sm:text-lg text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                  질문하기, 좋아요, 경험 공유 등의 기능을 이용하려면<br className="hidden sm:block" />
                  먼저 로그인해주세요.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm sm:text-lg font-semibold rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
                  >
                    로그인하기
                  </Link>
                  
                  <button
                    onClick={() => setShowLoginModal(false)}
                    className="inline-flex items-center justify-center px-5 sm:px-6 py-3 sm:py-4 bg-gray-100 text-gray-700 text-sm sm:text-lg font-semibold rounded-xl hover:bg-gray-200 transition-all duration-200"
                  >
                    취소
                  </button>
                </div>
                
                <p className="text-xs sm:text-sm text-gray-500 mt-4 sm:mt-6">
                  아직 계정이 없으신가요? 
                  <Link href="/signup" className="text-purple-600 hover:text-purple-700 ml-1 font-semibold">
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