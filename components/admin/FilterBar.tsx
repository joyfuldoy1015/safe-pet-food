'use client'

import React from 'react'
import { X } from 'lucide-react'

interface FilterChip {
  key: string
  label: string
  value: string
}

interface FilterBarProps {
  chips: FilterChip[]
  onRemoveChip: (key: string) => void
  onClearAll?: () => void
  children?: React.ReactNode
}

export default function FilterBar({
  chips,
  onRemoveChip,
  onClearAll,
  children
}: FilterBarProps) {
  if (chips.length === 0 && !children) {
    return null
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        {chips.map((chip) => (
          <div
            key={chip.key}
            className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg text-sm border border-blue-200"
          >
            <span className="font-medium">{chip.label}:</span>
            <span>{chip.value}</span>
            <button
              onClick={() => onRemoveChip(chip.key)}
              className="hover:bg-blue-100 rounded p-0.5 transition-colors"
              aria-label={`Remove ${chip.label} filter`}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        ))}
        {chips.length > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            className="text-sm text-gray-600 hover:text-gray-900 px-2 py-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            모두 지우기
          </button>
        )}
        {children}
      </div>
    </div>
  )
}


