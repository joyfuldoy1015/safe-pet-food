'use client'

import React from 'react'
import Link from 'next/link'
import { Heart, MessageSquare, Eye, Star, CalendarDays, ThumbsUp, ThumbsDown, CheckCircle, Clock, User } from 'lucide-react'
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

  const getAuthorBadge = (level?: string) => {
    if (!level) return null
    const badges = {
      beginner: { label: '새싹', color: 'bg-green-100 text-green-800' },
      experienced: { label: '경험자', color: 'bg-blue-100 text-blue-800' },
      expert: { label: '전문가', color: 'bg-purple-100 text-purple-800' }
    }
    const badge = badges[level as keyof typeof badges]
    if (!badge) return null
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed':
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-orange-500" />
    }
  }

  return (
    <Link href={item.href}>
      <article className="bg-white rounded-2xl border border-gray-200 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.08)] transition-all duration-200 h-full flex flex-col group overflow-hidden" style={{ aspectRatio: '5 / 3.5' }}>
        {/* 카테고리 배지들 - Q&A일 때만 Q&A 배지 + 카테고리 배지 */}
        {item.kind === 'qa' ? (
          <div className="mb-2 flex items-center gap-2 flex-wrap flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <span>💬</span>
              <span>Q&A</span>
            </span>
            {item.categoryEmoji && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
                <span>{item.categoryEmoji}</span>
                <span>{item.category?.replace(/^[\uD83C-\uDBFF\uDC00-\uDFFF\u2764\uFE0F\u200D\s]+/, '').trim()}</span>
              </span>
            )}
          </div>
        ) : (
          <div className="mb-2 flex-shrink-0">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
              <span>📝</span>
              <span>급여 후기</span>
            </span>
          </div>
        )}

        {/* Header */}
        <header className="mb-2 flex-shrink-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-lg font-bold tracking-tight text-gray-900 line-clamp-1 flex-1 group-hover:text-blue-600 transition-colors">{item.title}</h3>
            {item.kind === 'qa' && item.status && (
              <div className="flex-shrink-0">
                {getStatusIcon(item.status)}
              </div>
            )}
          </div>
        </header>

        {/* Author Info - Q&A일 때만 상단에 표시 */}
        {item.kind === 'qa' && item.author && (
          <div className="mb-2 flex items-center gap-2 text-xs text-gray-600 flex-shrink-0">
            <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-3 w-3 text-gray-500" />
            </div>
            <span className="font-semibold text-gray-900">{item.author.name}</span>
            {getAuthorBadge(item.author.level)}
          </div>
        )}

        {/* Review-specific info */}
        {item.kind === 'review' && (
          <div className="mb-2 flex flex-wrap items-center gap-1.5 flex-shrink-0">
            {item.period && (
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border font-medium ${periodColor}`}>
                <CalendarDays size={12} />
                <span className="whitespace-nowrap">{item.period.label}</span>
              </span>
            )}
            {item.rating !== undefined && item.rating !== null && (
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                <span className="text-base font-semibold text-gray-900">
                  {item.rating.toFixed(1)}
                </span>
                {item.recommend !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium border border-yellow-300 text-yellow-700 bg-yellow-50">
                    {item.recommend ? '추천' : '비추천'}
                  </span>
                )}
              </div>
            )}
            {item.meta && (
              <span className="text-xs text-gray-500">{item.meta}</span>
            )}
          </div>
        )}

        {/* Excerpt */}
        <div className="mt-2 flex-1 min-h-0">
          <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">
            {item.excerpt}
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-2 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1" aria-label="좋아요">
              <Heart className="h-3.5 w-3.5 text-red-500" />
              <span>{item.stats.likes.toLocaleString()}</span>
            </span>
            <span className="inline-flex items-center gap-1" aria-label="댓글">
              <MessageSquare className="h-3.5 w-3.5 text-blue-500" />
              <span>{item.stats.comments.toLocaleString()}</span>
            </span>
            <span className="inline-flex items-center gap-1" aria-label="조회수">
              <Eye className="h-3.5 w-3.5 text-gray-500" />
              <span>{item.stats.views.toLocaleString()}</span>
            </span>
          </div>
        </footer>
      </article>
    </Link>
  )
}

