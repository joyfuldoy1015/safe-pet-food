'use client'

import React, { useState } from 'react'
import { ArrowUp, MessageCircle, User, CheckCircle, Reply, Send, Edit, Trash2, MoreVertical } from 'lucide-react'

export interface Comment {
  id: string
  content: string
  author: {
    name: string
    avatar?: string
    level?: 'beginner' | 'experienced' | 'expert'
    id?: string // 작성자 ID
  }
  votes: number
  isUpvoted?: boolean
  isBestAnswer?: boolean
  createdAt: string
  replies?: Comment[]
  isDeleted?: boolean // 삭제된 댓글 여부
}

interface CommentThreadProps {
  comment: Comment
  onUpvote: (commentId: string) => void
  onReply: (commentId: string, content: string) => void
  onEdit?: (commentId: string, newContent: string) => void
  onDelete?: (commentId: string) => void
  formatTimeAgo: (date: string) => string
  depth?: number
  parentAuthor?: string // 대대댓글일 때 멘션할 부모 작성자
  currentUserId?: string // 현재 로그인한 사용자 ID
}

export default function CommentThread({
  comment,
  onUpvote,
  onReply,
  onEdit,
  onDelete,
  formatTimeAgo,
  depth = 0,
  parentAuthor,
  currentUserId
}: CommentThreadProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState(comment.content)
  const [showMenu, setShowMenu] = useState(false)
  const maxDepth = 10 // 충분히 깊은 답글 허용
  
  // 현재 사용자가 작성한 댓글인지 확인
  const isOwnComment = currentUserId && comment.author.id === currentUserId

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

  const handleReplyClick = () => {
    if (!currentUserId) {
      alert('답글을 작성하려면 로그인이 필요합니다.')
      const currentPath = window.location.pathname
      window.location.href = `/login?redirect=${encodeURIComponent(currentPath)}`
      return
    }
    setShowReplyForm(!showReplyForm)
  }

  const handleEditSubmit = () => {
    if (!editContent.trim() || !onEdit) return
    onEdit(comment.id, editContent.trim())
    setIsEditing(false)
  }

  const handleEditCancel = () => {
    setEditContent(comment.content)
    setIsEditing(false)
  }

  const handleDelete = () => {
    if (!onDelete) return
    if (confirm('댓글을 삭제하시겠습니까?')) {
      onDelete(comment.id)
      setShowMenu(false)
    }
  }

  // depth 0일 때만 들여쓰기 없음, 나머지는 모두 들여쓰기 적용
  const isMainComment = depth === 0
  const indentClass = isMainComment ? '' : 'ml-6 pl-3 border-l-2 border-gray-200'

  return (
    <>
      <div className={indentClass}>
        <div className="bg-white rounded-lg p-3">
          {/* Author Info */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
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
              <span className="text-sm font-medium text-gray-900">{comment.isDeleted ? '삭제된 사용자' : comment.author.name}</span>
              {!comment.isDeleted && getAuthorBadge(comment.author.level)}
              <span className="text-xs text-gray-500">{formatTimeAgo(comment.createdAt)}</span>
            </div>
            
            {/* 수정/삭제 메뉴 */}
            {isOwnComment && !comment.isDeleted && (
              <div className="relative">
                <button
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
                {showMenu && (
                  <div className="absolute right-0 mt-1 w-32 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                    <button
                      onClick={() => {
                        setIsEditing(true)
                        setShowMenu(false)
                      }}
                      className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Edit className="h-3 w-3" />
                      수정
                    </button>
                    <button
                      onClick={handleDelete}
                      className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="h-3 w-3" />
                      삭제
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Content - 삭제된 댓글 또는 일반 댓글 */}
          {comment.isDeleted ? (
            <p className="text-sm text-gray-400 italic mb-2">사용자가 댓글을 삭제했습니다.</p>
          ) : isEditing ? (
            <div className="mb-2">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none text-sm"
                rows={3}
              />
              <div className="flex justify-end space-x-2 mt-2">
                <button
                  onClick={handleEditCancel}
                  className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={handleEditSubmit}
                  disabled={!editContent.trim()}
                  className="px-3 py-1.5 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  저장
                </button>
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-700 whitespace-pre-line mb-2">
              {parentAuthor && (
                <span className="text-blue-600 font-medium">@{parentAuthor} </span>
              )}
              {comment.content}
            </p>
          )}

          {/* Actions */}
          {!comment.isDeleted && !isEditing && (
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
                    onClick={handleReplyClick}
                    className="flex items-center space-x-1 px-2 py-1 text-gray-600 hover:bg-gray-100 rounded transition-colors"
                  >
                    <Reply className="h-4 w-4" />
                    <span className="text-sm">답글</span>
                  </button>
                )}
              </div>
            </div>
          )}

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
      </div>

      {/* Nested Replies - 부모 컨테이너 밖에서 렌더링 */}
      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-1 space-y-1">
          {comment.replies.map((reply) => (
            <CommentThread
              key={reply.id}
              comment={reply}
              onUpvote={onUpvote}
              onReply={onReply}
              onEdit={onEdit}
              onDelete={onDelete}
              formatTimeAgo={formatTimeAgo}
              depth={1}
              parentAuthor={depth >= 1 ? comment.author.name : undefined}
              currentUserId={currentUserId}
            />
          ))}
        </div>
      )}
    </>
  )
}

