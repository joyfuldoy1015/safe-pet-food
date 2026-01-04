'use client'

import React from 'react'
import { Search } from 'lucide-react'

type SortOption = 'recent' | 'popular' | 'rating'

interface FeedFiltersProps {
  selectedSpecies: 'all' | 'dog' | 'cat'
  sortOption: SortOption
  searchQuery: string
  onSpeciesChange: (value: 'all' | 'dog' | 'cat') => void
  onSortChange: (value: SortOption) => void
  onSearchChange: (value: string) => void
}

export default function FeedFilters({
  selectedSpecies,
  sortOption,
  searchQuery,
  onSpeciesChange,
  onSortChange,
  onSearchChange
}: FeedFiltersProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Input */}
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="제품명, 브랜드, 반려동물을 이름으로 검색..."
              className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Species Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={selectedSpecies}
            onChange={(e) => onSpeciesChange(e.target.value as 'all' | 'dog' | 'cat')}
            className="w-full sm:w-32 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm bg-white"
          >
            <option value="all">전체</option>
            <option value="dog">강아지</option>
            <option value="cat">고양이</option>
          </select>
        </div>

        {/* Sort Filter */}
        <div className="w-full sm:w-auto">
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="w-full sm:w-32 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm bg-white"
          >
            <option value="recent">최신순</option>
            <option value="popular">인기순</option>
            <option value="rating">평점순</option>
          </select>
        </div>
      </div>
    </div>
  )
}
