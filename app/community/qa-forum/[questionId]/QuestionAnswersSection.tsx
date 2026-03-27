'use client'

import React from 'react'
import Link from 'next/link'
import { MessageCircle, Send, User } from 'lucide-react'
import CommentThread, { Comment } from '@/app/components/qa-forum/CommentThread'

interface QuestionAnswersSectionProps {
  answerCount: number
  comments: Comment[]
  newComment: string
  setNewComment: (value: string) => void
  user: { id: string } | null | undefined
  questionId: string
  onSubmit: (e: React.FormEvent) => void
  onUpvote: (commentId: string) => void
  onReply: (commentId: string, content: string) => void
  onEdit: (commentId: string, newContent: string) => void
  onDelete: (commentId: string) => void
  formatTimeAgo: (date: string) => string
}

export default function QuestionAnswersSection({
  answerCount,
  comments,
  newComment,
  setNewComment,
  user,
  questionId,
  onSubmit,
  onUpvote,
  onReply,
  onEdit,
  onDelete,
  formatTimeAgo,
}: QuestionAnswersSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6">
      <h2 className="text-base font-bold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center">
          <MessageCircle className="h-4 w-4 text-blue-500" />
        </span>
        {comments.length}개의 답변
      </h2>

      <div className="space-y-3 mb-6">
        {comments.map((comment) => (
          <CommentThread
            key={comment.id}
            comment={comment}
            onUpvote={onUpvote}
            onReply={onReply}
            onEdit={onEdit}
            onDelete={onDelete}
            formatTimeAgo={formatTimeAgo}
            currentUserId={user?.id}
          />
        ))}
      </div>

      {/* New Comment Form */}
      <div className="pt-4 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          답변 작성하기
        </h3>
        {user ? (
          <form onSubmit={onSubmit} className="space-y-4">
            <div>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="도움이 되는 답변을 작성해주세요... (최소 10자 이상)"
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                required
              />
              <div className="flex justify-between items-center mt-2">
                <span className={`text-xs ${
                  newComment.trim().length < 10 
                    ? 'text-red-500' 
                    : newComment.trim().length > 5000
                    ? 'text-red-500'
                    : 'text-gray-400'
                }`}>
                  {newComment.trim().length} / 5000자
                  {newComment.trim().length < 10 && newComment.trim().length > 0 && (
                    <span className="ml-2">(최소 10자 필요)</span>
                  )}
                </span>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={!newComment.trim() || newComment.trim().length < 10}
                className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <Send className="h-4 w-4" />
                <span>답변 등록</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="bg-gray-50 border border-gray-100 rounded-xl p-6 text-center">
            <div className="flex flex-col items-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-sm text-gray-500">답변을 작성하려면 로그인이 필요합니다.</p>
              <Link
                href={`/login?redirect=${encodeURIComponent(`/community/qa-forum/${questionId}`)}`}
                className="px-5 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
              >
                로그인하기
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
