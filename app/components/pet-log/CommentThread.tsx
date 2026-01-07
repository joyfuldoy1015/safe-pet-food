'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Reply, Send, CheckCircle, User, ArrowUp } from 'lucide-react'
import { Comment } from '@/lib/types/review-log'

interface CommentThreadProps {
  comment: Comment
  allComments: Comment[]
  formatTimeAgo: (date: string) => string
  onReply: (content: string, parentId: string) => void
  depth?: number
  parentAuthor?: string // 대댓글에서 @멘션할 부모 작성자
}

export default function CommentThread({
  comment,
  allComments,
  formatTimeAgo,
  onReply,
  depth = 0,
  parentAuthor
}: CommentThreadProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [liked, setLiked] = useState(false)

  const replies = allComments.filter((c) => c.parentId === comment.id)
  const maxDepth = 10

  // depth 0일 때만 들여쓰기 없음, 나머지는 모두 동일한 들여쓰기 적용
  const isMainComment = depth === 0
  const indentClass = isMainComment ? '' : 'ml-6 pl-3 border-l-2 border-gray-200'

  const handleReplySubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim()) return
    onReply(replyContent.trim(), comment.id)
    setReplyContent('')
    setShowReplyForm(false)
  }

  return (
    <>
      {/* Main Comment */}
      <div className={indentClass}>
        <div className={`bg-gray-50 rounded-xl p-3 ${
          comment.isBestAnswer ? 'border-2 border-green-500 bg-green-50' : ''
        }`}>
          {comment.isBestAnswer && (
            <div className="flex items-center gap-2 mb-2 text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">베스트 답변</span>
            </div>
          )}
          {comment.isHelpful && !comment.isBestAnswer && (
            <div className="flex items-center gap-2 mb-2 text-blue-600">
              <CheckCircle className="h-4 w-4" />
              <span className="text-xs font-medium">도움됨</span>
            </div>
          )}

          {/* Author Info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              {comment.avatarUrl ? (
                <img
                  src={comment.avatarUrl}
                  alt={comment.authorName || '사용자'}
                  className="w-8 h-8 rounded-full object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <User className="h-4 w-4 text-gray-500" />
                </div>
              )}
              <span className="font-medium text-gray-900">{comment.authorName || '사용자'}</span>
              <span className="text-xs text-gray-500">
                {formatTimeAgo(comment.createdAt)}
              </span>
            </div>
          </div>

          {/* Content with @mention */}
          <p className="text-sm text-gray-700 mb-3 whitespace-pre-line leading-relaxed">
            {parentAuthor && (
              <span className="text-blue-600 font-medium">@{parentAuthor} </span>
            )}
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setLiked(!liked)}
              className={`flex items-center gap-1 px-2 py-1 rounded text-sm transition-colors ${
                liked ? 'text-red-600 bg-red-50' : 'text-gray-600 hover:bg-gray-100 hover:text-red-600'
              }`}
            >
              <ArrowUp className={`h-4 w-4 ${liked ? 'fill-current' : ''}`} />
              <span>0</span>
            </button>
            {depth < maxDepth && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center gap-1 px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <Reply className="h-4 w-4" />
                <span>답글</span>
              </button>
            )}
          </div>

          {/* Reply Form */}
          <AnimatePresence>
            {showReplyForm && (
              <motion.form
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                onSubmit={handleReplySubmit}
                className="mt-3 pt-3 border-t border-gray-200"
              >
                <textarea
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  placeholder="답글을 작성해주세요..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] resize-none text-sm"
                  required
                />
                <div className="flex justify-end gap-2 mt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowReplyForm(false)
                      setReplyContent('')
                    }}
                    className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    disabled={!replyContent.trim()}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm bg-[#3056F5] text-white rounded-lg hover:bg-[#2545D4] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send className="h-3 w-3" />
                    <span>작성</span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Nested Replies - 부모 컨테이너 밖에서 렌더링하여 중첩 들여쓰기 방지 */}
      {replies.length > 0 && (
        <div className="mt-1 space-y-1">
          {replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              allComments={allComments}
              formatTimeAgo={formatTimeAgo}
              onReply={onReply}
              depth={1}
              parentAuthor={depth >= 1 ? comment.authorName : undefined}
            />
          ))}
        </div>
      )}
    </>
  )
}
