'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowUp, MessageCircle, Clock, CheckCircle, XCircle, User, Eye, Heart } from 'lucide-react'

export interface Question {
  id: string
  title: string
  content: string
  author: {
    name: string
    avatar?: string
    level?: 'beginner' | 'experienced' | 'expert'
  }
  category: string
  categoryEmoji: string
  votes: number
  answerCount: number
  views?: number
  createdAt: string
  updatedAt?: string
  status: 'open' | 'answered' | 'closed'
  isUpvoted?: boolean
  imageUrl?: string
}

interface QuestionCardProps {
  question: Question
  onUpvote: (questionId: string) => void
  formatTimeAgo: (date: string) => string
}

export default function QuestionCard({ question, onUpvote, formatTimeAgo }: QuestionCardProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'answered':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'closed':
        return <XCircle className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-orange-500" />
    }
  }

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

  return (
    <Link href={`/community/qa-forum/${question.id}`}>
      <article className="bg-white rounded-2xl border border-gray-200 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_10px_36px_rgba(0,0,0,0.08)] transition-all duration-200 h-full flex flex-col group overflow-hidden" style={{ aspectRatio: '5 / 3.5' }}>
        {/* 카테고리 배지들 - Q&A + 카테고리 */}
        <div className="mb-2 flex items-center gap-2 flex-wrap">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <span>💬</span>
            <span>Q&A</span>
          </span>
          {question.categoryEmoji && (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-gray-50 text-gray-700 border border-gray-200">
              <span>{question.categoryEmoji}</span>
              <span>{question.category.replace(/^[\uD83C-\uDBFF\uDC00-\uDFFF\u2764\uFE0F\u200D\s]+/, '').trim()}</span>
            </span>
          )}
        </div>

        {/* Header */}
        <header className="mb-2">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="text-base font-bold tracking-tight text-gray-900 line-clamp-1 flex-1 group-hover:text-blue-600 transition-colors">
              {question.title}
            </h3>
            {question.status && (
              <div className="flex-shrink-0">
                {getStatusIcon(question.status)}
              </div>
            )}
          </div>
        </header>

        {/* Author Info - 상단으로 이동 */}
        <div className="mb-2 flex items-center gap-2 text-xs text-gray-600">
          {question.author.avatar ? (
            <img
              src={question.author.avatar}
              alt={question.author.name}
              className="h-5 w-5 rounded-full"
            />
          ) : (
            <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-3 w-3 text-gray-500" />
            </div>
          )}
          <span className="font-semibold text-gray-900">{question.author.name}</span>
          {getAuthorBadge(question.author.level)}
        </div>

        {/* Excerpt */}
        <div className="mt-2 flex-1 min-h-0">
          <p className="text-sm leading-relaxed text-gray-600 line-clamp-2">
            {question.content}
          </p>
        </div>

        {/* Footer */}
        <footer className="mt-auto pt-3 border-t border-gray-100 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4 text-xs text-gray-600">
            <span className="inline-flex items-center gap-1" aria-label="좋아요">
              <Heart className="h-3.5 w-3.5 text-red-500" />
              <span>{question.votes.toLocaleString()}</span>
            </span>
            <span className="inline-flex items-center gap-1" aria-label="댓글">
              <MessageCircle className="h-3.5 w-3.5 text-blue-500" />
              <span>{question.answerCount.toLocaleString()}</span>
            </span>
            {question.views !== undefined && (
              <span className="inline-flex items-center gap-1" aria-label="조회수">
                <Eye className="h-3.5 w-3.5 text-gray-500" />
                <span>{question.views.toLocaleString()}</span>
              </span>
            )}
          </div>
        </footer>
      </article>
    </Link>
  )
}

