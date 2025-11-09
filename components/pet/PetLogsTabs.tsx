'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { Category } from '@/lib/types/review-log'

interface PetLogsTabsProps {
  activeTab: Category | 'all'
  onTabChange: (tab: Category | 'all') => void
  categoryCounts: Record<Category | 'all', number>
}

/**
 * Sticky category tabs for filtering logs
 */
export default function PetLogsTabs({
  activeTab,
  onTabChange,
  categoryCounts
}: PetLogsTabsProps) {
  const tabs: Array<{ id: Category | 'all'; label: string; emoji: string }> = [
    { id: 'all', label: '전체', emoji: '📋' },
    { id: 'feed', label: '사료', emoji: '🍽️' },
    { id: 'snack', label: '간식', emoji: '🦴' },
    { id: 'supplement', label: '영양제', emoji: '💊' },
    { id: 'toilet', label: '화장실', emoji: '🚽' }
  ]

  return (
    <div className="sticky top-0 z-30 -mx-4 sm:mx-0 px-4 sm:px-0 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-3">
        {tabs.map((tab) => {
          const count = categoryCounts[tab.id] || 0
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-all duration-200 ${
                isActive
                  ? 'bg-[#3056F5] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{tab.emoji}</span>
              {tab.label}
              {count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.5 rounded-full text-xs ${
                  isActive ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

