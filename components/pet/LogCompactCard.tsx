'use client'

import React, { useState } from 'react'
import { Star, Heart, MessageSquare, Eye, CalendarDays, ChevronDown, ChevronUp } from 'lucide-react'
import type { ReviewLog, Comment, QAThread, QAPostWithAuthor } from '@/lib/types/review-log'

interface LogCompactCardProps {
  log: ReviewLog
  owner: { nickname: string }
  pet: { name: string; birthDate: string; weightKg?: number }
  formatPeriodLabel: (status: 'feeding' | 'paused' | 'completed', start: string, end?: string, days?: number) => string
  calculateAge: (birthDate: string) => string
  onOpenDetail: () => void
  bestAnswerExcerpt?: string | null
  latestCommentExcerpt?: string | null
  comments?: Comment[]
  qaThreads?: QAThread[]
  qaPosts?: QAPostWithAuthor[]
  formatTimeAgo?: (date: string) => string
  getAuthorInfo?: (authorId: string) => { nickname: string; avatarUrl?: string } | null
}

/**
 * Compact log card for category sections
 */
export default function LogCompactCard({
  log,
  owner,
  pet,
  formatPeriodLabel,
  calculateAge,
  onOpenDetail,
  bestAnswerExcerpt,
  latestCommentExcerpt,
  comments = [],
  qaThreads = [],
  qaPosts = [],
  formatTimeAgo,
  getAuthorInfo
}: LogCompactCardProps) {
  const [showAllReasons, setShowAllReasons] = useState(false)
  const [showComments, setShowComments] = useState(false)
  const [showQA, setShowQA] = useState(false)

  const statusColor =
    log.status === 'feeding'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : log.status === 'completed'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-gray-50 text-gray-700 border-gray-200'

  const displayedContinueReasons = showAllReasons
    ? log.continueReasons || []
    : (log.continueReasons || []).slice(0, 3)
  const displayedStopReasons = showAllReasons
    ? log.stopReasons || []
    : (log.stopReasons || []).slice(0, 3)

  const hiddenContinueCount = (log.continueReasons?.length || 0) - displayedContinueReasons.length
  const hiddenStopCount = (log.stopReasons?.length || 0) - displayedStopReasons.length
  const totalHidden = hiddenContinueCount + hiddenStopCount

  return (
    <article
      onClick={onOpenDetail}
      className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm hover:shadow-md transition-all cursor-pointer"
    >
      {/* Header */}
      <div className="mb-3">
        <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-1">
          {log.brand} · {log.product}
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs border font-medium ${statusColor}`}
          >
            <CalendarDays size={12} />
            {formatPeriodLabel(log.status, log.periodStart, log.periodEnd, log.durationDays)}
          </span>
          {typeof log.rating === 'number' && (
            <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-50 text-yellow-800 text-xs border border-yellow-200">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={10}
                  className={i < Math.round(log.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
              <b className="ml-1">{log.rating.toFixed(1)}</b>
              {log.recommend !== undefined && (
                <span className="ml-1">{log.recommend ? '👍' : '👎'}</span>
              )}
            </span>
          )}
        </div>
      </div>

      {/* Reasons */}
      {(log.continueReasons && log.continueReasons.length > 0) ||
      (log.stopReasons && log.stopReasons.length > 0) ? (
        <div className="mb-3 flex flex-wrap gap-1.5">
          {displayedContinueReasons.map((reason) => (
            <span
              key={reason}
              className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-100 whitespace-nowrap"
            >
              계속: {reason}
            </span>
          ))}
          {displayedStopReasons.map((reason) => (
            <span
              key={reason}
              className="px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 text-xs border border-rose-100 whitespace-nowrap"
            >
              중지: {reason}
            </span>
          ))}
          {totalHidden > 0 && !showAllReasons && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                setShowAllReasons(true)
              }}
              className="px-2 py-0.5 rounded-full bg-gray-100 text-gray-700 text-xs border border-gray-200 hover:bg-gray-200 transition-colors whitespace-nowrap"
            >
              +{totalHidden}
            </button>
          )}
        </div>
      ) : null}

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
          className="px-3 py-1.5 bg-[#3056F5] text-white rounded-lg text-xs font-medium hover:bg-[#2648e6] transition-colors"
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

