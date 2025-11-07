'use client'

import React from 'react'

interface Category {
  value: string
  label: string
  emoji: string
}

interface CategoryTabsProps {
  categories: Category[]
  selectedCategory: string
  onSelectCategory: (category: string) => void
}

export default function CategoryTabs({
  categories,
  selectedCategory,
  onSelectCategory
}: CategoryTabsProps) {
  return (
    <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-hide">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
          selectedCategory === 'all'
            ? 'bg-blue-500 text-white shadow-md'
            : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
        }`}
      >
        전체
      </button>
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onSelectCategory(category.value)}
          className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 flex items-center space-x-2 ${
            selectedCategory === category.value
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
          }`}
        >
          <span>{category.emoji}</span>
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  )
}

