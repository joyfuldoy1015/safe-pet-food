/*
 * Analysis of TARGET_URL (http://localhost:3000/):
 * 
 * Colors:
 * - Primary: #3056F5 (blue), orange-500 to pink-500 (gradient)
 * - Background: yellow-50, white, gray-50
 * - Text: gray-900 (headings), gray-600/700 (body)
 * 
 * Radius:
 * - Cards: rounded-2xl, rounded-3xl
 * - Buttons: rounded-xl
 * 
 * Shadows:
 * - Soft: shadow-[0_8px_30px_rgba(0,0,0,0.05)]
 * - Medium: shadow-xl
 * 
 * Reusable patterns:
 * - Card hover: hover:shadow-2xl hover:-translate-y-2
 * - Gradient buttons: bg-gradient-to-r from-X to-Y
 * 
 * Mapping to explore page:
 * - Reuse existing card components (QuestionCard, CommunityReviewCard)
 * - Add filters and sorting options
 * - Grid layout: 1-col mobile, 2-col tablet, 3-col desktop
 */

'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Filter, Search } from 'lucide-react'
import QuestionCard, { Question } from '@/app/components/qa-forum/QuestionCard'
import PetLogCard from '@/components/petlogs/PetLogCard'
import FeedFilters from '@/app/components/pet-log/FeedFilters'
import { mockReviewLogs, mockOwners, mockPets } from '@/lib/mock/review-log'
import questionsData from '@/data/questions.json'

type SortOption = 'popular' | 'recent' | 'recommended'
type ContentType = 'all' | 'qa' | 'reviews'
type ProductCategory = 'all' | 'feed' | 'snack' | 'supplement' | 'toilet'

const ITEMS_PER_PAGE = 12

export default function ExplorePage() {
  const [contentType, setContentType] = useState<ContentType>('all')
  const [sortOption, setSortOption] = useState<SortOption>('popular')
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE)
  
  // Review filters
  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'dog' | 'cat'>('all')
  const [selectedCategory, setSelectedCategory] = useState<ProductCategory>('all')
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'feeding' | 'paused' | 'completed'>('all')
  const [selectedRating, setSelectedRating] = useState<number>(0)
  const [selectedRecommend, setSelectedRecommend] = useState<'all' | 'recommended' | 'not-recommended'>('all')

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

  // Format date for PetLogCard (YYYY.MM.DD.)
  const formatDateForCard = (dateString: string): string => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}.${month}.${day}.`
  }

  // Extract numeric age from calculateAge result
  const extractAgeNumber = (ageString: string): number => {
    const yearMatch = ageString.match(/(\d+)세/)
    if (yearMatch) {
      return parseInt(yearMatch[1], 10)
    }
    const monthMatch = ageString.match(/(\d+)개월/)
    if (monthMatch) {
      const months = parseInt(monthMatch[1], 10)
      return Math.max(1, Math.floor(months / 12))
    }
    return 0
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

  // Filter and sort questions
  const filteredQuestions = useMemo(() => {
    let questions = (questionsData as Question[]).map((q) => ({
      ...q,
      isUpvoted: false
    }))

    // Sort
    switch (sortOption) {
      case 'popular':
        questions.sort((a, b) => {
          const scoreA = a.votes * 2 + a.answerCount + (a.views || 0) / 10
          const scoreB = b.votes * 2 + b.answerCount + (b.views || 0) / 10
          return scoreB - scoreA
        })
        break
      case 'recent':
        questions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'recommended':
        // For Q&A, "recommended" means answered
        questions = questions.filter((q) => q.status === 'answered')
        questions.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime())
        break
    }

    return questions
  }, [sortOption])

  // Filter and sort reviews
  const filteredReviews = useMemo(() => {
    let reviews = mockReviewLogs.filter((review) => {
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
        reviews.sort((a, b) => b.likes - a.likes)
        break
      case 'recent':
        reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case 'recommended':
        reviews = reviews.filter((r) => r.recommend === true)
        reviews.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
    }

    return reviews
  }, [selectedSpecies, selectedCategory, selectedStatus, selectedRating, selectedRecommend, sortOption])

  // Combined items
  const allItems = useMemo(() => {
    const items: Array<{ type: 'qa' | 'review'; data: Question | typeof mockReviewLogs[0] }> = []
    
    if (contentType === 'all' || contentType === 'qa') {
      filteredQuestions.forEach((q) => items.push({ type: 'qa', data: q }))
    }
    
    if (contentType === 'all' || contentType === 'reviews') {
      filteredReviews.forEach((r) => items.push({ type: 'review', data: r }))
    }

    // Sort combined items
    if (contentType === 'all') {
      items.sort((a, b) => {
        const aDate = a.type === 'qa' ? new Date(a.data.createdAt).getTime() : new Date(a.data.createdAt).getTime()
        const bDate = b.type === 'qa' ? new Date(b.data.createdAt).getTime() : new Date(b.data.createdAt).getTime()
        return bDate - aDate
      })
    }

    return items
  }, [contentType, filteredQuestions, filteredReviews])

  // Displayed items
  const displayedItems = useMemo(() => {
    return allItems.slice(0, displayedCount)
  }, [allItems, displayedCount])

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE)
  }, [contentType, sortOption, selectedSpecies, selectedCategory, selectedStatus, selectedRating, selectedRecommend])

  const handleLoadMore = () => {
    setDisplayedCount((prev) => Math.min(prev + ITEMS_PER_PAGE, allItems.length))
  }

  const hasMore = displayedCount < allItems.length

  const getOwnerAndPet = (review: typeof mockReviewLogs[0]) => {
    const owner = mockOwners.find((o) => o.id === review.ownerId) || null
    const pet = mockPets.find((p) => p.id === review.petId) || null
    return { owner, pet }
  }

  const handleViewDetail = (reviewId: string) => {
    const review = mockReviewLogs.find((r) => r.id === reviewId)
    if (review) {
      window.location.href = `/owners/${review.ownerId}/pets/${review.petId}`
    }
  }

  const handleQuestionClick = (reviewId: string) => {
    // Navigate to detail page with Q&A focus
    const review = mockReviewLogs.find((r) => r.id === reviewId)
    if (review) {
      window.location.href = `/owners/${review.ownerId}/pets/${review.petId}?tab=qa`
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">탐색하기</h1>
          <p className="text-lg text-gray-600">
            Q&A와 급여 후기를 둘러보고 경험을 공유해보세요
          </p>
        </div>

        {/* Content Type Tabs */}
        <div className="mb-6">
          <div className="flex items-center gap-2 border-b border-gray-200">
            <button
              onClick={() => setContentType('all')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                contentType === 'all'
                  ? 'text-[#3056F5] border-b-2 border-[#3056F5]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              전체
            </button>
            <button
              onClick={() => setContentType('qa')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                contentType === 'qa'
                  ? 'text-[#3056F5] border-b-2 border-[#3056F5]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Q&A
            </button>
            <button
              onClick={() => setContentType('reviews')}
              className={`px-4 py-2 text-sm font-medium transition-colors relative ${
                contentType === 'reviews'
                  ? 'text-[#3056F5] border-b-2 border-[#3056F5]'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              급여 후기
            </button>
          </div>
        </div>

        {/* Filters and Sort */}
        <div className="mb-6 space-y-4">
          {/* Sort Options */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-gray-700">정렬:</span>
            <button
              onClick={() => setSortOption('popular')}
              className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                sortOption === 'popular'
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              인기순
            </button>
            <button
              onClick={() => setSortOption('recent')}
              className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                sortOption === 'recent'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              최신순
            </button>
            <button
              onClick={() => setSortOption('recommended')}
              className={`px-4 py-3 sm:py-2 rounded-lg text-sm font-medium transition-colors ${
                sortOption === 'recommended'
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              추천순
            </button>
          </div>

          {/* Review Filters (only show when reviews are visible) */}
          {(contentType === 'all' || contentType === 'reviews') && (
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
          )}
        </div>

        {/* Content Grid */}
        {displayedItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedItems.map((item, index) => {
                if (item.type === 'qa') {
                  const question = item.data as Question
                  return (
                    <motion.div
                      key={`qa-${question.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <QuestionCard
                        question={question}
                        onUpvote={() => {}}
                        formatTimeAgo={formatTimeAgo}
                      />
                    </motion.div>
                  )
                } else {
                  const review = item.data as typeof mockReviewLogs[0]
                  const { owner, pet } = getOwnerAndPet(review)
                  if (!owner || !pet) return null

                  // Map status to PetLogCard format
                  const statusMap: Record<string, 'in_progress' | 'stopped' | 'completed'> = {
                    'feeding': 'in_progress',
                    'paused': 'stopped',
                    'completed': 'completed'
                  }

                  const petAge = calculateAge(pet.birthDate)
                  const petAgeNumber = extractAgeNumber(petAge)

                  return (
                    <motion.div
                      key={`review-${review.id}`}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <PetLogCard
                        since={formatDateForCard(review.periodStart)}
                        until={
                          (review.status === 'completed' || review.status === 'paused') && review.periodEnd
                            ? formatDateForCard(review.periodEnd)
                            : undefined
                        }
                        status={statusMap[review.status] || 'in_progress'}
                        brand={review.brand}
                        product={review.product}
                        rating={review.rating || 0}
                        recommended={review.recommend}
                        authorName={owner.nickname}
                        petName={pet.name}
                        petAgeYears={petAgeNumber}
                        petWeightKg={pet.weightKg || 0}
                        review={review.excerpt || ''}
                        likes={review.likes}
                        comments={review.commentsCount}
                        views={review.views}
                        onDetail={() => handleViewDetail(review.id)}
                        avatarUrl={owner.avatarUrl}
                      />
                    </motion.div>
                  )
                }
              })}
            </div>

            {/* Load More */}
            {hasMore ? (
              <div className="mt-8 flex justify-center">
                <button
                  onClick={handleLoadMore}
                  className="px-6 py-3 bg-white border-2 border-[#3056F5] text-[#3056F5] rounded-xl font-medium hover:bg-[#3056F5] hover:text-white transition-all duration-200"
                >
                  더 보기
                </button>
              </div>
            ) : (
              <div className="mt-8 text-center text-sm text-gray-500">
                모든 콘텐츠를 불러왔습니다.
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-soft border border-gray-100">
            <p className="text-lg font-medium text-gray-900 mb-2">콘텐츠가 없습니다</p>
            <p className="text-sm text-gray-600">필터를 조정해보세요</p>
          </div>
        )}
      </main>
    </div>
  )
}

