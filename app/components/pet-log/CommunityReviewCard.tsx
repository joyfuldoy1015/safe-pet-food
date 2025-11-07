'use client'

import React, { useState } from 'react'
import { Star, MessageSquare, Heart, Eye, CalendarDays, User2 } from 'lucide-react'

type Props = {
  title: string // 브랜드 · 제품
  rating?: number // 0~5
  recommend?: boolean // 👍/👎
  status: 'feeding' | 'paused' | 'completed'
  periodLabel: string // "2024.06.01 ~ 2024.09.15 (총 106일)" or "since 2024.10.02"
  owner: { nickname: string; pet: string; meta: string } // "콩이(3세·6kg)"
  continueReasons?: string[] // ["변 상태 개선","모질 윤기"]
  stopReasons?: string[] // ["알러지 의심","섭취 거부"]
  excerpt: string
  metrics: { likes: number; comments: number; views: number }
  onOpenDetail?: () => void
  onAsk?: () => void
}

export default function CommunityReviewCard({
  title,
  rating,
  recommend,
  status,
  periodLabel,
  owner,
  continueReasons = [],
  stopReasons = [],
  excerpt,
  metrics,
  onOpenDetail,
  onAsk
}: Props) {
  const statusColor =
    status === 'feeding'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : status === 'completed'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-gray-50 text-gray-700 border-gray-200'

  const [showAllReasons, setShowAllReasons] = useState(false)
  const displayedContinueReasons = showAllReasons
    ? continueReasons
    : continueReasons.slice(0, 3)
  const displayedStopReasons = showAllReasons ? stopReasons : stopReasons.slice(0, 3)
  const hasMoreContinueReasons = continueReasons.length > 3
  const hasMoreStopReasons = stopReasons.length > 3
  const totalHiddenReasons =
    (hasMoreContinueReasons ? continueReasons.length - 3 : 0) +
    (hasMoreStopReasons ? stopReasons.length - 3 : 0)

  return (
    <article className="rounded-3xl border border-gray-100 bg-white p-4 sm:p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.08)] transition-all duration-200 flex flex-col h-full">
      <header className="mb-4">
        <h3 className="text-base sm:text-lg lg:text-xl font-semibold sm:font-bold text-gray-900 line-clamp-2 mb-3">{title}</h3>
        <div className="flex flex-wrap items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm border font-medium ${statusColor}`}
          >
            <CalendarDays size={14} className="sm:w-4 sm:h-4 flex-shrink-0" /> <span className="whitespace-nowrap break-keep">{periodLabel}</span>
          </span>
          {typeof rating === 'number' && (
            <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-yellow-50 text-yellow-800 text-xs sm:text-sm border border-yellow-200 font-medium">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={12}
                  className={`sm:w-3.5 sm:h-3.5 ${
                    i < Math.round(rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <b className="ml-1 text-xs sm:text-sm">{rating.toFixed(1)}</b>
              {recommend !== undefined && (
                <span className="ml-1 text-xs sm:text-sm hidden sm:inline">
                  {recommend ? '· 👍 추천' : '· 👎 비추천'}
                </span>
              )}
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-50 text-gray-700 text-xs sm:text-sm border font-medium">
            <User2 size={14} className="sm:w-4 sm:h-4 flex-shrink-0" /> <span className="whitespace-nowrap break-keep">{owner.nickname} · {owner.pet}</span>{' '}
            <span className="text-gray-500 hidden sm:inline break-keep">({owner.meta})</span>
          </span>
        </div>
      </header>

      <p className="text-sm text-gray-900 leading-relaxed bg-gray-50 rounded-2xl px-4 py-3 line-clamp-3 flex-shrink-0 min-h-[4.5rem] mb-3 text-[15px]">
        {excerpt}
      </p>

      {(displayedContinueReasons.length > 0 || displayedStopReasons.length > 0 || totalHiddenReasons > 0) && (
      <div className="flex flex-wrap gap-2 flex-shrink-0 min-h-[2rem] mb-1">
        {displayedContinueReasons.map((t) => (
          <span
            key={t}
            className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs border border-emerald-100 whitespace-nowrap"
          >
            계속: {t}
          </span>
        ))}
        {displayedStopReasons.map((t) => (
          <span
            key={t}
            className="px-3 py-1 rounded-full bg-rose-50 text-rose-700 text-xs border border-rose-100 whitespace-nowrap"
          >
            중지: {t}
          </span>
        ))}
        {totalHiddenReasons > 0 && !showAllReasons && (
          <button
            onClick={() => setShowAllReasons(true)}
            className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs border border-gray-200 hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            +{totalHiddenReasons} 더보기
          </button>
        )}
        {showAllReasons && totalHiddenReasons > 0 && (
          <button
            onClick={() => setShowAllReasons(false)}
            className="px-3 py-1 rounded-full bg-gray-100 text-gray-700 text-xs border border-gray-200 hover:bg-gray-200 transition-colors whitespace-nowrap"
          >
            접기
          </button>
        )}
      </div>
      )}

      <footer className="mt-auto pt-4 flex flex-col gap-3 border-t border-gray-100">
        {/* Metrics */}
        <div className="flex items-center justify-between text-xs sm:text-sm text-gray-600">
          <span className="inline-flex items-center gap-1">
            <Heart size={14} className="sm:w-4 sm:h-4 flex-shrink-0" /> <span className="whitespace-nowrap">{metrics.likes.toLocaleString()}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare size={14} className="sm:w-4 sm:h-4 flex-shrink-0" /> <span className="whitespace-nowrap">{metrics.comments.toLocaleString()}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <Eye size={14} className="sm:w-4 sm:h-4 flex-shrink-0" /> <span className="whitespace-nowrap">{metrics.views.toLocaleString()}</span>
          </span>
        </div>
        {/* Buttons */}
        <div className="flex gap-2 w-full">
          <button
            onClick={onAsk}
            className="flex-1 px-3 sm:px-4 py-2.5 rounded-xl border border-gray-300 bg-white text-gray-700 text-xs sm:text-sm font-medium hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 whitespace-nowrap active:scale-[0.98]"
            aria-label="질문하기"
          >
            질문하기
          </button>
          <button
            onClick={onOpenDetail}
            className="flex-1 px-3 sm:px-4 py-2.5 rounded-xl bg-[#3056F5] text-white text-xs sm:text-sm font-medium hover:bg-[#2648e6] active:bg-[#1e3ac4] transition-all duration-200 whitespace-nowrap active:scale-[0.98] shadow-sm hover:shadow-md"
            aria-label="자세히 보기"
          >
            자세히 보기
          </button>
        </div>
      </footer>
    </article>
  )
}
