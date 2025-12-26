'use client'

import { Star } from 'lucide-react'

interface RatingInputProps {
  label: string
  value: number | null
  onChange: (value: number) => void
  description?: string
  size?: 'sm' | 'md' | 'lg'
}

export default function RatingInput({
  label,
  value,
  onChange,
  description,
  size = 'md'
}: RatingInputProps) {
  const stars = [1, 2, 3, 4, 5]
  
  const sizeClasses = {
    sm: 'h-5 w-5',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }
  
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-gray-700">
          {label}
        </label>
        {value !== null && (
          <span className="text-sm font-semibold text-blue-600">
            {value}.0
          </span>
        )}
      </div>
      
      {description && (
        <p className="text-xs text-gray-500">{description}</p>
      )}
      
      <div className="flex items-center gap-2">
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded"
          >
            <Star
              className={`${sizeClasses[size]} ${
                value && star <= value
                  ? 'text-yellow-400 fill-current'
                  : 'text-gray-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  )
}
