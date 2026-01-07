'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Heart, MessageCircle, Eye, Calendar, ChevronDown, ChevronUp, Edit, Trash2, ExternalLink } from 'lucide-react'
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
  onAuthRequired?: () => void
  qaThreads?: QAThread[]
  qaPosts?: QAPostWithAuthor[]
  onQAThreadCreate?: (logId: string, title: string) => void
  onQAPostSubmit?: (threadId: string, content: string, kind: 'question' | 'answer' | 'comment', parentId?: string) => void
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
  onAuthRequired,
  qaThreads = [],
  qaPosts = [],
  onQAThreadCreate,
  onQAPostSubmit,
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

  // Update active tab when initialTab changes
  useEffect(() => {
    if (isOpen && initialTab) {
      setActiveTab(initialTab)
    }
  }, [isOpen, initialTab])

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
            className="fixed right-0 top-0 bottom-0 w-full h-full md:w-[600px] md:h-auto bg-white shadow-strong z-50 overflow-y-auto"
          >
            {/* Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                <div className="min-w-0">
                  <h2 className="text-xl sm:text-3xl font-bold text-gray-900 truncate">
                    {log.brand}
                  </h2>
                  <p className="text-sm sm:text-base text-gray-600 truncate">{log.product}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Rating in Header */}
                {log.rating && (
                  <div className="flex items-center gap-1.5">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }, (_, i) => (
                        <Star
                          key={i}
                          size={14}
                          className={i < Math.round(log.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{log.rating.toFixed(1)}</span>
                    {log.recommend !== undefined && (
                      <span className="text-sm text-gray-600">
                        {log.recommend ? '👍' : '👎'}
                      </span>
                    )}
                  </div>
                )}
                {isOwner && (
                  <>
                    {onEdit && (
                      <button
                        onClick={() => onEdit(log)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="수정"
                      >
                        <Edit className="h-5 w-5 text-gray-500" />
                      </button>
                    )}
                    {onDelete && (
                      <button
                        onClick={() => {
                          if (confirm('정말 삭제하시겠습니까?')) {
                            onDelete(log.id)
                          }
                        }}
                        className="p-2 hover:bg-red-50 rounded-full transition-colors"
                        aria-label="삭제"
                      >
                        <Trash2 className="h-5 w-5 text-red-500" />
                      </button>
                    )}
                  </>
                )}
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>
            </div>

            {/* Status */}
            {isOwner && onStatusChange && (
              <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                  <span className="text-sm sm:text-base font-medium text-gray-700">상태:</span>
                  <div className="flex gap-2 flex-wrap">
                    {(['feeding', 'paused', 'completed'] as const).map((s) => (
                      <button
                        key={s}
                        onClick={() => handleStatusChange(s)}
                        className={`px-2 sm:px-3 py-1.5 rounded-lg text-sm sm:text-base font-medium transition-colors ${
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
              </div>
            )}

            {/* Product Detail Link */}
            <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
              <button
                onClick={() => {
                  console.log('[LogDetailDrawer] Brand link clicked:', {
                    logBrand: log.brand,
                    logProduct: log.product
                  })
                  // Next.js router는 자동으로 URL을 인코딩하므로 수동 인코딩 불필요
                  const targetUrl = `/brands/${log.brand}`
                  console.log('[LogDetailDrawer] Navigating to:', targetUrl)
                  router.push(targetUrl)
                  onClose()
                }}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#3056F5] text-white rounded-xl text-sm sm:text-base font-medium hover:bg-[#2648e6] transition-colors shadow-sm hover:shadow-md"
              >
                <span>제품에 대해 자세히 알아보기</span>
                <ExternalLink className="h-4 w-4" />
              </button>
            </div>

            {/* Period */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                <span className="text-sm sm:text-base font-bold text-gray-900">급여 기간</span>
              </div>
              <p className="text-sm sm:text-base text-gray-700">
                {formatDate(log.periodStart)}
                {log.periodEnd && ` ~ ${formatDate(log.periodEnd)}`}
                {!log.periodEnd && ' ~ 현재'}
                {log.durationDays && ` (총 ${log.durationDays}일)`}
              </p>
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
                  {/* Comments Notice */}
                  <div className="text-center py-8 bg-gray-50 rounded-xl border border-gray-200 mb-6">
                    <MessageCircle className="h-12 w-12 mx-auto mb-4 text-[#3056F5]" />
                    <p className="text-base font-medium text-gray-900 mb-2">
                      댓글 기능 안내
                    </p>
                    <p className="text-sm text-gray-600 mb-4">
                      댓글은 펫 로그 상세 페이지에서 작성하실 수 있습니다.
                    </p>
                    <button
                      onClick={() => {
                        router.push('/pet-log')
                        onClose()
                      }}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3056F5] text-white rounded-xl text-sm font-medium hover:bg-[#2648e6] transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      펫 로그에서 댓글 달기
                    </button>
                  </div>

                  {/* Existing Comments (Read-only) */}
                  {reviewComments.length > 0 && (
                    <div className="space-y-4">
                      <p className="text-sm font-medium text-gray-600 mb-3">기존 댓글</p>
                      {reviewComments
                        .filter((c) => !c.parentId)
                        .map((comment) => (
                          <CommentThread
                            key={comment.id}
                            comment={comment}
                            allComments={reviewComments}
                            formatTimeAgo={formatTimeAgo}
                            onReply={() => {
                              // Read-only: redirect to pet-log
                              router.push('/pet-log')
                              onClose()
                            }}
                          />
                        ))}
                    </div>
                  )}
                </>
              ) : activeTab === 'qa' ? (
                <>
                  {/* Q&A Threads */}
                  {qaThreads.length > 0 || onQAThreadCreate ? (
                    <div className="space-y-4">
                      {onQAThreadCreate && user && (
                        <div className="mb-4 p-4 bg-blue-50 rounded-xl border border-blue-200">
                          <button
                            onClick={() => {
                              const title = prompt('질문 제목을 입력하세요:')
                              if (title && log) {
                                onQAThreadCreate(log.id, title)
                              }
                            }}
                            className="w-full px-4 py-2 bg-[#3056F5] text-white rounded-lg text-base font-medium hover:bg-[#2648e6] transition-colors"
                          >
                            + 새 질문하기
                          </button>
                        </div>
                      )}
                      <QAThreadList
                        threads={qaThreads}
                        posts={qaPosts}
                        currentUserId={user?.id}
                        onPostSubmit={onQAPostSubmit || (() => {})}
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

