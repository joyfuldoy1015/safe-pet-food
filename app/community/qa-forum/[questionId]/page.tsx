'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
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
  Bookmark,
  Edit,
  X,
  Save
} from 'lucide-react'
import { Question } from '@/app/components/qa-forum/QuestionCard'
import CommentThread, { Comment } from '@/app/components/qa-forum/CommentThread'
import { getBrowserClient } from '@/lib/supabase-client'

// Fallback Mock data
const mockQuestionsData = [
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
    status: 'answered'
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
    status: 'answered'
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
  const router = useRouter()
  const questionId = params.questionId as string
  const { user, profile } = useAuth()

  const [question, setQuestion] = useState<Question | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [userVotes, setUserVotes] = useState<Record<string, boolean>>({})
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(true)
  const [isLoadingComments, setIsLoadingComments] = useState(true)
  const [isTogglingBookmark, setIsTogglingBookmark] = useState(false)
  
  const [showFullContent, setShowFullContent] = useState(false)

  // 질문 수정 관련 상태
  const [isEditingQuestion, setIsEditingQuestion] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [editCategory, setEditCategory] = useState('')
  const [isSavingEdit, setIsSavingEdit] = useState(false)

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
    const loadQuestion = async () => {
      setIsLoadingQuestion(true)
      try {
        const supabase = getBrowserClient()
        if (!supabase) {
          // Fallback to mock data
          const questionData = mockQuestionsData.find((q) => q.id === questionId)
          if (questionData) {
            setQuestion({
              ...questionData,
              isUpvoted: userVotes[questionId] || false
            } as Question)
          }
          setIsLoadingQuestion(false)
          return
        }

        // Fetch question from Supabase
        const { data: questionData, error } = await supabase
          .from('community_questions')
          .select(`
            *,
            author:profiles!author_id(nickname, avatar_url)
          `)
          .eq('id', questionId)
          .eq('admin_status', 'visible')
          .single()

        if (error) {
          console.error('Failed to load question:', error)
          setIsLoadingQuestion(false)
          return
        }

        if (questionData) {
          // Get answer count
          const { count } = await supabase
            .from('community_answers')
            .select('*', { count: 'exact', head: true })
            .eq('question_id', questionData.id)
            .eq('admin_status', 'visible')

          setQuestion({
            id: questionData.id,
            title: questionData.title,
            content: questionData.content,
            summary: questionData.summary || undefined,
            author: {
              name: questionData.author?.nickname || '익명',
              level: 'beginner' as const,
              avatar: questionData.author?.avatar_url,
              id: questionData.author_id
            },
            category: questionData.category,
            categoryEmoji: questionData.category.split(' ')[0],
            votes: questionData.votes || 0,
            answerCount: count || 0,
            views: questionData.views || 0,
            createdAt: questionData.created_at,
            updatedAt: questionData.updated_at,
            status: questionData.status as 'open' | 'answered' | 'closed',
            isUpvoted: false,
            author_id: questionData.author_id
          })

          // Increment view count
          await (supabase
            .from('community_questions') as any)
            .update({ views: (questionData.views || 0) + 1 })
            .eq('id', questionId)
        }
      } catch (error) {
        console.error('Failed to load question:', error)
      } finally {
        setIsLoadingQuestion(false)
      }
    }

    const loadComments = async () => {
      setIsLoadingComments(true)
      try {
        const supabase = getBrowserClient()
        if (!supabase) {
          // Fallback to mock data
          const questionComments = mockComments[questionId] || []
          setComments(questionComments.map((c) => ({ ...c, isUpvoted: false })))
          setIsLoadingComments(false)
          return
        }

        // Fetch all answers from Supabase (including nested replies)
        const { data: answersData, error } = await supabase
          .from('community_answers')
          .select(`
            *,
            author:profiles!author_id(nickname, avatar_url)
          `)
          .eq('question_id', questionId)
          .eq('admin_status', 'visible')
          .order('created_at', { ascending: true })

        if (error) {
          console.error('Failed to load answers:', error)
          setIsLoadingComments(false)
          return
        }

        // Build flat list of all answers
        const flatComments: Comment[] = (answersData || []).map((answer: any) => ({
          id: answer.id,
          content: answer.content,
          author: {
            name: answer.author?.nickname || '익명',
            level: 'beginner' as const,
            avatar: answer.author?.avatar_url,
            id: answer.author_id
          },
          votes: answer.votes || 0,
          createdAt: answer.created_at,
          isUpvoted: false,
          parent_id: answer.parent_id
        }))

        // Build nested structure
        const commentMap = new Map<string, Comment>()
        const rootComments: Comment[] = []

        // First pass: create map of all comments
        flatComments.forEach(comment => {
          commentMap.set(comment.id, { ...comment, replies: [] })
        })

        // Second pass: build tree structure
        flatComments.forEach(comment => {
          const commentWithReplies = commentMap.get(comment.id)!
          if (comment.parent_id) {
            // This is a reply, add to parent's replies array
            const parent = commentMap.get(comment.parent_id)
            if (parent) {
              if (!parent.replies) parent.replies = []
              parent.replies.push(commentWithReplies)
            }
          } else {
            // This is a root comment
            rootComments.push(commentWithReplies)
          }
        })

        // Sort root comments by votes (descending) then by creation time
        rootComments.sort((a, b) => {
          if (b.votes !== a.votes) {
            return b.votes - a.votes
          }
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        })

        setComments(rootComments)
      } catch (error) {
        console.error('Failed to load answers:', error)
      } finally {
        setIsLoadingComments(false)
      }
    }

    const loadBookmarkStatus = async () => {
      try {
        const supabase = getBrowserClient()
        if (!supabase) return

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Check if user has bookmarked this question
        const { data, error } = await supabase
          .from('community_bookmarks')
          .select('id')
          .eq('user_id', user.id)
          .eq('question_id', questionId)
          .maybeSingle() // Use maybeSingle() instead of single() to avoid 406 error

        if (!error && data) {
          setIsBookmarked(true)
        } else {
          setIsBookmarked(false)
        }
      } catch (error) {
        // Handle any unexpected errors
        setIsBookmarked(false)
      }
    }

    loadQuestion()
    loadComments()
    loadBookmarkStatus()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [questionId]) // Only reload when questionId changes

  // Handle question upvote
  const handleQuestionUpvote = () => {
    if (!question) return

    // 로그인 체크
    if (!user) {
      if (confirm('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?')) {
        router.push(`/login?redirect=/community/qa-forum/${questionId}`)
      }
      return
    }

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

  // Handle bookmark toggle
  const handleToggleBookmark = async () => {
    if (isTogglingBookmark) return

    const supabase = getBrowserClient()
    if (!supabase) {
      alert('Supabase에 연결할 수 없습니다.')
      return
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }

    setIsTogglingBookmark(true)
    try {
      if (isBookmarked) {
        // 북마크 삭제
        const { error } = await supabase
          .from('community_bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('question_id', questionId)

        if (error) {
          console.error('Failed to remove bookmark:', error)
          alert('북마크 해제에 실패했습니다.')
          return
        }

        setIsBookmarked(false)
      } else {
        // 북마크 추가
        const { error } = await (supabase
          .from('community_bookmarks') as any)
          .insert({
            user_id: user.id,
            question_id: questionId
          })

        if (error) {
          console.error('Failed to add bookmark:', error)
          // 이미 북마크된 경우 (UNIQUE constraint)
          if (error.code === '23505') {
            setIsBookmarked(true)
            return
          }
          alert('북마크 추가에 실패했습니다.')
          return
        }

        setIsBookmarked(true)
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
      alert('북마크 처리 중 오류가 발생했습니다.')
    } finally {
      setIsTogglingBookmark(false)
    }
  }

  // Handle comment upvote
  const handleCommentUpvote = (commentId: string) => {
    // 로그인 체크
    if (!user) {
      if (confirm('로그인이 필요한 기능입니다.\n로그인 페이지로 이동하시겠습니까?')) {
        router.push(`/login?redirect=/community/qa-forum/${questionId}`)
      }
      return
    }

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

  // Handle reply - Supabase에 저장하고 재귀적으로 댓글 트리 업데이트
  const handleReply = async (commentId: string, content: string) => {
    if (!user || !profile) {
      alert('로그인이 필요합니다.')
      return
    }

    try {
      const supabase = getBrowserClient()
      if (!supabase) {
        alert('Supabase에 연결할 수 없습니다.')
        return
      }

      // Insert reply into database
      const { data: newAnswer, error } = await (supabase
        .from('community_answers') as any)
        .insert({
          question_id: questionId,
          author_id: user.id,
          content: content.trim(),
          parent_id: commentId,
          is_accepted: false,
          votes: 0,
          admin_status: 'visible'
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create reply:', error)
        alert('답글 등록에 실패했습니다.')
        return
      }

      // Create new reply object with profile data
      const newReply: Comment = {
        id: newAnswer.id,
        content: newAnswer.content,
        author: {
          name: profile?.nickname || '사용자',
          level: 'beginner',
          avatar: profile?.avatar_url,
          id: user.id
        },
        votes: 0,
        createdAt: newAnswer.created_at
      }

      // 재귀 함수: 댓글 트리에서 대상 ID 찾기
      const addReplyToComment = (comment: Comment): Comment => {
        if (comment.id === commentId) {
          // 찾았으면 답글 추가
          return {
            ...comment,
            replies: [...(comment.replies || []), newReply]
          }
        }
        
        // 하위 답글들도 재귀적으로 탐색
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map(addReplyToComment)
          }
        }
        
        return comment
      }

      setComments((prev) => prev.map(addReplyToComment))
    } catch (error) {
      console.error('Failed to submit reply:', error)
      alert('답글 등록 중 오류가 발생했습니다.')
    }
  }

  // Handle edit comment
  const handleEditComment = async (commentId: string, newContent: string) => {
    try {
      const supabase = getBrowserClient()
      if (!supabase) {
        alert('Supabase에 연결할 수 없습니다.')
        return
      }

      // Update in database
      const { error } = await (supabase
        .from('community_answers') as any)
        .update({ content: newContent })
        .eq('id', commentId)
        .eq('author_id', user?.id) // RLS: only own comments

      if (error) {
        console.error('Failed to update comment:', error)
        alert('댓글 수정에 실패했습니다.')
        return
      }

      // Update local state
      const editComment = (comment: Comment): Comment => {
        if (comment.id === commentId) {
          return {
            ...comment,
            content: newContent
          }
        }
        
        if (comment.replies && comment.replies.length > 0) {
          return {
            ...comment,
            replies: comment.replies.map(editComment)
          }
        }
        
        return comment
      }

      setComments((prev) => prev.map(editComment))
    } catch (error) {
      console.error('Failed to edit comment:', error)
      alert('댓글 수정 중 오류가 발생했습니다.')
    }
  }

  // Handle delete comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      const supabase = getBrowserClient()
      if (!supabase) {
        alert('Supabase에 연결할 수 없습니다.')
        return
      }

      // Check if comment has replies
      const findComment = (comments: Comment[], id: string): Comment | null => {
        for (const comment of comments) {
          if (comment.id === id) return comment
          if (comment.replies) {
            const found = findComment(comment.replies, id)
            if (found) return found
          }
        }
        return null
      }

      const targetComment = findComment(comments, commentId)
      if (!targetComment) return

      const hasReplies = targetComment.replies && targetComment.replies.length > 0

      if (hasReplies) {
        // Soft delete: update content only (keep admin_status as 'visible')
        const { error } = await (supabase
          .from('community_answers') as any)
          .update({ 
            content: '작성자가 삭제한 댓글입니다.'
          })
          .eq('id', commentId)
          .eq('author_id', user?.id) // RLS: only own comments

        if (error) {
          console.error('Failed to soft delete comment:', error)
          alert('댓글 삭제에 실패했습니다.')
          return
        }
      } else {
        // Hard delete: remove from database
        const { error } = await supabase
          .from('community_answers')
          .delete()
          .eq('id', commentId)
          .eq('author_id', user?.id) // RLS: only own comments

        if (error) {
          console.error('Failed to delete comment:', error)
          alert('댓글 삭제에 실패했습니다.')
          return
        }
      }

      // Update local state
      const deleteComment = (comment: Comment): Comment | null => {
        if (comment.id === commentId) {
          // 대댓글이 있으면 내용만 삭제 표시
          if (comment.replies && comment.replies.length > 0) {
            return {
              ...comment,
              content: '작성자가 삭제한 댓글입니다.',
              isDeleted: true
            }
          }
          // 대댓글이 없으면 완전 삭제 (null 반환)
          return null
        }
        
        // 하위 답글 처리
        if (comment.replies && comment.replies.length > 0) {
          const updatedReplies = comment.replies
            .map(deleteComment)
            .filter((r): r is Comment => r !== null)
          
          return {
            ...comment,
            replies: updatedReplies
          }
        }
        
        return comment
      }

      setComments((prev) => 
        prev
          .map(deleteComment)
          .filter((c): c is Comment => c !== null)
      )
    } catch (error) {
      console.error('Failed to delete comment:', error)
      alert('댓글 삭제 중 오류가 발생했습니다.')
    }
  }

  // 질문 수정 카테고리 목록
  const questionCategories = [
    { value: '🐶 강아지', label: '강아지', emoji: '🐶' },
    { value: '🐱 고양이', label: '고양이', emoji: '🐱' },
    { value: '🍖 사료 & 영양', label: '사료 & 영양', emoji: '🍖' },
    { value: '❤️ 건강', label: '건강', emoji: '❤️' },
    { value: '🎓 훈련 & 행동', label: '훈련 & 행동', emoji: '🎓' },
    { value: '💬 자유토론', label: '자유토론', emoji: '💬' }
  ]

  // 질문 수정 모드 시작
  const handleStartEditQuestion = () => {
    if (!question) return
    setEditTitle(question.title)
    setEditContent(question.content)
    setEditCategory(question.category)
    setIsEditingQuestion(true)
  }

  // 질문 수정 취소
  const handleCancelEditQuestion = () => {
    setIsEditingQuestion(false)
    setEditTitle('')
    setEditContent('')
    setEditCategory('')
  }

  // 질문 수정 저장
  const handleSaveEditQuestion = async () => {
    if (!question || !editTitle.trim() || !editContent.trim()) {
      alert('제목과 내용을 입력해주세요.')
      return
    }

    setIsSavingEdit(true)
    try {
      const supabase = getBrowserClient()
      if (!supabase) {
        alert('Supabase에 연결할 수 없습니다.')
        return
      }

      const { error } = await (supabase
        .from('community_questions') as any)
        .update({
          title: editTitle.trim(),
          content: editContent.trim(),
          category: editCategory,
          updated_at: new Date().toISOString()
        })
        .eq('id', questionId)
        .eq('author_id', user?.id)

      if (error) {
        console.error('Failed to update question:', error)
        alert('질문 수정에 실패했습니다.')
        return
      }

      // 로컬 상태 업데이트
      setQuestion({
        ...question,
        title: editTitle.trim(),
        content: editContent.trim(),
        category: editCategory,
        categoryEmoji: editCategory.split(' ')[0],
        updatedAt: new Date().toISOString()
      })

      setIsEditingQuestion(false)
      alert('질문이 수정되었습니다.')
    } catch (error) {
      console.error('Failed to save question edit:', error)
      alert('질문 수정 중 오류가 발생했습니다.')
    } finally {
      setIsSavingEdit(false)
    }
  }

  // Handle new comment submit
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim() || !question) return

    // Validate minimum length
    if (newComment.trim().length < 10) {
      alert('답변은 최소 10자 이상 입력해주세요.')
      return
    }

    if (newComment.trim().length > 5000) {
      alert('답변은 최대 5000자까지 입력 가능합니다.')
      return
    }

    try {
      const supabase = getBrowserClient()
      if (!supabase) {
        alert('Supabase에 연결할 수 없습니다.')
        return
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        alert('로그인이 필요합니다.')
        return
      }

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('nickname, avatar_url')
        .eq('id', user.id)
        .single()

      // Insert answer
      const { data: newAnswer, error } = await (supabase
        .from('community_answers') as any)
        .insert({
          question_id: questionId,
          author_id: user.id,
          content: newComment.trim(),
          is_accepted: false,
          votes: 0,
          admin_status: 'visible'
        })
        .select()
        .single()

      if (error) {
        console.error('Failed to create answer:', error)
        alert('답변 등록에 실패했습니다.')
        return
      }

      // Add to local state
      const newCommentObj: Comment = {
        id: newAnswer.id,
        content: newAnswer.content,
        author: {
          name: profile?.nickname || '사용자',
          level: 'beginner',
          avatar: profile?.avatar_url,
          id: user.id
        },
        votes: 0,
        createdAt: newAnswer.created_at,
        isUpvoted: false
      }

      setComments([...comments, newCommentObj])
      setNewComment('')

      // Update question status to 'answered' if it was 'open'
      if (question.status === 'open') {
        await (supabase
          .from('community_questions') as any)
          .update({ status: 'answered' })
          .eq('id', questionId)
      }

      // Update question answer count and status
      setQuestion({
        ...question,
        answerCount: question.answerCount + 1,
        status: 'answered'
      })
    } catch (error) {
      console.error('Failed to submit answer:', error)
      alert('답변 등록에 실패했습니다.')
    }
  }

  // Related questions state
  const [relatedQuestions, setRelatedQuestions] = useState<Question[]>([])

  // Load related questions
  useEffect(() => {
    const loadRelatedQuestions = async () => {
      if (!question) return

      try {
        const supabase = getBrowserClient()
        if (!supabase) {
          // Fallback to mock data
          const related = mockQuestionsData
            .filter((q) => q.id !== questionId && q.category === question.category)
            .slice(0, 3)
          setRelatedQuestions(related)
          return
        }

        // Fetch related questions from Supabase
        const { data: questionsData, error } = await supabase
          .from('community_questions')
          .select(`
            *,
            author:profiles!author_id(nickname, avatar_url)
          `)
          .eq('category', question.category)
          .eq('admin_status', 'visible')
          .neq('id', questionId)
          .order('votes', { ascending: false })
          .limit(3)

        if (error) {
          console.error('Failed to load related questions:', error)
          return
        }

        const questions: Question[] = await Promise.all(
          (questionsData || []).map(async (q: any) => {
            const { count } = await supabase
              .from('community_answers')
              .select('*', { count: 'exact', head: true })
              .eq('question_id', q.id)
              .eq('admin_status', 'visible')

            return {
              id: q.id,
              title: q.title,
              content: q.content,
              summary: q.summary || undefined,
              author: {
                name: q.author?.nickname || '익명',
                level: 'beginner' as const
              },
              category: q.category,
              categoryEmoji: q.category.split(' ')[0],
              votes: q.votes || 0,
              answerCount: count || 0,
              views: q.views || 0,
              createdAt: q.created_at,
              updatedAt: q.updated_at,
              status: q.status as 'open' | 'answered' | 'closed',
              isUpvoted: false
            }
          })
        )

        setRelatedQuestions(questions)
      } catch (error) {
        console.error('Failed to load related questions:', error)
      }
    }

    loadRelatedQuestions()
  }, [question?.category, questionId, question])

  if (isLoadingQuestion) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent mb-4"></div>
          <p className="text-gray-600">질문을 불러오는 중...</p>
        </div>
      </div>
    )
  }

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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          href="/community/qa-forum"
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
          <span className="text-sm">목록으로 돌아가기</span>
        </Link>

        <div className="space-y-4">
          {/* Main Content */}
          <div className="space-y-4">
            {/* Question Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
              {/* 상단: 프로필 + 상태 배지 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  {/* 아바타 with Q badge */}
                  <div className="relative flex-shrink-0">
                    {question.author.avatar ? (
                      <img
                        src={question.author.avatar}
                        alt={question.author.name}
                        className="w-11 h-11 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                    )}
                    <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center border-2 border-white">
                      <span className="text-white text-[9px] font-bold">Q</span>
                    </div>
                  </div>
                  {/* 작성자 정보 */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900 text-sm">
                        {question.author.name}
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">{formatTimeAgo(question.createdAt)}</span>
                  </div>
                </div>
                {/* 상태 배지 */}
                <div className="flex items-center gap-2">
                  {question.status === 'answered' ? (
                    <span className="px-3 py-1 text-xs font-medium bg-green-50 text-green-600 rounded-full">
                      답변 완료
                    </span>
                  ) : (
                    <span className="px-3 py-1 text-xs font-medium bg-orange-50 text-orange-600 rounded-full">
                      답변 대기
                    </span>
                  )}
                </div>
              </div>

              {/* 카테고리 태그 */}
              <div className="mb-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  {question.category.replace(/^[\uD83C-\uDBFF\uDC00-\uDFFF\u2764\uFE0F\u200D\s]+/, '').trim()}
                </span>
              </div>

              {/* Title */}
              {isEditingQuestion ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full text-xl font-bold text-gray-900 mb-4 px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="질문 제목"
                />
              ) : (
                <div className="flex items-start justify-between gap-3 mb-4">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-snug">
                    {question.title}
                  </h1>
                  {/* 수정 버튼 - 본인 글일 경우에만 표시 */}
                  {user && question.author_id === user.id && (
                    <button
                      onClick={handleStartEditQuestion}
                      className="flex-shrink-0 p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-xl transition-colors"
                      title="질문 수정"
                    >
                      <Edit className="h-5 w-5" />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              {isEditingQuestion ? (
                <div className="space-y-4 mb-6">
                  {/* 카테고리 선택 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">카테고리</label>
                    <select
                      value={editCategory}
                      onChange={(e) => setEditCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {questionCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.emoji} {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  {/* 내용 입력 */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">내용</label>
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      rows={8}
                      className="w-full px-3 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="질문 내용을 입력하세요"
                    />
                  </div>
                  {/* 저장/취소 버튼 */}
                  <div className="flex justify-end gap-3">
                    <button
                      onClick={handleCancelEditQuestion}
                      disabled={isSavingEdit}
                      className="px-4 py-2 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <X className="h-4 w-4" />
                      취소
                    </button>
                    <button
                      onClick={handleSaveEditQuestion}
                      disabled={isSavingEdit || !editTitle.trim() || !editContent.trim()}
                      className="px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSavingEdit ? '저장 중...' : '저장'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="mb-6">
                  {question.summary && (
                    <div className="mb-4 p-3 bg-blue-50 border border-blue-100 rounded-xl">
                      <div className="flex items-center gap-1.5 mb-1.5">
                        <span className="text-xs font-medium text-blue-600 bg-blue-100 px-2 py-0.5 rounded">AI 요약</span>
                      </div>
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {question.summary}
                      </p>
                    </div>
                  )}

                  {question.summary && !showFullContent ? (
                    <button
                      onClick={() => setShowFullContent(true)}
                      className="text-sm text-blue-500 hover:text-blue-600 font-medium mb-3"
                    >
                      전체 내용 보기 ▼
                    </button>
                  ) : (
                    <>
                      {question.summary && showFullContent && (
                        <button
                          onClick={() => setShowFullContent(false)}
                          className="text-sm text-blue-500 hover:text-blue-600 font-medium mb-3"
                        >
                          접기 ▲
                        </button>
                      )}
                      <p className="text-gray-600 text-sm sm:text-base whitespace-pre-line leading-relaxed">
                        {question.content}
                      </p>
                    </>
                  )}

                  {question.imageUrl && (
                    <img
                      src={question.imageUrl}
                      alt="Question image"
                      className="mt-4 rounded-xl max-w-full"
                    />
                  )}
                </div>
              )}

              {/* Actions - 하단 통계 및 액션 */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                {/* 좌측: 좋아요, 답변, 조회수 */}
                <div className="flex items-center gap-4">
                  <button
                    onClick={handleQuestionUpvote}
                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors"
                  >
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center ${
                      question.isUpvoted ? 'bg-red-50' : 'bg-gray-50'
                    }`}>
                      <ArrowUp className={`h-4 w-4 ${question.isUpvoted ? 'text-red-500' : 'text-gray-400'}`} />
                    </span>
                    <span className="font-medium text-gray-600">{question.votes}</span>
                  </button>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <span className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-blue-400" />
                    </span>
                    <span className="font-medium text-gray-600">{question.answerCount}</span>
                  </div>
                  {question.views !== undefined && (
                    <div className="flex items-center gap-1.5 text-xs text-gray-500">
                      <span className="w-7 h-7 rounded-full bg-gray-50 flex items-center justify-center">
                        <Eye className="h-4 w-4 text-gray-400" />
                      </span>
                      <span className="font-medium text-gray-600">{question.views}</span>
                    </div>
                  )}
                </div>
                
                {/* 우측: 북마크, 신고 */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleToggleBookmark}
                    disabled={isTogglingBookmark}
                    className={`p-2 rounded-xl transition-colors disabled:opacity-50 ${
                      isBookmarked
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-400 hover:bg-gray-100'
                    }`}
                    aria-label={isBookmarked ? '북마크 해제' : '북마크 추가'}
                  >
                    <Bookmark className={`h-5 w-5 ${isBookmarked ? 'fill-current' : ''}`} />
                  </button>
                  <button 
                    className="p-2 text-gray-400 hover:bg-gray-100 rounded-xl transition-colors"
                    aria-label="신고하기"
                  >
                    <Flag className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Comments Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
              <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
                <span className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                </span>
                {comments.length}개의 답변
              </h2>

              <div className="space-y-3 mb-6">
                {comments.map((comment) => (
                  <CommentThread
                    key={comment.id}
                    comment={comment}
                    onUpvote={handleCommentUpvote}
                    onReply={handleReply}
                    onEdit={handleEditComment}
                    onDelete={handleDeleteComment}
                    formatTimeAgo={formatTimeAgo}
                    currentUserId={user?.id}
                  />
                ))}
              </div>

              {/* New Comment Form */}
              <div className="pt-4 border-t border-gray-100">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">
                  답변 작성하기
                </h3>
                {user ? (
                  <form onSubmit={handleCommentSubmit} className="space-y-4">
                    <div>
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="도움이 되는 답변을 작성해주세요... (최소 10자 이상)"
                        rows={5}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                        required
                      />
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-xs ${
                          newComment.trim().length < 10 
                            ? 'text-red-500' 
                            : newComment.trim().length > 5000
                            ? 'text-red-500'
                            : 'text-gray-400'
                        }`}>
                          {newComment.trim().length} / 5000자
                          {newComment.trim().length < 10 && newComment.trim().length > 0 && (
                            <span className="ml-2">(최소 10자 필요)</span>
                          )}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="submit"
                        disabled={!newComment.trim() || newComment.trim().length < 10}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="h-4 w-4" />
                        <span>답변 등록</span>
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
                    <div className="flex flex-col items-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                        <User className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="text-sm text-gray-500">답변을 작성하려면 로그인이 필요합니다.</p>
                      <Link
                        href={`/login?redirect=${encodeURIComponent(`/community/qa-forum/${questionId}`)}`}
                        className="px-5 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
                      >
                        로그인하기
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Related Questions */}
            {relatedQuestions.length > 0 && (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
                <h3 className="text-base font-bold text-gray-900 mb-4">관련 질문</h3>
                <div className="space-y-3">
                  {relatedQuestions.map((q) => (
                    <Link
                      key={q.id}
                      href={`/community/qa-forum/${q.id}`}
                      className="block p-3 rounded-xl hover:bg-gray-50 transition-colors group border border-gray-100"
                    >
                      <h4 className="text-sm font-medium text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                        {q.title}
                      </h4>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        <div className="flex items-center gap-1">
                          <ArrowUp className="h-3 w-3" />
                          <span>{q.votes}</span>
                        </div>
                        <div className="flex items-center gap-1">
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
