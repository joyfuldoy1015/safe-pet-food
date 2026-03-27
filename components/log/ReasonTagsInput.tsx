'use client'

import React from 'react'
import { X } from 'lucide-react'

interface ReasonTagsInputProps {
  label: string
  reasons: string[]
  inputValue: string
  setInputValue: (v: string) => void
  onAdd: () => void
  onRemove: (reason: string) => void
  maxCount: number
  placeholder: string
  tagColor: 'emerald' | 'rose'
}

const TAG_STYLES = {
  emerald: {
    tag: 'bg-emerald-50 text-emerald-700',
    hover: 'hover:text-emerald-900'
  },
  rose: {
    tag: 'bg-rose-50 text-rose-700',
    hover: 'hover:text-rose-900'
  }
} as const

export default function ReasonTagsInput({
  label,
  reasons,
  inputValue,
  setInputValue,
  onAdd,
  onRemove,
  maxCount,
  placeholder,
  tagColor
}: ReasonTagsInputProps) {
  const styles = TAG_STYLES[tagColor]

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex gap-2 mb-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              onAdd()
            }
          }}
          disabled={reasons.length >= maxCount}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base disabled:bg-gray-100 disabled:cursor-not-allowed"
          placeholder={placeholder}
        />
        <button
          type="button"
          onClick={onAdd}
          disabled={reasons.length >= maxCount}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          추가
        </button>
      </div>
      {reasons.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {reasons.map((reason) => (
            <span
              key={reason}
              className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs ${styles.tag}`}
            >
              {reason}
              <button
                type="button"
                onClick={() => onRemove(reason)}
                className={styles.hover}
                aria-label={`${reason} 제거`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
