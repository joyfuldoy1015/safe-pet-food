'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Heart, MessageCircle, Eye, Calendar, ChevronDown, ChevronUp, Edit, Trash2, ExternalLink, Plus, Loader2, ArrowLeft, Share2, CheckCircle } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import type { ReviewLog, Pet, Owner, Comment, QAThread, QAPost, QAPostWithAuthor } from '@/lib/types/review-log'
import CommentThread from '@/app/components/pet-log/CommentThread'
import QAThreadList from './QAThreadList'
import { useAuth } from '@/hooks/useAuth'

interface LogDetailDrawerProps {
  log: ReviewLog | null
  pet: Pet | null
  owner: Owner | null
  isOpen: boolean
  onClose: () => void
  onStatusChange?: (logId: string, newStatus: 'feeding' | 'paused' | 'completed') => void
  onEdit?: (log: ReviewLog) => void
  onDelete?: (logId: string) => void
  formatTimeAgo: (date: string) => string
  formatDate: (date: string) => string
  calculateAge: (birthDate: string) => string
  comments: Comment[]
  onCommentSubmit: (logId: string, content: string, parentId?: string) => void
  onCommentEdit?: (commentId: string, newContent: string) => void
  onCommentDelete?: (commentId: string) => void
  onAuthRequired?: () => void
  qaThreads?: QAThread[]
  qaPosts?: QAPostWithAuthor[]
  onQAThreadCreate?: (logId: string, title: string, content: string) => void
  onQAPostSubmit?: (threadId: string, content: string, kind: 'question' | 'answer' | 'comment', parentId?: string) => void
  onQAPostEdit?: (postId: string, newContent: string) => void
  onQAPostDelete?: (postId: string) => void
  onQAThreadDelete?: (threadId: string) => void
  onAcceptAnswer?: (postId: string) => void
  onUpvote?: (postId: string) => void
  getAuthorInfo?: (authorId: string) => { nickname: string; avatarUrl?: string } | null
  initialTab?: 'details' | 'comments' | 'qa'
  initialThreadId?: string
}

/**
 * Detailed log drawer with full information and comments
 */
export default function LogDetailDrawer({
  log,
  pet,
  owner,
  isOpen,
  onClose,
  onStatusChange,
  onEdit,
  onDelete,
  formatTimeAgo,
  formatDate,
  calculateAge,
  comments,
  onCommentSubmit,
  onCommentEdit,
  onCommentDelete,
  onAuthRequired,
  qaThreads = [],
  qaPosts = [],
  onQAThreadCreate,
  onQAPostSubmit,
  onQAPostEdit,
  onQAPostDelete,
  onQAThreadDelete,
  onAcceptAnswer,
  onUpvote,
  getAuthorInfo,
  initialTab = 'details',
  initialThreadId
}: LogDetailDrawerProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'qa'>(initialTab)
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['reason', 'changes']))
  const [newComment, setNewComment] = useState('')
  
  // Q&A 질문 작성 관련 state
  const [showQAForm, setShowQAForm] = useState(false)
  const [qaTitle, setQATitle] = useState('')
  const [qaContent, setQAContent] = useState('')

  // 제품 등록 요청 관련 state
  const [showProductRequestForm, setShowProductRequestForm] = useState(false)
  const [productRequestDescription, setProductRequestDescription] = useState('')
  const [isSubmittingRequest, setIsSubmittingRequest] = useState(false)
  const [requestSubmitted, setRequestSubmitted] = useState(false)
  
  // 제품 존재 여부 확인
  const [productExists, setProductExists] = useState<boolean | null>(null)
  const [isCheckingProduct, setIsCheckingProduct] = useState(false)

  // Update active tab when initialTab changes
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

  // Reset product request form when drawer closes
  useEffect(() => {
    if (!isOpen) {
      setShowProductRequestForm(false)
      setProductRequestDescription('')
      setRequestSubmitted(false)
      setProductExists(null)
    }
  }, [isOpen])

  // 제품 존재 여부 확인
  useEffect(() => {
    const checkProductExists = async () => {
      if (!isOpen || !log?.brand) return
      
      setIsCheckingProduct(true)
      try {
        const response = await fetch(`/api/brands/${encodeURIComponent(log.brand)}`)
        if (response.ok) {
          const data = await response.json()
          // 브랜드가 존재하고 제품 목록이 있는지 확인
          const hasProducts = data.products && Array.isArray(data.products) && data.products.length > 0
          setProductExists(hasProducts)
        } else {
          // 브랜드가 없으면 제품도 없음
          setProductExists(false)
        }
      } catch (error) {
        console.error('제품 확인 오류:', error)
        setProductExists(false)
      } finally {
        setIsCheckingProduct(false)
      }
    }

    checkProductExists()
  }, [isOpen, log?.brand])

  // 제품 등록 요청 제출
  const handleProductRequestSubmit = async () => {
    if (!user) {
      if (onAuthRequired) {
        onAuthRequired()
      }
      return
    }

    if (!log) return

    setIsSubmittingRequest(true)
    try {
      const response = await fetch('/api/product-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          brand_name: log.brand,
          product_name: log.product,
          category: log.category || 'feed',
          description: productRequestDescription || undefined
        })
      })

      const result = await response.json()
      
      if (response.ok) {
        setRequestSubmitted(true)
        setShowProductRequestForm(false)
        alert(result.message || '제품 등록 요청이 접수되었습니다.')
      } else {
        alert(result.error || '요청 처리 중 오류가 발생했습니다.')
      }
    } catch (error) {
      console.error('제품 등록 요청 오류:', error)
      alert('요청 처리 중 오류가 발생했습니다.')
    } finally {
      setIsSubmittingRequest(false)
    }
  }

  if (!log || !pet || !owner) return null

  const isOwner = user?.id === log.ownerId
  const reviewComments = comments.filter((c) => c.logId === log.id)

  const statusConfig = {
    feeding: { label: '급여 중', color: 'bg-green-100 text-green-800' },
    paused: { label: '급여 중지', color: 'bg-gray-100 text-gray-800' },
    completed: { label: '급여 완료', color: 'bg-blue-100 text-blue-800' }
  }

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(section)) {
        newSet.delete(section)
      } else {
        newSet.add(section)
      }
      return newSet
    })
  }

  const handleStatusChange = (newStatus: 'feeding' | 'paused' | 'completed') => {
    if (onStatusChange && confirm(`상태를 "${statusConfig[newStatus].label}"로 변경하시겠습니까?`)) {
      onStatusChange(log.id, newStatus)
    }
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return

    if (!user && onAuthRequired) {
      onAuthRequired()
      return
    }

    onCommentSubmit(log.id, newComment.trim())
    setNewComment('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />

          {/* Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed right-0 top-0 bottom-0 w-full h-full md:w-[600px] md:h-auto bg-gray-50 shadow-strong z-50 overflow-y-auto"
          >
            {/* Header - 로그 상세보기 */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between z-10">
              <button
                onClick={onClose}
                className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-700" />
              </button>
              <h2 className="text-base font-semibold text-gray-900">로그 상세보기</h2>
              <div className="flex items-center gap-1">
                {isOwner && onEdit && (
                  <button
                    onClick={() => onEdit(log)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="수정"
                  >
                    <Edit className="h-4 w-4 text-gray-500" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: `${log.product} 후기`,
                        text: log.excerpt,
                        url: window.location.href
                      })
                    }
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <Share2 className="h-5 w-5 text-gray-700" />
                </button>
              </div>
            </div>

            {/* 프로필 영역 */}
            <div className="bg-white px-4 py-4">
              <button
                onClick={() => router.push(`/pet-log/pets/${pet.id}`)}
                className="flex items-center gap-3 hover:opacity-80 transition-opacity"
              >
                {/* 아바타 */}
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
                    <ChevronDown className="h-4 w-4 text-gray-400 rotate-[-90deg]" />
                  </div>
                  <p className="text-sm text-gray-500">
                    {pet.name} · {pet.species === 'dog' ? '강아지' : pet.species === 'cat' ? '고양이' : pet.species}
                  </p>
                </div>
              </button>
            </div>

            {/* 제품 정보 카드 */}
            <div className="mx-4 my-4 bg-white rounded-2xl border border-gray-100 p-4 relative">
              {/* 사용 기간 배지 */}
              <div className="absolute top-4 right-4">
                <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
                  log.status === 'feeding' ? 'bg-green-50 text-green-600' :
                  log.status === 'completed' ? 'bg-gray-100 text-gray-600' :
                  'bg-red-50 text-red-600'
                }`}>
                  {log.status === 'feeding' 
                    ? `${log.durationDays || Math.ceil((new Date().getTime() - new Date(log.periodStart).getTime()) / (1000 * 60 * 60 * 24))}일째 사용 중`
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
              <h3 className="text-lg font-bold text-gray-900 mb-2 pr-24">
                {log.product}
              </h3>

              {/* 기능 태그 (임시 - 실제 데이터에서 가져와야 함) */}
              {log.excerpt && (
                <div className="mb-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-green-50 text-green-600">
                    <CheckCircle className="h-3 w-3" />
                    {log.category === 'supplement' ? '건강 개선' : 
                     log.category === 'feed' ? '영양 공급' :
                     log.category === 'snack' ? '기호성 좋음' : '사용 중'}
                  </span>
                </div>
              )}

              {/* 기록 시작일 */}
              <p className="text-sm text-gray-500">
                기록 시작: {formatDate(log.periodStart)}
              </p>
            </div>

            {/* AI 스마트 분석 (선택적) */}
            {log.excerpt && (
              <div className="mx-4 mb-4 bg-violet-50 rounded-2xl p-4 border border-violet-100">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">✨</span>
                  <span className="text-sm font-semibold text-violet-700">AI 스마트 분석</span>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {log.product}은(는) {pet.species === 'dog' ? '반려견' : '반려묘'}에게 {
                    log.category === 'supplement' ? '건강 개선과 영양 보충에 효과적인 제품입니다.' :
                    log.category === 'feed' ? '균형 잡힌 영양소를 제공하는 사료입니다.' :
                    log.category === 'snack' ? '기호성이 좋은 간식입니다.' :
                    '유용한 용품입니다.'
                  }
                </p>
              </div>
            )}

            {/* 후기 내용 */}
            {log.excerpt && (
              <div className="mx-4 mb-4 bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-sm text-gray-700 leading-relaxed italic">
                  &ldquo;{log.excerpt}&rdquo;
                </p>
              </div>
            )}

            {/* 상태 변경 (소유자만) */}
            {isOwner && onStatusChange && (
              <div className="mx-4 mb-4 bg-white rounded-2xl border border-gray-100 p-4">
                <p className="text-xs font-medium text-gray-500 mb-2">상태 변경</p>
                <div className="flex gap-2">
                  {(['feeding', 'paused', 'completed'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        log.status === s
                          ? statusConfig[s].color
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 제품 상세 링크 */}
            <div className="mx-4 mb-4">
              {isCheckingProduct ? (
                <div className="flex items-center justify-center gap-2 py-3 text-gray-500">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">제품 정보 확인 중...</span>
                </div>
              ) : productExists === false ? (
                <div className="space-y-3">
                  <div className="text-center py-3 px-4 bg-gray-50 rounded-xl">
                    <p className="text-sm text-gray-600">📦 아직 제품 목록에 등록되어 있지 않아요</p>
                  </div>
                  {!requestSubmitted && !showProductRequestForm && (
                    <button
                      onClick={() => {
                        if (!user) {
                          if (onAuthRequired) onAuthRequired()
                          return
                        }
                        setShowProductRequestForm(true)
                      }}
                      className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-500 text-white rounded-xl text-sm font-medium hover:bg-violet-600 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                      <span>제품 등록 요청하기</span>
                    </button>
                  )}
                </div>
              ) : (
                <button
                  onClick={() => {
                    router.push(`/brands/${log.brand}`)
                    onClose()
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-violet-500 text-white rounded-xl text-sm font-medium hover:bg-violet-600 transition-colors"
                >
                  <span>제품에 대해 자세히 알아보기</span>
                  <ExternalLink className="h-4 w-4" />
                </button>
              )}
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'text-[#3056F5] border-b-2 border-[#3056F5]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                상세 정보
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors relative ${
                  activeTab === 'comments'
                    ? 'text-[#3056F5] border-b-2 border-[#3056F5]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                댓글
                {reviewComments.length > 0 && (
                  <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-sm">
                    {reviewComments.length}
                  </span>
                )}
              </button>
              <button
                onClick={() => setActiveTab('qa')}
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-sm sm:text-base font-medium transition-colors relative ${
                  activeTab === 'qa'
                    ? 'text-[#3056F5] border-b-2 border-[#3056F5]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Q&A
                {qaThreads.length > 0 && (
                  <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-sm">
                    {qaThreads.length}
                  </span>
                )}
              </button>
            </div>

            {/* Content */}
            <div className="p-4 sm:p-6 space-y-4">
              {activeTab === 'details' ? (
                <>
                  {/* 급여 이유/목표 */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('reason')}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm sm:text-base font-semibold text-gray-900">급여 이유/목표</span>
                      {expandedSections.has('reason') ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedSections.has('reason') && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-3 sm:px-4 py-2 sm:py-3"
                        >
                          <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">
                            {log.notes || log.excerpt}
                          </p>
                          {log.continueReasons && log.continueReasons.length > 0 && (
                            <div className="mt-3">
                              <p className="text-sm font-medium text-gray-600 mb-2">계속하는 이유:</p>
                              <div className="flex flex-wrap gap-2">
                                {log.continueReasons.map((reason) => (
                                  <span
                                    key={reason}
                                    className="px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-sm border border-emerald-100"
                                  >
                                    {reason}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 관찰된 변화 */}
                  <div className="border border-gray-200 rounded-xl overflow-hidden">
                    <button
                      onClick={() => toggleSection('changes')}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                    >
                      <span className="text-sm sm:text-base font-semibold text-gray-900">관찰된 변화</span>
                      {expandedSections.has('changes') ? (
                        <ChevronUp className="h-5 w-5 text-gray-600" />
                      ) : (
                        <ChevronDown className="h-5 w-5 text-gray-600" />
                      )}
                    </button>
                    <AnimatePresence>
                      {expandedSections.has('changes') && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="px-3 sm:px-4 py-2 sm:py-3"
                        >
                          <p className="text-sm sm:text-base text-gray-700 whitespace-pre-line">
                            {log.notes || '관찰된 변화가 기록되지 않았습니다.'}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 중지/교체 이유 */}
                  {log.stopReasons && log.stopReasons.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection('stop')}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-sm sm:text-base font-semibold text-gray-900">중지/교체 이유</span>
                        {expandedSections.has('stop') ? (
                          <ChevronUp className="h-5 w-5 text-gray-600" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-gray-600" />
                        )}
                      </button>
                      <AnimatePresence>
                        {expandedSections.has('stop') && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="px-3 sm:px-4 py-2 sm:py-3"
                          >
                            <div className="flex flex-wrap gap-2">
                              {log.stopReasons.map((reason) => (
                                <span
                                  key={reason}
                                  className="px-2 py-1 rounded-full bg-rose-50 text-rose-700 text-sm border border-rose-100"
                                >
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {/* Metrics */}
                  <div className="flex items-center gap-3 sm:gap-6 pt-3 sm:pt-4 border-t border-gray-200 text-sm sm:text-base text-gray-600">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      <span>{log.likes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>{log.commentsCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>{log.views}</span>
                    </div>
                  </div>
                </>
              ) : activeTab === 'comments' ? (
                <>
                  {/* Comments List */}
                  <div className="space-y-4">
                    {reviewComments.length > 0 ? (
                      reviewComments
                        .filter((c) => !c.parentId)
                        .map((comment) => (
                          <CommentThread
                            key={comment.id}
                            comment={comment}
                            allComments={reviewComments}
                            formatTimeAgo={formatTimeAgo}
                            onReply={(content, parentId) => {
                              if (!user && onAuthRequired) {
                                onAuthRequired()
                                return
                              }
                              onCommentSubmit(log.id, content, parentId)
                            }}
                            onEdit={onCommentEdit}
                            onDelete={onCommentDelete}
                            currentUserId={user?.id}
                          />
                        ))
                    ) : (
                      <div className="text-center py-12">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-base text-gray-500">아직 댓글이 없습니다.</p>
                      </div>
                    )}
                  </div>

                  {/* Comment Form */}
                  <form onSubmit={handleCommentSubmit} className="mt-6 pt-6 border-t border-gray-200">
                    {user ? (
                      <>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                          placeholder="댓글을 작성해주세요..."
                      rows={3}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base resize-none"
                    />
                      <div className="flex justify-end mt-3">
                        <button
                          type="submit"
                          disabled={!newComment.trim()}
                          className="px-4 py-2 bg-[#3056F5] text-white rounded-xl text-base font-medium hover:bg-[#2648e6] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          댓글 작성
                          </button>
                        </div>
                      </>
                    ) : (
                      <div className="flex flex-col items-center gap-3 text-base text-gray-600">
                        <button
                          type="button"
                          onClick={() => onAuthRequired?.()}
                          className="w-full px-4 py-3 border border-dashed border-gray-300 rounded-xl text-gray-500 hover:border-[#3056F5] hover:text-[#3056F5] transition-colors"
                        >
                          로그인이 필요합니다. 클릭하여 로그인하세요.
                        </button>
                      </div>
                    )}
                  </form>
                </>
              ) : activeTab === 'qa' ? (
                <>
                  {/* Q&A Threads */}
                  {qaThreads.length > 0 || onQAThreadCreate ? (
                    <div className="space-y-4">
                      {onQAThreadCreate && user && (
                        <div className="mb-4">
                          {showQAForm ? (
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-200 space-y-3">
                              <div className="text-sm font-medium text-gray-900">새 질문 작성</div>
                              <input
                                type="text"
                                value={qaTitle}
                                onChange={(e) => setQATitle(e.target.value)}
                                placeholder="질문 제목을 입력하세요"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5]"
                              />
                              <textarea
                                value={qaContent}
                                onChange={(e) => setQAContent(e.target.value)}
                                placeholder="질문 내용을 자세히 입력하세요"
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] resize-none"
                              />
                              <div className="flex gap-2">
                                <button
                                  onClick={() => {
                                    setShowQAForm(false)
                                    setQATitle('')
                                    setQAContent('')
                                  }}
                                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-100 transition-colors"
                                >
                                  취소
                                </button>
                                <button
                                  onClick={() => {
                                    if (qaTitle.trim() && qaContent.trim() && log) {
                                      onQAThreadCreate(log.id, qaTitle.trim(), qaContent.trim())
                                      setShowQAForm(false)
                                      setQATitle('')
                                      setQAContent('')
                                    } else {
                                      alert('제목과 내용을 모두 입력해주세요.')
                                    }
                                  }}
                                  className="flex-1 px-4 py-2 bg-[#3056F5] text-white rounded-lg text-sm font-medium hover:bg-[#2648e6] transition-colors"
                                >
                                  질문 등록
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => setShowQAForm(true)}
                              className="w-full px-4 py-3 bg-[#3056F5] text-white rounded-xl text-base font-medium hover:bg-[#2648e6] transition-colors"
                            >
                              + 새 질문하기
                            </button>
                          )}
                        </div>
                      )}
                      <QAThreadList
                        threads={qaThreads}
                        posts={qaPosts}
                        currentUserId={user?.id}
                        onPostSubmit={onQAPostSubmit || (() => {})}
                        onPostEdit={onQAPostEdit}
                        onPostDelete={onQAPostDelete}
                        onThreadDelete={onQAThreadDelete}
                        onAcceptAnswer={onAcceptAnswer}
                        onUpvote={onUpvote}
                        formatTimeAgo={formatTimeAgo}
                        getAuthorInfo={getAuthorInfo || (() => null)}
                      />
                    </div>
                  ) : (
                    <div className="text-center py-12 text-gray-500">
                      <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p className="text-base">아직 질문이 없습니다.</p>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

