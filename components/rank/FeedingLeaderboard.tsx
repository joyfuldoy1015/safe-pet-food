'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, TrendingUp, Star, ChevronDown, ChevronUp } from 'lucide-react'
import { getTopLongest, getTopMentions, getBlended, type Species, type Category, type ProductRanking } from '@/lib/supa/rankings'

type TabType = 'trust' | 'popular' | 'recommended'

/**
 * Mock rankings for development fallback
 * Used when Supabase views don't exist or timeout occurs
 */
function getMockRankings(tab: TabType, category: Category): ProductRanking[] {
  const mockData: Record<TabType, ProductRanking[]> = {
    trust: [
      { category: 'feed', brand: '로얄캐닌', product: '골든 리트리버 어덜트', max_days: 365, logs_count: 12, mentions: 15, last_updated: new Date().toISOString() },
      { category: 'feed', brand: '힐스', product: '어덜트 라지 브리드', max_days: 180, logs_count: 8, mentions: 10, last_updated: new Date().toISOString() },
      { category: 'feed', brand: '오리젠', product: '오리지널', max_days: 120, logs_count: 5, mentions: 8, last_updated: new Date().toISOString() },
      { category: 'snack', brand: '네츄럴발란스', product: '트레이닝 트릿', max_days: 90, logs_count: 15, mentions: 20, last_updated: new Date().toISOString() },
      { category: 'supplement', brand: '뉴트리코', product: '오메가3 오일', max_days: 60, logs_count: 6, mentions: 9, last_updated: new Date().toISOString() },
    ],
    popular: [
      { category: 'snack', brand: '캣챠', product: '츄르', max_days: 30, logs_count: 25, mentions: 35, last_updated: new Date().toISOString() },
      { category: 'feed', brand: '로얄캐닌', product: '페르시안 어덜트', max_days: 200, logs_count: 18, mentions: 28, last_updated: new Date().toISOString() },
      { category: 'feed', brand: '로얄캐닌', product: '골든 리트리버 어덜트', max_days: 365, logs_count: 12, mentions: 15, last_updated: new Date().toISOString() },
      { category: 'supplement', brand: '뉴트리코', product: '프로바이오틱스', max_days: 45, logs_count: 10, mentions: 14, last_updated: new Date().toISOString() },
      { category: 'feed', brand: '아카나', product: '그라스랜드', max_days: 150, logs_count: 9, mentions: 12, last_updated: new Date().toISOString() },
    ],
    recommended: [
      { category: 'feed', brand: '로얄캐닌', product: '골든 리트리버 어덜트', max_days: 365, logs_count: 12, mentions: 15, last_updated: new Date().toISOString(), blended_score: 0.95 },
      { category: 'feed', brand: '로얄캐닌', product: '페르시안 어덜트', max_days: 200, logs_count: 18, mentions: 28, last_updated: new Date().toISOString(), blended_score: 0.92 },
      { category: 'feed', brand: '힐스', product: '어덜트 라지 브리드', max_days: 180, logs_count: 8, mentions: 10, last_updated: new Date().toISOString(), blended_score: 0.85 },
      { category: 'snack', brand: '네츄럴발란스', product: '트레이닝 트릿', max_days: 90, logs_count: 15, mentions: 20, last_updated: new Date().toISOString(), blended_score: 0.80 },
      { category: 'feed', brand: '아카나', product: '그라스랜드', max_days: 150, logs_count: 9, mentions: 12, last_updated: new Date().toISOString(), blended_score: 0.78 },
    ]
  }

  let filtered = mockData[tab] || []
  
  // Apply category filter
  if (category && category !== 'all') {
    filtered = filtered.filter(item => item.category === category)
  }

  return filtered.slice(0, 10)
}

interface FeedingLeaderboardProps {
  initialSpecies?: Species
  initialCategory?: Category
}

export default function FeedingLeaderboard({ 
  initialSpecies = 'all',
  initialCategory = 'all'
}: FeedingLeaderboardProps) {
  const [activeTab, setActiveTab] = useState<TabType>('trust')
  const [species, setSpecies] = useState<Species>(initialSpecies)
  const [category, setCategory] = useState<Category>(initialCategory)
  const [rankings, setRankings] = useState<ProductRanking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [expanded, setExpanded] = useState(false)

  // Fetch rankings based on active tab
  const fetchRankings = async () => {
    setLoading(true)
    setError(null)

    try {
      // Shorter timeout for better UX (5초로 단축)
      const timeoutPromise = new Promise<ProductRanking[]>((_, reject) => {
        setTimeout(() => reject(new Error('Request timeout')), 5000)
      })

      const fetchPromise = (async () => {
        let data: ProductRanking[] = []

        switch (activeTab) {
          case 'trust':
            data = await getTopLongest({ limit: 10, species, category, minLogs: 2 })
            break
          case 'popular':
            data = await getTopMentions({ limit: 10, species, category })
            break
          case 'recommended':
            data = await getBlended({ limit: 10, species, category, minLogs: 2 })
            break
        }

        return data
      })()

      const data = await Promise.race([fetchPromise, timeoutPromise])
      
      // If no data returned, use mock data for development
      if (!data || data.length === 0) {
        if (process.env.NODE_ENV === 'development') {
          console.log('[FeedingLeaderboard] No data, using mock rankings')
          setRankings(getMockRankings(activeTab, category))
        } else {
          setRankings([])
        }
      } else {
        setRankings(data)
      }
    } catch (err) {
      const error = err as Error
      console.error('[FeedingLeaderboard] Error fetching rankings:', error.message)
      
      // Graceful fallback: use mock data in development
      if (process.env.NODE_ENV === 'development') {
        console.log('[FeedingLeaderboard] Using mock data due to error')
        setRankings(getMockRankings(activeTab, category))
      } else {
        setRankings([])
      }
      
      setError(null) // Don't show error UI, just show data or empty state
    } finally {
      setLoading(false)
    }
  }

  // Initial fetch and polling
  useEffect(() => {
    fetchRankings()

    // Poll every 60 seconds
    const interval = setInterval(() => {
      fetchRankings()
    }, 60000)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, species, category])

  // Display rankings (1-5 or 1-10 based on expanded state)
  const displayedRankings = useMemo(() => {
    return expanded ? rankings : rankings.slice(0, 5)
  }, [rankings, expanded])

  // Get category label in Korean
  const getCategoryLabel = (cat: string): string => {
    const labels: Record<string, string> = {
      feed: '사료',
      snack: '간식',
      supplement: '영양제',
      toilet: '화장실'
    }
    return labels[cat] || cat
  }

  // Get rank badge color
  const getRankBadgeColor = (rank: number): string => {
    if (rank === 1) return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    if (rank === 2) return 'bg-gray-100 text-gray-800 border-gray-300'
    if (rank === 3) return 'bg-orange-100 text-orange-800 border-orange-300'
    return 'bg-gray-50 text-gray-600 border-gray-200'
  }

  // Get row background for top 3
  const getRowBackground = (rank: number): string => {
    if (rank <= 3) return 'bg-gradient-to-r from-transparent via-blue-50/30 to-transparent'
    return ''
  }

  return (
    <div className="w-full bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-900 flex items-center gap-2">
          <Trophy className="w-5 h-5 text-yellow-500" />
          급여 랭킹
        </h2>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4 border-b border-gray-200">
        <button
          onClick={() => {
            setActiveTab('trust')
            setExpanded(false)
          }}
          className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'trust'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          신뢰(장기간)
        </button>
        <button
          onClick={() => {
            setActiveTab('popular')
            setExpanded(false)
          }}
          className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'popular'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          인기(언급)
        </button>
        <button
          onClick={() => {
            setActiveTab('recommended')
            setExpanded(false)
          }}
          className={`px-3 py-2 text-sm font-medium rounded-t-lg transition-colors ${
            activeTab === 'recommended'
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          추천(혼합)
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {/* Species Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">반려동물:</span>
          <div className="flex gap-1">
            {(['all', 'dog', 'cat'] as Species[]).map((s) => (
              <button
                key={s}
                onClick={() => setSpecies(s)}
                className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                  species === s
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {s === 'all' ? '전체' : s === 'dog' ? '강아지' : '고양이'}
              </button>
            ))}
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">제품군:</span>
          <div className="flex gap-1">
            {(['all', 'feed', 'snack', 'supplement', 'toilet'] as Category[]).map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`px-2 py-1 text-xs rounded-md border transition-colors ${
                  category === c
                    ? 'bg-blue-50 text-blue-700 border-blue-300'
                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                }`}
              >
                {c === 'all' ? '전체' : getCategoryLabel(c)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Rankings List */}
      <div className="space-y-2">
        {loading ? (
          // Skeleton loading
          Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="animate-pulse flex items-center gap-3 p-3 rounded-lg bg-gray-50">
              <div className="w-8 h-8 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
              </div>
            </div>
          ))
        ) : error ? (
          // Error state
          <div className="text-center py-8 text-red-600 text-sm">
            {error}
          </div>
        ) : displayedRankings.length === 0 ? (
          // Empty state
          <div className="text-center py-8 text-gray-500 text-sm">
            랭킹 데이터가 없습니다.
          </div>
        ) : (
          // Rankings list
          <AnimatePresence mode="wait">
            {displayedRankings.map((item, index) => {
              const rank = index + 1
              return (
                <motion.div
                  key={`${item.category}-${item.brand}-${item.product}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors ${getRowBackground(rank)}`}
                >
                  {/* Rank Badge */}
                  <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border ${getRankBadgeColor(rank)}`}>
                    {rank}
                  </div>

                  {/* Product Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-sm font-semibold text-gray-900 truncate">
                        {item.brand} · {item.product}
                      </h3>
                      <span className="flex-shrink-0 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-md border border-gray-200">
                        {getCategoryLabel(item.category)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600">
                      {activeTab === 'trust' && (
                        <span>최장 {item.max_days}일 · 언급 {item.logs_count}건</span>
                      )}
                      {activeTab === 'popular' && (
                        <span>언급 {Math.round(item.mentions || 0)}건</span>
                      )}
                      {activeTab === 'recommended' && (
                        <span>최장 {item.max_days}일 · 언급 {Math.round(item.mentions || 0)}건</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        )}
      </div>

      {/* Expand/Collapse Button */}
      {!loading && !error && rankings.length > 5 && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="mt-4 w-full flex items-center justify-center gap-2 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors border-t border-gray-200 pt-4"
          aria-label={expanded ? '접기' : '6-10위 펼쳐보기'}
        >
          {expanded ? (
            <>
              <ChevronUp className="w-4 h-4" />
              접기
            </>
          ) : (
            <>
              <ChevronDown className="w-4 h-4" />
              6-10위 펼쳐보기
            </>
          )}
        </button>
      )}
    </div>
  )
}

