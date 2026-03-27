'use client'

import { useState } from 'react'
import { Shield, ChevronDown, ChevronUp, CheckCircle, AlertCircle, MinusCircle } from 'lucide-react'
import type { AutoGradeResult, GradeBreakdownItem } from '@/lib/auto-grade-calculator'

interface GradeCredibilityProps {
  autoGrade: AutoGradeResult
}

function getScoreColor(score: number | null): string {
  if (score === null) return 'text-gray-400'
  if (score >= 80) return 'text-green-600'
  if (score >= 60) return 'text-yellow-600'
  if (score >= 40) return 'text-orange-600'
  return 'text-red-600'
}

function getScoreBarColor(score: number | null): string {
  if (score === null) return 'bg-gray-200'
  if (score >= 80) return 'bg-green-500'
  if (score >= 60) return 'bg-yellow-500'
  if (score >= 40) return 'bg-orange-500'
  return 'bg-red-500'
}

function getGradeColor(grade: string): string {
  switch (grade) {
    case 'S': return 'text-violet-600 bg-violet-50 border-violet-200'
    case 'A': return 'text-green-600 bg-green-50 border-green-200'
    case 'B': return 'text-blue-600 bg-blue-50 border-blue-200'
    case 'C': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    case 'D': return 'text-orange-600 bg-orange-50 border-orange-200'
    default: return 'text-red-600 bg-red-50 border-red-200'
  }
}

function ScoreIcon({ item }: { item: GradeBreakdownItem }) {
  if (item.source === 'insufficient_data') return <MinusCircle className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
  if (item.score !== null && item.score >= 70) return <CheckCircle className="h-3.5 w-3.5 text-green-500 flex-shrink-0" />
  return <AlertCircle className="h-3.5 w-3.5 text-orange-500 flex-shrink-0" />
}

export default function GradeCredibility({ autoGrade }: GradeCredibilityProps) {
  const [showBreakdown, setShowBreakdown] = useState(false)
  const hasGrade = autoGrade.evaluatedCount >= 2

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
          <Shield className="h-3.5 w-3.5 text-gray-600" />
        </span>
        등급 산정 근거
        <span className="px-1.5 py-0.5 bg-gray-100 text-gray-500 text-[10px] rounded-full font-normal">자동 산정</span>
      </h3>

      {hasGrade ? (
        <>
          {/* 종합 점수 */}
          <div className="flex items-center gap-3 mb-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border ${getGradeColor(autoGrade.grade)}`}>
              {autoGrade.grade}
            </div>
            <div>
              <div className="text-sm font-semibold text-gray-900">
                {autoGrade.gradeText} · {autoGrade.totalScore}점
              </div>
              <div className="text-xs text-gray-500">
                {autoGrade.evaluatedCount}/{autoGrade.totalCriteria}개 항목 평가 완료
              </div>
            </div>
          </div>

          {/* 항목별 요약 바 */}
          <div className="space-y-2.5 mb-4">
            {autoGrade.breakdown.map((item, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    <ScoreIcon item={item} />
                    <span className="text-xs text-gray-700">{item.criterion}</span>
                    <span className="text-[10px] text-gray-400">({item.weight}%)</span>
                  </div>
                  <span className={`text-xs font-medium ${getScoreColor(item.score)}`}>
                    {item.score !== null ? `${item.score}점` : '데이터 부족'}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${getScoreBarColor(item.score)}`}
                    style={{ width: `${item.score ?? 0}%` }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* 상세 근거 토글 */}
          <button
            onClick={() => setShowBreakdown(!showBreakdown)}
            className="w-full flex items-center justify-center gap-1 py-2 text-xs text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showBreakdown ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            산정 근거 상세 보기
          </button>

          {showBreakdown && (
            <div className="mt-2 space-y-3">
              {autoGrade.breakdown.map((item, idx) => (
                <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-800">{item.criterion}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                      item.source === 'auto'
                        ? 'bg-blue-50 text-blue-600 border border-blue-200'
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                    }`}>
                      {item.source === 'auto' ? '자동 산정' : '데이터 부족'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">{item.detail}</p>
                </div>
              ))}

              {/* 등급 기준 안내 */}
              <div className="p-3 bg-violet-50 rounded-xl">
                <p className="text-xs text-gray-600 mb-2">
                  <span className="font-medium text-violet-600">등급 기준: </span>
                  평가 가능한 항목의 가중 평균으로 산정
                </p>
                <div className="grid grid-cols-3 gap-1 text-[10px] text-gray-500">
                  <span>S: 90점+</span>
                  <span>A: 80점+</span>
                  <span>B: 70점+</span>
                  <span>C: 60점+</span>
                  <span>D: 50점+</span>
                  <span>F: 50점 미만</span>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-xs text-gray-500 mb-2">
            아직 등급을 산정하기에 데이터가 부족합니다.
          </p>
          <p className="text-[10px] text-gray-400">
            평가 가능 항목: {autoGrade.evaluatedCount}/{autoGrade.totalCriteria}개
            {autoGrade.evaluatedCount > 0 && ' (최소 2개 필요)'}
          </p>
          {autoGrade.breakdown.filter(b => b.source === 'insufficient_data').length > 0 && (
            <div className="mt-3 space-y-1">
              {autoGrade.breakdown.filter(b => b.source === 'insufficient_data').map((item, idx) => (
                <p key={idx} className="text-[10px] text-gray-400">
                  · {item.criterion}: {item.detail}
                </p>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
