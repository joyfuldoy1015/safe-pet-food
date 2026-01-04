'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Star, Heart, MessageCircle, Eye, ThumbsUp, ThumbsDown } from 'lucide-react'

export interface Review {
  id: string
  brand: string
  productName: string
  category: '사료' | '간식' | '영양제' | '화장실'
  rating: number
  status: '급여중' | '급여완료' | '급여중지'
  summary: string
  petInfo: {
    species: 'dog' | 'cat'
    breed: string
    age: string
    weight: string
  }
  isRecommended: boolean
  likes: number
  comments: number
  views: number
  author: {
    name: string
    avatar?: string
  }
  createdAt: string
}

interface ReviewCardProps {
  review: Review
  onViewDetail: (reviewId: string) => void
  formatTimeAgo: (date: string) => string
}

export default function ReviewCard({
  review,
  onViewDetail,
  formatTimeAgo
}: ReviewCardProps) {
  const categoryConfig = {
    사료: { emoji: '🍽️', color: 'bg-blue-50 text-blue-700 border-blue-200' },
    간식: { emoji: '🦴', color: 'bg-green-50 text-green-700 border-green-200' },
    영양제: { emoji: '💊', color: 'bg-purple-50 text-purple-700 border-purple-200' },
    화장실: { emoji: '🚽', color: 'bg-orange-50 text-orange-700 border-orange-200' }
  }

  const statusConfig = {
    급여중: { label: '급여 중', color: 'bg-green-100 text-green-800 border-green-300' },
    급여완료: { label: '급여 완료', color: 'bg-gray-100 text-gray-800 border-gray-300' },
    급여중지: { label: '급여 중지', color: 'bg-red-100 text-red-800 border-red-300' }
  }

  const category = categoryConfig[review.category]
  const status = statusConfig[review.status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white rounded-[28px] shadow-soft border border-gray-100 cursor-pointer group"
      style={{ aspectRatio: '5 / 4' }}
      onClick={() => onViewDetail(review.id)}
    >
      {/* Content */}
      <div className="p-4 flex flex-col h-full overflow-hidden">
        {/* Category & Status Badge */}
        <div className="flex items-center gap-2 mb-2 flex-shrink-0">
          <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${category.color}`}>
            {review.category}
          </span>
          <span className={`px-2 py-1 text-xs font-medium rounded-lg border ${status.color}`}>
            {status.label}
          </span>
        </div>

        {/* Brand & Product Name */}
        <h3 className="text-base font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">
          {review.brand}
        </h3>
        <p className="text-sm font-semibold text-gray-700 mb-2 line-clamp-1">
          {review.productName}
        </p>

        {/* Rating */}
        <div className="flex items-center gap-2 mb-2 flex-shrink-0">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }, (_, i) => (
              <Star
                key={i}
                className={`h-4 w-4 ${
                  i < review.rating
                    ? 'text-yellow-400 fill-current'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm font-bold text-gray-900">{review.rating}.0</span>
        </div>

        {/* Summary */}
        <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-2 flex-1 min-h-0">
          {review.summary}
        </p>

        {/* Pet Info & Recommendation - Inline */}
        <div className="flex items-center justify-between mb-2 flex-shrink-0">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>{review.petInfo.species === 'dog' ? '🐕' : '🐱'}</span>
            <span>{review.petInfo.breed}</span>
            <span>•</span>
            <span>{review.petInfo.age}</span>
            <span>•</span>
            <span>{review.petInfo.weight}</span>
          </div>
          <div className="flex items-center gap-2">
          {review.isRecommended ? (
            <div className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-700 rounded-lg">
              <ThumbsUp className="h-3 w-3" />
              <span className="text-xs font-medium">추천합니다</span>
            </div>
          ) : (
            <div className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-700 rounded-lg">
              <ThumbsDown className="h-3 w-3" />
              <span className="text-xs font-medium">추천하지 않습니다</span>
            </div>
          )}
          </div>
        </div>

        {/* Metrics */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-auto flex-shrink-0">
          <div className="flex items-center gap-3 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>{review.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <MessageCircle className="h-4 w-4" />
              <span>{review.comments}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span>{review.views}</span>
            </div>
          </div>
          <span className="text-xs text-gray-400">
            {formatTimeAgo(review.createdAt)}
          </span>
        </div>

        {/* View Detail Button */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={(e) => {
            e.stopPropagation()
            onViewDetail(review.id)
          }}
          className="w-full mt-2 px-4 py-2 bg-[#3056F5] text-white rounded-lg text-xs font-medium hover:bg-[#2545D4] transition-colors flex-shrink-0"
        >
          자세히 보기
        </motion.button>
      </div>
    </motion.div>
  )
}
