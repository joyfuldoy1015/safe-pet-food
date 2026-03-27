'use client'

import React from 'react'

interface ScoreGridProps {
  label: string
  value: number | null | undefined
  onChange: (value: number | null) => void
  descriptions: string[]
  activeColor?: 'violet' | 'blue'
}

export default function ScoreGrid({
  label,
  value,
  onChange,
  descriptions,
  activeColor = 'violet'
}: ScoreGridProps) {
  const colorClasses = activeColor === 'violet'
    ? 'border-violet-500 bg-violet-50 text-violet-700'
    : 'border-blue-500 bg-blue-50 text-blue-700'

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="grid grid-cols-5 gap-2">
        {[1, 2, 3, 4, 5].map((score) => (
          <button
            key={score}
            type="button"
            onClick={() => onChange(value === score ? null : score)}
            className={`px-2 py-2.5 rounded-xl border-2 transition-colors text-center ${
              value === score
                ? colorClasses
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            <div className="text-sm font-semibold">{score}점</div>
            <div className="text-[10px] text-gray-500 mt-0.5 whitespace-nowrap">
              {descriptions[score - 1]}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
