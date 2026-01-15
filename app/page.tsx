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
 * Mapping to hybrid layout:
 * - Hero section: Keep existing (top 20-30%)
 * - Feature cards: Keep existing (middle section)
 * - UGC feed preview: New section (bottom 70-80%)
 * - "See all" button links to /explore
 */

'use client'

import React, { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight, TrendingUp, ArrowUp, MessageCircle } from 'lucide-react'
import Hero from '@/components/home/Hero'
import FeatureCards from '@/components/home/FeatureCards'
import FeedTabs, { FeedTab } from '@/components/home/FeedTabs'
import UnifiedCard from '@/components/home/UnifiedCard'
import PetLogCard from '@/components/petlogs/PetLogCard'
import { getPopular, getRecent, getQA, getReviews, type UnifiedFeedItem } from '@/lib/data/feed'
import { mockReviewLogs, mockOwners, mockPets } from '@/lib/mock/review-log'

const PREVIEW_ITEMS_PER_TAB = 6

interface TrendingQuestion {
  id: string
  title: string
  category: string
  votes: number
  views: number
  answerCount: number
  author: {
    name: string
    level: string
  }
  createdAt: string
  trendingScore: number
}

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<FeedTab>('popular')
  const [feedItems, setFeedItems] = useState<UnifiedFeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [trendingQuestions, setTrendingQuestions] = useState<TrendingQuestion[]>([])
  const [isTrendingLoading, setIsTrendingLoading] = useState(true)
  
  // Fetch trending questions from API
  useEffect(() => {
    const fetchTrending = async () => {
      setIsTrendingLoading(true)
      try {
        const response = await fetch('/api/trending-questions')
        if (response.ok) {
          const data = await response.json()
          setTrendingQuestions(data)
        }
      } catch (error) {
        console.error('Failed to fetch trending questions:', error)
      } finally {
        setIsTrendingLoading(false)
      }
    }
    fetchTrending()
  }, [])

  // Load feed items based on active tab
  useEffect(() => {
    const loadFeed = async () => {
      setIsLoading(true)
      try {
        let items: UnifiedFeedItem[] = []
        
        switch (activeTab) {
          case 'popular':
            items = await getPopular(PREVIEW_ITEMS_PER_TAB)
            break
          case 'recent':
            items = await getRecent(PREVIEW_ITEMS_PER_TAB)
            break
          case 'qa':
            items = await getQA(PREVIEW_ITEMS_PER_TAB)
            break
          case 'reviews':
            items = await getReviews(PREVIEW_ITEMS_PER_TAB)
            break
        }
        
        setFeedItems(items)
      } catch (error) {
        console.error('Failed to load feed:', error)
        setFeedItems([])
      } finally {
        setIsLoading(false)
      }
    }

    loadFeed()
  }, [activeTab])

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

  // Handle review detail navigation
  const handleViewDetail = (reviewId: string) => {
    const review = mockReviewLogs.find((r) => r.id === reviewId)
    if (review) {
      router.push(`/owners/${review.ownerId}/pets/${review.petId}`)
    }
  }

  // Handle question click
  const handleQuestionClick = (reviewId: string) => {
    const review = mockReviewLogs.find((r) => r.id === reviewId)
    if (review) {
      router.push(`/owners/${review.ownerId}/pets/${review.petId}?tab=qa`)
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section (Top 20-30%) */}
      <Hero />

      {/* Feature Cards Section */}
      <FeatureCards />

      {/* UGC Feed Preview Section (Bottom 70-80%) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">커뮤니티 피드</h2>
          <p className="text-lg text-gray-600">
            다른 집사들의 질문과 급여 후기를 확인해보세요
          </p>
        </div>

        {/* Feed Tabs */}
        <FeedTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Feed Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-6 shadow-[0_8px_30px_rgba(0,0,0,0.05)] h-64 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : feedItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {feedItems.map((item, index) => {
                // For review items, use PetLogCard
                if (item.kind === 'review') {
                  const review = mockReviewLogs.find((r) => r.id === item.id)
                  if (!review) {
                    // Fallback to UnifiedCard if review not found
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <UnifiedCard item={item} formatTimeAgo={formatTimeAgo} />
                      </motion.div>
                    )
                  }

                  const owner = mockOwners.find((o) => o.id === review.ownerId)
                  const pet = mockPets.find((p) => p.id === review.petId)
                  if (!owner || !pet) {
                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <UnifiedCard item={item} formatTimeAgo={formatTimeAgo} />
                      </motion.div>
                    )
                  }

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
                      key={item.id}
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
                }

                // For Q&A items, use UnifiedCard
                return (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    <UnifiedCard item={item} formatTimeAgo={formatTimeAgo} />
                  </motion.div>
                )
              })}
            </div>

            {/* See All Button */}
            <div className="flex justify-center">
              <Link
                href="/explore"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#3056F5] text-white rounded-xl font-medium hover:bg-[#2648e6] transition-all duration-200 shadow-md hover:shadow-lg"
              >
                전체 보기
                <ChevronRight className="h-5 w-5" />
              </Link>
            </div>
          </>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl shadow-soft border border-gray-100">
            <p className="text-lg font-medium text-gray-900 mb-2">콘텐츠가 없습니다</p>
            <p className="text-sm text-gray-600">곧 새로운 콘텐츠가 추가될 예정입니다</p>
          </div>
        )}
      </section>

      {/* Trending Questions Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6">
        <div className="bg-white rounded-xl shadow-soft border border-gray-200 p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <h3 className="font-bold text-gray-900">트렌딩 질문</h3>
          </div>
          <div className="space-y-4">
            {isTrendingLoading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500 mx-auto"></div>
              </div>
            ) : trendingQuestions.length > 0 ? (
              trendingQuestions.map((question, index) => (
                <Link
                  key={question.id}
                  href={`/community/qa-forum/${question.id}`}
                  className="block p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                      <span className="text-xs font-bold text-orange-600">{index + 1}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                        {question.title}
                      </h4>
                      <div className="flex items-center space-x-3 mt-2 text-xs text-gray-500">
                        <div className="flex items-center space-x-1">
                          <ArrowUp className="h-3 w-3" />
                          <span>{question.votes}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <MessageCircle className="h-3 w-3" />
                          <span>{question.answerCount}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <p className="text-sm text-gray-500 text-center py-4">
                트렌딩 질문이 없습니다
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <div className="bg-gradient-to-br from-yellow-50 to-orange-50 rounded-xl p-6 border border-yellow-200 max-w-2xl mx-auto">
          <h3 className="font-bold text-gray-900 mb-2 text-lg text-center">뉴스레터 구독</h3>
          <p className="text-sm text-gray-700 mb-4 text-center">
            반려동물 건강 정보와 최신 소식을 받아보세요
          </p>
          <button className="w-full px-4 py-3 bg-yellow-400 text-black rounded-lg hover:bg-yellow-500 transition-colors text-sm font-medium shadow-md hover:shadow-lg">
            구독하기
          </button>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-4xl mx-auto text-center">
          <h2 className="text-[1.7rem] sm:text-3xl font-bold text-gray-900 mb-4">
            지금 바로 시작해보세요!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            우리 아이의 건강한 반려생활을 위한 첫 걸음을 함께 시작해요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/health-analyzer"
              className="inline-block bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              건강검진표 분석하기
            </Link>
            <Link
              href="/pet-log"
              className="inline-block bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              펫 로그 커뮤니티
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
