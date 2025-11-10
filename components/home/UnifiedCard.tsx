'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, MessageSquare, Eye, Star, CalendarDays, ThumbsUp, ThumbsDown, CheckCircle, Clock } from 'lucide-react'
import type { UnifiedFeedItem } from '@/lib/data/feed'

interface UnifiedCardProps {
  item: UnifiedFeedItem
  formatTimeAgo?: (date: string) => string
}

/**
 * Unified card component for both Q&A and Review items
 */
export default function UnifiedCard({ item, formatTimeAgo }: UnifiedCardProps) {
  const formatTime = (dateString: string): string => {
    if (formatTimeAgo) return formatTimeAgo(dateString)
    
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

  const periodColor =
    item.period?.status === 'feeding'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
      : item.period?.status === 'completed'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-gray-50 text-gray-700 border-gray-200'

  return (
    <Link href={item.href}>
      <article className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.08)] transition-all duration-200 h-full flex flex-col">
        {/* Header */}
        <header className="mb-3">
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-lg font-bold text-gray-900 line-clamp-2 flex-1">{item.title}</h3>
            {item.kind === 'qa' && item.status && (
              <div className="flex-shrink-0">
                {item.status === 'answered' ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <Clock className="h-5 w-5 text-orange-500" />
                )}
              </div>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            {item.categoryEmoji && (
              <span className="text-lg">{item.categoryEmoji}</span>
            )}
            {item.period && (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border font-medium ${periodColor}`}>
                <CalendarDays size={14} />
                <span className="whitespace-nowrap">{item.period.label}</span>
              </span>
            )}
            {item.rating !== undefined && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-yellow-50 text-yellow-800 text-xs border border-yellow-200 font-medium">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    size={12}
                    className={i < Math.round(item.rating!) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                  />
                ))}
                <b className="ml-1">{item.rating.toFixed(1)}</b>
                {item.recommend !== undefined && (
                  <span className="ml-1">
                    {item.recommend ? '👍 추천' : '👎 비추천'}
                  </span>
                )}
              </span>
            )}
            <span className="text-xs text-gray-500">{item.meta}</span>
          </div>
        </header>

        {/* Excerpt */}
        <p className="text-sm text-gray-700 leading-relaxed bg-gray-50 rounded-xl px-4 py-3 line-clamp-3 flex-shrink-0 h-[5rem] mb-3 flex items-start">
          {item.excerpt}
        </p>

        {/* Footer */}
        <footer className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1">
              <Heart size={14} />
              <span>{item.stats.likes.toLocaleString()}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <MessageSquare size={14} />
              <span>{item.stats.comments.toLocaleString()}</span>
            </span>
            <span className="inline-flex items-center gap-1">
              <Eye size={14} />
              <span>{item.stats.views.toLocaleString()}</span>
            </span>
          </div>
          <span className="text-xs text-gray-500">{formatTime(item.createdAt)}</span>
        </footer>
      </article>
    </Link>
  )
}

