'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { getOwner, getPet, getLogsByOwnerPet } from '@/lib/supa/queries'
import { groupByCategory, sortLogs, filterByTab, getCategoryStats } from '@/lib/group'
import type { ReviewLog, Pet, Owner, Comment, Category, QAThread, QAPost, QAPostWithAuthor } from '@/lib/types/review-log'
import { mockReviewLogs, mockOwners, mockPets, mockComments, mockQAThreads, mockQAPosts } from '@/lib/mock/review-log'
import { getThreadsByLog, getPostsByThread, getBestAnswerExcerpt } from '@/lib/supa/queries'
import PetProfileHeader from '@/components/pet/PetProfileHeader'
import PetLogsTabs from '@/components/pet/PetLogsTabs'
import CategorySection from '@/components/pet/CategorySection'
import LogDetailDrawer from '@/components/pet/LogDetailDrawer'
import AuthDialog from '@/app/components/auth/AuthDialog'
import LogFormDialog from '@/components/log/LogFormDialog'
import FeedActivityPanel from '@/components/activity/FeedActivityPanel'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'

/**
 * Pet-centric history page
 * Route: /owners/[ownerId]/pets/[petId]
 */
export default function PetHistoryPage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const ownerId = params.ownerId as string
  const petId = params.petId as string
  const tabParam = searchParams.get('tab') as Category | 'all' | null

  // Validate tab parameter - only allow valid categories or 'all'
  const validCategories: Category[] = ['feed', 'snack', 'supplement', 'toilet']
  const isValidTab = tabParam === 'all' || (tabParam && validCategories.includes(tabParam as Category))
  const validatedTab = isValidTab ? (tabParam as Category | 'all') : 'all'

  // Type guard function
  const isCategory = (tab: Category | 'all'): tab is Category => {
    return tab !== 'all'
  }

  const [owner, setOwner] = useState<Owner | null>(null)
  const [pet, setPet] = useState<Pet | null>(null)
  const [logs, setLogs] = useState<ReviewLog[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [qaThreads, setQAThreads] = useState<QAThread[]>([])
  const [qaPosts, setQAPosts] = useState<QAPostWithAuthor[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedLog, setSelectedLog] = useState<ReviewLog | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false)
  const [isLogFormOpen, setIsLogFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<Category | 'all'>(validatedTab)
  const [initialTab, setInitialTab] = useState<'details' | 'comments' | 'qa'>('details')
  const [initialThreadId, setInitialThreadId] = useState<string | undefined>(undefined)
  const [editingLog, setEditingLog] = useState<any>(null)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)

      try {
        const supabase = getBrowserClient()
        if (!supabase) {
          console.warn('[PetHistoryPage] Supabase client not available, using mock data')
          loadMockData()
          setIsLoading(false)
          return
        }

        // Supabase 클라이언트의 URL 확인 (placeholder인지 체크)
        // Supabase 클라이언트는 내부적으로 supabaseUrl 속성을 가지고 있음
        const clientUrl = (supabase as any).supabaseUrl || ''
        const isPlaceholder = clientUrl === 'https://placeholder.supabase.co' || 
                             clientUrl.includes('placeholder') ||
                             !clientUrl

        if (isPlaceholder) {
          console.log('[PetHistoryPage] Placeholder Supabase client detected, using mock data')
          loadMockData()
          setIsLoading(false)
          return
        }

        // 타임아웃 설정 (5초로 단축)
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Request timeout')), 5000)
        )

        const dataPromise = Promise.all([
          getOwner(ownerId),
          getPet(petId),
          getLogsByOwnerPet(ownerId, petId)
        ])

        const [ownerData, petData, logsData] = await Promise.race([
          dataPromise,
          timeoutPromise
        ]) as [any, any, any]

        if (ownerData && petData) {
          setOwner(ownerData as unknown as Owner)
          setPet(petData as unknown as Pet)
          setLogs(logsData as unknown as ReviewLog[])
          setIsLoading(false)
        } else {
          // Fallback to mock
          console.warn('[PetHistoryPage] Supabase data not found, using mock data')
          loadMockData()
          setIsLoading(false)
        }
      } catch (error) {
        console.error('[PetHistoryPage] Error loading data:', error)
        // 에러 발생 시 mock 데이터로 fallback
        loadMockData()
        setIsLoading(false)
      }
    }

    const loadMockData = () => {
      const mockOwner = mockOwners.find((o) => o.id === ownerId)
      const mockPet = mockPets.find((p) => p.id === petId)

      if (!mockOwner || !mockPet) {
        // 404 - owner/pet mismatch
        // 데이터를 찾지 못해도 로딩 상태는 해제해야 함
        setOwner(null)
        setPet(null)
        setLogs([])
        setComments([])
        return
      }

      setOwner(mockOwner)
      setPet(mockPet)
      setLogs(mockReviewLogs.filter((l) => l.ownerId === ownerId && l.petId === petId))
      setComments(mockComments.filter((c) => {
        const log = mockReviewLogs.find((l) => l.id === c.logId)
        return log && log.ownerId === ownerId && log.petId === petId
      }))
    }

    loadData()
  }, [ownerId, petId])

  // Update URL when tab changes
  useEffect(() => {
    const url = new URL(window.location.href)
    if (activeTab === 'all') {
      url.searchParams.delete('tab')
    } else {
      url.searchParams.set('tab', activeTab)
    }
    router.replace(url.pathname + url.search, { scroll: false })
  }, [activeTab, router])

  // Utility functions
  const calculateAge = (birthDate: string): string => {
    const birth = new Date(birthDate)
    const now = new Date()
    const years = now.getFullYear() - birth.getFullYear()
    const months = now.getMonth() - birth.getMonth()
    if (months < 0) {
      return `${years - 1}세`
    }
    if (years > 0) {
      return `${years}세`
    }
    return `${months}개월`
  }

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, '')
  }

  const formatTimeAgo = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return '방금 전'
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}분 전`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}시간 전`
    if (diffInSeconds < 2592000) return `${Math.floor(diffInSeconds / 86400)}일 전`
    if (diffInSeconds < 31536000) return `${Math.floor(diffInSeconds / 2592000)}개월 전`
    return `${Math.floor(diffInSeconds / 31536000)}년 전`
  }

  // Group and filter logs
  const groupedLogs = useMemo(() => {
    const grouped = groupByCategory(logs)
    Object.keys(grouped).forEach((key) => {
      grouped[key as Category] = sortLogs(grouped[key as Category])
    })
    return grouped
  }, [logs])

  const categoryCounts = useMemo(() => {
    return {
      all: logs.length,
      feed: groupedLogs.feed.length,
      snack: groupedLogs.snack.length,
      supplement: groupedLogs.supplement.length,
      toilet: groupedLogs.toilet.length
    }
  }, [logs, groupedLogs])

  const displayedLogs = useMemo(() => {
    const filtered = filterByTab(logs, activeTab)
    return sortLogs(filtered)
  }, [logs, activeTab])

  const getPetInfo = (petId: string) => {
    if (petId === pet?.id) {
      return {
        name: pet.name,
        birthDate: pet.birthDate,
        weightKg: pet.weightKg
      }
    }
    return mockPets.find((p) => p.id === petId) || null
  }

  const getOwnerInfo = (ownerId: string) => {
    if (ownerId === owner?.id) {
      return { nickname: owner.nickname }
    }
    const found = mockOwners.find((o) => o.id === ownerId)
    return found ? { nickname: found.nickname, avatarUrl: found.avatarUrl } : null
  }

  const getBestAnswerExcerptForLog = (logId: string): string | null => {
    const thread = qaThreads.find((t) => t.logId === logId)
    if (!thread) return null
    
    const acceptedAnswer = qaPosts.find(
      (p) => p.threadId === thread.id && p.kind === 'answer' && p.isAccepted
    )
    
    if (acceptedAnswer) {
      return acceptedAnswer.content.length > 120
        ? acceptedAnswer.content.substring(0, 120) + '...'
        : acceptedAnswer.content
    }
    
    return null
  }

  const getLatestCommentExcerptForLog = (logId: string): string | null => {
    const thread = qaThreads.find((t) => t.logId === logId)
    if (!thread) return null
    
    const latestPost = qaPosts
      .filter((p) => p.threadId === thread.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())[0]
    
    if (latestPost) {
      return latestPost.content.length > 120
        ? latestPost.content.substring(0, 120) + '...'
        : latestPost.content
    }
    
    return null
  }

  const getCommentsForLog = (logId: string): Comment[] => {
    return comments.filter((c) => c.logId === logId)
  }

  const getQAThreadsForLog = (logId: string): QAThread[] => {
    return qaThreads.filter((t) => t.logId === logId)
  }

  const getQAPostsForLog = (logId: string): QAPostWithAuthor[] => {
    const threads = qaThreads.filter((t) => t.logId === logId)
    return qaPosts.filter((p) => threads.some((t) => t.id === p.threadId))
  }

  const handleLogClick = (log: ReviewLog) => {
    setSelectedLog(log)
    setIsDrawerOpen(true)
  }

  // Handle activity panel open
  const handleActivityOpen = (params: {
    logId: string
    tab: 'details' | 'comments' | 'qa'
    threadId?: string
  }) => {
    const log = logs.find((l) => l.id === params.logId)
    if (log) {
      setSelectedLog(log)
      setInitialTab(params.tab)
      setInitialThreadId(params.threadId)
      setIsDrawerOpen(true)
    }
  }

  // Get visible log IDs (for activity panel)
  const visibleLogIds = useMemo(() => {
    return logs.map((l) => l.id)
  }, [logs])

  const handleStatusChange = (logId: string, newStatus: 'feeding' | 'paused' | 'completed') => {
    setLogs((prev) =>
      prev.map((log) => {
        if (log.id === logId) {
          const updated = { ...log, status: newStatus, updatedAt: new Date().toISOString() }
          if (newStatus === 'completed' && !log.periodEnd) {
            updated.periodEnd = new Date().toISOString().split('T')[0]
            const start = new Date(log.periodStart)
            const end = new Date(updated.periodEnd)
            updated.durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
          }
          return updated
        }
        return log
      })
    )

    if (selectedLog && selectedLog.id === logId) {
      setSelectedLog({ ...selectedLog, status: newStatus })
    }
  }

  const handleCommentSubmit = (logId: string, content: string, parentId?: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      logId,
      authorId: user?.id || 'anonymous',
      content,
      createdAt: new Date().toISOString(),
      parentId,
      isBestAnswer: false,
      isHelpful: false
    }
    setComments((prev) => [...prev, newComment])

    setLogs((prev) =>
      prev.map((log) =>
        log.id === logId ? { ...log, commentsCount: log.commentsCount + 1 } : log
      )
    )
  }

  const handleQAThreadCreate = (logId: string, title: string) => {
    if (!user) return
    
    const newThread: QAThread = {
      id: `thread-${Date.now()}`,
      logId,
      title,
      authorId: user.id,
      createdAt: new Date().toISOString()
    }
    setQAThreads((prev) => [...prev, newThread])
  }

  const handleQAPostSubmit = (
    threadId: string,
    content: string,
    kind: 'question' | 'answer' | 'comment',
    parentId?: string
  ) => {
    if (!user) return
    
    const newPost: QAPostWithAuthor = {
      id: `post-${Date.now()}`,
      threadId,
      authorId: user.id,
      kind,
      content,
      parentId,
      isAccepted: false,
      upvotes: 0,
      createdAt: new Date().toISOString(),
      author: {
        id: user.id,
        nickname: user.email?.split('@')[0] || '사용자',
        avatarUrl: undefined
      }
    }
    setQAPosts((prev) => [...prev, newPost])
  }

  const handleAcceptAnswer = (postId: string) => {
    setQAPosts((prev) =>
      prev.map((p) => ({
        ...p,
        isAccepted: p.id === postId ? true : p.isAccepted
      }))
    )
  }

  const handleUpvote = (postId: string) => {
    setQAPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p
      )
    )
  }

  // 수정 핸들러
  const handleEditLog = (log: ReviewLog) => {
    // ReviewLog (camelCase) 타입을 Database ReviewLog (snake_case) 타입으로 변환
    const convertedLog = {
      id: log.id,
      pet_id: log.petId,
      owner_id: log.ownerId,
      category: log.category,
      brand: log.brand,
      product: log.product,
      product_id: '', // Not available in ReviewLog type
      status: log.status,
      period_start: log.periodStart,
      period_end: log.periodEnd || null,
      duration_days: log.durationDays || null,
      rating: log.rating || null,
      recommend: log.recommend ?? null,
      continue_reasons: log.continueReasons || null,
      stop_reasons: log.stopReasons || null,
      excerpt: log.excerpt,
      notes: log.notes || null,
      likes: log.likes,
      comments_count: log.commentsCount,
      views: log.views,
      admin_status: 'visible' as const, // Default value
      stool_score: log.stool_score || null,
      allergy_symptoms: log.allergy_symptoms || null,
      vomiting: log.vomiting || null,
      appetite_change: log.appetite_change || null,
      safi_score: null, // Not available in ReviewLog type
      safi_level: null, // Not available in ReviewLog type
      safi_detail: null, // Not available in ReviewLog type
      created_at: log.createdAt,
      updated_at: log.updatedAt
    }
    
    setEditingLog(convertedLog as any)
    setIsDrawerOpen(false)
    setIsLogFormOpen(true)
  }

  // 삭제 핸들러
  const handleDeleteLog = async (logId: string) => {
    if (!confirm('정말로 이 후기를 삭제하시겠습니까?\n삭제된 후기는 복구할 수 없습니다.')) {
      return
    }

    try {
      const response = await fetch(`/api/review-logs/${logId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete log')
      }

      // 목록에서 제거
      setLogs(prev => prev.filter(l => l.id !== logId))
      setIsDrawerOpen(false)
      alert('후기가 삭제되었습니다.')
    } catch (error) {
      console.error('Failed to delete log:', error)
      alert('삭제에 실패했습니다. 다시 시도해주세요.')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#3056F5] mx-auto mb-4"></div>
          <p className="text-gray-600">로딩 중...</p>
        </div>
      </div>
    )
  }

  if (!owner || !pet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg font-medium text-gray-900 mb-2">페이지를 찾을 수 없습니다</p>
          <p className="text-sm text-gray-600">반려동물 정보가 존재하지 않습니다.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Add Button */}
        <PetProfileHeader
          pet={pet}
          owner={owner}
          logs={logs}
          calculateAge={calculateAge}
          onAddLog={() => setIsLogFormOpen(true)}
        />

        {/* Tabs */}
        <PetLogsTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          categoryCounts={categoryCounts}
        />

        {/* Category Sections */}
        {activeTab === 'all' ? (
          <>
            {groupedLogs.feed.length > 0 && (
              <CategorySection
                category="feed"
                logs={groupedLogs.feed}
                onLogClick={handleLogClick}
                getPetInfo={getPetInfo}
                getOwnerInfo={getOwnerInfo}
                getBestAnswerExcerpt={getBestAnswerExcerptForLog}
                getLatestCommentExcerpt={getLatestCommentExcerptForLog}
                getCommentsForLog={getCommentsForLog}
                getQAThreadsForLog={getQAThreadsForLog}
                getQAPostsForLog={getQAPostsForLog}
                formatTimeAgo={formatTimeAgo}
              />
            )}
            {groupedLogs.snack.length > 0 && (
              <CategorySection
                category="snack"
                logs={groupedLogs.snack}
                onLogClick={handleLogClick}
                getPetInfo={getPetInfo}
                getOwnerInfo={getOwnerInfo}
                getBestAnswerExcerpt={getBestAnswerExcerptForLog}
                getLatestCommentExcerpt={getLatestCommentExcerptForLog}
                getCommentsForLog={getCommentsForLog}
                getQAThreadsForLog={getQAThreadsForLog}
                getQAPostsForLog={getQAPostsForLog}
                formatTimeAgo={formatTimeAgo}
              />
            )}
            {groupedLogs.supplement.length > 0 && (
              <CategorySection
                category="supplement"
                logs={groupedLogs.supplement}
                onLogClick={handleLogClick}
                getPetInfo={getPetInfo}
                getOwnerInfo={getOwnerInfo}
                getBestAnswerExcerpt={getBestAnswerExcerptForLog}
                getLatestCommentExcerpt={getLatestCommentExcerptForLog}
                getCommentsForLog={getCommentsForLog}
                getQAThreadsForLog={getQAThreadsForLog}
                getQAPostsForLog={getQAPostsForLog}
                formatTimeAgo={formatTimeAgo}
              />
            )}
            {groupedLogs.toilet.length > 0 && (
              <CategorySection
                category="toilet"
                logs={groupedLogs.toilet}
                onLogClick={handleLogClick}
                getPetInfo={getPetInfo}
                getOwnerInfo={getOwnerInfo}
                getBestAnswerExcerpt={getBestAnswerExcerptForLog}
                getLatestCommentExcerpt={getLatestCommentExcerptForLog}
                getCommentsForLog={getCommentsForLog}
                getQAThreadsForLog={getQAThreadsForLog}
                getQAPostsForLog={getQAPostsForLog}
                formatTimeAgo={formatTimeAgo}
              />
            )}
          </>
        ) : (
          isCategory(activeTab) && groupedLogs[activeTab] && groupedLogs[activeTab].length > 0 && (
            <CategorySection
              category={activeTab}
              logs={groupedLogs[activeTab]}
              onLogClick={handleLogClick}
              getPetInfo={getPetInfo}
              getOwnerInfo={getOwnerInfo}
              getBestAnswerExcerpt={getBestAnswerExcerptForLog}
              getLatestCommentExcerpt={getLatestCommentExcerptForLog}
              getCommentsForLog={getCommentsForLog}
              getQAThreadsForLog={getQAThreadsForLog}
              getQAPostsForLog={getQAPostsForLog}
              formatTimeAgo={formatTimeAgo}
            />
          )
        )}

        {displayedLogs.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-20 bg-white rounded-3xl shadow-soft border border-gray-100"
          >
            <p className="text-lg font-medium text-gray-900 mb-2">기록이 없습니다</p>
            <p className="text-sm text-gray-600">첫 번째 급여 기록을 작성해보세요!</p>
          </motion.div>
        )}

        {/* Activity Panel */}
        {visibleLogIds.length > 0 && (
          <FeedActivityPanel
            logIds={visibleLogIds}
            onOpen={handleActivityOpen}
            formatTimeAgo={formatTimeAgo}
          />
        )}
      </main>

      {/* Log Detail Drawer */}
      <LogDetailDrawer
        log={selectedLog}
        pet={pet}
        owner={owner}
        isOpen={isDrawerOpen}
        onClose={() => {
          setIsDrawerOpen(false)
          setSelectedLog(null)
          setInitialTab('details')
          setInitialThreadId(undefined)
        }}
        onStatusChange={handleStatusChange}
        onEdit={handleEditLog}
        onDelete={handleDeleteLog}
        formatTimeAgo={formatTimeAgo}
        formatDate={formatDate}
        calculateAge={calculateAge}
        comments={comments}
        onCommentSubmit={handleCommentSubmit}
        onAuthRequired={() => setIsAuthDialogOpen(true)}
        qaThreads={qaThreads}
        qaPosts={qaPosts}
        onQAThreadCreate={handleQAThreadCreate}
        onQAPostSubmit={handleQAPostSubmit}
        onAcceptAnswer={handleAcceptAnswer}
        onUpvote={handleUpvote}
        getAuthorInfo={getOwnerInfo}
        initialTab={initialTab}
        initialThreadId={initialThreadId}
      />

      {/* Auth Dialog */}
      <AuthDialog
        isOpen={isAuthDialogOpen}
        onClose={() => setIsAuthDialogOpen(false)}
      />

      {/* Log Form Dialog */}
      <LogFormDialog
        open={isLogFormOpen}
        onOpenChange={(open) => {
          setIsLogFormOpen(open)
          if (!open) {
            setEditingLog(null)
          }
        }}
        title={editingLog ? `${pet?.name} 로그 수정` : pet ? `${pet.name} 새 로그 작성` : '새 로그 작성'}
        defaultValues={pet ? { petId: pet.id } : undefined}
        editData={editingLog}
        onSuccess={() => {
          // Refetch logs for this pet
          const supabase = getBrowserClient()
          const hasSupabase = !!process.env.NEXT_PUBLIC_SUPABASE_URL

          if (hasSupabase && supabase) {
            getLogsByOwnerPet(ownerId, petId).then((logsData) => {
              setLogs(logsData as unknown as ReviewLog[])
            }).catch((error) => {
              console.error('[PetHistoryPage] Error refetching logs:', error)
            })
          } else {
            // Reload mock data
            setLogs(mockReviewLogs.filter((l) => l.ownerId === ownerId && l.petId === petId))
          }
          setEditingLog(null)
        }}
      />
    </div>
  )
}

