'use client'

import Link from 'next/link'
import { Shield } from 'lucide-react'

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
  }
}

const getGradeStyle = (grade?: string) => {
  switch (grade) {
    case 'A': return { bg: 'bg-green-500', text: 'text-white', label: 'A등급' }
    case 'B': return { bg: 'bg-blue-500', text: 'text-white', label: 'B등급' }
    case 'C': return { bg: 'bg-yellow-500', text: 'text-white', label: 'C등급' }
    case 'D': return { bg: 'bg-orange-500', text: 'text-white', label: 'D등급' }
    case 'F': return { bg: 'bg-red-500', text: 'text-white', label: 'F등급' }
    default: return { bg: 'bg-gray-400', text: 'text-white', label: '미평가' }
  }
}

export default function ProductSearchResult({ product }: ProductSearchResultProps) {
  const gradeStyle = getGradeStyle(product.grade)
  
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

        {/* 등급 배지 */}
        <div className={`flex-shrink-0 px-3 py-1.5 rounded-lg font-bold text-sm ${gradeStyle.bg} ${gradeStyle.text}`}>
          {gradeStyle.label}
        </div>
      </div>
    </Link>
  )
}
