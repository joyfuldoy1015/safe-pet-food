'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Star, Heart, MessageCircle, Eye, ThumbsUp, ThumbsDown, Send } from 'lucide-react'
import { Review } from './ReviewCard'
import CommentThread from './CommentThread'
import { Comment } from '@/lib/types/review-log'

interface ReviewDetailModalProps {
  review: Review | null
  isOpen: boolean
  onClose: () => void
  formatTimeAgo: (date: string) => string
}

export default function ReviewDetailModal({
  review,
  isOpen,
  onClose,
  formatTimeAgo
}: ReviewDetailModalProps) {
  const [activeTab, setActiveTab] = useState<'details' | 'comments'>('details')
  const [newComment, setNewComment] = useState('')
  const [liked, setLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(review?.likes || 0)
  const [comments, setComments] = useState<Comment[]>([])

  if (!review) return null

  const categoryConfig = {
    사료: { emoji: '🍽️', color: 'bg-blue-50 text-blue-700' },
    간식: { emoji: '🦴', color: 'bg-green-50 text-green-700' },
    영양제: { emoji: '💊', color: 'bg-purple-50 text-purple-700' },
    화장실: { emoji: '🚽', color: 'bg-orange-50 text-orange-700' }
  }

  const statusConfig = {
    급여중: { label: '급여 중', color: 'bg-green-100 text-green-800' },
    급여완료: { label: '급여 완료', color: 'bg-gray-100 text-gray-800' },
    급여중지: { label: '급여 중지', color: 'bg-red-100 text-red-800' }
  }

  const category = categoryConfig[review.category]
  const status = statusConfig[review.status]

  const handleLike = () => {
    setLiked(!liked)
    setLikesCount(liked ? likesCount - 1 : likesCount + 1)
  }

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newComment.trim()) return
    
    // 댓글 추가
    const newCommentObj: Comment = {
      id: `comment-${Date.now()}`,
      logId: review.id,
      authorId: 'current-user', // 실제로는 useAuth에서 가져와야 함
      content: newComment.trim(),
      createdAt: new Date().toISOString(),
      parentId: undefined
    }
    
    setComments([...comments, newCommentObj])
    setNewComment('')
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black bg-opacity-50 z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none"
          >
            <div
              className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-strong pointer-events-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between z-10">
                <div className="flex items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl ${category.color} flex items-center justify-center text-2xl`}>
                    {category.emoji}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">{review.brand}</h2>
                    <p className="text-sm text-gray-600">{review.productName}</p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="h-5 w-5 text-gray-500" />
                </button>
              </div>

              {/* Tabs */}
              <div className="flex border-b border-gray-200">
                <button
                  onClick={() => setActiveTab('details')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors ${
                    activeTab === 'details'
                      ? 'text-[#3056F5] border-b-2 border-[#3056F5]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  상세 정보
                </button>
                <button
                  onClick={() => setActiveTab('comments')}
                  className={`flex-1 px-6 py-4 text-sm font-medium transition-colors relative ${
                    activeTab === 'comments'
                      ? 'text-[#3056F5] border-b-2 border-[#3056F5]'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  댓글
                  {review.comments > 0 && (
                    <span className="ml-2 px-2 py-0.5 bg-blue-100 text-blue-600 rounded-full text-xs">
                      {review.comments}
                    </span>
                  )}
                </button>
              </div>

              {/* Content */}
              <div className="overflow-y-auto max-h-[calc(90vh-140px)] p-6">
                {activeTab === 'details' ? (
                  <div className="space-y-6">
                    {/* Rating & Status */}
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star
                            key={i}
                            className={`h-5 w-5 ${
                              i < review.rating
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                        <span className="text-lg font-bold text-gray-900">
                          {review.rating}.0
                        </span>
                      </div>
                      <span className={`px-3 py-1 text-sm font-medium rounded-lg border ${status.color}`}>
                        {status.label}
                      </span>
                      {review.isRecommended ? (
                        <div className="flex items-center gap-1 px-3 py-1 bg-green-50 text-green-700 rounded-lg">
                          <ThumbsUp className="h-4 w-4" />
                          <span className="text-sm font-medium">추천합니다</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 rounded-lg">
                          <ThumbsDown className="h-4 w-4" />
                          <span className="text-sm font-medium">추천하지 않습니다</span>
                        </div>
                      )}
                    </div>

                    {/* Pet Info */}
                    <div className="bg-gray-50 rounded-2xl p-4">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">반려동물 정보</h3>
                      <div className="flex items-center gap-4 text-sm text-gray-700">
                        <div className="flex items-center gap-1">
                          <span>{review.petInfo.species === 'dog' ? '🐕' : '🐱'}</span>
                          <span>{review.petInfo.breed}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>나이:</span>
                          <span>{review.petInfo.age}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>체중:</span>
                          <span>{review.petInfo.weight}</span>
                        </div>
                      </div>
                    </div>

                    {/* Full Review */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-3">후기 전문</h3>
                      <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                        {review.summary}
                      </p>
                    </div>

                    {/* Metrics */}
                    <div className="flex items-center gap-6 pt-4 border-t border-gray-200">
                      <button
                        onClick={handleLike}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                          liked
                            ? 'bg-red-50 text-red-600'
                            : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        <Heart className={`h-5 w-5 ${liked ? 'fill-current' : ''}`} />
                        <span className="font-medium">{likesCount}</span>
                      </button>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MessageCircle className="h-5 w-5" />
                        <span>{review.comments}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Eye className="h-5 w-5" />
                        <span>{review.views}</span>
                      </div>
                      <div className="ml-auto text-sm text-gray-500">
                        {formatTimeAgo(review.createdAt)}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Comments */}
                    {review.comments > 0 ? (
                      <div className="space-y-4">
                        {/* Mock comments - replace with actual data */}
                        {comments.length > 0 ? (
                          comments.map((comment) => (
                            <CommentThread
                              key={comment.id}
                              comment={comment}
                              allComments={comments}
                              formatTimeAgo={formatTimeAgo}
                              onReply={(content, parentId) => {
                                // 답글 추가
                                const newReply: Comment = {
                                  id: `comment-${Date.now()}`,
                                  logId: review.id,
                                  authorId: 'current-user', // 실제로는 useAuth에서 가져와야 함
                                  content: content.trim(),
                                  createdAt: new Date().toISOString(),
                                  parentId
                                }
                                setComments([...comments, newReply])
                              }}
                            />
                          ))
                        ) : (
                          <div className="text-center py-12">
                            <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p className="text-sm text-gray-500">아직 댓글이 없습니다.</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-12">
                        <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                        <p className="text-sm text-gray-500">
                          아직 댓글이 없습니다. 첫 댓글을 남겨보세요!
                        </p>
                      </div>
                    )}

                    {/* Comment Form */}
                    <form onSubmit={handleCommentSubmit} className="pt-6 border-t border-gray-200">
                      <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="댓글을 작성해주세요..."
                        rows={3}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] resize-none"
                        required
                      />
                      <div className="flex justify-end mt-3">
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          type="submit"
                          disabled={!newComment.trim()}
                          className="flex items-center gap-2 px-6 py-2.5 bg-[#3056F5] text-white rounded-xl hover:bg-[#2545D4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          <Send className="h-4 w-4" />
                          <span>댓글 작성</span>
                        </motion.button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
