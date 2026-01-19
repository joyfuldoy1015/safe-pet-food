'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageSquare, Eye, CheckCircle, Clock, ChevronRight } from 'lucide-react'
import type { UnifiedFeedItem } from '@/lib/data/feed'

interface UnifiedCardProps {
  item: UnifiedFeedItem
  formatTimeAgo?: (date: string) => string
}

/**
 * Unified card component for Q&A items
 * Redesigned to match PetLogCard's tone and manner
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

  // 상태 배지 (답변됨/미답변)
  const getStatusBadge = () => {
    if (item.status === 'answered') {
      return { text: '답변 완료', className: 'bg-green-50 text-green-600' }
    } else if (item.status === 'closed') {
      return { text: '마감', className: 'bg-gray-100 text-gray-600' }
    } else {
      return { text: '답변 대기', className: 'bg-orange-50 text-orange-600' }
    }
  }

  const statusBadge = getStatusBadge()

  // 작성자 레벨에 따른 배지
  const getLevelBadge = (level?: string) => {
    if (!level) return null
    const badges: Record<string, { label: string; className: string }> = {
      beginner: { label: '새싹', className: 'bg-green-100 text-green-700' },
      experienced: { label: '경험자', className: 'bg-blue-100 text-blue-700' },
      expert: { label: '전문가', className: 'bg-purple-100 text-purple-700' }
    }
    return badges[level] || null
  }

  const levelBadge = getLevelBadge(item.author?.level)

  return (
    <Link href={item.href}>
      <article
        className="rounded-2xl border border-gray-100 bg-white p-4 sm:p-5 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer group h-full flex flex-col"
        role="article"
        aria-label={`Q&A: ${item.title}`}
      >
        {/* 상단: 프로필 + 작성일 + 상태 배지 */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            {/* 아바타 */}
            <div className="relative flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                <span className="text-blue-600 text-sm font-medium">
                  {item.author?.name?.charAt(0) || 'Q'}
                </span>
              </div>
              {/* Q&A 배지 */}
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-purple-500 rounded-full flex items-center justify-center border-2 border-white">
                <span className="text-white text-[8px] font-bold">Q</span>
              </div>
            </div>
            
            {/* 작성자 정보 */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-semibold text-gray-900 text-sm">{item.author?.name || '익명'}</span>
                {levelBadge && (
                  <span className={`px-2 py-0.5 text-xs rounded-md ${levelBadge.className}`}>
                    {levelBadge.label}
                  </span>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-0.5">{formatTime(item.createdAt)} 작성</p>
            </div>
          </div>
          
          {/* 상태 배지 */}
          <span className={`flex-shrink-0 px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge.className}`}>
            {statusBadge.text}
          </span>
        </div>

        {/* 카테고리 태그 */}
        {item.category && (
          <div className="mb-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-600 border border-gray-100">
              {item.categoryEmoji && <span>{item.categoryEmoji}</span>}
              <span>{item.category.replace(/^[\uD83C-\uDBFF\uDC00-\uDFFF\u2764\uFE0F\u200D\s]+/, '').trim()}</span>
            </span>
          </div>
        )}

        {/* 질문 제목 */}
        <h3 className="text-base font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors line-clamp-2">
          {item.title}
        </h3>

        {/* 질문 내용 */}
        {item.excerpt && (
          <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-1">
            {item.excerpt}
          </p>
        )}

        {/* 하단: 좋아요 + 답변 + 조회수 + 화살표 */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3">
            {/* 좋아요 */}
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-6 h-6 rounded-full bg-red-50 flex items-center justify-center">
                <Heart className="h-3.5 w-3.5 text-red-400" />
              </span>
              <span className="font-medium text-gray-600">{item.stats.likes}</span>
            </span>
            
            {/* 답변 */}
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                <MessageSquare className="h-3.5 w-3.5 text-blue-400" />
              </span>
              <span className="font-medium text-gray-600">{item.stats.comments}</span>
            </span>
            
            {/* 조회수 */}
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-500">
              <span className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                <Eye className="h-3.5 w-3.5 text-gray-400" />
              </span>
              <span className="font-medium text-gray-600">{item.stats.views}</span>
            </span>
          </div>
          
          {/* 화살표 */}
          <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-gray-500 transition-colors" />
        </div>
      </article>
    </Link>
  )
}
