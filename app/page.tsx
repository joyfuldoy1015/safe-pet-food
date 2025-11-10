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
import { motion } from 'framer-motion'
import { ArrowRight, ChevronRight } from 'lucide-react'
import Hero from '@/components/home/Hero'
import FeatureCards from '@/components/home/FeatureCards'
import FeedTabs, { FeedTab } from '@/components/home/FeedTabs'
import UnifiedCard from '@/components/home/UnifiedCard'
import { getPopular, getRecent, getQA, getReviews, type UnifiedFeedItem } from '@/lib/data/feed'

const PREVIEW_ITEMS_PER_TAB = 6

export default function Home() {
  const [activeTab, setActiveTab] = useState<FeedTab>('popular')
  const [feedItems, setFeedItems] = useState<UnifiedFeedItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

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
              {feedItems.map((item, index) => (
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

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-2xl shadow-xl p-12 max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            지금 바로 시작해보세요!
          </h2>
          <p className="text-lg text-gray-600 mb-8">
            우리 아이의 건강한 반려생활을 위한 첫 걸음을 함께 시작해요
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/nutrition-calculator"
              className="inline-block bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105"
            >
              사료 성분 계산하기
            </Link>
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
