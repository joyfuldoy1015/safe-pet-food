'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, HelpCircle, ChevronRight, Loader2 } from 'lucide-react'
import type { Comment, QAThread, QAPostWithAuthor } from '@/lib/types/review-log'
import { getRecentComments, getRecentQA } from '@/lib/supa/activity'
import { mockComments, mockQAThreads, mockQAPosts } from '@/lib/mock/review-log'
import { mockOwners } from '@/lib/mock/review-log'

interface ActivityItem {
  id: string
  type: 'comment' | 'question' | 'answer'
  authorName: string
  content: string
  createdAt: string
  logId: string
  brand: string
  product: string
  threadId?: string
  threadTitle?: string
}

interface FeedActivityPanelProps {
  logIds: string[]
  onOpen: (params: { logId: string; tab: 'details' | 'comments' | 'qa'; threadId?: string }) => void
  formatTimeAgo: (date: string) => string
}

const ITEMS_PER_PAGE = 10

/**
 * Feed Activity Panel - shows recent comments and Q&A for visible logs
 */
export default function FeedActivityPanel({
  logIds,
  onOpen,
  formatTimeAgo
}: FeedActivityPanelProps) {
  const [activeTab, setActiveTab] = useState<'comments' | 'qa'>('comments')
  const [comments, setComments] = useState<ActivityItem[]>([])
  const [qaPosts, setQAPosts] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [commentsOffset, setCommentsOffset] = useState(0)
  const [qaOffset, setQAOffset] = useState(0)
  const [hasMoreComments, setHasMoreComments] = useState(true)
  const [hasMoreQA, setHasMoreQA] = useState(true)

  const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL

  // Load initial data
  useEffect(() => {
    if (logIds.length === 0) {
      setComments([])
      setQAPosts([])
      return
    }

    loadActivities()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [logIds, activeTab])

  const loadActivities = async () => {
    setIsLoading(true)

    try {
      if (hasSupabase) {
        // Load from Supabase
        if (activeTab === 'comments') {
          const data = await getRecentComments(logIds, ITEMS_PER_PAGE, 0)
          const items: ActivityItem[] = data.map((item: any) => ({
            id: item.id,
            type: 'comment',
            authorName: item.profiles?.nickname || '익명',
            content: item.content,
            createdAt: item.created_at,
            logId: item.log_id,
            brand: item.review_logs?.brand || '',
            product: item.review_logs?.product || ''
          }))
          setComments(items)
          setHasMoreComments(items.length === ITEMS_PER_PAGE)
          setCommentsOffset(ITEMS_PER_PAGE)
        } else {
          const data = await getRecentQA(logIds, ITEMS_PER_PAGE, 0)
          const items: ActivityItem[] = data.map((item: any) => ({
            id: item.id,
            type: item.kind === 'question' ? 'question' : 'answer',
            authorName: item.profiles?.nickname || '익명',
            content: item.content,
            createdAt: item.created_at,
            logId: item.qa_threads?.log_id || '',
            brand: item.review_logs?.brand || '',
            product: item.review_logs?.product || '',
            threadId: item.thread_id,
            threadTitle: item.qa_threads?.title || ''
          }))
          setQAPosts(items)
          setHasMoreQA(items.length === ITEMS_PER_PAGE)
          setQAOffset(ITEMS_PER_PAGE)
        }
      } else {
        // Fallback to mock data
        if (activeTab === 'comments') {
          const filteredComments = mockComments
            .filter((c) => logIds.includes(c.logId))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, ITEMS_PER_PAGE)

          const items: ActivityItem[] = filteredComments.map((comment) => {
            const owner = mockOwners.find((o) => o.id === comment.authorId)
            // Find log to get brand/product
            const log = require('@/lib/mock/review-log').mockReviewLogs.find(
              (l: any) => l.id === comment.logId
            )
            return {
              id: comment.id,
              type: 'comment' as const,
              authorName: owner?.nickname || '익명',
              content: comment.content,
              createdAt: comment.createdAt,
              logId: comment.logId,
              brand: log?.brand || '',
              product: log?.product || ''
            }
          })
          setComments(items)
          setHasMoreComments(filteredComments.length === ITEMS_PER_PAGE)
          setCommentsOffset(ITEMS_PER_PAGE)
        } else {
          const filteredThreads = mockQAThreads.filter((t) => logIds.includes(t.logId))
          const filteredPosts = mockQAPosts
            .filter((p) => filteredThreads.some((t) => t.id === p.threadId))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, ITEMS_PER_PAGE)

          const items: ActivityItem[] = filteredPosts.map((post) => {
            const owner = mockOwners.find((o) => o.id === post.authorId)
            const thread = filteredThreads.find((t) => t.id === post.threadId)
            const log = require('@/lib/mock/review-log').mockReviewLogs.find(
              (l: any) => l.id === thread?.logId
            )
            return {
              id: post.id,
              type: post.kind === 'question' ? 'question' : 'answer',
              authorName: owner?.nickname || '익명',
              content: post.content,
              createdAt: post.createdAt,
              logId: thread?.logId || '',
              brand: log?.brand || '',
              product: log?.product || '',
              threadId: post.threadId,
              threadTitle: thread?.title || ''
            }
          })
          setQAPosts(items)
          setHasMoreQA(filteredPosts.length === ITEMS_PER_PAGE)
          setQAOffset(ITEMS_PER_PAGE)
        }
      }
    } catch (error) {
      console.error('[FeedActivityPanel] Error loading activities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadMore = async () => {
    if (isLoading) return

    setIsLoading(true)

    try {
      if (hasSupabase) {
        if (activeTab === 'comments') {
          const data = await getRecentComments(logIds, ITEMS_PER_PAGE, commentsOffset)
          const items: ActivityItem[] = data.map((item: any) => ({
            id: item.id,
            type: 'comment',
            authorName: item.profiles?.nickname || '익명',
            content: item.content,
            createdAt: item.created_at,
            logId: item.log_id,
            brand: item.review_logs?.brand || '',
            product: item.review_logs?.product || ''
          }))
          setComments((prev) => [...prev, ...items])
          setHasMoreComments(items.length === ITEMS_PER_PAGE)
          setCommentsOffset((prev) => prev + ITEMS_PER_PAGE)
        } else {
          const data = await getRecentQA(logIds, ITEMS_PER_PAGE, qaOffset)
          const items: ActivityItem[] = data.map((item: any) => ({
            id: item.id,
            type: item.kind === 'question' ? 'question' : 'answer',
            authorName: item.profiles?.nickname || '익명',
            content: item.content,
            createdAt: item.created_at,
            logId: item.qa_threads?.log_id || '',
            brand: item.review_logs?.brand || '',
            product: item.review_logs?.product || '',
            threadId: item.thread_id,
            threadTitle: item.qa_threads?.title || ''
          }))
          setQAPosts((prev) => [...prev, ...items])
          setHasMoreQA(items.length === ITEMS_PER_PAGE)
          setQAOffset((prev) => prev + ITEMS_PER_PAGE)
        }
      } else {
        // Mock data pagination
        if (activeTab === 'comments') {
          const filteredComments = mockComments
            .filter((c) => logIds.includes(c.logId))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(commentsOffset, commentsOffset + ITEMS_PER_PAGE)

          const { mockReviewLogs } = await import('@/lib/mock/review-log')
          const items: ActivityItem[] = filteredComments.map((comment) => {
            const owner = mockOwners.find((o) => o.id === comment.authorId)
            const log = mockReviewLogs.find((l: any) => l.id === comment.logId)
            return {
              id: comment.id,
              type: 'comment' as const,
              authorName: owner?.nickname || '익명',
              content: comment.content,
              createdAt: comment.createdAt,
              logId: comment.logId,
              brand: log?.brand || '',
              product: log?.product || ''
            }
          })
          setComments((prev) => [...prev, ...items])
          setHasMoreComments(items.length === ITEMS_PER_PAGE)
          setCommentsOffset((prev) => prev + ITEMS_PER_PAGE)
        } else {
          const filteredThreads = mockQAThreads.filter((t) => logIds.includes(t.logId))
          const filteredPosts = mockQAPosts
            .filter((p) => filteredThreads.some((t) => t.id === p.threadId))
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(qaOffset, qaOffset + ITEMS_PER_PAGE)

          const items: ActivityItem[] = filteredPosts.map((post) => {
            const owner = mockOwners.find((o) => o.id === post.authorId)
            const thread = filteredThreads.find((t) => t.id === post.threadId)
            const log = require('@/lib/mock/review-log').mockReviewLogs.find(
              (l: any) => l.id === thread?.logId
            )
            return {
              id: post.id,
              type: post.kind === 'question' ? 'question' : 'answer',
              authorName: owner?.nickname || '익명',
              content: post.content,
              createdAt: post.createdAt,
              logId: thread?.logId || '',
              brand: log?.brand || '',
              product: log?.product || '',
              threadId: post.threadId,
              threadTitle: thread?.title || ''
            }
          })
          setQAPosts((prev) => [...prev, ...items])
          setHasMoreQA(items.length === ITEMS_PER_PAGE)
          setQAOffset((prev) => prev + ITEMS_PER_PAGE)
        }
      }
    } catch (error) {
      console.error('[FeedActivityPanel] Error loading more:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const currentItems = activeTab === 'comments' ? comments : qaPosts
  const hasMore = activeTab === 'comments' ? hasMoreComments : hasMoreQA

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'comment':
        return { label: '댓글', color: 'bg-blue-100 text-blue-700' }
      case 'question':
        return { label: '질문', color: 'bg-purple-100 text-purple-700' }
      case 'answer':
        return { label: '답변', color: 'bg-emerald-100 text-emerald-700' }
      default:
        return { label: '활동', color: 'bg-gray-100 text-gray-700' }
    }
  }

  if (logIds.length === 0) {
    return null
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-12 pt-8 border-t border-gray-200"
    >
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">최근 활동</h2>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200">
          <button
            onClick={() => setActiveTab('comments')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === 'comments'
                ? 'text-[#3056F5] border-b-2 border-[#3056F5]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <MessageSquare size={16} />
              댓글
            </span>
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`px-4 py-2 text-sm font-medium transition-colors relative ${
              activeTab === 'qa'
                ? 'text-[#3056F5] border-b-2 border-[#3056F5]'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <span className="flex items-center gap-2">
              <HelpCircle size={16} />
              Q&A
            </span>
          </button>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-3">
        {isLoading && currentItems.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : currentItems.length > 0 ? (
          <>
            {currentItems.map((item) => {
              const badge = getTypeBadge(item.type)

              return (
                <motion.button
                  key={item.id}
                  onClick={() => {
                    onOpen({
                      logId: item.logId,
                      tab: activeTab === 'comments' ? 'comments' : 'qa',
                      threadId: item.threadId
                    })
                  }}
                  className="w-full text-left p-4 rounded-xl border border-gray-200 bg-white hover:border-[#3056F5] hover:shadow-md transition-all focus:outline-none focus:ring-2 focus:ring-[#3056F5] focus:ring-offset-2"
                  aria-label="이 활동 열기"
                >
                  <div className="flex items-start gap-4">
                    {/* Left: Badge + Author + Time */}
                    <div className="flex-shrink-0 min-w-[140px]">
                      <div className="flex items-center gap-2 mb-2">
                        <span
                          className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
                        >
                          {badge.label}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <span className="font-medium text-gray-900">{item.authorName}</span>
                        <span className="mx-1">·</span>
                        <span>{formatTimeAgo(item.createdAt)}</span>
                      </div>
                    </div>

                    {/* Middle: Content + Brand/Product */}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 line-clamp-2 mb-2">{item.content}</p>
                      <div className="text-xs text-gray-500">
                        {item.brand && item.product && (
                          <span>
                            {item.brand} · {item.product}
                          </span>
                        )}
                        {item.threadTitle && (
                          <span className="ml-2 text-purple-600">→ {item.threadTitle}</span>
                        )}
                      </div>
                    </div>

                    {/* Right: Button */}
                    <div className="flex-shrink-0">
                      <ChevronRight className="h-5 w-5 text-gray-400" />
                    </div>
                  </div>
                </motion.button>
              )
            })}

            {/* Load More Button */}
            {hasMore && (
              <div className="pt-4">
                <button
                  onClick={loadMore}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-[#3056F5] focus:ring-offset-2"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      로딩 중...
                    </span>
                  ) : (
                    '더 보기'
                  )}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <p className="text-sm">활동이 없습니다.</p>
          </div>
        )}
      </div>
    </motion.section>
  )
}

