'use client'

import React, { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown } from 'lucide-react'

type SortOption = 'recent' | 'popular' | 'rating'

interface FeedFiltersProps {
  selectedSpecies: 'all' | 'dog' | 'cat'
  sortOption: SortOption
  searchQuery: string
  onSpeciesChange: (value: 'all' | 'dog' | 'cat') => void
  onSortChange: (value: SortOption) => void
  onSearchChange: (value: string) => void
}

const speciesOptions = [
  { value: 'all', label: '전체' },
  { value: 'dog', label: '강아지' },
  { value: 'cat', label: '고양이' }
] as const

const sortOptions = [
  { value: 'recent', label: '최신순' },
  { value: 'popular', label: '인기순' },
  { value: 'rating', label: '평점순' }
] as const

interface CustomDropdownProps {
  value: string
  options: readonly { value: string; label: string }[]
  onChange: (value: string) => void
  className?: string
}

function CustomDropdown({ value, options, onChange, className = '' }: CustomDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  const selectedOption = options.find(opt => opt.value === value)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div ref={dropdownRef} className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg bg-white text-sm flex items-center justify-between focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5]"
      >
        <span>{selectedOption?.label}</span>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 overflow-hidden">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full px-3 py-2.5 text-left text-sm hover:bg-gray-50 transition-colors ${
                value === option.value ? 'bg-blue-50 text-blue-600 font-medium' : 'text-gray-700'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
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
        <CustomDropdown
          value={selectedSpecies}
          options={speciesOptions}
          onChange={(value) => onSpeciesChange(value as 'all' | 'dog' | 'cat')}
          className="w-full sm:w-32"
        />

        {/* Sort Filter */}
        <CustomDropdown
          value={sortOption}
          options={sortOptions}
          onChange={(value) => onSortChange(value as SortOption)}
          className="w-full sm:w-32"
        />
      </div>
    </div>
  )
}
