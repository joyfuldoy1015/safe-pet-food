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
    <div className="flex flex-wrap gap-2">
      <button
        onClick={() => onSelectCategory('all')}
        className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 ${
          selectedCategory === 'all'
            ? 'bg-blue-500 text-white shadow-sm'
            : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
        }`}
      >
        전체
      </button>
      {categories.map((category) => (
        <button
          key={category.value}
          onClick={() => onSelectCategory(category.value)}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
            selectedCategory === category.value
              ? 'bg-blue-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <span>{category.emoji}</span>
          <span>{category.label}</span>
        </button>
      ))}
    </div>
  )
}

