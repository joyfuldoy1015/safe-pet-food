'use client'

import React, { useState, useMemo, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CheckCircle, User, TrendingUp, Plus, ChevronDown, Search } from 'lucide-react'
import { ReviewLog, Owner, Pet, Comment } from '@/lib/types/review-log'
import PetLogCard from '@/components/petlogs/PetLogCard'
// FeedFilters removed - using inline filters
import LogDrawer from '@/app/components/pet-log/LogDrawer'
import LogFormDialog from '@/components/log/LogFormDialog'
import FeedingLeaderboard from '@/components/rank/FeedingLeaderboard'
import { useAuth } from '@/hooks/useAuth'
import { getBrowserClient } from '@/lib/supabase-client'

type SortOption = 'recent' | 'popular' | 'rating'
type CategoryFilter = 'all' | 'feed' | 'supplement' | 'toilet' | 'health'

const ITEMS_PER_PAGE = 6

export default function PetLogPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [reviews, setReviews] = useState<ReviewLog[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [selectedReview, setSelectedReview] = useState<ReviewLog | null>(null)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [displayedCount, setDisplayedCount] = useState(ITEMS_PER_PAGE)
  const [isLogFormOpen, setIsLogFormOpen] = useState(false)
  const [isLoadingReviews, setIsLoadingReviews] = useState(true)
  const [pets, setPets] = useState<Pet[]>([])
  const [owners, setOwners] = useState<Owner[]>([])

  // 클라이언트 사이드 마운트 확인 (하이드레이션 에러 방지)
  useEffect(() => {
    setMounted(true)
  }, [])

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

        setReviews(allReviews)
      } catch (error) {
        console.error('[PetLogPage] Error fetching reviews:', error)
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
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false)
  const sortDropdownRef = useRef<HTMLDivElement>(null)
  
  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setSortDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

      // Category filter
      let matchesCategory = true
      if (categoryFilter !== 'all') {
        if (categoryFilter === 'feed') {
          matchesCategory = review.category === 'feed' || review.category === 'snack'
        } else if (categoryFilter === 'supplement') {
          matchesCategory = review.category === 'supplement'
        } else if (categoryFilter === 'toilet') {
          matchesCategory = review.category === 'toilet'
        } else if (categoryFilter === 'health') {
          // 건강체크 카테고리 (추후 추가 가능)
          matchesCategory = false
        }
      }

      // Search filter (제품명, 브랜드, 반려동물 이름)
      const matchesSearch =
        searchQuery === '' ||
        review.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
        review.product.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (owner && owner.nickname.toLowerCase().includes(searchQuery.toLowerCase()))

      return matchesSpecies && matchesCategory && matchesSearch
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
  }, [reviews, pets, owners, selectedSpecies, sortOption, searchQuery, categoryFilter])

  // Displayed reviews (paginated)
  const displayedReviews = useMemo(() => {
    return filteredAndSortedReviews.slice(0, displayedCount)
  }, [filteredAndSortedReviews, displayedCount])

  // Reset displayed count when filters change
  useEffect(() => {
    setDisplayedCount(ITEMS_PER_PAGE)
  }, [selectedSpecies, sortOption, searchQuery, categoryFilter])

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

  // Handle review detail - navigate to log detail page
  const handleViewDetail = (reviewId: string) => {
    // Navigate to single log detail page
    router.push(`/pet-log/${reviewId}`)
  }


  // Handle question click - navigate to detail page with Q&A tab
  const handleQuestionClick = (reviewId: string) => {
    // Navigate to review detail page with Q&A focus
    router.push(`/pet-log/${reviewId}?tab=qa`)
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

  // 클라이언트 마운트 전에는 로딩 UI 표시 (하이드레이션 에러 방지)
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          <div className="mb-6">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">로그 타임라인</h1>
          </div>
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-2 border-gray-200 border-t-blue-500"></div>
          </div>
        </main>
      </div>
    )
  }

  // 정렬 옵션 라벨
  const getSortLabel = () => {
    switch (sortOption) {
      case 'recent': return '최신순'
      case 'popular': return '인기순'
      case 'rating': return '평점순'
      default: return '맞춤 추천 순'
    }
  }

  // 카테고리 탭 데이터
  const categoryTabs = [
    { id: 'all' as CategoryFilter, label: '전체 로그' },
    { id: 'feed' as CategoryFilter, label: '사료/간식' },
    { id: 'supplement' as CategoryFilter, label: '영양제' },
    { id: 'toilet' as CategoryFilter, label: '용품' },
    { id: 'health' as CategoryFilter, label: '건강체크' },
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* 히어로 섹션 */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            급여 후기
          </h1>
          <p className="text-sm text-gray-500">
            집사들의 급여/사용 경험을 공유하고 참고해보세요
          </p>
        </motion.div>

        {/* Header: 필터 + 정렬 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center justify-between mb-4"
        >
          <span className="text-xs text-gray-500">총 {filteredAndSortedReviews.length}개의 로그</span>
          
          {/* 정렬 드롭다운 */}
          <div className="relative" ref={sortDropdownRef}>
            <button
              onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
              className="flex items-center gap-1 text-xs text-violet-600 font-medium hover:text-violet-700"
            >
              {getSortLabel()}
              <ChevronDown className={`h-3.5 w-3.5 transition-transform ${sortDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            {sortDropdownOpen && (
              <div className="absolute right-0 top-full mt-1 w-28 bg-white border border-gray-100 rounded-xl shadow-sm z-50 overflow-hidden">
                {[
                  { value: 'recent' as SortOption, label: '최신순' },
                  { value: 'popular' as SortOption, label: '인기순' },
                  { value: 'rating' as SortOption, label: '평점순' },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      setSortOption(option.value)
                      setSortDropdownOpen(false)
                    }}
                    className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 ${
                      sortOption === option.value ? 'bg-violet-50 text-violet-600 font-medium' : 'text-gray-700'
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* 카테고리 탭 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="mb-4 overflow-x-auto scrollbar-hide"
        >
          <div className="flex gap-1.5 min-w-max pb-2">
            {categoryTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${
                  categoryFilter === tab.id
                    ? 'bg-violet-500 text-white'
                    : 'bg-white text-gray-600 border border-gray-100 hover:border-gray-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 검색 바 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-4"
        >
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="제품명, 브랜드로 검색..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
        </motion.div>

        {/* Feeding Leaderboard (데스크톱에서만) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-6 hidden lg:block"
        >
          <FeedingLeaderboard
            initialSpecies={selectedSpecies}
            initialCategory="all"
          />
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reviews Feed */}
          <div className="lg:col-span-2">
            {displayedReviews.length > 0 ? (
              <>
                <div className="space-y-4">
                  {displayedReviews.map((review, index) => {
                    const { owner, pet } = getOwnerAndPet(review)
                    if (!owner || !pet) return null

                    // Map status to PetLogCard format
                    const statusMap: Record<string, 'in_progress' | 'stopped' | 'completed'> = {
                      'feeding': 'in_progress',
                      'paused': 'stopped',
                      'completed': 'completed'
                    }

                    return (
                      <motion.div
                        key={review.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: Math.min(index * 0.03, 0.3) }}
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
                          recommended={review.recommend}
                          authorName={owner.nickname}
                          petName={pet.name}
                          review={review.excerpt || ''}
                          likes={review.likes}
                          comments={review.commentsCount}
                          createdAt={formatDateForCard(review.createdAt)}
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
                      className="px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 active:scale-[0.98] shadow-sm"
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
                    <p className="text-sm text-gray-400">
                      모든 후기를 불러왔습니다.
                    </p>
                  </motion.div>
                )}
              </>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 bg-white rounded-2xl border border-gray-100"
              >
                <p className="text-lg font-medium text-gray-900 mb-2">
                  후기가 없습니다
                </p>
                <p className="text-sm text-gray-500">
                  필터를 조정해보세요
                </p>
              </motion.div>
            )}
          </div>

          {/* Sidebar (데스크톱) */}
          <div className="lg:col-span-1 space-y-4 hidden lg:block">
            {/* 최근 활발한 집사 */}
            {activeOwners.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="bg-white rounded-2xl border border-gray-100 p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <User className="h-5 w-5 text-blue-500" />
                  <h3 className="font-semibold text-gray-900">활발한 집사</h3>
                </div>
                <div className="space-y-2">
                  {activeOwners.map((owner) => (
                    <div
                      key={owner.id}
                      className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center text-sm font-medium text-gray-600 overflow-hidden">
                        {owner.avatarUrl ? (
                          <img 
                            src={owner.avatarUrl} 
                            alt={owner.nickname}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          owner.nickname.charAt(0)
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-gray-900 truncate">
                          {owner.nickname}
                        </div>
                        <div className="text-xs text-gray-400">
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
                className="bg-white rounded-2xl border border-gray-100 p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  <h3 className="font-semibold text-gray-900">장기 급여 제품</h3>
                </div>
                <div className="p-3 bg-green-50 rounded-xl">
                  <div className="font-medium text-gray-900 text-sm mb-1">
                    {longestFeeding.product}
                  </div>
                  <div className="text-xs text-gray-500">
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
                className="bg-white rounded-2xl border border-gray-100 p-5"
              >
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="h-5 w-5 text-red-400" />
                  <h3 className="font-semibold text-gray-900">중지 사유</h3>
                </div>
                <div className="space-y-2">
                  {recentStopReasons.map((reason, index) => (
                    <div
                      key={index}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg text-xs"
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
