'use client'

import { useState } from 'react'

interface BrandDetailTabsProps {
  activeTab: string
  onTabChange: (tab: string) => void
  productsCount: number
  qaCount: number
}

export default function BrandDetailTabs({
  activeTab,
  onTabChange,
  productsCount,
  qaCount
}: BrandDetailTabsProps) {
  const tabs = [
    { id: 'products', label: `제품 목록 (${productsCount})` },
    { id: 'qa', label: '관련 Q&A' }
  ]

  return (
    <div className="border-b border-gray-200 bg-white sticky top-16 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <nav className="flex space-x-8 overflow-x-auto" aria-label="Tabs">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={`py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  )
}
