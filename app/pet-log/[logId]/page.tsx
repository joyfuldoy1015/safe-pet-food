'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Share2, Heart, HelpCircle, Send, CheckCircle, ChevronRight } from 'lucide-react'
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

  // 댓글 제출
  const handleCommentSubmit = async () => {
    if (!newComment.trim() || !user || !log) return

    setIsSubmitting(true)
    try {
      const supabase = getBrowserClient()
      if (supabase) {
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
      }
    } catch (error) {
      console.error('댓글 등록 오류:', error)
    } finally {
      setIsSubmitting(false)
    }
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
      </motion.div>

      {/* 구분선 */}
      <div className="border-t border-gray-200 my-4" />

      {/* 집사 문답 섹션 */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="px-4 mb-4"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-gray-900">
            집사 문답 <span className="text-violet-500">{qaThreads.length}</span>
          </h3>
          {totalHelpful > 0 && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 rounded-full text-sm text-red-500">
              <Heart className="h-4 w-4 fill-current" />
              도움돼요 {totalHelpful}
            </span>
          )}
        </div>

        {/* Q&A 목록 */}
        {qaPosts.filter(p => p.kind === 'question').length > 0 ? (
          <div className="space-y-3">
            {qaPosts.filter(p => p.kind === 'question').map((question) => {
              const answers = qaPosts.filter(p => p.kind === 'answer' && p.threadId === question.threadId)
              return (
                <div key={question.id} className="bg-gray-50 rounded-2xl p-4">
                  <p className="text-xs text-violet-600 font-medium mb-1">
                    {question.author?.nickname || '익명'}님의 문의
                  </p>
                  <p className="text-sm text-gray-800">{question.content}</p>
                  {answers.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-green-600 font-medium mb-1">답변</p>
                      <p className="text-sm text-gray-700">{answers[0].content}</p>
                    </div>
                  )}
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
      </motion.div>

      {/* 구분선 */}
      <div className="border-t border-gray-200" />

      {/* 하단 탭 & 입력 영역 */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        {/* 탭 */}
        <div className="flex">
          <button
            onClick={() => setActiveTab('comments')}
            className={`flex-1 py-3 text-sm font-medium transition-colors ${
              activeTab === 'comments'
                ? 'bg-violet-500 text-white'
                : 'bg-white text-gray-600'
            }`}
          >
            댓글 {comments.length > 0 && `(${comments.length})`}
          </button>
          <button
            onClick={() => setActiveTab('qa')}
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
                handleCommentSubmit()
              }
            }}
          />
          <button
            onClick={handleCommentSubmit}
            disabled={!newComment.trim() || isSubmitting}
            className="w-12 h-12 bg-violet-500 text-white rounded-full flex items-center justify-center hover:bg-violet-600 transition-colors disabled:opacity-50"
          >
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* 댓글 목록 (탭이 comments일 때) */}
      {activeTab === 'comments' && comments.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="px-4 pb-4"
        >
          <h3 className="text-lg font-bold text-gray-900 mb-3">댓글</h3>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div key={comment.id} className="bg-white rounded-xl p-3 border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
                  <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-gray-700">{comment.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
