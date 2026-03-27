'use client'

import { useState } from 'react'
import { Eye, EyeOff, Minus, ChevronDown, ChevronUp } from 'lucide-react'
import type { Brand } from './types'

export const getTransparencyColor = (score: number) => {
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  return 'text-red-600'
}

export const getTransparencyBgColor = (score: number) => {
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  return 'bg-red-500'
}

export const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'high': return 'text-red-600 bg-red-50'
    case 'medium': return 'text-yellow-600 bg-yellow-50'
    case 'low': return 'text-green-600 bg-green-50'
    default: return 'text-gray-600 bg-gray-50'
  }
}

export const getDisclosureIcon = (level: string) => {
  switch (level) {
    case 'full': return <Eye className="h-4 w-4 text-green-500" />
    case 'partial': return <Minus className="h-4 w-4 text-yellow-500" />
    case 'none': return <EyeOff className="h-4 w-4 text-red-500" />
    default: return <Minus className="h-4 w-4 text-gray-400" />
  }
}

export default function IngredientTransparencySection({ brand }: { brand: Brand }) {
  const [showIngredients, setShowIngredients] = useState(false)
  const [showCriteria, setShowCriteria] = useState(false)

  const hasIngredients = brand.ingredients && brand.ingredients.length > 0

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-blue-50 flex items-center justify-center text-xs">🔍</span>
        원료 투명성 점수
        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-normal">자동 산정</span>
      </h2>
      {brand.representative_product && (
        <p className="text-xs text-gray-500 mb-4 ml-9">
          대표 제품 <span className="font-medium text-gray-700">{brand.representative_product}</span> 기준
        </p>
      )}
      {!brand.representative_product && (
        <p className="text-xs text-gray-400 mb-4 ml-9">
          해당 브랜드의 대표 사료를 기준으로 원료 공개 수준을 평가한 점수입니다.
        </p>
      )}

      <div className="flex items-center gap-6">
        <div className="text-center flex-shrink-0">
          <div className={`text-3xl font-bold ${getTransparencyColor(brand.transparency_score)} mb-1`}>
            {brand.transparency_score}
          </div>
          <p className="text-xs text-gray-500">/ 100</p>
        </div>

        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-green-50 flex items-center justify-center">
                <Eye className="h-3 w-3 text-green-500" />
              </span>
              <span className="text-xs text-gray-600">완전 공개</span>
            </div>
            <span className="text-xs font-semibold text-green-600">
              {brand.ingredient_disclosure.fully_disclosed}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-yellow-50 flex items-center justify-center">
                <Minus className="h-3 w-3 text-yellow-500" />
              </span>
              <span className="text-xs text-gray-600">부분 공개</span>
            </div>
            <span className="text-xs font-semibold text-yellow-600">
              {brand.ingredient_disclosure.partially_disclosed}%
            </span>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center">
                <EyeOff className="h-3 w-3 text-red-500" />
              </span>
              <span className="text-xs text-gray-600">미공개</span>
            </div>
            <span className="text-xs font-semibold text-red-600">
              {brand.ingredient_disclosure.not_disclosed}%
            </span>
          </div>
        </div>
      </div>

      {/* 원료 목록 토글 */}
      {hasIngredients && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <button
            onClick={() => setShowIngredients(!showIngredients)}
            className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            {showIngredients ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            원료 목록 보기 ({brand.ingredients.length}개)
          </button>

          {showIngredients && (
            <div className="mt-3 space-y-1.5">
              {brand.ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center justify-between py-1.5 px-2 rounded-lg hover:bg-gray-50">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className={`flex-shrink-0 w-2 h-2 rounded-full ${
                      ing.disclosure_level === 'full' ? 'bg-green-400' :
                      ing.disclosure_level === 'partial' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <span className="text-xs text-gray-700 truncate">{ing.name}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                    {ing.percentage && (
                      <span className="text-[10px] text-gray-400">{ing.percentage}%</span>
                    )}
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      ing.disclosure_level === 'full' ? 'bg-green-50 text-green-600' :
                      ing.disclosure_level === 'partial' ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {ing.disclosure_level === 'full' ? '완전 공개' :
                       ing.disclosure_level === 'partial' ? '부분 공개' : '미공개'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 판단 기준 토글 */}
      <div className={`${hasIngredients ? 'mt-3' : 'mt-4'} ${hasIngredients ? '' : 'pt-4 border-t border-gray-100'}`}>
        <button
          onClick={() => setShowCriteria(!showCriteria)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          {showCriteria ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
          판단 기준 보기
        </button>

        {showCriteria && (
          <div className="mt-2 p-3 bg-gray-50 rounded-xl text-xs text-gray-600 space-y-2">
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-green-400 mt-1" />
              <div>
                <span className="font-medium text-gray-700">완전 공개</span>
                <span className="text-green-500 ml-1 text-[10px]">100점</span>
                <span className="mx-1">—</span>
                구체적 원료명 + 원산지 등 추가 정보 표기
                <span className="text-gray-400 ml-1">예: &quot;닭고기(국내산)&quot;</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-yellow-400 mt-1" />
              <div>
                <span className="font-medium text-gray-700">부분 공개</span>
                <span className="text-yellow-500 ml-1 text-[10px]">80점</span>
                <span className="mx-1">—</span>
                구체적 원료명만 표기
                <span className="text-gray-400 ml-1">예: &quot;닭고기&quot;, &quot;현미&quot;</span>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-400 mt-1" />
              <div>
                <span className="font-medium text-gray-700">미공개</span>
                <span className="text-red-500 ml-1 text-[10px]">0점</span>
                <span className="mx-1">—</span>
                모호하거나 포괄적 표현
                <span className="text-gray-400 ml-1">예: &quot;가금류 부산물&quot;, &quot;동물성 유지&quot;</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
