'use client'

import React, { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, User, TrendingUp, Plus } from 'lucide-react'
import { ReviewLog, Owner, Pet, Comment } from '@/lib/types/review-log'
import { mockReviewLogs, mockOwners, mockPets, mockComments } from '@/lib/mock/review-log'
import PetLogCard from '@/components/petlogs/PetLogCard'
import FeedFilters from '@/app/components/pet-log/FeedFilters'
import LogDrawer from '@/app/components/pet-log/LogDrawer'
import LogFormDialog from '@/components/log/LogFormDialog'
import FeedingLeaderboard from '@/components/rank/FeedingLeaderboard'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'

type SortOption = 'recent' | 'popular' | 'rating'

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
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [pets, setPets] = useState<Pet[]>(mockPets)
  const [owners, setOwners] = useState<Owner[]>(mockOwners)

  // Fetch reviews from Supabase (review_logs and pet_log_posts)
  useEffect(() => {
    const fetchReviews = async () => {
      setIsLoadingReviews(true)
      try {
        const supabase = getBrowserClient()
        const isSupabaseConfigured = !!process.env.NEXT_PUBLIC_SUPABASE_URL && 
          !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
          !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')

        if (!isSupabaseConfigured || !supabase) {
          console.log('[PetLogPage] Supabase not configured, using mock data')
          setIsLoadingReviews(false)
          return
        }

        const allReviews: ReviewLog[] = []

        // 1. Fetch from review_logs table
        try {
          const { data: reviewLogs, error: reviewLogsError } = await supabase
            .from('review_logs')
            .select(`
              *,
              profiles!owner_id(nickname, avatar_url),
              pets!pet_id(id, name, species, birth_date, weight_kg)
            `)
            .order('created_at', { ascending: false })
            .limit(100)

          if (!reviewLogsError && reviewLogs) {
            const transformedReviewLogs: ReviewLog[] = reviewLogs.map((log: any) => ({
              id: log.id,
              petId: log.pet_id || '',
              ownerId: log.owner_id || '',
              category: log.category || 'feed',
              brand: log.brand || '',
              product: log.product || '',
              status: log.status || 'feeding',
              periodStart: log.period_start || log.created_at,
              periodEnd: log.period_end || undefined,
              durationDays: log.duration_days || undefined,
              rating: log.rating || undefined,
              recommend: log.recommend || undefined,
              continueReasons: log.continue_reasons || undefined,
              stopReasons: log.stop_reasons || undefined,
              excerpt: log.excerpt || '',
              notes: log.notes || undefined,
              likes: log.likes || 0,
              commentsCount: log.comments_count || 0,
              views: log.views || 0,
              createdAt: log.created_at || new Date().toISOString(),
              updatedAt: log.updated_at || log.created_at || new Date().toISOString(),
              stool_score: log.stool_score || undefined,
              allergy_symptoms: log.allergy_symptoms || undefined,
              vomiting: log.vomiting || undefined,
              appetite_change: log.appetite_change || undefined
            }))
            allReviews.push(...transformedReviewLogs)
            
            // Extract unique pets and owners from reviewLogs
            const uniquePets: Pet[] = []
            const uniqueOwners: Owner[] = []
            reviewLogs.forEach((log: any) => {
              if (log.pets && !uniquePets.find(p => p.id === log.pets.id)) {
                uniquePets.push({
                  id: log.pets.id,
                  name: log.pets.name,
                  species: log.pets.species,
                  birthDate: log.pets.birth_date,
                  weightKg: log.pets.weight_kg,
                  tags: log.pets.tags || []
                })
              }
              if (log.profiles && !uniqueOwners.find(o => o.id === log.owner_id)) {
                uniqueOwners.push({
                  id: log.owner_id,
                  nickname: log.profiles.nickname,
                  avatarUrl: log.profiles.avatar_url || undefined,
                  pets: [] // Will be populated later if needed
                })
              }
            })
            if (uniquePets.length > 0) setPets(prev => [...prev, ...uniquePets])
            if (uniqueOwners.length > 0) setOwners(prev => [...prev, ...uniqueOwners])
          }
        } catch (error) {
          console.warn('[PetLogPage] Error fetching review_logs:', error)
        }

        // 2. Fetch from pet_log_posts table and convert to ReviewLog format
        try {
          const { data: petLogPosts, error: petLogPostsError } = await supabase
            .from('pet_log_posts')
            .select(`
              *,
              pet_log_feeding_records(*)
            `)
            .order('created_at', { ascending: false })
            .limit(100)

          if (!petLogPostsError && petLogPosts) {
            const transformedPetLogPosts: ReviewLog[] = petLogPosts.flatMap((post: any) => {
              if (!post.pet_log_feeding_records || post.pet_log_feeding_records.length === 0) {
                return []
              }

              return post.pet_log_feeding_records.map((record: any) => ({
                id: `${post.id}-${record.id}`,
                petId: post.pet_profile_id || `pet-${post.pet_name}`,
                ownerId: post.user_id || 'unknown',
                category: record.category === '사료' ? 'feed' : 
                         record.category === '간식' ? 'snack' :
                         record.category === '영양제' ? 'supplement' : 'toilet',
                brand: record.brand || '',
                product: record.product_name || '',
                status: record.status === '급여중' ? 'feeding' :
                       record.status === '급여완료' ? 'completed' : 'paused',
                periodStart: record.start_date || post.created_at,
                periodEnd: record.end_date || undefined,
                durationDays: record.duration ? parseInt(record.duration) : undefined,
                rating: record.satisfaction || record.palatability || undefined,
                recommend: record.repurchase_intent || undefined,
                excerpt: record.comment || '',
                likes: post.likes || 0,
                commentsCount: post.comments_count || 0,
                views: post.views || 0,
                createdAt: post.created_at || new Date().toISOString(),
                updatedAt: post.updated_at || post.created_at || new Date().toISOString()
              }))
            })
            allReviews.push(...transformedPetLogPosts)
          }
        } catch (error) {
          console.warn('[PetLogPage] Error fetching pet_log_posts:', error)
        }

        // Merge with mock data if no Supabase data
        if (allReviews.length > 0) {
          setReviews(allReviews)
        } else {
          setReviews(mockReviewLogs)
        }
      } catch (error) {
        console.error('[PetLogPage] Error fetching reviews:', error)
        setReviews(mockReviewLogs)
      } finally {
        setIsLoadingReviews(false)
      }
    }

    fetchReviews()
  }, [])

  // Filters
  const [selectedSpecies, setSelectedSpecies] = useState<'all' | 'dog' | 'cat'>('all')
  const [sortOption, setSortOption] = useState<SortOption>('recent')
  const [searchQuery, setSearchQuery] = useState<string>('')

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
  // Returns age in years (converts months to approximate years: 12 months = 1 year)
  const extractAgeNumber = (ageString: string): number => {
    const yearMatch = ageString.match(/(\d+)세/)
    if (yearMatch) {
      return parseInt(yearMatch[1], 10)
    }
    const monthMatch = ageString.match(/(\d+)개월/)
    if (monthMatch) {
      // Convert months to approximate years (e.g., 6 months = 0.5 years, but we'll round to 1)
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

  // Filter and sort reviews
  const filteredAndSortedReviews = useMemo(() => {
    let filtered = reviews.filter((review) => {
      const pet = pets.find((p) => p.id === review.petId)
      const owner = owners.find((o) => o.id === review.ownerId)
      if (!pet) return false

      // Species filter
      const matchesSpecies = selectedSpecies === 'all' || pet.species === selectedSpecies

      // Search filter (제품명, 브랜드, 반려동물 이름)
      const matchesSearch =
        searchQuery === '' ||
        review.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (owner && owner.nickname.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesSpecies && matchesSearch
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
      case 'rating':
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0))
        break
    }

    return filtered
  }, [reviews, pets, owners, selectedSpecies, sortOption, searchQuery])

  // Displayed reviews (paginated)
  const displayedReviews = useMemo(() => {
    return filteredAndSortedReviews.slice(0, displayedCount)
  }, [filteredAndSortedReviews, displayedCount])

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE)
  }, [selectedSpecies, sortOption, searchQuery])

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
        const owner = owners.find((o) => o.id === review.ownerId) || null
        const pet = pets.find((p) => p.id === review.petId) || null
        cache.set(key, { owner, pet })
      }
    })
    return cache
  }, [reviews, owners, pets])

  const getOwnerAndPet = (review: ReviewLog): { owner: Owner | null; pet: Pet | null } => {
    const key = `${review.ownerId}-${review.petId}`
    if (ownerPetCache.has(key)) {
      return ownerPetCache.get(key)!
    }
    const owner = owners.find((o) => o.id === review.ownerId) || null
    const pet = pets.find((p) => p.id === review.petId) || null
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
      .map(([ownerId]) => owners.find((o) => o.id === ownerId))
      .filter((o): o is Owner => o !== undefined)
  }, [reviews, owners])

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
    ? owners.find((o) => o.id === selectedReview.ownerId) || null
    : null
  const selectedPet = selectedReview
    ? pets.find((p) => p.id === selectedReview.petId) || null
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
            sortOption={sortOption}
            searchQuery={searchQuery}
            onSpeciesChange={setSelectedSpecies}
            onSortChange={setSortOption}
            onSearchChange={setSearchQuery}
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
            initialCategory="all"
          />
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
                      key={review.id}
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
                        category={review.category}
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
                        onAsk={() => handleQuestionClick(review.id)}
                        onDetail={() => handleViewDetail(review.id)}
                        avatarUrl={owner.avatarUrl}
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
