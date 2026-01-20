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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section (Top 20-30%) */}
      <Hero />

      {/* Feature Cards Section */}
      <FeatureCards />

      {/* 급여/사용 기록 섹션 */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">급여 후기</h2>
            <p className="text-xs text-gray-500">
              다른 집사들의 급여 및 사용 후기를 확인해보세요
            </p>
          </div>
          <Link
            href="/pet-log"
            className="flex items-center gap-1 text-xs text-violet-600 font-medium hover:text-violet-700"
          >
            더보기
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {mockReviewLogs.slice(0, 2).map((review, index) => {
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
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-0.5">Q&A</h2>
            <p className="text-xs text-gray-500">
              궁금한 점을 질문하고 답변을 받아보세요
            </p>
          </div>
          <Link
            href="/community/qa-forum"
            className="flex items-center gap-1 text-xs text-violet-600 font-medium hover:text-violet-700"
          >
            더보기
            <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {isQALoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 2 }).map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-2xl border border-gray-100 p-4 h-32 animate-pulse"
              >
                <div className="h-3 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded mb-3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        ) : qaItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {qaItems.slice(0, 2).map((item, index) => (
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
          <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
            <p className="text-xs text-gray-500">아직 등록된 Q&A가 없습니다</p>
          </div>
        )}
      </section>

      {/* CTA Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-10">
        <div className="bg-white rounded-2xl shadow-sm p-6 text-center border border-gray-100">
          <h2 className="text-base font-bold text-gray-900 mb-2">
            지금 바로 시작해보세요
          </h2>
          <p className="text-xs text-gray-500 mb-4">
            우리 아이의 건강한 반려생활을 위한 첫 걸음
          </p>
          <div className="flex flex-col sm:flex-row gap-2 justify-center">
            <Link
              href="/pet-log/posts/write"
              className="inline-block bg-violet-500 hover:bg-violet-600 text-white text-sm font-medium py-2.5 px-5 rounded-xl transition-colors"
            >
              급여 후기 작성하기
            </Link>
            <Link
              href="/community/qa-forum"
              className="inline-block bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-medium py-2.5 px-5 rounded-xl transition-colors"
            >
              Q&A 둘러보기
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
