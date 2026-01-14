'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, ChevronDown, ChevronUp, CheckCircle, ThumbsUp, MoreHorizontal, Edit2, Trash2 } from 'lucide-react'
import type { QAThread, QAPost, QAPostWithAuthor } from '@/lib/types/review-log'

interface QAThreadListProps {
  threads: QAThread[]
  posts: QAPostWithAuthor[]
  currentUserId?: string
  onPostSubmit: (threadId: string, content: string, kind: 'question' | 'answer' | 'comment', parentId?: string) => void
  onPostEdit?: (postId: string, newContent: string) => void
  onPostDelete?: (postId: string) => void
  onThreadDelete?: (threadId: string) => void
  onAcceptAnswer?: (postId: string) => void
  onUpvote?: (postId: string) => void
  formatTimeAgo: (date: string) => string
  getAuthorInfo: (authorId: string) => { nickname: string; avatarUrl?: string } | null
}

/**
 * Q&A Thread List Component
 */
export default function QAThreadList({
  threads,
  posts,
  currentUserId,
  onPostSubmit,
  onPostEdit,
  onPostDelete,
  onThreadDelete,
  onAcceptAnswer,
  onUpvote,
  formatTimeAgo,
  getAuthorInfo
}: QAThreadListProps) {
  const [expandedThreads, setExpandedThreads] = useState<Set<string>>(new Set())
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [replyContent, setReplyContent] = useState('')
  const [answerContents, setAnswerContents] = useState<Record<string, string>>({})
  const [editingPostId, setEditingPostId] = useState<string | null>(null)
  const [editContent, setEditContent] = useState('')
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const toggleThread = (threadId: string) => {
    setExpandedThreads((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(threadId)) {
        newSet.delete(threadId)
      } else {
        newSet.add(threadId)
      }
      return newSet
    })
  }

  const getThreadPosts = (threadId: string): QAPostWithAuthor[] => {
    return posts.filter((p) => p.threadId === threadId)
  }

  const getQuestionPost = (threadId: string): QAPostWithAuthor | undefined => {
    return posts.find((p) => p.threadId === threadId && p.kind === 'question')
  }

  const getAnswerPosts = (threadId: string): QAPostWithAuthor[] => {
    const question = getQuestionPost(threadId)
    if (!question) return []
    return posts.filter((p) => p.threadId === threadId && p.kind === 'answer' && p.parentId === question.id)
  }

  const getCommentsForPost = (postId: string): QAPostWithAuthor[] => {
    return posts.filter((p) => p.parentId === postId && p.kind === 'comment')
  }

  const handleReplySubmit = (threadId: string, kind: 'answer' | 'comment', parentId?: string) => {
    if (!replyContent.trim()) return
    onPostSubmit(threadId, replyContent.trim(), kind, parentId)
    setReplyContent('')
    setReplyingTo(null)
  }

  const handleAnswerSubmit = (threadId: string, questionId: string) => {
    const content = answerContents[threadId]
    if (!content?.trim()) return
    onPostSubmit(threadId, content.trim(), 'answer', questionId)
    setAnswerContents((prev) => ({ ...prev, [threadId]: '' }))
  }

  return (
    <div className="space-y-4">
      {threads.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
          <p className="text-sm">아직 질문이 없습니다.</p>
        </div>
      ) : (
        threads.map((thread) => {
          const threadPosts = getThreadPosts(thread.id)
          const question = getQuestionPost(thread.id)
          const answers = getAnswerPosts(thread.id)
          const isExpanded = expandedThreads.has(thread.id)

          if (!question) return null

          const questionAuthor = getAuthorInfo(question.authorId)

          return (
            <motion.div
              key={thread.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border border-gray-200 rounded-xl overflow-hidden bg-white"
            >
              {/* Thread Header */}
              <button
                onClick={() => toggleThread(thread.id)}
                className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
              >
                <div className="flex-1 text-left">
                  <h3 className="text-sm font-semibold text-gray-900 mb-1">{thread.title}</h3>
                  <div className="flex items-center gap-2 text-xs text-gray-600">
                    <span>{questionAuthor?.nickname || '익명'}</span>
                    <span>·</span>
                    <span>{formatTimeAgo(thread.createdAt)}</span>
                    {answers.length > 0 && (
                      <>
                        <span>·</span>
                        <span>{answers.length}개 답변</span>
                      </>
                    )}
                  </div>
                </div>
                {isExpanded ? (
                  <ChevronUp className="h-5 w-5 text-gray-600 flex-shrink-0" />
                ) : (
                  <ChevronDown className="h-5 w-5 text-gray-600 flex-shrink-0" />
                )}
              </button>

              {/* Thread Content */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="px-4 py-3 space-y-4"
                  >
                    {/* Question */}
                    <div className="pb-3 border-b border-gray-200">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          {question.isDeleted ? (
                            // 삭제된 질문 표시
                            <div className="bg-gray-100 rounded-lg p-3 border border-gray-200">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-medium text-gray-400 bg-gray-200 px-2 py-1 rounded">
                                  질문
                                </span>
                              </div>
                              <p className="text-sm text-gray-400 italic">작성자가 삭제한 질문입니다.</p>
                            </div>
                          ) : (
                            <>
                              <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                    질문
                                  </span>
                                  <span className="text-xs text-gray-600">
                                    {questionAuthor?.nickname || '익명'}
                                  </span>
                                  <span className="text-xs text-gray-400">
                                    {formatTimeAgo(question.createdAt)}
                                  </span>
                                </div>
                                {/* 본인 질문 수정/삭제 메뉴 */}
                                {currentUserId === question.authorId && (onPostEdit || onThreadDelete) && (
                                  <div className="relative">
                                    <button
                                      onClick={() => setOpenMenuId(openMenuId === question.id ? null : question.id)}
                                      className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                    >
                                      <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                    </button>
                                    {openMenuId === question.id && (
                                      <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[80px]">
                                        {onPostEdit && (
                                          <button
                                            onClick={() => {
                                              setEditingPostId(question.id)
                                              setEditContent(question.content)
                                              setOpenMenuId(null)
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                          >
                                            <Edit2 className="h-3 w-3" />
                                            수정
                                          </button>
                                        )}
                                        {onThreadDelete && (
                                          <button
                                            onClick={() => {
                                              if (confirm('질문을 삭제하시겠습니까? 답변이 없는 경우 완전히 삭제됩니다.')) {
                                                onThreadDelete(thread.id)
                                              }
                                              setOpenMenuId(null)
                                            }}
                                            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                          >
                                            <Trash2 className="h-3 w-3" />
                                            삭제
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                )}
                              </div>
                              {/* 질문 내용 - 수정 모드 or 일반 모드 */}
                              {editingPostId === question.id ? (
                                <div className="mb-2">
                                  <textarea
                                    value={editContent}
                                    onChange={(e) => setEditContent(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3056F5] text-sm resize-none"
                                    rows={3}
                                  />
                                  <div className="flex justify-end gap-2 mt-2">
                                    <button
                                      onClick={() => {
                                        setEditingPostId(null)
                                        setEditContent('')
                                      }}
                                      className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                                    >
                                      취소
                                    </button>
                                    <button
                                      onClick={() => {
                                        if (editContent.trim() && onPostEdit) {
                                          onPostEdit(question.id, editContent.trim())
                                          setEditingPostId(null)
                                        }
                                      }}
                                      className="px-3 py-1.5 text-sm bg-[#3056F5] text-white rounded-lg hover:bg-[#2545D4]"
                                    >
                                      저장
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <p className="text-sm text-gray-900 whitespace-pre-line">{question.content}</p>
                              )}
                              <div className="flex items-center gap-3 mt-2">
                                <button
                                  onClick={() => onUpvote?.(question.id)}
                                  className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                                >
                                  <ThumbsUp size={14} />
                                  {question.upvotes}
                                </button>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Answers */}
                    {answers.length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs font-semibold text-gray-700">답변 ({answers.length})</h4>
                        {answers.map((answer) => {
                          const answerAuthor = getAuthorInfo(answer.authorId)
                          const comments = getCommentsForPost(answer.id)

                          return (
                            <div
                              key={answer.id}
                              className={`p-3 rounded-lg border ${
                                answer.isDeleted
                                  ? 'bg-gray-100 border-gray-200'
                                  : answer.isAccepted
                                    ? 'bg-emerald-50 border-emerald-200'
                                    : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              {answer.isDeleted ? (
                                // 삭제된 답변 표시
                                <p className="text-sm text-gray-400 italic">작성자가 삭제한 답변입니다.</p>
                              ) : (
                                <>
                                  <div className="flex items-start gap-2 mb-2">
                                    {answer.isAccepted && (
                                      <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                                    )}
                                    <div className="flex-1">
                                      <div className="flex items-center justify-between mb-1">
                                        <div className="flex items-center gap-2">
                                          <span className="text-xs font-medium text-gray-700">
                                            {answerAuthor?.nickname || '익명'}
                                          </span>
                                          {answer.isAccepted && (
                                            <span className="text-xs text-emerald-600 font-medium bg-emerald-100 px-2 py-0.5 rounded">
                                              채택됨
                                            </span>
                                          )}
                                          <span className="text-xs text-gray-400">
                                            {formatTimeAgo(answer.createdAt)}
                                          </span>
                                        </div>
                                        {/* 본인 답변 수정/삭제 메뉴 */}
                                        {currentUserId === answer.authorId && (onPostEdit || onPostDelete) && (
                                          <div className="relative">
                                            <button
                                              onClick={() => setOpenMenuId(openMenuId === answer.id ? null : answer.id)}
                                              className="p-1 hover:bg-gray-200 rounded-full transition-colors"
                                            >
                                              <MoreHorizontal className="h-4 w-4 text-gray-500" />
                                            </button>
                                            {openMenuId === answer.id && (
                                              <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-10 min-w-[80px]">
                                                {onPostEdit && (
                                                  <button
                                                    onClick={() => {
                                                      setEditingPostId(answer.id)
                                                      setEditContent(answer.content)
                                                      setOpenMenuId(null)
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                                                  >
                                                    <Edit2 className="h-3 w-3" />
                                                    수정
                                                  </button>
                                                )}
                                                {onPostDelete && (
                                                  <button
                                                    onClick={() => {
                                                      if (confirm('답변을 삭제하시겠습니까?')) {
                                                        onPostDelete(answer.id)
                                                      }
                                                      setOpenMenuId(null)
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                                                  >
                                                    <Trash2 className="h-3 w-3" />
                                                    삭제
                                                  </button>
                                                )}
                                              </div>
                                            )}
                                          </div>
                                        )}
                                      </div>
                                      {/* 답변 내용 - 수정 모드 or 일반 모드 */}
                                      {editingPostId === answer.id ? (
                                        <div className="mb-2">
                                          <textarea
                                            value={editContent}
                                            onChange={(e) => setEditContent(e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3056F5] text-sm resize-none"
                                            rows={3}
                                          />
                                          <div className="flex justify-end gap-2 mt-2">
                                            <button
                                              onClick={() => {
                                                setEditingPostId(null)
                                                setEditContent('')
                                              }}
                                              className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
                                            >
                                              취소
                                            </button>
                                            <button
                                              onClick={() => {
                                                if (editContent.trim() && onPostEdit) {
                                                  onPostEdit(answer.id, editContent.trim())
                                                  setEditingPostId(null)
                                                }
                                              }}
                                              className="px-3 py-1.5 text-sm bg-[#3056F5] text-white rounded-lg hover:bg-[#2545D4]"
                                            >
                                              저장
                                            </button>
                                          </div>
                                        </div>
                                      ) : (
                                        <p className="text-sm text-gray-900 whitespace-pre-line">{answer.content}</p>
                                      )}
                                  <div className="flex items-center gap-3 mt-2">
                                    <button
                                      onClick={() => onUpvote?.(answer.id)}
                                      className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                                    >
                                      <ThumbsUp size={14} />
                                      {answer.upvotes}
                                    </button>
                                    {currentUserId && currentUserId !== answer.authorId && onAcceptAnswer && (
                                      <button
                                        onClick={() => onAcceptAnswer(answer.id)}
                                        disabled={answer.isAccepted}
                                        className="text-xs text-gray-600 hover:text-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                      >
                                        {answer.isAccepted ? '채택됨' : '채택하기'}
                                      </button>
                                    )}
                                    {currentUserId && (
                                      <button
                                        onClick={() => setReplyingTo(answer.id)}
                                        className="text-xs text-gray-600 hover:text-blue-600 transition-colors"
                                      >
                                        댓글 ({comments.length})
                                      </button>
                                    )}
                                  </div>

                                  {/* Comments */}
                                  {comments.length > 0 && (
                                    <div className="mt-3 ml-4 space-y-2 border-l-2 border-gray-200 pl-3">
                                      {comments.map((comment) => {
                                        const commentAuthor = getAuthorInfo(comment.authorId)
                                        return (
                                          <div key={comment.id} className="text-xs">
                                            <span className="font-medium text-gray-700">
                                              {commentAuthor?.nickname || '익명'}
                                            </span>
                                            <span className="text-gray-400 ml-2">
                                              {formatTimeAgo(comment.createdAt)}
                                            </span>
                                            <p className="text-gray-700 mt-1">{comment.content}</p>
                                          </div>
                                        )
                                      })}
                                    </div>
                                  )}

                                      {/* Reply Form */}
                                      {replyingTo === answer.id && (
                                        <div className="mt-3">
                                          <textarea
                                            value={replyContent}
                                            onChange={(e) => setReplyContent(e.target.value)}
                                            placeholder="댓글을 작성하세요..."
                                            rows={2}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] resize-none"
                                          />
                                          <div className="flex justify-end gap-2 mt-2">
                                            <button
                                              onClick={() => {
                                                setReplyingTo(null)
                                                setReplyContent('')
                                              }}
                                              className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-200 transition-colors"
                                            >
                                              취소
                                            </button>
                                            <button
                                              onClick={() => handleReplySubmit(thread.id, 'comment', answer.id)}
                                              className="px-3 py-1.5 bg-[#3056F5] text-white rounded-lg text-xs font-medium hover:bg-[#2648e6] transition-colors"
                                            >
                                              댓글 작성
                                            </button>
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </>
                              )}
                            </div>
                          )
                        })}
                      </div>
                    )}

                    {/* Answer Form */}
                    {currentUserId && (
                      <div className="pt-3 border-t border-gray-200">
                        <textarea
                          value={answerContents[thread.id] || ''}
                          onChange={(e) => setAnswerContents((prev) => ({ ...prev, [thread.id]: e.target.value }))}
                          placeholder="답변을 작성하세요..."
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] resize-none"
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            onClick={() => {
                              const question = getQuestionPost(thread.id)
                              if (question) {
                                handleAnswerSubmit(thread.id, question.id)
                              }
                            }}
                            className="px-4 py-2 bg-[#3056F5] text-white rounded-lg text-sm font-medium hover:bg-[#2648e6] transition-colors"
                          >
                            답변 작성
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })
      )}
    </div>
  )
}

