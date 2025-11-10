'use client'

import React from 'react'
import { Flame, Clock, HelpCircle, BookOpen } from 'lucide-react'

export type FeedTab = 'popular' | 'recent' | 'qa' | 'reviews'

interface FeedTabsProps {
  activeTab: FeedTab
  onTabChange: (tab: FeedTab) => void
}

/**
 * Feed tabs component for switching between different feed types
 */
export default function FeedTabs({ activeTab, onTabChange }: FeedTabsProps) {
  const tabs: { id: FeedTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'popular', label: '인기', icon: Flame },
    { id: 'recent', label: '최신', icon: Clock },
    { id: 'qa', label: 'Q&A', icon: HelpCircle },
    { id: 'reviews', label: '급여 후기', icon: BookOpen }
  ]

  return (
    <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm shadow-sm -mx-4 sm:mx-0 px-4 sm:px-0 py-4 mb-6">
      <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`px-4 py-2.5 rounded-xl transition-colors flex items-center space-x-2 whitespace-nowrap text-sm font-medium ${
                isActive
                  ? 'bg-[#3056F5] text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              aria-label={tab.label}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

