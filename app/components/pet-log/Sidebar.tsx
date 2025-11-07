'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, Clock, Heart, MessageCircle, Eye } from 'lucide-react'
import { Review } from './ReviewCard'

interface SidebarProps {
  popularReviews: Review[]
  recentReviews: Review[]
  formatTimeAgo: (date: string) => string
  onReviewClick: (reviewId: string) => void
}

export default function Sidebar({
  popularReviews,
  recentReviews,
  formatTimeAgo,
  onReviewClick
}: SidebarProps) {
  return (
    <div className="space-y-6">
      {/* Popular Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp className="h-5 w-5 text-orange-500" />
          <h3 className="font-bold text-gray-900">인기 후기</h3>
        </div>
        <div className="space-y-2">
          {popularReviews.length > 0 ? (
            popularReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onReviewClick(review.id)}
                className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                    <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-[#3056F5] transition-colors">
                      {review.productName}
                    </h4>
                    <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                      {review.brand}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Heart className="h-3 w-3" />
                        <span>{review.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3" />
                        <span>{review.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              인기 후기가 없습니다
            </p>
          )}
        </div>
      </motion.div>

      {/* Recent Reviews */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6"
      >
        <div className="flex items-center gap-2 mb-4">
          <Clock className="h-5 w-5 text-blue-500" />
          <h3 className="font-bold text-gray-900">최근 후기</h3>
        </div>
        <div className="space-y-2">
          {recentReviews.length > 0 ? (
            recentReviews.map((review, index) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => onReviewClick(review.id)}
                className="p-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer group"
              >
                <h4 className="text-sm font-semibold text-gray-900 line-clamp-1 group-hover:text-[#3056F5] transition-colors">
                  {review.productName}
                </h4>
                <p className="text-xs text-gray-600 line-clamp-1 mt-1">
                  {review.brand}
                </p>
                <div className="flex items-center gap-2 mt-2 text-xs text-gray-500">
                  <Eye className="h-3 w-3" />
                  <span>{review.views}</span>
                  <span>•</span>
                  <span>{formatTimeAgo(review.createdAt)}</span>
                </div>
              </motion.div>
            ))
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              최근 후기가 없습니다
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
