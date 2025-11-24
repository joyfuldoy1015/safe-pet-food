'use client'

import React, { useState } from 'react'
import { Star, Heart, MessageSquare, Eye, ChevronDown, ChevronUp } from 'lucide-react'
import type { ReviewLog, Comment, QAThread, QAPostWithAuthor } from '@/lib/types/review-log'

interface LogCompactCardProps {
  log: ReviewLog
  owner: { nickname: string }
  pet: { name: string; birthDate: string; weightKg?: number }
  onOpenDetail: () => void
  bestAnswerExcerpt?: string | null
  latestCommentExcerpt?: string | null
  comments?: Comment[]
  qaThreads?: QAThread[]
  qaPosts?: QAPostWithAuthor[]
  formatTimeAgo?: (date: string) => string
  getAuthorInfo?: (authorId: string) => { nickname: string; avatarUrl?: string } | null
  category?: 'feed' | 'snack' | 'supplement' | 'toilet'
}

/**
 * Compact log card for category sections
 */
export default function LogCompactCard({
  log,
  owner,
  pet,
  onOpenDetail,
  bestAnswerExcerpt,
  latestCommentExcerpt,
  comments = [],
  qaThreads = [],
  qaPosts = [],
  formatTimeAgo,
  getAuthorInfo,
  category
}: LogCompactCardProps) {
  const [showComments, setShowComments] = useState(false)
  const [showQA, setShowQA] = useState(false)

  const isUsageCategory = log.category === 'toilet'
  const statusLabelMap: Record<'feeding' | 'paused' | 'completed', string> = isUsageCategory
    ? {
        feeding: '사용 중',
        paused: '사용 중지',
        completed: '사용 완료'
      }
    : {
        feeding: '급여 중',
        paused: '급여 중지',
        completed: '급여 완료'
      }

  const statusColor =
    log.status === 'feeding'
      ? 'bg-green-50 text-green-700 border-green-200'
      : log.status === 'completed'
      ? 'bg-gray-100 text-gray-700 border-gray-200'
      : 'bg-red-50 text-red-700 border-red-200'

  // 카테고리별 테두리 색상과 그림자 설정
  const categoryStyle = category
    ? category === 'feed'
      ? 'border-blue-300 shadow-md shadow-blue-100/50 hover:shadow-lg hover:shadow-blue-200/50'
      : category === 'snack'
      ? 'border-green-300 shadow-md shadow-green-100/50 hover:shadow-lg hover:shadow-green-200/50'
      : category === 'supplement'
      ? 'border-purple-300 shadow-md shadow-purple-100/50 hover:shadow-lg hover:shadow-purple-200/50'
      : 'border-orange-300 shadow-md shadow-orange-100/50 hover:shadow-lg hover:shadow-orange-200/50'
    : 'border-gray-200 shadow-md shadow-gray-200/50 hover:shadow-lg hover:shadow-gray-300/50'

  const formatDateForBadge = (dateString: string) => {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}.`
  }

  const reviewText = log.excerpt || (log.notes ?? '')
  const displayedContinueReasons = (log.continueReasons || []).slice(0, 3)
  const displayedStopReasons = (log.stopReasons || []).slice(0, 3)

  return (
    <article
      onClick={onOpenDetail}
      className={`rounded-2xl border-2 bg-white p-4 ${categoryStyle} transition-all cursor-pointer`}
    >
      {/* Top badges */}
      <div className="flex items-center justify-between text-xs text-gray-500 mb-2">
        <span>
          since {formatDateForBadge(log.periodStart)}
          {log.periodEnd && ` - ${formatDateForBadge(log.periodEnd)}`}
        </span>
        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColor}`}>
          {statusLabelMap[log.status]}
        </span>
      </div>

      {/* Product info */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-1">
        {log.brand} · {log.product}
      </h3>
      {typeof log.rating === 'number' && (
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
          <span className="text-base font-semibold text-gray-900">
            {log.rating.toFixed(1)}
          </span>
          {log.recommend !== undefined && (
            <span className="px-2 py-0.5 rounded-full bg-yellow-50 text-yellow-700 text-xs border border-yellow-200">
              {log.recommend ? '추천' : '비추천'}
            </span>
          )}
        </div>
      )}

      {/* Review excerpt */}
      {reviewText && (
        <p className="text-sm text-gray-600 leading-6 mb-3 line-clamp-3">
          {reviewText}
        </p>
      )}

      {/* Pros / Cons tags */}
      {(displayedContinueReasons.length > 0 || displayedStopReasons.length > 0) && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {displayedContinueReasons.map((reason) => (
            <span
              key={`pro-${reason}`}
              className="px-2 py-0.5 rounded-full border border-emerald-100 bg-emerald-50 text-emerald-700 text-xs"
            >
              장점: {reason}
            </span>
          ))}
          {displayedStopReasons.map((reason) => (
            <span
              key={`con-${reason}`}
              className="px-2 py-0.5 rounded-full border border-rose-100 bg-rose-50 text-rose-700 text-xs"
            >
              단점: {reason}
            </span>
          ))}
        </div>
      )}

      {/* Comment Teaser */}
      {(bestAnswerExcerpt || latestCommentExcerpt) && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="text-xs text-gray-600 line-clamp-2">
            {bestAnswerExcerpt ? (
              <>
                <span className="font-medium text-emerald-600">✓ 베스트 답변:</span>{' '}
                {bestAnswerExcerpt}
              </>
            ) : latestCommentExcerpt ? (
              <>
                <span className="font-medium text-gray-700">💬 최신 댓글:</span>{' '}
                {latestCommentExcerpt}
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Metrics & Actions */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-3 text-xs text-gray-600">
          <span className="inline-flex items-center gap-1">
            <Heart size={12} />
            {log.likes}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare size={12} />
            {log.commentsCount}
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye size={12} />
            {log.views}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onOpenDetail()
          }}
          className="px-4 sm:px-5 py-1.5 bg-[#3056F5] text-white rounded-lg text-xs font-medium hover:bg-[#2648e6] transition-colors"
        >
          상세
        </button>
      </div>

      {/* Comments & Q&A Preview */}
      {(comments.length > 0 || qaThreads.length > 0) && (
        <div className="mt-3 pt-3 border-t border-gray-100 space-y-2">
          {/* Comments Toggle */}
          {comments.length > 0 && (
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowComments(!showComments)
                }}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare size={14} />
                  댓글 ({comments.length})
                </span>
                {showComments ? (
                  <ChevronUp size={14} className="text-gray-500" />
                ) : (
                  <ChevronDown size={14} className="text-gray-500" />
                )}
              </button>
              {showComments && (
                <div className="mt-2 space-y-2 pl-4 border-l-2 border-gray-200">
                  {comments.slice(0, 3).map((comment) => {
                    const author = getAuthorInfo?.(comment.authorId)
                    return (
                      <div key={comment.id} className="py-1.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium text-gray-700">
                            {author?.nickname || '익명'}
                          </span>
                          {formatTimeAgo && (
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(comment.createdAt)}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-600 line-clamp-2">{comment.content}</p>
                      </div>
                    )
                  })}
                  {comments.length > 3 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenDetail()
                      }}
                      className="text-xs text-[#3056F5] hover:underline mt-1"
                    >
                      댓글 {comments.length - 3}개 더 보기
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Q&A Toggle */}
          {qaThreads.length > 0 && (
            <div>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setShowQA(!showQA)
                }}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <span className="flex items-center gap-2">
                  <MessageSquare size={14} />
                  Q&A ({qaThreads.length})
                </span>
                {showQA ? (
                  <ChevronUp size={14} className="text-gray-500" />
                ) : (
                  <ChevronDown size={14} className="text-gray-500" />
                )}
              </button>
              {showQA && (
                <div className="mt-2 space-y-2 pl-4 border-l-2 border-blue-200">
                  {qaThreads.slice(0, 3).map((thread) => {
                    const questionPost = qaPosts.find(
                      (p) => p.threadId === thread.id && p.kind === 'question'
                    )
                    const acceptedAnswer = qaPosts.find(
                      (p) => p.threadId === thread.id && p.kind === 'answer' && p.isAccepted
                    )
                    const author = questionPost ? getAuthorInfo?.(questionPost.authorId) : null

                    return (
                      <div key={thread.id} className="py-1.5">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-gray-900">{thread.title}</span>
                          {formatTimeAgo && (
                            <span className="text-xs text-gray-400">
                              {formatTimeAgo(thread.createdAt)}
                            </span>
                          )}
                        </div>
                        {questionPost && (
                          <p className="text-xs text-gray-600 line-clamp-2 mb-1">
                            {questionPost.content}
                          </p>
                        )}
                        {acceptedAnswer && (
                          <div className="mt-1 pl-2 border-l-2 border-emerald-200">
                            <div className="flex items-center gap-1 mb-0.5">
                              <span className="text-xs font-medium text-emerald-600">✓ 채택된 답변</span>
                              {formatTimeAgo && (
                                <span className="text-xs text-gray-400">
                                  {formatTimeAgo(acceptedAnswer.createdAt)}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-600 line-clamp-2">
                              {acceptedAnswer.content}
                            </p>
                          </div>
                        )}
                      </div>
                    )
                  })}
                  {qaThreads.length > 3 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenDetail()
                      }}
                      className="text-xs text-[#3056F5] hover:underline mt-1"
                    >
                      Q&A {qaThreads.length - 3}개 더 보기
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </article>
  )
}

