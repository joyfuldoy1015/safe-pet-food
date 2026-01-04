'use client'

import React, { useState } from 'react'
import { ArrowUp, MessageCircle, User, CheckCircle, Reply, Send } from 'lucide-react'

export interface Comment {
  id: string
  content: string
  author: {
    name: string
    avatar?: string
    level?: 'beginner' | 'experienced' | 'expert'
  }
  votes: number
  isUpvoted?: boolean
  isBestAnswer?: boolean
  createdAt: string
  replies?: Comment[]
}

interface CommentThreadProps {
  comment: Comment
  onUpvote: (commentId: string) => void
  onReply: (commentId: string, content: string) => void
  formatTimeAgo: (date: string) => string
  depth?: number
  parentAuthor?: string // 대대댓글일 때 멘션할 부모 작성자
}

export default function CommentThread({
  comment,
  onUpvote,
  onReply,
  formatTimeAgo,
  depth = 0,
  parentAuthor
}: CommentThreadProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const maxDepth = 10 // 충분히 깊은 답글 허용

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

  const handleReplySubmit = () => {
    if (!replyContent.trim()) return
    onReply(comment.id, replyContent.trim())
    setReplyContent('')
    setShowReplyForm(false)
  }

  // depth 1까지만 들여쓰기 적용, 그 이상은 동일한 들여쓰기 유지
  const shouldIndent = depth > 0
  const indentClass = shouldIndent ? 'ml-6 pl-3 border-l-2 border-gray-200' : ''

  return (
    <div className={indentClass}>
      <div className="bg-white rounded-lg p-3">
        {/* Author Info */}
        <div className="flex items-center space-x-2 mb-2">
          {comment.author.avatar ? (
            <img
              src={comment.author.avatar}
              alt={comment.author.name}
              className="h-8 w-8 rounded-full"
            />
          ) : (
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <User className="h-4 w-4 text-gray-500" />
            </div>
          )}
          <span className="text-sm font-medium text-gray-900">{comment.author.name}</span>
          {getAuthorBadge(comment.author.level)}
          <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
        </div>

        {/* Content with mention for nested replies */}
        <p className="text-sm text-gray-700 whitespace-pre-line mb-2">
          {parentAuthor && (
            <span className="text-blue-600 font-medium">@{parentAuthor} </span>
          )}
          {comment.content}
        </p>

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => onUpvote(comment.id)}
              className={`flex items-center space-x-1 px-2 py-1 rounded transition-colors ${
                comment.isUpvoted
                  ? 'text-red-600 bg-red-50'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-red-600'
              }`}
            >
              <ArrowUp className={`h-4 w-4 ${comment.isUpvoted ? 'fill-current' : ''}`} />
              <span className="text-sm font-medium">{comment.votes}</span>
            </button>
            {depth < maxDepth && (
              <button
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="flex items-center space-x-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
              >
                <Reply className="h-4 w-4" />
                <span className="text-sm">답글</span>
              </button>
            )}
          </div>
        </div>

        {/* Reply Form */}
        {showReplyForm && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="답글을 작성해주세요..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
            />
            <div className="flex justify-end space-x-2 mt-2">
              <button
                onClick={() => {
                  setShowReplyForm(false)
                  setReplyContent('')
                }}
                className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                취소
              </button>
              <button
                onClick={handleReplySubmit}
                disabled={!replyContent.trim()}
                className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-1"
              >
                <Send className="h-3 w-3" />
                <span>작성</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Nested Replies */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-2 space-y-2">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onUpvote={onUpvote}
              onReply={onReply}
              formatTimeAgo={formatTimeAgo}
              depth={1}
              parentAuthor={depth >= 1 ? comment.author.name : undefined}
            />
          ))}
        </div>
      )}
    </div>
  )
}

