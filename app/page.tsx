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
import { ArrowRight, ChevronRight } from 'lucide-react'
import Hero from '@/components/home/Hero'
import FeatureCards from '@/components/home/FeatureCards'
import UnifiedCard from '@/components/home/UnifiedCard'
import PetLogCard from '@/components/petlogs/PetLogCard'
import { getQA, type UnifiedFeedItem } from '@/lib/data/feed'
import { mockReviewLogs, mockOwners, mockPets } from '@/lib/mock/review-log'

export default function Home() {
  const router = useRouter()
  const [qaItems, setQAItems] = useState<UnifiedFeedItem[]>([])
  const [isQALoading, setIsQALoading] = useState(true)

  // Load Q&A
  useEffect(() => {
    const loadQA = async () => {
      setIsQALoading(true)
      try {
        const items = await getQA(3)
        setQAItems(items)
      } catch (error) {
        console.error('Failed to load Q&A:', error)
        setQAItems([])
      } finally {
        setIsQALoading(false)
      }
    }

    loadQA()
  }, [])

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
    router.push(`/pet-log/${reviewId}`)
  }

  // Handle question click
  const handleQuestionClick = (reviewId: string) => {
    router.push(`/pet-log/${reviewId}?tab=qa`)
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section (Top 20-30%) */}
      <Hero />

      {/* Feature Cards Section */}
      <FeatureCards />

      {/* 급여/사용 기록 섹션 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">급여/사용 기록 📝</h2>
            <p className="text-sm text-gray-600">
              다른 집사들의 급여 및 사용 후기를 확인해보세요
            </p>
          </div>
          <Link
            href="/pet-log"
            className="flex items-center gap-1 text-sm text-violet-600 font-medium hover:text-violet-700"
          >
            더보기
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockReviewLogs.slice(0, 3).map((review, index) => {
            const owner = mockOwners.find((o) => o.id === review.ownerId)
            const pet = mockPets.find((p) => p.id === review.petId)
            if (!owner || !pet) return null

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
      </section>

      {/* Q&A 섹션 */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-1">Q&A 💬</h2>
            <p className="text-sm text-gray-600">
              궁금한 점을 질문하고 답변을 받아보세요
            </p>
          </div>
          <Link
            href="/community/qa-forum"
            className="flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700"
          >
            더보기
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        {isQALoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-4 h-36 animate-pulse"
              >
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-10 bg-gray-200 rounded mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : qaItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {qaItems.slice(0, 3).map((item, index) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <UnifiedCard item={item} formatTimeAgo={formatTimeAgo} />
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-gray-50 rounded-2xl">
            <p className="text-sm text-gray-500">아직 등록된 Q&A가 없습니다</p>
          </div>
        )}
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
