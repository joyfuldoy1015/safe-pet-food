'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, User, TrendingUp, Plus } from 'lucide-react'
import { ReviewLog, Owner, Pet, Comment } from '@/lib/types/review-log'
import { mockReviewLogs, mockOwners, mockPets, mockComments } from '@/lib/mock/review-log'
import CommunityReviewCard from '@/app/components/pet-log/CommunityReviewCard'
import FeedFilters from '@/app/components/pet-log/FeedFilters'
import LogDrawer from '@/app/components/pet-log/LogDrawer'
import LogFormDialog from '@/components/log/LogFormDialog'
import FeedingLeaderboard from '@/components/rank/FeedingLeaderboard'
import { useAuth } from '@/hooks/useAuth'

type SortOption = 'popular' | 'recent' | 'completed'

const ITEMS_PER_PAGE = 6

export default function PetLogPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [reviews, setReviews] = useState<ReviewLog[]>(mockReviewLogs)
  const [comments, setComments] = useState<Comment[]>(mockComments)
  const [selectedReview, setSelectedReview] = useState<ReviewLog | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE)
  const [isLogFormOpen, setIsLogFormOpen] = useState(false)

  // Filters
  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'dog' | 'cat'>('all')
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'feed' | 'snack' | 'supplement' | 'toilet'>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'feeding' | 'paused' | 'completed'>('all')
  const [selectedRating, setSelectedRating] = useState<number>(0)
  const [selectedRecommend, setSelectedRecommend] = useState<'all' | 'recommended' | 'not-recommended'>('all')
  const [sortOption, setSortOption] = useState<SortOption>('popular')

  // Format helpers
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

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).replace(/\./g, '.').replace(/\s/g, '')
  }

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

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = reviews.filter((review) => {
      const pet = mockPets.find((p) => p.id === review.petId)
      if (!pet) return false

      const matchesSpecies = selectedSpecies === 'all' || pet.species === selectedSpecies
      const matchesCategory = selectedCategory === 'all' || review.category === selectedCategory
      const matchesStatus = selectedStatus === 'all' || review.status === selectedStatus
      const matchesRating = selectedRating === 0 || (review.rating && review.rating >= selectedRating)
      const matchesRecommend =
        selectedRecommend === 'all' ||
        (selectedRecommend === 'recommended' && review.recommend === true) ||
        (selectedRecommend === 'not-recommended' && review.recommend === false)

      return matchesSpecies && matchesCategory && matchesStatus && matchesRating && matchesRecommend
    })

    // Sort
    switch (sortOption) {
      case 'popular':
        filtered.sort((a, b) => b.likes - a.likes)
        break
      case 'recent':
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
      case 'completed':
        filtered = filtered.filter((r) => r.status === 'completed')
        filtered.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        )
        break
    }

    return filtered
  }, [reviews, selectedSpecies, selectedCategory, selectedStatus, selectedRating, selectedRecommend, sortOption])

  // Displayed reviews (paginated)
  const displayedReviews = useMemo(() => {
    return filteredAndSortedReviews.slice(0, displayedCount)
  }, [filteredAndSortedReviews, displayedCount])

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE)
  }, [selectedSpecies, selectedCategory, selectedStatus, selectedRating, selectedRecommend, sortOption])

  const handleLoadMore = () => {
    setDisplayedCount((prev) => Math.min(prev + ITEMS_PER_PAGE, filteredAndSortedReviews.length))
  }

  const hasMore = displayedCount < filteredAndSortedReviews.length

  // Get owner and pet for review (with caching)
  const ownerPetCache = useMemo(() => {
    const cache = new Map<string, { owner: Owner | null; pet: Pet | null }>()
    reviews.forEach((review) => {
      const key = `${review.ownerId}-${review.petId}`
      if (!cache.has(key)) {
        const owner = mockOwners.find((o) => o.id === review.ownerId) || null
        const pet = mockPets.find((p) => p.id === review.petId) || null
        cache.set(key, { owner, pet })
      }
    })
    return cache
  }, [reviews])

  const getOwnerAndPet = (review: ReviewLog): { owner: Owner | null; pet: Pet | null } => {
    const key = `${review.ownerId}-${review.petId}`
    if (ownerPetCache.has(key)) {
      return ownerPetCache.get(key)!
    }
    const owner = mockOwners.find((o) => o.id === review.ownerId) || null
    const pet = mockPets.find((p) => p.id === review.petId) || null
    return { owner, pet }
  }

  // Sidebar data
  const activeOwners = useMemo(() => {
    const ownerActivity: Record<string, number> = {}
    reviews.forEach((review) => {
      ownerActivity[review.ownerId] = (ownerActivity[review.ownerId] || 0) + 1
    })
    return Object.entries(ownerActivity)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([ownerId]) => mockOwners.find((o) => o.id === ownerId))
      .filter((o): o is Owner => o !== undefined)
  }, [reviews])

  const longestFeeding = useMemo(() => {
    return reviews
      .filter((r) => r.status === 'feeding')
      .sort((a, b) => (b.durationDays || 0) - (a.durationDays || 0))[0]
  }, [reviews])

  const recentStopReasons = useMemo(() => {
    return reviews
      .filter((r) => r.status === 'paused' && r.stopReasons && r.stopReasons.length > 0)
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 3)
      .flatMap((r) => r.stopReasons || [])
      .slice(0, 5)
  }, [reviews])

  // Handle review detail - navigate to pet history page
  const handleViewDetail = (reviewId: string) => {
    const review = reviews.find((r) => r.id === reviewId)
    if (review) {
      // Navigate to pet-centric history page
      router.push(`/owners/${review.ownerId}/pets/${review.petId}`)
    }
  }


  // Handle question click - navigate to detail page with Q&A tab
  const handleQuestionClick = (reviewId: string) => {
    const review = reviews.find((r) => r.id === reviewId)
    if (review) {
      // Navigate to pet history page with Q&A focus
      router.push(`/owners/${review.ownerId}/pets/${review.petId}?tab=qa`)
    }
  }

  // Handle status change
  const handleStatusChange = (reviewId: string, newStatus: 'feeding' | 'paused' | 'completed') => {
    setReviews((prev) =>
      prev.map((review) => {
        if (review.id === reviewId) {
          const updated = {
            ...review,
            status: newStatus,
            periodEnd:
              newStatus === 'completed'
                ? new Date().toISOString().split('T')[0]
                : review.periodEnd,
            updatedAt: new Date().toISOString()
          }
          return updated
        }
        return review
      })
    )

    if (selectedReview && selectedReview.id === reviewId) {
      setSelectedReview({
        ...selectedReview,
        status: newStatus,
        periodEnd:
          newStatus === 'completed'
            ? new Date().toISOString().split('T')[0]
            : selectedReview.periodEnd,
        updatedAt: new Date().toISOString()
      })
    }
  }

  // Handle comment submit
  const handleCommentSubmit = (logId: string, content: string, parentId?: string) => {
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      logId,
      authorId: 'current-user',
      content,
      createdAt: new Date().toISOString(),
      parentId
    }

    setComments([...comments, newComment])

    // Update review comment count
    setReviews((prev) =>
      prev.map((review) =>
        review.id === logId
          ? { ...review, commentsCount: review.commentsCount + 1 }
          : review
      )
    )
  }

  const selectedOwner = selectedReview
    ? mockOwners.find((o) => o.id === selectedReview.ownerId) || null
    : null
  const selectedPet = selectedReview
    ? mockPets.find((p) => p.id === selectedReview.petId) || null
    : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            급여 후기 커뮤니티 🐾
            </h1>
          <p className="text-sm sm:text-base lg:text-lg text-gray-600 px-4">
            다른 반려집사들의 급여 경험을 둘러보고 나만의 후기도 남겨보세요
          </p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6"
        >
          <FeedFilters
            selectedSpecies={selectedSpecies}
            selectedCategory={selectedCategory}
            selectedStatus={selectedStatus}
            selectedRating={selectedRating}
            selectedRecommend={selectedRecommend}
            onSpeciesChange={setSelectedSpecies}
            onCategoryChange={setSelectedCategory}
            onStatusChange={setSelectedStatus}
            onRatingChange={setSelectedRating}
            onRecommendChange={setSelectedRecommend}
          />
        </motion.div>

        {/* Feeding Leaderboard */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6"
        >
          <FeedingLeaderboard
            initialSpecies={selectedSpecies}
            initialCategory={selectedCategory}
          />
        </motion.div>

        {/* Sort Tabs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="sticky top-0 z-30 -mx-4 sm:mx-0 px-4 sm:px-0 py-4 sm:py-4 mb-6"
        >
          <div className="flex items-center gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSortOption('popular')}
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-colors flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                        sortOption === 'popular'
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      aria-label="인기순 정렬"
                    >
                      <span className="font-medium">🔥 인기</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSortOption('recent')}
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-colors flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                        sortOption === 'recent'
                          ? 'bg-blue-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      aria-label="최신순 정렬"
                    >
                      <span className="font-medium">🕓 최신</span>
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setSortOption('completed')}
                      className={`px-3 sm:px-4 py-2 sm:py-3 rounded-xl transition-colors flex items-center space-x-1 sm:space-x-2 text-sm sm:text-base ${
                        sortOption === 'completed'
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                      aria-label="급여 완료순 정렬"
                    >
                      <span className="font-medium">✅ 급여 완료</span>
                    </motion.button>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Reviews Feed */}
          <div className="lg:col-span-2">
            {displayedReviews.length > 0 ? (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {displayedReviews.map((review, index) => {
                  const { owner, pet } = getOwnerAndPet(review)
                  if (!owner || !pet) return null

                  return (
                    <motion.div
                      key={review.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <CommunityReviewCard
                        title={`${review.brand} · ${review.product}`}
                        rating={review.rating}
                        recommend={review.recommend}
                        status={review.status}
                        periodLabel={
                          review.status === 'feeding'
                            ? `since ${formatDate(review.periodStart)}`
                            : review.periodEnd
                            ? `${formatDate(review.periodStart)} ~ ${formatDate(review.periodEnd)} (총 ${review.durationDays}일)`
                            : formatDate(review.periodStart)
                        }
                        owner={{
                          nickname: owner.nickname,
                          pet: pet.name,
                          meta: `${calculateAge(pet.birthDate)} · ${pet.weightKg}kg`
                        }}
                        continueReasons={review.continueReasons}
                        stopReasons={review.stopReasons}
                        excerpt={review.excerpt}
                        metrics={{
                          likes: review.likes,
                          comments: review.commentsCount,
                          views: review.views
                        }}
                        onOpenDetail={() => handleViewDetail(review.id)}
                        onAsk={() => handleQuestionClick(review.id)}
                      />
                    </motion.div>
                  )
                })}
                </div>

                {/* Load More Button or Completion Message */}
                {hasMore ? (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-8 flex justify-center"
                  >
                    <button
                      onClick={handleLoadMore}
                      className="px-6 py-3 bg-white border-2 border-[#3056F5] text-[#3056F5] rounded-xl font-medium hover:bg-[#3056F5] hover:text-white transition-all duration-200 active:scale-[0.98] shadow-sm hover:shadow-md"
                      aria-label="더 많은 후기 보기"
                    >
                      더 보기
                    </button>
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-8 flex justify-center"
                  >
                    <p className="text-sm text-gray-500">
                      모든 후기를 불러왔습니다.
                    </p>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-3xl shadow-soft border border-gray-100"
              >
                <p className="text-lg font-medium text-gray-900 mb-2">
                  후기가 없습니다
                </p>
                <p className="text-sm text-gray-600">
                  필터를 조정해보세요
                </p>
              </motion.div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-4 sm:space-y-6 hidden lg:block">
            {/* 최근 활발한 집사 */}
            {activeOwners.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-500" />
                  <h3 className="font-bold text-gray-900">최근 활발한 집사</h3>
            </div>
                <div className="space-y-2">
                  {activeOwners.map((owner, index) => (
                    <div
                      key={owner.id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-sm">
                        {owner.avatarUrl || '👤'}
                            </div>
                      <div className="flex-1">
                        <div className="text-sm font-semibold text-gray-900">
                          {owner.nickname}
                        </div>
                        <div className="text-xs text-gray-500">
                          {reviews.filter((r) => r.ownerId === owner.id).length}개 후기
                        </div>
                        </div>
                    </div>
                  ))}
                  </div>
              </motion.div>
            )}

            {/* 가장 오래 급여 중인 제품 */}
            {longestFeeding && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <h3 className="font-bold text-gray-900">가장 오래 급여 중인 제품</h3>
            </div>
                <div className="p-3 bg-orange-50 rounded-xl">
                  <div className="font-semibold text-gray-900 text-sm mb-1">
                    {longestFeeding.brand} · {longestFeeding.product}
            </div>
                  <div className="text-xs text-gray-600">
                    {longestFeeding.durationDays}일째 급여 중
        </div>
              </div>
              </motion.div>
            )}

            {/* 최근 중지 사유 */}
            {recentStopReasons.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-red-500" />
                  <h3 className="font-bold text-gray-900">최근 중지 사유</h3>
                </div>
                <div className="space-y-2">
                  {recentStopReasons.map((reason, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 bg-red-50 text-red-700 rounded-lg text-xs font-medium"
                    >
                      {reason}
              </div>
                  ))}
            </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Log Drawer */}
        <LogDrawer
          review={selectedReview}
          pet={selectedPet}
          owner={selectedOwner}
          isOpen={isDrawerOpen}
          onClose={() => {
            setIsDrawerOpen(false)
            setSelectedReview(null)
          }}
          onStatusChange={handleStatusChange}
          formatTimeAgo={formatTimeAgo}
          formatDate={formatDate}
          comments={comments}
          onCommentSubmit={handleCommentSubmit}
        />

        {/* FAB Button */}
        <button
          onClick={() => setIsLogFormOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 bg-blue-500 text-white rounded-full shadow-strong hover:bg-blue-600 transition-all duration-200 hover:scale-110 flex items-center justify-center z-40"
          aria-label="새 로그 작성"
        >
          <Plus className="h-6 w-6" />
        </button>

        {/* Log Form Dialog */}
        <LogFormDialog
          open={isLogFormOpen}
          onOpenChange={setIsLogFormOpen}
          title="새 로그 작성"
          onSuccess={() => {
            // Refetch reviews (in a real app, this would invalidate queries)
            // For now, we'll just close the dialog
            setIsLogFormOpen(false)
          }}
        />
      </main>
    </div>
  )
}
