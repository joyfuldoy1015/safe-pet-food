'use client'

import Link from 'next/link'
import { Shield, ChevronRight } from 'lucide-react'

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
    case 'A': return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200', label: 'A' }
    case 'B': return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'B' }
    case 'C': return { bg: 'bg-yellow-100', text: 'text-yellow-700', border: 'border-yellow-200', label: 'C' }
    case 'D': return { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'D' }
    case 'F': return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200', label: 'F' }
    default: return { bg: 'bg-gray-100', text: 'text-gray-500', border: 'border-gray-200', label: '-' }
  }
}

export default function ProductSearchResult({ product }: ProductSearchResultProps) {
  const gradeStyle = getGradeStyle(product.grade)
  
  return (
    <Link
      href={`/products/${product.id}`}
      className="block bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all duration-200 group"
    >
      <div className="flex items-center gap-4">
        {/* 등급 배지 */}
        <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${gradeStyle.bg} ${gradeStyle.text} border ${gradeStyle.border}`}>
          {gradeStyle.label}
        </div>

        {/* 제품 정보 */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-violet-600 transition-colors">
              {product.name}
            </h3>
          </div>

          {/* 브랜드명 */}
          {product.brand_name && (
            <p className="text-xs text-gray-500 mb-1">{product.brand_name}</p>
          )}

          {/* 설명 */}
          {product.description && (
            <p className="text-xs text-gray-500 line-clamp-1">
              {product.description}
            </p>
          )}

          {/* 인증 */}
          {product.certifications && product.certifications.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2">
              {product.certifications.slice(0, 2).map((cert, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-0.5 bg-green-50 text-green-600 text-[10px] rounded-full"
                >
                  <Shield className="h-2.5 w-2.5 mr-0.5" />
                  {cert}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 화살표 */}
        <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-violet-400 transition-colors flex-shrink-0" />
      </div>
    </Link>
  )
}
