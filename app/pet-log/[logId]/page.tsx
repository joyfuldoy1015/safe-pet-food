'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Share2, Heart, HelpCircle, Send, CheckCircle, ChevronRight, MoreVertical, Edit2, Trash2, ThumbsUp } from 'lucide-react'
import Image from 'next/image'
import { getBrowserClient } from '@/lib/supabase-client'
import type { ReviewLog, Pet, Owner, Comment, QAThread, QAPostWithAuthor } from '@/lib/types/review-log'
import { mockReviewLogs, mockOwners, mockPets, mockComments, mockQAThreads, mockQAPosts } from '@/lib/mock/review-log'
import { useAuth } from '@/hooks/useAuth'

/**
 * Single Log Detail Page
 * Route: /pet-log/[logId]
 */
export default function LogDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const logId = params.logId as string

  const [log, setLog] = useState<ReviewLog | null>(null)
  const [pet, setPet] = useState<Pet | null>(null)
  const [owner, setOwner] = useState<Owner | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [qaThreads, setQAThreads] = useState<QAThread[]>([])
  const [qaPosts, setQAPosts] = useState<QAPostWithAuthor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'comments' | 'qa'>('comments')
  const [newComment, setNewComment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null)
  const [editingQAPostId, setEditingQAPostId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null)
  const [replyingToQAId, setReplyingToQAId] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [hasMarkedHelpful, setHasMarkedHelpful] = useState(false)
  const [helpfulCount, setHelpfulCount] = useState(0)
  const [isMarkingHelpful, setIsMarkingHelpful] = useState(false)
  const commentsSectionRef = useRef<HTMLDivElement>(null)
  const qaSectionRef = useRef<HTMLDivElement>(null)

  // 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      try {
        const supabase = getBrowserClient()
        
        if (supabase) {
          // Supabase에서 로그 데이터 로드
          const { data: logData, error: logError } = await supabase
            .from('review_logs')
            .select(`
              *,
              profiles:owner_id(id, nickname, avatar_url),
              pets:pet_id(id, name, species, birth_date, weight_kg)
            `)
            .eq('id', logId)
            .single()

          if (!logError && logData) {
            const transformedLog: ReviewLog = {
              id: logData.id,
              petId: logData.pet_id,
              ownerId: logData.owner_id,
              category: logData.category,
              brand: logData.brand,
              product: logData.product,
              status: logData.status,
              periodStart: logData.period_start,
              periodEnd: logData.period_end,
              durationDays: logData.duration_days,
              rating: logData.rating,
              recommend: logData.recommend,
              excerpt: logData.excerpt,
              notes: logData.notes,
              likes: logData.likes || 0,
              commentsCount: logData.comments_count || 0,
              views: logData.views || 0,
              createdAt: logData.created_at,
              updatedAt: logData.updated_at
            }
            setLog(transformedLog)
            setHelpfulCount(logData.likes || 0)

            // 사용자가 이미 도움돼요를 눌렀는지 확인
            if (user) {
              const { data: helpfulData } = await supabase
                .from('review_log_helpful')
                .select('id')
                .eq('log_id', logId)
                .eq('user_id', user.id)
                .single()
              
              setHasMarkedHelpful(!!helpfulData)
            }

            if (logData.profiles) {
              setOwner({
                id: logData.profiles.id,
                nickname: logData.profiles.nickname,
                avatarUrl: logData.profiles.avatar_url,
                pets: []
              })
            }

            if (logData.pets) {
              setPet({
                id: logData.pets.id,
                name: logData.pets.name,
                species: logData.pets.species,
                birthDate: logData.pets.birth_date,
                weightKg: logData.pets.weight_kg,
                tags: []
              })
            }

            // 댓글 로드
            const { data: commentsData } = await supabase
              .from('comments')
              .select(`
                *,
                profiles:author_id(nickname, avatar_url)
              `)
              .eq('log_id', logId)
              .order('created_at', { ascending: true })

            if (commentsData) {
              setComments(commentsData.map((c: any) => ({
                id: c.id,
                logId: c.log_id,
                authorId: c.author_id,
                authorName: c.profiles?.nickname || '익명',
                avatarUrl: c.profiles?.avatar_url,
                content: c.content,
                createdAt: c.created_at,
                parentId: c.parent_id
              })))
            }

            // Q&A 로드
            const { data: threadsData } = await supabase
              .from('pet_log_qa_threads')
              .select('*')
              .eq('log_id', logId)

            if (threadsData && threadsData.length > 0) {
              setQAThreads(threadsData.map((t: any) => ({
                id: t.id,
                logId: t.log_id,
                title: t.title,
                authorId: t.author_id,
                createdAt: t.created_at
              })))

              const threadIds = threadsData.map((t: any) => t.id)
              const { data: postsData } = await supabase
                .from('pet_log_qa_posts')
                .select(`
                  *,
                  profiles:author_id(nickname, avatar_url)
                `)
                .in('thread_id', threadIds)
                .order('created_at', { ascending: true })

              if (postsData) {
                setQAPosts(postsData.map((p: any) => ({
                  id: p.id,
                  threadId: p.thread_id,
                  authorId: p.author_id,
                  content: p.content,
                  kind: p.kind,
                  parentId: p.parent_id,
                  isAccepted: p.is_accepted,
                  upvotes: p.upvotes || 0,
                  createdAt: p.created_at,
                  author: {
                    id: p.author_id,
                    nickname: p.profiles?.nickname || '익명',
                    avatarUrl: p.profiles?.avatar_url
                  }
                })))
              }
            }

            setIsLoading(false)
            return
          }
        }

        // Mock 데이터 fallback
        loadMockData()
      } catch (error) {
        console.error('[LogDetailPage] Error:', error)
        loadMockData()
      }
    }

    const loadMockData = () => {
      const mockLog = mockReviewLogs.find((l) => l.id === logId)
      if (mockLog) {
        setLog(mockLog)
        setPet(mockPets.find((p) => p.id === mockLog.petId) || null)
        setOwner(mockOwners.find((o) => o.id === mockLog.ownerId) || null)
        setComments(mockComments.filter((c) => c.logId === logId))
        setQAThreads(mockQAThreads.filter((t) => t.logId === logId))
        const threads = mockQAThreads.filter((t) => t.logId === logId)
        setQAPosts(mockQAPosts.filter((p) => threads.some((t) => t.id === p.threadId)) as QAPostWithAuthor[])
      }
      setIsLoading(false)
    }

    loadData()
  }, [logId])

  // 날짜 포맷
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'numeric',
      day: 'numeric'
    })
  }

  // 시간 경과 포맷
  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return '방금 전'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`
    return formatDate(dateString)
  }

  // 사용 일수 계산
  const calculateDaysUsed = (): number => {
    if (!log) return 0
    try {
      const startDate = new Date(log.periodStart)
      const endDate = log.periodEnd ? new Date(log.periodEnd) : new Date()
      return Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)))
    } catch {
      return log.durationDays || 0
    }
  }

  // 댓글/문의 제출
  const handleSubmit = async () => {
    if (!newComment.trim() || !user || !log) return

    setIsSubmitting(true)
    try {
      const supabase = getBrowserClient()
      if (!supabase) return

      if (activeTab === 'comments') {
        // 댓글 등록
        const { data, error } = await supabase
          .from('comments')
          .insert({
            log_id: log.id,
            author_id: user.id,
            content: newComment.trim()
          })
          .select(`
            *,
            profiles:author_id(nickname, avatar_url)
          `)
          .single()

        if (!error && data) {
          setComments([...comments, {
            id: data.id,
            logId: data.log_id,
            authorId: data.author_id,
            authorName: data.profiles?.nickname || '익명',
            content: data.content,
            createdAt: data.created_at
          }])
          setNewComment('')
        }
      } else {
        // 문의 등록 - 새 스레드 생성 후 질문 포스트 추가
        console.log('[문의 등록] 시작 - log_id:', log.id, 'user_id:', user.id)
        
        const { data: threadData, error: threadError } = await supabase
          .from('pet_log_qa_threads')
          .insert({
            log_id: log.id,
            title: newComment.trim().slice(0, 50),
            author_id: user.id
          })
          .select()
          .single()

        if (threadError) {
          console.error('[문의 등록] 스레드 생성 오류:', threadError)
          alert(`문의 등록 실패: ${threadError.message}`)
          return
        }

        console.log('[문의 등록] 스레드 생성 성공:', threadData)

        if (threadData) {
          // 질문 포스트 추가
          const { data: postData, error: postError } = await supabase
            .from('pet_log_qa_posts')
            .insert({
              thread_id: threadData.id,
              author_id: user.id,
              content: newComment.trim(),
              kind: 'question'
            })
            .select(`
              *,
              profiles:author_id(nickname, avatar_url)
            `)
            .single()

          if (postError) {
            console.error('[문의 등록] 포스트 생성 오류:', postError)
            alert(`문의 등록 실패: ${postError.message}`)
            return
          }

          console.log('[문의 등록] 포스트 생성 성공:', postData)

          if (postData) {
            setQAThreads([...qaThreads, {
              id: threadData.id,
              logId: threadData.log_id,
              title: threadData.title,
              authorId: threadData.author_id,
              createdAt: threadData.created_at
            }])
            setQAPosts([...qaPosts, {
              id: postData.id,
              threadId: postData.thread_id,
              authorId: postData.author_id,
              content: postData.content,
              kind: postData.kind,
              parentId: postData.parent_id,
              isAccepted: postData.is_accepted,
              upvotes: postData.upvotes || 0,
              createdAt: postData.created_at,
              author: {
                id: postData.author_id,
                nickname: postData.profiles?.nickname || '익명',
                avatarUrl: postData.profiles?.avatar_url
              }
            }])
            setNewComment('')
          }
        }
      }
    } catch (error) {
      console.error('등록 오류:', error)
      alert('등록 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 댓글 수정
  const handleEditComment = async (commentId: string) => {
    if (!editContent.trim() || !user) return

    try {
      const supabase = getBrowserClient()
      if (!supabase) return

      const { error } = await supabase
        .from('comments')
        .update({ content: editContent.trim() })
        .eq('id', commentId)
        .eq('author_id', user.id)

      if (!error) {
        setComments(comments.map(c => 
          c.id === commentId ? { ...c, content: editContent.trim() } : c
        ))
        setEditingCommentId(null)
        setEditContent('')
      }
    } catch (error) {
      console.error('댓글 수정 오류:', error)
    }
  }

  // 댓글 삭제
  const handleDeleteComment = async (commentId: string) => {
    if (!user || !confirm('댓글을 삭제하시겠습니까?')) return

    try {
      const supabase = getBrowserClient()
      if (!supabase) return

      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId)
        .eq('author_id', user.id)

      if (!error) {
        setComments(comments.filter(c => c.id !== commentId))
      }
    } catch (error) {
      console.error('댓글 삭제 오류:', error)
    }
    setMenuOpenId(null)
  }

  // 문의 수정
  const handleEditQAPost = async (postId: string) => {
    if (!editContent.trim() || !user) return

    try {
      const supabase = getBrowserClient()
      if (!supabase) return

      const { error } = await supabase
        .from('pet_log_qa_posts')
        .update({ content: editContent.trim() })
        .eq('id', postId)
        .eq('author_id', user.id)

      if (!error) {
        setQAPosts(qaPosts.map(p => 
          p.id === postId ? { ...p, content: editContent.trim() } : p
        ))
        setEditingQAPostId(null)
        setEditContent('')
      }
    } catch (error) {
      console.error('문의 수정 오류:', error)
    }
  }

  // 문의 삭제
  const handleDeleteQAPost = async (postId: string, threadId: string) => {
    if (!user || !confirm('문의를 삭제하시겠습니까?')) return

    try {
      const supabase = getBrowserClient()
      if (!supabase) return

      // 포스트 삭제
      const { error: postError } = await supabase
        .from('pet_log_qa_posts')
        .delete()
        .eq('id', postId)
        .eq('author_id', user.id)

      if (!postError) {
        // 해당 스레드의 다른 포스트가 없으면 스레드도 삭제
        const remainingPosts = qaPosts.filter(p => p.threadId === threadId && p.id !== postId)
        if (remainingPosts.length === 0) {
          await supabase
            .from('pet_log_qa_threads')
            .delete()
            .eq('id', threadId)
          setQAThreads(qaThreads.filter(t => t.id !== threadId))
        }
        setQAPosts(qaPosts.filter(p => p.id !== postId))
      }
    } catch (error) {
      console.error('문의 삭제 오류:', error)
    }
    setMenuOpenId(null)
  }

  // 댓글 답글 등록
  const handleReplyToComment = async (parentId: string) => {
    if (!replyContent.trim() || !user || !log) return

    try {
      const supabase = getBrowserClient()
      if (!supabase) return

      const { data, error } = await supabase
        .from('comments')
        .insert({
          log_id: log.id,
          author_id: user.id,
          content: replyContent.trim(),
          parent_id: parentId
        })
        .select(`
          *,
          profiles:author_id(nickname, avatar_url)
        `)
        .single()

      if (!error && data) {
        setComments([...comments, {
          id: data.id,
          logId: data.log_id,
          authorId: data.author_id,
          authorName: data.profiles?.nickname || '익명',
          avatarUrl: data.profiles?.avatar_url,
          content: data.content,
          createdAt: data.created_at,
          parentId: data.parent_id
        }])
        setReplyContent('')
        setReplyingToCommentId(null)
      }
    } catch (error) {
      console.error('답글 등록 오류:', error)
    }
  }

  // 문의 답변 등록
  const handleReplyToQA = async (threadId: string, questionId: string) => {
    if (!replyContent.trim() || !user) return

    try {
      const supabase = getBrowserClient()
      if (!supabase) return

      const { data, error } = await supabase
        .from('pet_log_qa_posts')
        .insert({
          thread_id: threadId,
          author_id: user.id,
          content: replyContent.trim(),
          kind: 'answer',
          parent_id: questionId
        })
        .select(`
          *,
          profiles:author_id(nickname, avatar_url)
        `)
        .single()

      if (!error && data) {
        setQAPosts([...qaPosts, {
          id: data.id,
          threadId: data.thread_id,
          authorId: data.author_id,
          content: data.content,
          kind: data.kind,
          parentId: data.parent_id,
          isAccepted: data.is_accepted,
          upvotes: data.upvotes || 0,
          createdAt: data.created_at,
          author: {
            id: data.author_id,
            nickname: data.profiles?.nickname || '익명',
            avatarUrl: data.profiles?.avatar_url
          }
        }])
        setReplyContent('')
        setReplyingToQAId(null)
      }
    } catch (error) {
      console.error('답변 등록 오류:', error)
    }
  }

  // 도움돼요 토글
  const handleToggleHelpful = async () => {
    if (!user) {
      alert('로그인이 필요합니다.')
      return
    }
    if (!log || isMarkingHelpful) return

    setIsMarkingHelpful(true)
    try {
      const supabase = getBrowserClient()
      if (!supabase) return

      if (hasMarkedHelpful) {
        // 도움돼요 취소
        await supabase
          .from('review_log_helpful')
          .delete()
          .eq('log_id', log.id)
          .eq('user_id', user.id)

        // likes 감소
        await supabase
          .from('review_logs')
          .update({ likes: Math.max(0, helpfulCount - 1) })
          .eq('id', log.id)

        setHelpfulCount(prev => Math.max(0, prev - 1))
        setHasMarkedHelpful(false)
      } else {
        // 도움돼요 추가
        await supabase
          .from('review_log_helpful')
          .insert({
            log_id: log.id,
            user_id: user.id
          })

        // likes 증가
        await supabase
          .from('review_logs')
          .update({ likes: helpfulCount + 1 })
          .eq('id', log.id)

        setHelpfulCount(prev => prev + 1)
        setHasMarkedHelpful(true)
      }
    } catch (error) {
      console.error('도움돼요 토글 오류:', error)
    } finally {
      setIsMarkingHelpful(false)
    }
  }

  // 탭 변경 시 해당 섹션으로 스크롤
  const handleTabChange = (tab: 'comments' | 'qa') => {
    setActiveTab(tab)
    setTimeout(() => {
      if (tab === 'comments' && commentsSectionRef.current) {
        commentsSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      } else if (tab === 'qa' && qaSectionRef.current) {
        qaSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }, 100)
  }

  // 공유 기능
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${log?.product} 후기`,
        text: log?.excerpt || '',
        url: window.location.href
      })
    } else {
      navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사되었습니다!')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-violet-500"></div>
      </div>
    )
  }

  if (!log || !pet || !owner) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 mb-2">로그를 찾을 수 없습니다</p>
          <button
            onClick={() => router.back()}
            className="text-violet-600 hover:text-violet-700"
          >
            돌아가기
          </button>
        </div>
      </div>
    )
  }

  const daysUsed = calculateDaysUsed()
  const totalHelpful = qaPosts.reduce((sum, p) => sum + (p.upvotes || 0), 0)

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      {/* 헤더 */}
      <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
        <button
          onClick={() => router.back()}
          className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <ArrowLeft className="h-5 w-5 text-gray-700" />
        </button>
        <h1 className="text-base font-semibold text-gray-900">로그 상세보기</h1>
        <button
          onClick={handleShare}
          className="p-2 -mr-2 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Share2 className="h-5 w-5 text-gray-700" />
        </button>
      </div>

      {/* 프로필 영역 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white px-4 py-4"
      >
        <button
          onClick={() => router.push(`/owners/${owner.id}`)}
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="relative flex-shrink-0">
            {owner.avatarUrl && (owner.avatarUrl.startsWith('http') || owner.avatarUrl.startsWith('/')) ? (
              <Image
                src={owner.avatarUrl}
                alt={owner.nickname}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                <span className="text-gray-500 font-medium">
                  {owner.nickname.charAt(0)}
                </span>
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-gray-900">{owner.nickname}</span>
              <ChevronRight className="h-4 w-4 text-gray-400" />
            </div>
            <p className="text-sm text-gray-500">
              {pet.name} · {pet.species === 'dog' ? '강아지' : pet.species === 'cat' ? '고양이' : pet.species}
            </p>
          </div>
        </button>
      </motion.div>

      {/* 제품 정보 카드 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mx-4 my-4 bg-white rounded-2xl border border-gray-100 p-4 relative"
      >
        {/* 사용 기간 배지 */}
        <div className="absolute top-4 right-4">
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            log.status === 'feeding' ? 'bg-green-50 text-green-600' :
            log.status === 'completed' ? 'bg-gray-100 text-gray-600' :
            'bg-red-50 text-red-600'
          }`}>
            {log.status === 'feeding' 
              ? `${daysUsed}일째 사용 중`
              : log.status === 'completed' ? '사용 완료' : '사용 중지'
            }
          </span>
        </div>

        {/* 카테고리 레이블 */}
        <p className="text-xs font-medium text-violet-500 uppercase tracking-wider mb-2">
          {log.category === 'feed' ? 'FEED LOG' :
           log.category === 'snack' ? 'SNACK LOG' :
           log.category === 'supplement' ? 'SUPPLEMENT LOG' :
           log.category === 'toilet' ? 'TOILET LOG' : 'PET LOG'}
        </p>

        {/* 제품명 */}
        <h2 className="text-lg font-bold text-gray-900 mb-2 pr-24">
          {log.product}
        </h2>

        {/* 기능 태그 */}
        <div className="mb-3">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-violet-50 text-violet-600">
            <CheckCircle className="h-3 w-3" />
            {log.category === 'supplement' ? '건강 개선' : 
             log.category === 'feed' ? '영양 공급' :
             log.category === 'snack' ? '기호성 좋음' : 
             log.category === 'toilet' ? '위생 관리' : '반려 케어'}
          </span>
        </div>

        {/* 기록 시작일 */}
        <p className="text-sm text-gray-500">
          기록 시작: {formatDate(log.periodStart)}
        </p>
      </motion.div>

      {/* 후기 내용 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mx-4 mb-4 bg-white rounded-2xl border border-gray-100 p-5"
      >
        <h3 className="text-sm font-semibold text-gray-900 mb-3">사용 후기</h3>
        {log.excerpt ? (
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line">
            {log.excerpt}
          </p>
        ) : (
          <p className="text-sm text-gray-400 italic">
            아직 작성된 후기가 없습니다.
          </p>
        )}
        {log.notes && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-medium text-gray-500 mb-2">추가 메모</h4>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
              {log.notes}
            </p>
          </div>
        )}

        {/* 도움돼요 버튼 */}
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={handleToggleHelpful}
            disabled={isMarkingHelpful}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
              hasMarkedHelpful
                ? 'bg-violet-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-violet-100 hover:text-violet-700'
            } disabled:opacity-50`}
          >
            <ThumbsUp className={`h-4 w-4 ${hasMarkedHelpful ? 'fill-current' : ''}`} />
            도움돼요
          </button>
          <span className="text-sm text-gray-500">
            {helpfulCount > 0 && `${helpfulCount}명에게 도움이 됐어요`}
          </span>
        </div>
      </motion.div>

      {/* 구분선 */}
      <div className="border-t border-gray-200 my-4" />

      {/* 댓글 섹션 */}
      <div ref={commentsSectionRef} className="px-4 mb-4">
        <h3 className="text-lg font-bold text-gray-900 mb-3">
          댓글 <span className="text-violet-500">{comments.length}</span>
        </h3>
        {comments.filter(c => !c.parentId).length > 0 ? (
          <div className="space-y-3">
            {comments.filter(c => !c.parentId).map((comment) => (
              <div key={comment.id} className="bg-white rounded-xl p-3 border border-gray-100 relative">
                {editingCommentId === comment.id ? (
                  // 수정 모드
                  <div className="space-y-2">
                    <textarea
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                      rows={2}
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { setEditingCommentId(null); setEditContent(''); }}
                        className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                      >
                        취소
                      </button>
                      <button
                        onClick={() => handleEditComment(comment.id)}
                        className="px-3 py-1.5 text-xs bg-violet-500 text-white rounded-lg hover:bg-violet-600"
                      >
                        저장
                      </button>
                    </div>
                  </div>
                ) : (
                  // 일반 모드
                  <>
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                        <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                      </div>
                      {user && user.id === comment.authorId && (
                        <div className="relative">
                          <button
                            onClick={() => setMenuOpenId(menuOpenId === comment.id ? null : comment.id)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                          >
                            <MoreVertical className="h-4 w-4 text-gray-400" />
                          </button>
                          {menuOpenId === comment.id && (
                            <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden min-w-[100px]">
                              <button
                                onClick={() => {
                                  setEditingCommentId(comment.id)
                                  setEditContent(comment.content)
                                  setMenuOpenId(null)
                                }}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full whitespace-nowrap"
                              >
                                <Edit2 className="h-4 w-4 flex-shrink-0" /> 수정
                              </button>
                              <button
                                onClick={() => handleDeleteComment(comment.id)}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full whitespace-nowrap"
                              >
                                <Trash2 className="h-4 w-4 flex-shrink-0" /> 삭제
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-gray-700">{comment.content}</p>
                    
                    {/* 답글 버튼 - 부모 댓글에만 표시 */}
                    {!comment.parentId && (
                      <button
                        onClick={() => {
                          if (!user) {
                            alert('로그인이 필요합니다.')
                            return
                          }
                          setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)
                          setReplyContent('')
                        }}
                        className="mt-2 text-xs text-violet-600 hover:text-violet-700 font-medium"
                      >
                        {replyingToCommentId === comment.id ? '취소' : '답글 달기'}
                      </button>
                    )}

                    {/* 답글 입력 영역 */}
                    {replyingToCommentId === comment.id && (
                      <div className="mt-3 pl-3 border-l-2 border-violet-200">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="답글을 입력하세요..."
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                          rows={2}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => { setReplyingToCommentId(null); setReplyContent(''); }}
                            className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => handleReplyToComment(comment.id)}
                            disabled={!replyContent.trim()}
                            className="px-3 py-1.5 text-xs bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50"
                          >
                            답글 등록
                          </button>
                        </div>
                      </div>
                    )}

                    {/* 대댓글(답글) 표시 */}
                    {comments.filter(reply => reply.parentId === comment.id).length > 0 && (
                      <div className="mt-3 space-y-2 pl-3 border-l-2 border-gray-200">
                        {comments.filter(reply => reply.parentId === comment.id).map(reply => (
                          <div key={reply.id} className="bg-gray-50 rounded-lg p-2.5">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs font-medium text-gray-800">{reply.authorName}</span>
                              <span className="text-xs text-gray-400">{formatTimeAgo(reply.createdAt)}</span>
                            </div>
                            <p className="text-xs text-gray-600">{reply.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-500">아직 댓글이 없습니다</p>
          </div>
        )}
      </div>

      {/* 구분선 */}
      <div className="border-t border-gray-200 mb-4" />

      {/* 문의 섹션 */}
      <div ref={qaSectionRef} className="px-4 pb-40">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-900">
            문의 <span className="text-violet-500">{qaThreads.length}</span>
          </h3>
          {totalHelpful > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-full text-sm text-red-500">
              <Heart className="h-4 w-4 fill-current" />
              도움돼요 {totalHelpful}
            </span>
          )}
        </div>

        {qaPosts.filter(p => p.kind === 'question').length > 0 ? (
          <div className="space-y-3">
            {qaPosts.filter(p => p.kind === 'question').map((question) => {
              const answers = qaPosts.filter(p => p.kind === 'answer' && p.threadId === question.threadId)
              return (
                <div key={question.id} className="bg-gray-50 rounded-2xl p-4 relative">
                  {editingQAPostId === question.id ? (
                    // 수정 모드
                    <div className="space-y-2">
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                        rows={3}
                      />
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => { setEditingQAPostId(null); setEditContent(''); }}
                          className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                        >
                          취소
                        </button>
                        <button
                          onClick={() => handleEditQAPost(question.id)}
                          className="px-3 py-1.5 text-xs bg-violet-500 text-white rounded-lg hover:bg-violet-600"
                        >
                          저장
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs text-violet-600 font-medium">
                          {question.author?.nickname || '익명'}님의 문의
                        </p>
                        {user && user.id === question.authorId && (
                          <div className="relative">
                            <button
                              onClick={() => setMenuOpenId(menuOpenId === `qa-${question.id}` ? null : `qa-${question.id}`)}
                              className="p-1 hover:bg-gray-200 rounded-full"
                            >
                              <MoreVertical className="h-4 w-4 text-gray-400" />
                            </button>
                            {menuOpenId === `qa-${question.id}` && (
                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden min-w-[100px]">
                                <button
                                  onClick={() => {
                                    setEditingQAPostId(question.id)
                                    setEditContent(question.content)
                                    setMenuOpenId(null)
                                  }}
                                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full whitespace-nowrap"
                                >
                                  <Edit2 className="h-4 w-4 flex-shrink-0" /> 수정
                                </button>
                                <button
                                  onClick={() => handleDeleteQAPost(question.id, question.threadId)}
                                  className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full whitespace-nowrap"
                                >
                                  <Trash2 className="h-4 w-4 flex-shrink-0" /> 삭제
                                </button>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-800">{question.content}</p>
                      <p className="text-xs text-gray-400 mt-1">{formatTimeAgo(question.createdAt)}</p>
                    </>
                  )}
                  {/* 답변 표시 */}
                  {answers.filter(a => !a.parentId || a.parentId === question.id).length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
                      {answers.filter(a => !a.parentId || a.parentId === question.id).map(answer => {
                        // 이 답변에 대한 대댓글들
                        const answerReplies = qaPosts.filter(p => p.parentId === answer.id)
                        
                        return (
                          <div key={answer.id} className="bg-white rounded-lg p-3 border border-green-100">
                            <div className="flex items-center justify-between mb-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs text-green-600 font-medium">
                                  {answer.author?.nickname || '익명'}님의 답변
                                </p>
                                <span className="text-xs text-gray-400">{formatTimeAgo(answer.createdAt)}</span>
                              </div>
                              {user && user.id === answer.authorId && (
                                <div className="relative">
                                  <button
                                    onClick={() => setMenuOpenId(menuOpenId === `answer-${answer.id}` ? null : `answer-${answer.id}`)}
                                    className="p-1 hover:bg-gray-100 rounded-full"
                                  >
                                    <MoreVertical className="h-3.5 w-3.5 text-gray-400" />
                                  </button>
                                  {menuOpenId === `answer-${answer.id}` && (
                                    <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden min-w-[100px]">
                                      <button
                                        onClick={() => {
                                          setEditingQAPostId(answer.id)
                                          setEditContent(answer.content)
                                          setMenuOpenId(null)
                                        }}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full whitespace-nowrap"
                                      >
                                        <Edit2 className="h-4 w-4 flex-shrink-0" /> 수정
                                      </button>
                                      <button
                                        onClick={() => handleDeleteQAPost(answer.id, answer.threadId)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full whitespace-nowrap"
                                      >
                                        <Trash2 className="h-4 w-4 flex-shrink-0" /> 삭제
                                      </button>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                            
                            {editingQAPostId === answer.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                                  rows={2}
                                />
                                <div className="flex justify-end gap-2">
                                  <button
                                    onClick={() => { setEditingQAPostId(null); setEditContent(''); }}
                                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                                  >
                                    취소
                                  </button>
                                  <button
                                    onClick={() => handleEditQAPost(answer.id)}
                                    className="px-3 py-1.5 text-xs bg-violet-500 text-white rounded-lg hover:bg-violet-600"
                                  >
                                    저장
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-sm text-gray-700">{answer.content}</p>
                                
                                {/* 답변에 답글 달기 버튼 */}
                                <button
                                  onClick={() => {
                                    if (!user) {
                                      alert('로그인이 필요합니다.')
                                      return
                                    }
                                    setReplyingToQAId(replyingToQAId === answer.id ? null : answer.id)
                                    setReplyContent('')
                                  }}
                                  className="mt-2 text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                  {replyingToQAId === answer.id ? '취소' : '답글 달기'}
                                </button>
                              </>
                            )}

                            {/* 답변에 대한 답글 입력 */}
                            {replyingToQAId === answer.id && (
                              <div className="mt-2 pl-3 border-l-2 border-blue-200">
                                <textarea
                                  value={replyContent}
                                  onChange={(e) => setReplyContent(e.target.value)}
                                  placeholder="답글을 입력하세요..."
                                  className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                                  rows={2}
                                />
                                <div className="flex justify-end gap-2 mt-2">
                                  <button
                                    onClick={() => { setReplyingToQAId(null); setReplyContent(''); }}
                                    className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                                  >
                                    취소
                                  </button>
                                  <button
                                    onClick={() => handleReplyToQA(answer.threadId, answer.id)}
                                    disabled={!replyContent.trim()}
                                    className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
                                  >
                                    답글 등록
                                  </button>
                                </div>
                              </div>
                            )}

                            {/* 답변에 대한 대댓글 표시 */}
                            {answerReplies.length > 0 && (
                              <div className="mt-2 pl-3 border-l-2 border-gray-200 space-y-2">
                                {answerReplies.map(reply => (
                                  <div key={reply.id} className="bg-gray-50 rounded-lg p-2.5">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="text-xs font-medium text-blue-600">
                                        {reply.author?.nickname || '익명'}
                                      </span>
                                      <span className="text-xs text-gray-400">{formatTimeAgo(reply.createdAt)}</span>
                                    </div>
                                    <p className="text-xs text-gray-600">{reply.content}</p>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}

                  {/* 문의에 답변하기 버튼 */}
                  <div className="mt-3">
                    {replyingToQAId === question.id ? (
                      <div className="bg-white rounded-lg p-3 border border-violet-200">
                        <textarea
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="답변을 입력하세요..."
                          className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                          rows={3}
                        />
                        <div className="flex justify-end gap-2 mt-2">
                          <button
                            onClick={() => { setReplyingToQAId(null); setReplyContent(''); }}
                            className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => handleReplyToQA(question.threadId, question.id)}
                            disabled={!replyContent.trim()}
                            className="px-3 py-1.5 text-xs bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
                          >
                            답변 등록
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          if (!user) {
                            alert('로그인이 필요합니다.')
                            return
                          }
                          setReplyingToQAId(question.id)
                          setReplyContent('')
                        }}
                        className="text-xs text-green-600 hover:text-green-700 font-medium"
                      >
                        답변하기
                      </button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-gray-50 rounded-2xl">
            <HelpCircle className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">아직 문의가 없습니다</p>
          </div>
        )}
      </div>

      {/* 하단 탭 & 입력 영역 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-20">
        {/* 탭 */}
        <div className="flex">
          <button
            onClick={() => handleTabChange('comments')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'bg-violet-500 text-white'
                : 'bg-white text-gray-600'
            }`}
          >
            댓글 {comments.length > 0 && `(${comments.length})`}
          </button>
          <button
            onClick={() => handleTabChange('qa')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'qa'
                ? 'bg-violet-500 text-white'
                : 'bg-white text-gray-600 border-l border-gray-200'
            }`}
          >
            문의 {qaThreads.length > 0 && `(${qaThreads.length})`}
          </button>
        </div>

        {/* 입력 영역 */}
        <div className="p-4 flex items-center gap-3">
          <input
            type="text"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={activeTab === 'comments' ? '응원 댓글 입력...' : '문의 내용 입력...'}
            className="flex-1 px-4 py-3 bg-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit()
              }
            }}
          />
          <button
            onClick={() => {
              console.log('[버튼 클릭] newComment:', newComment, 'isSubmitting:', isSubmitting, 'user:', user, 'log:', log, 'activeTab:', activeTab)
              if (!user) {
                alert('로그인이 필요합니다.')
                return
              }
              if (!newComment.trim()) {
                alert('내용을 입력해주세요.')
                return
              }
              handleSubmit()
            }}
            disabled={isSubmitting}
            className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
              newComment.trim() && !isSubmitting
                ? 'bg-violet-500 text-white hover:bg-violet-600'
                : 'bg-gray-300 text-gray-500'
            }`}
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}
