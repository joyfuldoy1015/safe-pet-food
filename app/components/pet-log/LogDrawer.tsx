'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Heart, MessageCircle, Eye, ThumbsUp, ThumbsDown, Calendar, ChevronDown, ChevronUp } from 'lucide-react'
import { ReviewLog, Pet, Owner, Comment } from '@/lib/types/review-log'
import CommentThread from './CommentThread'

interface LogDrawerProps {
  review: ReviewLog | null
  pet: Pet | null
  owner: Owner | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (reviewId: string, newStatus: 'feeding' | 'paused' | 'completed') => void
  formatTimeAgo: (date: string) => string
  formatDate: (date: string) => string
  comments: Comment[]
  onCommentSubmit: (logId: string, content: string, parentId?: string) => void
}

export default function LogDrawer({
  review,
  pet,
  owner,
  isOpen,
  onClose,
  onStatusChange,
  formatTimeAgo,
  formatDate,
  comments,
  onCommentSubmit
}: LogDrawerProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details')
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['reason', 'changes']))
  const [newComment, setNewComment] = useState('')

  if (!review || !pet || !owner) return null

  const categoryConfig = {
    feed: { label: '사료', color: 'bg-blue-50 text-blue-700' },
    snack: { label: '간식', color: 'bg-green-50 text-green-700' },
    supplement: { label: '영양제', color: 'bg-purple-50 text-purple-700' },
    toilet: { label: '화장실', color: 'bg-orange-50 text-orange-700' }
  }

  const statusConfig = {
    feeding: { label: '급여 중', color: 'bg-green-100 text-green-800' },
    paused: { label: '급여 중지', color: 'bg-gray-100 text-gray-800' },
    completed: { label: '급여 완료', color: 'bg-blue-100 text-blue-800' }
  }

  const category = categoryConfig[review.category]
  const status = statusConfig[review.status]

  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate)
    const now = new Date()
    const years = now.getFullYear() - birth.getFullYear()
    const months = now.getMonth() - birth.getMonth()
    if (months < 0) {
      return `${years - 1}세`
    }
    if (years > 0) {
      return `${years}세`
    }
    return `${months}개월`
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
    if (confirm(`상태를 "${statusConfig[newStatus].label}"로 변경하시겠습니까?`)) {
      onStatusChange(review.id, newStatus)
    }
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    onCommentSubmit(review.id, newComment.trim())
    setNewComment('')
  }

  const reviewComments = comments.filter((c) => c.logId === review.id)

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
                  <h2 className="text-base sm:text-xl font-semibold sm:font-bold text-gray-900 truncate">{review.brand}</h2>
                  <p className="text-xs sm:text-sm text-gray-600 truncate">{review.product}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            {/* Status Switch & Rating */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2">
                <span className="text-xs sm:text-sm font-medium text-gray-700">상태:</span>
                <div className="flex gap-2 flex-wrap">
                  {(['feeding', 'paused', 'completed'] as const).map((s) => (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      className={`px-2 sm:px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${
                        review.status === s
                          ? statusConfig[s].color
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {statusConfig[s].label}
                    </button>
                  ))}
                </div>
              </div>
              {review.rating && (
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }, (_, i) => (
                      <Star
                        key={i}
                        className={`h-5 w-5 ${
                          i < review.rating!
                            ? 'text-yellow-400 fill-current'
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-lg font-bold text-gray-900">{review.rating}.0</span>
                  {review.recommend !== undefined && (
                    <div className="flex items-center gap-1 ml-2">
                      {review.recommend ? (
                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg">
                          <ThumbsUp className="h-4 w-4" />
                          <span className="text-xs font-medium">추천</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-lg">
                          <ThumbsDown className="h-4 w-4" />
                          <span className="text-xs font-medium">비추천</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Pet Mini Profile */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200 bg-gray-50">
              <h3 className="text-xs sm:text-sm font-semibold text-gray-900 mb-2">반려동물 정보</h3>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-xl">
                  {pet.species === 'dog' ? '🐕' : '🐱'}
                </div>
                <div>
                  <div className="font-semibold text-gray-900">{pet.name}</div>
                  <div className="text-sm text-gray-600">
                    {pet.species === 'dog' ? '강아지' : '고양이'} · {calculateAge(pet.birthDate)} · {pet.weightKg}kg
                  </div>
                  {pet.tags && pet.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                      {pet.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-2 py-0.5 bg-orange-100 text-orange-800 rounded text-xs"
                        >
                          {tag === 'allergy-chicken' ? '닭 알레르기' :
                           tag === 'sensitive-stomach' ? '민감한 위' :
                           tag === 'picky-eater' ? '편식' : tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Period */}
            <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-200">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
                <span className="text-xs sm:text-sm font-medium text-gray-900">급여 기간</span>
              </div>
              <p className="text-xs sm:text-sm text-gray-700">
                {formatDate(review.periodStart)}
                {review.periodEnd && ` ~ ${formatDate(review.periodEnd)}`}
                {!review.periodEnd && ' ~ 현재'}
                {review.durationDays && ` (총 ${review.durationDays}일)`}
              </p>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setActiveTab('details')}
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors ${
                  activeTab === 'details'
                    ? 'text-[#3056F5] border-b-2 border-[#3056F5]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                상세 정보
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`flex-1 px-4 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium transition-colors relative ${
                  activeTab === 'comments'
                    ? 'text-[#3056F5] border-b-2 border-[#3056F5]'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                댓글
                {reviewComments.length > 0 && (
                  <span className="ml-1 sm:ml-2 px-1.5 sm:px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                    {reviewComments.length}
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
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">급여 이유/목표</span>
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
                          <p className="text-xs sm:text-sm text-gray-700 whitespace-pre-line">
                            {review.notes || review.excerpt}
                          </p>
                          {review.continueReasons && review.continueReasons.length > 0 && (
                            <div className="mt-3">
                              <p className="text-xs font-medium text-gray-600 mb-2">계속하는 이유:</p>
                              <div className="flex flex-wrap gap-2">
                                {review.continueReasons.map((reason, index) => (
                                  <span
                                    key={index}
                                    className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium"
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
                      <span className="text-xs sm:text-sm font-semibold text-gray-900">관찰된 변화</span>
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
                          className="px-4 py-3"
                        >
                          <p className="text-sm text-gray-700">
                            {review.notes || '관찰된 변화에 대한 상세 정보가 없습니다.'}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* 중지/교체 이유 */}
                  {review.stopReasons && review.stopReasons.length > 0 && (
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                      <button
                        onClick={() => toggleSection('stop')}
                        className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-gray-50 flex items-center justify-between hover:bg-gray-100 transition-colors"
                      >
                        <span className="text-xs sm:text-sm font-semibold text-gray-900">중지/교체 이유</span>
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
                            className="px-4 py-3"
                          >
                            <div className="flex flex-wrap gap-2">
                              {review.stopReasons.map((reason, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium"
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
                  <div className="flex items-center gap-3 sm:gap-6 pt-3 sm:pt-4 border-t border-gray-200 text-xs sm:text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Heart className="h-4 w-4" />
                      <span>{review.likes}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MessageCircle className="h-4 w-4" />
                      <span>{review.commentsCount}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Eye className="h-4 w-4" />
                      <span>{review.views}</span>
                    </div>
                    <div className="ml-auto text-xs text-gray-500">
                      {formatTimeAgo(review.updatedAt)}
                    </div>
                  </div>
                </>
              ) : (
                <>
                  {/* Comments */}
                  <div className="space-y-4">
                    {reviewComments.length === 0 ? (
                      <div className="text-center py-12">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm text-gray-500">
                          아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
                        </p>
                      </div>
                    ) : (
                      reviewComments
                        .filter((c) => !c.parentId)
                        .map((comment) => (
                          <CommentThread
                            key={comment.id}
                            comment={comment}
                            allComments={reviewComments}
                            formatTimeAgo={formatTimeAgo}
                            onReply={(content, parentId) =>
                              onCommentSubmit(review.id, content, parentId)
                            }
                          />
                        ))
                    )}
                  </div>

                  {/* Comment Form */}
                  <form onSubmit={handleCommentSubmit} className="pt-6 border-t border-gray-200">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="댓글을 작성해주세요..."
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] resize-none"
                      required
                    />
                    <div className="flex justify-end mt-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        type="submit"
                        disabled={!newComment.trim()}
                        className="flex items-center gap-2 px-6 py-2.5 bg-[#3056F5] text-white rounded-xl hover:bg-[#2545D4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <MessageCircle className="h-4 w-4" />
                        <span>댓글 작성</span>
                      </motion.button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

