'use client'

import React from 'react'
import Link from 'next/link'
import { ArrowUp, MessageCircle, Clock, CheckCircle, XCircle, User, Eye } from 'lucide-react'

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
    <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6 hover:shadow-medium transition-all duration-200">
      {/* Category and Status */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <span className="text-lg">{question.categoryEmoji}</span>
          <span className="text-sm font-medium text-gray-600 tracking-wide">
            {question.category.replace(/^[\uD83C-\uDBFF\uDC00-\uDFFF]+[\u200D\uFE0F]*[\uD83C-\uDBFF\uDC00-\uDFFF]*[\u200D\uFE0F]*\s*/, '')}
          </span>
        </div>
        <div className="flex items-center space-x-1">
          {getStatusIcon(question.status)}
        </div>
      </div>

      {/* Title */}
      <Link href={`/community/qa-forum/${question.id}`}>
        <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-blue-600 transition-colors cursor-pointer line-clamp-2">
          {question.title}
        </h3>
      </Link>

      {/* Content Excerpt */}
      <p className="text-sm text-gray-600 line-clamp-2 mb-4">
        {question.content}
      </p>

      {/* Author and Time */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          {question.author.avatar ? (
            <img
              src={question.author.avatar}
              alt={question.author.name}
              className="h-6 w-6 rounded-full"
            />
          ) : (
            <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-500" />
            </div>
          )}
          <span className="text-sm font-medium text-gray-700">{question.author.name}</span>
          {getAuthorBadge(question.author.level)}
        </div>
        <div className="flex items-center space-x-1 text-xs text-gray-500">
          <Clock className="h-3 w-3" />
          <span>{formatTimeAgo(question.createdAt)}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
        {/* Left: Upvote */}
        <div className="flex items-center space-x-2">
          <button
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              onUpvote(question.id)
            }}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg transition-all duration-200 ${
              question.isUpvoted
                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                : 'text-gray-600 bg-gray-50 hover:bg-gray-100 hover:text-red-600'
            }`}
          >
            <ArrowUp className={`h-4 w-4 ${question.isUpvoted ? 'fill-current' : ''}`} />
            <span className="text-sm font-medium">Upvote</span>
          </button>
          <span className="text-sm font-semibold text-gray-700 min-w-[2rem]">
            {question.votes}
          </span>
        </div>

        {/* Right: Comments and Views */}
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5 text-gray-600">
            <MessageCircle className="h-4 w-4" />
            <span className="text-sm font-medium">{question.answerCount}</span>
          </div>
          {question.views !== undefined && (
            <div className="flex items-center space-x-1.5 text-gray-600">
              <Eye className="h-4 w-4" />
              <span className="text-sm font-medium">{question.views}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

