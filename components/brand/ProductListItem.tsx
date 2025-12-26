'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ThumbsUp, ThumbsDown, Shield, Info, Star } from 'lucide-react'

interface ProductListItemProps {
  product: {
    id: string
    name: string
    description?: string
    grade?: string
    grade_text?: string
    certifications?: string[]
    consumer_ratings?: {
      palatability?: number
      digestibility?: number
      coat_quality?: number
      stool_quality?: number
      overall_satisfaction?: number
    }
    community_feedback?: {
      recommend_yes: number
      recommend_no: number
      total_votes: number
    }
  }
}

// 등급 색상
const getGradeColor = (grade?: string) => {
  switch (grade) {
    case 'A': return 'bg-green-100 text-green-800 border-green-300'
    case 'B': return 'bg-blue-100 text-blue-800 border-blue-300'
    case 'C': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
    case 'D': return 'bg-orange-100 text-orange-800 border-orange-300'
    case 'F': return 'bg-red-100 text-red-800 border-red-300'
    default: return 'bg-gray-100 text-gray-800 border-gray-300'
  }
}

// 등급 정보 툴팁
function GradeInfoTooltip({ grade }: { grade?: string }) {
  const [showTooltip, setShowTooltip] = useState(false)

  const gradeInfo = {
    A: '5개 평가 항목 모두 80점 이상 우수',
    B: '대부분 항목이 70점 이상 양호',
    C: '일부 항목에서 개선 필요',
    D: '여러 항목에서 보완 필요',
    F: '안전성 검토 권장'
  }

  return (
    <div className="relative inline-block">
      <button
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
          setShowTooltip(!showTooltip)
        }}
        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
      >
        <Info className="h-4 w-4 text-gray-500" />
      </button>

      {showTooltip && (
        <div className="absolute z-50 left-0 top-full mt-2 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-3 text-xs">
          <div className="font-semibold text-gray-900 mb-2">등급 산정 항목</div>
          <ul className="space-y-1 text-gray-600">
            <li>• 원료 공개도</li>
            <li>• 기준 충족도</li>
            <li>• 소비자 평가</li>
            <li>• 리콜 대응</li>
            <li>• 근거/연구</li>
          </ul>
          {grade && (
            <div className="mt-2 pt-2 border-t border-gray-100 text-gray-700">
              {gradeInfo[grade as keyof typeof gradeInfo] || '평가 진행 중'}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ProductListItem({ product }: ProductListItemProps) {
  const recommendRate = product.community_feedback && product.community_feedback.total_votes > 0
    ? Math.round((product.community_feedback.recommend_yes / product.community_feedback.total_votes) * 100)
    : 0

  // 핵심 태그 생성 (최대 3개)
  const tags: string[] = []
  if (product.certifications && product.certifications.length > 0) {
    tags.push(...product.certifications.slice(0, 2))
  }
  if (product.grade === 'A') tags.unshift('프리미엄')
  
  return (
    <Link 
      href={`/products/${product.id}`}
      className="block bg-white border border-gray-200 rounded-xl p-4 hover:shadow-lg hover:border-blue-300 transition-all duration-200"
    >
      <div className="flex flex-col sm:flex-row gap-4">
        {/* 왼쪽: 제품명 & 등급 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 mb-2 truncate">
            {product.name}
          </h3>

          {/* 1. 등급 */}
          {product.grade && (
            <div className="flex items-center gap-2 mb-3">
              <div className={`inline-flex items-center px-3 py-1 rounded-lg border font-bold text-sm ${getGradeColor(product.grade)}`}>
                {product.grade} {product.grade_text}
              </div>
              <GradeInfoTooltip grade={product.grade} />
            </div>
          )}

          {/* 2. 추천/비추천 */}
          {product.community_feedback && (
            <div className="flex items-center gap-4 mb-3">
              <div className="flex items-center gap-1">
                <ThumbsUp className="h-4 w-4 text-green-600" />
                <span className="text-sm font-medium text-green-600">
                  {product.community_feedback.recommend_yes}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <ThumbsDown className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">
                  {product.community_feedback.recommend_no}
                </span>
              </div>
              <span className="text-sm text-gray-600">
                추천률 <span className="font-semibold text-blue-600">{recommendRate}%</span>
              </span>
            </div>
          )}

          {/* 3. 핵심 태그 */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {tags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 오른쪽: 소비자 평가 & 인증 */}
        <div className="flex-shrink-0 sm:w-40 flex flex-row sm:flex-col justify-between sm:justify-start gap-3">
          {/* 4. 소비자 평가 요약 (기호성/소화력) */}
          {product.consumer_ratings && (
            <div className="flex-1 sm:flex-none">
              <div className="text-xs text-gray-600 mb-1">소비자 평가</div>
              <div className="space-y-1">
                {product.consumer_ratings.palatability !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600">기호성</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= (product.consumer_ratings?.palatability || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
                {product.consumer_ratings.digestibility !== undefined && (
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-600">소화력</span>
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-3 w-3 ${
                            star <= (product.consumer_ratings?.digestibility || 0)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* 5. 대표 인증 (최대 2개) */}
          {product.certifications && product.certifications.length > 0 && (
            <div className="flex-1 sm:flex-none">
              <div className="text-xs text-gray-600 mb-1">인증</div>
              <div className="space-y-1">
                {product.certifications.slice(0, 2).map((cert, idx) => (
                  <div key={idx} className="flex items-center gap-1">
                    <Shield className="h-3 w-3 text-green-500" />
                    <span className="text-xs text-gray-700">{cert}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 설명 (선택) */}
      {product.description && (
        <p className="mt-3 text-sm text-gray-600 line-clamp-1">
          {product.description}
        </p>
      )}
    </Link>
  )
}
