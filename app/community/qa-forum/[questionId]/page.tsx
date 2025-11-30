'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ArrowLeft,
  ArrowUp,
  MessageCircle,
  User,
  Clock,
  CheckCircle,
  Flag,
  Send,
  Eye,
  Bookmark
} from 'lucide-react'
import { Question } from '@/app/components/qa-forum/QuestionCard'
import CommentThread, { Comment } from '@/app/components/qa-forum/CommentThread'
// Mock data - in production, this would come from an API
const questionsData = [
  {
    id: '1',
    title: '강아지가 사료를 잘 안 먹어요. 어떻게 해야 할까요?',
    content: '3살 골든리트리버인데 최근에 사료를 잘 안 먹습니다. 건강에는 문제가 없어 보이는데 식욕이 떨어진 것 같아요.\n\n평소에는 잘 먹던 아이인데 2주 전부터 갑자기 사료를 남기기 시작했어요. 간식은 잘 먹는데 사료만 안 먹어서 걱정입니다.\n\n혹시 비슷한 경험 있으신 분들 조언 부탁드려요. 병원에 가봐야 할까요?',
    author: { name: '반려인초보', level: 'beginner' },
    category: '🍖 사료 & 영양',
    categoryEmoji: '🍖',
    votes: 15,
    answerCount: 3,
    views: 234,
    createdAt: '2024-01-20T10:30:00Z',
    updatedAt: '2024-01-20T14:20:00Z',
    status: 'answered'
  },
  {
    id: '2',
    title: '고양이 모래 추천 부탁드립니다',
    content: '털 빠짐이 심한 장모종 고양이를 키우고 있는데, 모래가 털에 잘 붙지 않는 제품이 있을까요?\n\n현재는 일반 벤토나이트 모래를 사용하고 있는데, 털에 많이 붙어서 청소가 힘들어요. 클레이 모래나 다른 종류의 모래를 추천해주시면 감사하겠습니다!',
    author: { name: '냥집사5년차', level: 'experienced' },
    category: '💬 자유토론',
    categoryEmoji: '💬',
    votes: 8,
    answerCount: 2,
    views: 156,
    createdAt: '2024-01-19T15:45:00Z',
    status: 'open'
  },
  {
    id: '3',
    title: '강아지 영양제 급여 시기가 궁금해요',
    content: '6개월 된 강아지인데 언제부터 영양제를 급여하는 게 좋을까요? 필수 영양제가 있다면 추천해주세요.\n\n현재는 사료만 먹이고 있는데, 주변에서 영양제를 먹여야 한다는 말을 들어서 궁금합니다. 어떤 영양제가 필요한지, 언제부터 시작하는 게 좋은지 알려주세요!',
    author: { name: '퍼피맘', level: 'beginner' },
    category: '❤️ 건강',
    categoryEmoji: '❤️',
    votes: 22,
    answerCount: 5,
    views: 312,
    createdAt: '2024-01-18T09:15:00Z',
    updatedAt: '2024-01-19T11:30:00Z',
    status: 'answered'
  },
  {
    id: '4',
    title: '강아지 산책 시 다른 강아지와 싸워요',
    content: '1살 된 믹스견을 키우고 있는데, 산책할 때 다른 강아지를 만나면 짖거나 공격적인 행동을 보여요.\n\n사회화가 부족한 것 같은데, 어떻게 훈련해야 할까요? 전문 훈련사에게 맡겨야 할까요?',
    author: { name: '댕댕이집사', level: 'beginner' },
    category: '🎓 훈련 & 행동',
    categoryEmoji: '🎓',
    votes: 12,
    answerCount: 4,
    views: 189,
    createdAt: '2024-01-17T13:20:00Z',
    status: 'open'
  },
  {
    id: '5',
    title: '고양이 화장실 훈련 방법',
    content: '새로 입양한 3개월 고양이인데, 화장실을 제대로 사용하지 못해요.\n\n모래는 어디에 두는 게 좋고, 어떻게 훈련해야 할까요?',
    author: { name: '고양이초보', level: 'beginner' },
    category: '🎓 훈련 & 행동',
    categoryEmoji: '🎓',
    votes: 18,
    answerCount: 6,
    views: 267,
    createdAt: '2024-01-16T16:10:00Z',
    updatedAt: '2024-01-17T10:45:00Z',
    status: 'answered'
  },
  {
    id: '6',
    title: '강아지 사료 브랜드 추천해주세요',
    content: '골든리트리버 2살을 키우고 있는데, 어떤 사료 브랜드가 좋을까요?\n\n알레르기가 있어서 곡물 없는 사료를 찾고 있어요. 가격대는 중간 정도면 좋겠습니다.',
    author: { name: '골든맘', level: 'experienced' },
    category: '🍖 사료 & 영양',
    categoryEmoji: '🍖',
    votes: 25,
    answerCount: 8,
    views: 445,
    createdAt: '2024-01-15T11:00:00Z',
    updatedAt: '2024-01-16T14:30:00Z',
    status: 'answered'
  }
] as Question[]

// Mock comments data
const mockComments: Record<string, Comment[]> = {
  '1': [
    {
      id: 'c1',
      content: `안녕하세요. 수의사입니다.

먼저 건강검진을 받아보시는 것을 권합니다. 갑작스러운 식욕 저하는 여러 원인이 있을 수 있어요:

1. **스트레스**: 환경 변화, 새로운 가족 구성원 등
2. **치아 문제**: 잇몸 염증이나 치석
3. **소화기 문제**: 위장 불편감
4. **사료 자체의 문제**: 상한 사료나 맛의 변화

**임시 해결책:**
- 사료에 따뜻한 물을 조금 부어서 향을 높여보세요
- 평소 좋아하는 토핑을 조금 올려주세요 (삶은 닭가슴살, 단호박 등)
- 사료 그릇을 깨끗이 씻어보세요

그래도 계속 안 먹으면 꼭 병원에 가보세요.`,
      author: {
        name: '수의사김선생',
        level: 'expert'
      },
      votes: 12,
      isBestAnswer: true,
      createdAt: '2024-01-20T12:00:00Z',
      replies: [
        {
          id: 'r1',
          content: '정말 자세한 답변 감사합니다! 내일 병원 예약하겠어요.',
          author: {
            name: '반려인초보',
            level: 'beginner'
          },
          votes: 3,
          createdAt: '2024-01-20T14:30:00Z'
        }
      ]
    },
    {
      id: 'c2',
      content: `저희 아이도 비슷한 경험이 있었어요.

사료를 바꿔보니까 잘 먹더라구요. 혹시 같은 사료를 오래 먹여서 질린 걸 수도 있어요.

다른 브랜드로 천천히 바꿔보시는 것도 방법이에요. 단, 갑자기 바꾸면 설사할 수 있으니까 기존 사료와 7:3, 5:5, 3:7 이런 식으로 점진적으로 바꿔주세요.`,
      author: {
        name: '골든맘5년차',
        level: 'experienced'
      },
      votes: 8,
      createdAt: '2024-01-21T09:15:00Z'
    },
    {
      id: 'c3',
      content: `운동량은 어떠신가요? 운동 부족으로도 식욕이 떨어질 수 있어요.

산책 시간을 늘려보시거나, 집에서 놀아주는 시간을 늘려보세요. 에너지를 충분히 소모하면 배가 고파서 사료도 잘 먹을 거예요.

그리고 사료 주는 시간을 일정하게 맞춰주시는 것도 중요해요.`,
      author: {
        name: '댕댕이훈련사',
        level: 'experienced'
      },
      votes: 5,
      createdAt: '2024-01-21T11:20:00Z'
    }
  ]
}

export default function QuestionDetailPage() {
  const params = useParams()
  const questionId = params.questionId as string

  const [question, setQuestion] = useState<Question | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({})
  const [isBookmarked, setIsBookmarked] = useState(false)

  // Format time ago helper
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return '방금 전'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`
    return `${Math.floor(diffInSeconds / 31536000)}년 전`
  }

  useEffect(() => {
    // Load question data
    const questionData = questionsData.find((q) => q.id === questionId)
    if (questionData) {
      setQuestion({
        ...questionData,
        isUpvoted: userVotes[questionId] || false
      } as Question)
    }

    // Load comments
    const questionComments = mockComments[questionId] || []
    setComments(questionComments.map((c) => ({ ...c, isUpvoted: false })))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]) // Only reload when questionId changes

  // Handle question upvote
  const handleQuestionUpvote = () => {
    if (!question) return

    const isCurrentlyUpvoted = userVotes[questionId]

    setQuestion({
      ...question,
      votes: isCurrentlyUpvoted ? question.votes - 1 : question.votes + 1,
      isUpvoted: !isCurrentlyUpvoted
    })

    setUserVotes((prev) => {
      if (isCurrentlyUpvoted) {
        const newVotes = { ...prev }
        delete newVotes[questionId]
        return newVotes
      }
      return { ...prev, [questionId]: true }
    })
  }

  // Handle comment upvote
  const handleCommentUpvote = (commentId: string) => {
    const isCurrentlyUpvoted = userVotes[commentId]

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            votes: isCurrentlyUpvoted ? c.votes - 1 : c.votes + 1,
            isUpvoted: !isCurrentlyUpvoted
          }
        }
        // Handle nested replies
        if (c.replies) {
          return {
            ...c,
            replies: c.replies.map((r) =>
              r.id === commentId
                ? {
                    ...r,
                    votes: isCurrentlyUpvoted ? r.votes - 1 : r.votes + 1,
                    isUpvoted: !isCurrentlyUpvoted
                  }
                : r
            )
          }
        }
        return c
      })
    )

    setUserVotes((prev) => {
      if (isCurrentlyUpvoted) {
        const newVotes = { ...prev }
        delete newVotes[commentId]
        return newVotes
      }
      return { ...prev, [commentId]: true }
    })
  }

  // Handle reply
  const handleReply = (commentId: string, content: string) => {
    const newReply: Comment = {
      id: `r-${Date.now()}`,
      content,
      author: {
        name: '사용자',
        level: 'beginner'
      },
      votes: 0,
      createdAt: new Date().toISOString()
    }

    setComments((prev) =>
      prev.map((c) => {
        if (c.id === commentId) {
          return {
            ...c,
            replies: [...(c.replies || []), newReply]
          }
        }
        return c
      })
    )
  }

  // Handle new comment submit
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !question) return

    const newCommentObj: Comment = {
      id: `c-${Date.now()}`,
      content: newComment.trim(),
      author: {
        name: '사용자',
        level: 'beginner'
      },
      votes: 0,
      createdAt: new Date().toISOString()
    }

    setComments([...comments, newCommentObj])
    setNewComment('')

    // Update question answer count
    setQuestion({
      ...question,
      answerCount: question.answerCount + 1
    })
  }

  // Get related questions (same category) - must be before early return
  const relatedQuestions = useMemo(() => {
    if (!question) return []
    return questionsData
      .filter((q) => q.id !== questionId && q.category === question.category)
      .slice(0, 3)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId, question?.category])

  if (!question) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            질문을 찾을 수 없습니다
          </h2>
          <p className="text-gray-600 mb-4">
            요청하신 질문이 존재하지 않거나 삭제되었습니다.
          </p>
          <Link
            href="/community/qa-forum"
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Q&A 포럼으로 돌아가기</span>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/community/qa-forum"
          className="inline-flex items-center space-x-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>목록으로 돌아가기</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Question Card */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
              {/* Category and Status */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">{question.categoryEmoji}</span>
                  <span className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    {question.category.replace(/^[\uD83C-\uDBFF\uDC00-\uDFFF\u2764\uFE0F\u200D\s]+/, '').trim()}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  {question.status === 'answered' && (
                    <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full">
                      답변 완료
                    </span>
                  )}
                  {question.status === 'open' && (
                    <span className="px-2 py-1 text-xs bg-orange-100 text-orange-800 rounded-full">
                      답변 대기
                    </span>
                  )}
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {question.title}
              </h1>

              {/* Author and Meta */}
              <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                <div className="flex items-center space-x-3">
                  {question.author.avatar ? (
                    <img
                      src={question.author.avatar}
                      alt={question.author.name}
                      className="h-10 w-10 rounded-full"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium text-gray-900">
                        {question.author.name}
                      </span>
                      {question.author.level && (
                        <span
                          className={`px-2 py-1 text-xs rounded-full ${
                            question.author.level === 'expert'
                              ? 'bg-purple-100 text-purple-800'
                              : question.author.level === 'experienced'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {question.author.level === 'expert'
                            ? '전문가'
                            : question.author.level === 'experienced'
                            ? '경험자'
                            : '새싹'}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500 mt-1">
                      <Clock className="h-3 w-3" />
                      <span>{formatTimeAgo(question.createdAt)}</span>
                      {question.views !== undefined && (
                        <>
                          <span>•</span>
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>{question.views}회 조회</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <button
                  onClick={() => setIsBookmarked(!isBookmarked)}
                  className={`p-2 rounded-lg transition-colors ${
                    isBookmarked
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-400 hover:bg-gray-100'
                  }`}
                >
                  <Bookmark
                    className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`}
                  />
                </button>
              </div>

              {/* Content */}
              <div className="prose max-w-none mb-6">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {question.content}
                </p>
                {question.imageUrl && (
                  <img
                    src={question.imageUrl}
                    alt="Question image"
                    className="mt-4 rounded-lg max-w-full"
                  />
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                  <button
                    onClick={handleQuestionUpvote}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                      question.isUpvoted
                        ? 'text-red-600 bg-red-50 hover:bg-red-100'
                        : 'text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-red-600'
                    }`}
                  >
                    <ArrowUp
                      className={`h-5 w-5 ${question.isUpvoted ? 'fill-current' : ''}`}
                    />
                    <span className="font-medium">Upvote</span>
                    <span className="text-lg font-semibold">
                      {question.votes}
                    </span>
                  </button>
                </div>
                <div className="flex items-center space-x-4 text-gray-600">
                  <div className="flex items-center space-x-2">
                    <MessageCircle className="h-5 w-5" />
                    <span className="font-medium">{question.answerCount}개 답변</span>
                  </div>
                  <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                    <Flag className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">
                {comments.length}개의 답변
              </h2>

              <div className="space-y-6 mb-6">
                {comments.map((comment) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    onUpvote={handleCommentUpvote}
                    onReply={handleReply}
                    formatTimeAgo={formatTimeAgo}
                  />
                ))}
              </div>

              {/* New Comment Form */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  답변 작성하기
                </h3>
                <form onSubmit={handleCommentSubmit} className="space-y-4">
                  <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="도움이 되는 답변을 작성해주세요..."
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                    required
                  />
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={!newComment.trim()}
                      className="flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      <Send className="h-4 w-4" />
                      <span>답변 등록</span>
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Related Questions */}
            {relatedQuestions.length > 0 && (
              <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
                <h3 className="font-bold text-gray-900 mb-4">관련 질문</h3>
                <div className="space-y-4">
                  {relatedQuestions.map((q) => (
                    <Link
                      key={q.id}
                      href={`/community/qa-forum/${q.id}`}
                      className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                    >
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {q.title}
                      </h4>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ArrowUp className="h-3 w-3" />
                          <span>{q.votes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{q.answerCount || 0}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
