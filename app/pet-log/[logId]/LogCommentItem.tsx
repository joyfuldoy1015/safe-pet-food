'use client'

import { MoreVertical, Edit2, Trash2 } from 'lucide-react'
import type { Comment } from '@/lib/types/review-log'
import { formatTimeAgo } from '@/lib/utils/format'

interface LogCommentItemProps {
  comment: Comment
  replies: Comment[]
  user: { id: string } | null
  editingCommentId: string | null
  editContent: string
  menuOpenId: string | null
  replyingToCommentId: string | null
  replyContent: string
  onEditComment: (commentId: string) => void
  onDeleteComment: (commentId: string) => void
  onReplyToComment: (parentId: string) => void
  setEditingCommentId: (id: string | null) => void
  setEditContent: (content: string) => void
  setMenuOpenId: (id: string | null) => void
  setReplyingToCommentId: (id: string | null) => void
  setReplyContent: (content: string) => void
  requireLogin: () => boolean
}

export default function LogCommentItem({
  comment,
  replies,
  user,
  editingCommentId,
  editContent,
  menuOpenId,
  replyingToCommentId,
  replyContent,
  onEditComment,
  onDeleteComment,
  onReplyToComment,
  setEditingCommentId,
  setEditContent,
  setMenuOpenId,
  setReplyingToCommentId,
  setReplyContent,
  requireLogin,
}: LogCommentItemProps) {
  return (
    <div className="bg-white rounded-xl p-3 border border-gray-100 relative">
      {editingCommentId === comment.id ? (
        <div className="space-y-2">
          <textarea
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
            rows={2}
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => { setEditingCommentId(null); setEditContent(''); }}
              className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              취소
            </button>
            <button
              onClick={() => onEditComment(comment.id)}
              className="px-3 py-1.5 text-xs bg-violet-500 text-white rounded-lg hover:bg-violet-600"
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-900">{comment.authorName}</span>
              <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
            </div>
            {user && user.id === comment.authorId && (
              <div className="relative">
                <button
                  onClick={() => setMenuOpenId(menuOpenId === comment.id ? null : comment.id)}
                  className="p-1 hover:bg-gray-100 rounded-full"
                >
                  <MoreVertical className="h-4 w-4 text-gray-400" />
                </button>
                {menuOpenId === comment.id && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 overflow-hidden min-w-[100px]">
                    <button
                      onClick={() => {
                        setEditingCommentId(comment.id)
                        setEditContent(comment.content)
                        setMenuOpenId(null)
                      }}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 w-full whitespace-nowrap"
                    >
                      <Edit2 className="h-4 w-4 flex-shrink-0" /> 수정
                    </button>
                    <button
                      onClick={() => onDeleteComment(comment.id)}
                      className="flex items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 w-full whitespace-nowrap"
                    >
                      <Trash2 className="h-4 w-4 flex-shrink-0" /> 삭제
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-gray-700">{comment.content}</p>
          
          {!comment.parentId && (
            <button
              onClick={() => {
                if (requireLogin()) return
                setReplyingToCommentId(replyingToCommentId === comment.id ? null : comment.id)
                setReplyContent('')
              }}
              className="mt-2 text-xs text-violet-600 hover:text-violet-700 font-medium"
            >
              {replyingToCommentId === comment.id ? '취소' : '답글 달기'}
            </button>
          )}

          {replyingToCommentId === comment.id && (
            <div className="mt-3 pl-3 border-l-2 border-violet-200">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답글을 입력하세요..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
                rows={2}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => { setReplyingToCommentId(null); setReplyContent(''); }}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100 rounded-lg"
                >
                  취소
                </button>
                <button
                  onClick={() => onReplyToComment(comment.id)}
                  disabled={!replyContent.trim()}
                  className="px-3 py-1.5 text-xs bg-violet-500 text-white rounded-lg hover:bg-violet-600 disabled:opacity-50"
                >
                  답글 등록
                </button>
              </div>
            </div>
          )}

          {replies.length > 0 && (
            <div className="mt-3 space-y-2 pl-3 border-l-2 border-gray-200">
              {replies.map(reply => (
                <div key={reply.id} className="bg-gray-50 rounded-lg p-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium text-gray-800">{reply.authorName}</span>
                    <span className="text-xs text-gray-400">{formatTimeAgo(reply.createdAt)}</span>
                  </div>
                  <p className="text-xs text-gray-600">{reply.content}</p>
                </div>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
