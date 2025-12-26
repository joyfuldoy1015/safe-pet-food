'use client'

import Link from 'next/link'
import { Star, Shield } from 'lucide-react'

interface ProductSearchResultProps {
  product: {
    id: string
    name: string
    brand_id: string
    brand_name?: string
    description?: string
    grade?: string
    grade_text?: string
    certifications?: string[]
    consumer_ratings?: {
      palatability?: number
      overall_satisfaction?: number
    }
  }
}

const getGradeColor = (grade?: string) => {
  switch (grade) {
    case 'A': return 'bg-green-100 text-green-800 border-green-300'
    case 'B': return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

export default function ProductSearchResult({ product }: ProductSearchResultProps) {
  return (
    <Link
      href={`/products/${product.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md hover:border-blue-300 transition-all"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          {/* 제품명 */}
          <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
            {product.name}
          </h3>

          {/* 브랜드명 */}
          {product.brand_name && (
            <p className="text-sm text-gray-600 mb-2">{product.brand_name}</p>
          )}

          {/* 설명 */}
          {product.description && (
            <p className="text-sm text-gray-600 line-clamp-2 mb-3">
              {product.description}
            </p>
          )}

          {/* 인증 */}
          {product.certifications && product.certifications.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {product.certifications.slice(0, 2).map((cert, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs rounded-full"
                >
                  <Shield className="h-3 w-3 mr-1" />
                  {cert}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 등급 & 평점 */}
        <div className="flex flex-col items-end gap-2">
          {product.grade && (
            <div className={`px-3 py-1 rounded-lg border font-bold text-sm ${getGradeColor(product.grade)}`}>
              {product.grade}
            </div>
          )}

          {product.consumer_ratings?.overall_satisfaction && (
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="text-sm font-medium text-gray-700">
                {product.consumer_ratings.overall_satisfaction.toFixed(1)}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}
