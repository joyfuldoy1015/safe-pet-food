'use client'

import React from 'react'
import { Filter } from 'lucide-react'

interface FeedFiltersProps {
  selectedSpecies: 'all' | 'dog' | 'cat'
  selectedCategory: 'all' | 'feed' | 'snack' | 'supplement' | 'toilet'
  selectedStatus: 'all' | 'feeding' | 'paused' | 'completed'
  selectedRating: number
  selectedRecommend: 'all' | 'recommended' | 'not-recommended'
  onSpeciesChange: (value: 'all' | 'dog' | 'cat') => void
  onCategoryChange: (value: 'all' | 'feed' | 'snack' | 'supplement' | 'toilet') => void
  onStatusChange: (value: 'all' | 'feeding' | 'paused' | 'completed') => void
  onRatingChange: (value: number) => void
  onRecommendChange: (value: 'all' | 'recommended' | 'not-recommended') => void
}

export default function FeedFilters({
  selectedSpecies,
  selectedCategory,
  selectedStatus,
  selectedRating,
  selectedRecommend,
  onSpeciesChange,
  onCategoryChange,
  onStatusChange,
  onRatingChange,
  onRecommendChange
}: FeedFiltersProps) {
  return (
    <div className="bg-white rounded-3xl shadow-soft border border-gray-100 p-4 sm:p-6">
      <div className="flex items-center gap-2 mb-4">
        <Filter className="h-4 w-4 sm:h-5 sm:w-5 text-gray-600" />
        <h3 className="text-base sm:text-lg font-bold text-gray-900">필터</h3>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        {/* Species Filter */}
        <div className="min-w-[120px] sm:min-w-0">
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2.5">
            반려동물
          </label>
          <select
            value={selectedSpecies}
            onChange={(e) => onSpeciesChange(e.target.value as 'all' | 'dog' | 'cat')}
            className="w-full px-3 sm:px-3 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm sm:text-base"
          >
            <option value="all">전체</option>
            <option value="dog">🐕 강아지</option>
            <option value="cat">🐱 고양이</option>
          </select>
        </div>

        {/* Category Filter */}
        <div className="min-w-[120px] sm:min-w-0">
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2.5">
            제품군
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onCategoryChange(e.target.value as typeof selectedCategory)}
            className="w-full px-3 sm:px-3 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm sm:text-base"
          >
            <option value="all">전체</option>
            <option value="feed">🍽️ 사료</option>
            <option value="snack">🦴 간식</option>
            <option value="supplement">💊 영양제</option>
            <option value="toilet">🚽 화장실</option>
          </select>
        </div>

        {/* Status Filter */}
        <div className="min-w-[120px] sm:min-w-0">
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2.5">
            상태
          </label>
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange(e.target.value as typeof selectedStatus)}
            className="w-full px-3 sm:px-3 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm sm:text-base"
          >
            <option value="all">전체</option>
            <option value="feeding">급여 중</option>
            <option value="paused">급여 중지</option>
            <option value="completed">급여 완료</option>
          </select>
        </div>

        {/* Rating Filter */}
        <div className="min-w-[120px] sm:min-w-0">
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2.5">
            평점
          </label>
          <select
            value={selectedRating}
            onChange={(e) => onRatingChange(Number(e.target.value))}
            className="w-full px-3 sm:px-3 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm sm:text-base"
          >
            <option value={0}>전체</option>
            <option value={5}>5점</option>
            <option value={4}>4점 이상</option>
            <option value={3}>3점 이상</option>
          </select>
        </div>

        {/* Recommend Filter */}
        <div className="min-w-[120px] sm:min-w-0">
          <label className="block text-sm sm:text-base font-medium text-gray-700 mb-2.5">
            추천
          </label>
          <select
            value={selectedRecommend}
            onChange={(e) => onRecommendChange(e.target.value as typeof selectedRecommend)}
            className="w-full px-3 sm:px-3 py-3 sm:py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-sm sm:text-base"
          >
            <option value="all">전체</option>
            <option value="recommended">추천</option>
            <option value="not-recommended">비추천</option>
          </select>
        </div>
      </div>
    </div>
  )
}
