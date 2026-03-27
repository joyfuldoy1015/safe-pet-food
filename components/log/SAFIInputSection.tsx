'use client'

import React from 'react'
import { X } from 'lucide-react'
import ScoreGrid from '@/components/log/ScoreGrid'

interface SAFIInputSectionProps {
  stoolScore: number | null | undefined
  onStoolScoreChange: (v: number | null) => void
  appetiteChange: string | null | undefined
  onAppetiteChange: (v: string | null) => void
  vomiting: boolean | null | undefined
  onVomitingChange: (v: boolean | null) => void
  allergySymptoms: string[]
  allergyInput: string
  setAllergyInput: (v: string) => void
  onAddAllergy: () => void
  onRemoveAllergy: (symptom: string) => void
}

export default function SAFIInputSection({
  stoolScore,
  onStoolScoreChange,
  appetiteChange,
  onAppetiteChange,
  vomiting,
  onVomitingChange,
  allergySymptoms,
  allergyInput,
  setAllergyInput,
  onAddAllergy,
  onRemoveAllergy
}: SAFIInputSectionProps) {
  return (
    <>
      {/* SAFI 안전성 평가 */}
      <div className="pt-2 pb-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-sm font-semibold text-gray-900">안전성 평가 (SAFI)</span>
          <span className="px-2 py-0.5 bg-blue-50 text-blue-600 text-[10px] font-medium rounded-full">선택</span>
        </div>
        <p className="text-xs text-gray-500">급여 중 관찰한 반응을 기록하면 브랜드 안전성 점수에 반영됩니다</p>
      </div>

      {/* Stool Score */}
      <ScoreGrid
        label="변 상태 점수"
        value={stoolScore}
        onChange={onStoolScoreChange}
        descriptions={['나쁨', '아쉬움', '보통', '좋음', '최고']}
        activeColor="blue"
      />

      {/* Appetite Change */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          식욕 변화
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { value: 'INCREASED', label: '증가', emoji: '📈' },
            { value: 'NORMAL', label: '정상', emoji: '✅' },
            { value: 'DECREASED', label: '감소', emoji: '📉' },
            { value: 'REFUSED', label: '거부', emoji: '❌' }
          ].map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onAppetiteChange(appetiteChange === option.value ? null : option.value)}
              className={`px-3 py-2.5 rounded-xl border-2 transition-colors text-sm ${
                appetiteChange === option.value
                  ? 'border-blue-500 bg-blue-50 text-blue-700'
                  : 'border-gray-300 text-gray-700 hover:border-gray-400'
              }`}
            >
              <span className="text-base">{option.emoji}</span>
              <div className="mt-0.5 font-medium text-xs">{option.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Vomiting */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          구토 발생 여부
        </label>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onVomitingChange(vomiting === true ? null : true)}
            className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-colors text-sm ${
              vomiting === true
                ? 'border-red-500 bg-red-50 text-red-700'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            🤢 발생함
          </button>
          <button
            type="button"
            onClick={() => onVomitingChange(vomiting === false ? null : false)}
            className={`flex-1 px-4 py-2.5 rounded-xl border-2 transition-colors text-sm ${
              vomiting === false
                ? 'border-green-500 bg-green-50 text-green-700'
                : 'border-gray-300 text-gray-700 hover:border-gray-400'
            }`}
          >
            ✅ 발생 안 함
          </button>
        </div>
      </div>

      {/* Allergy Symptoms */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          알레르기 증상
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={allergyInput}
            onChange={(e) => setAllergyInput(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                onAddAllergy()
              }
            }}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-[#3056F5] focus:border-[#3056F5] text-base"
            placeholder="예: 가려움, 발진, 눈물"
          />
          <button
            type="button"
            onClick={onAddAllergy}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors text-sm"
          >
            추가
          </button>
        </div>
        {allergySymptoms.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {allergySymptoms.map((symptom) => (
              <span
                key={symptom}
                className="inline-flex items-center gap-1 px-3 py-1 bg-orange-50 text-orange-700 rounded-full text-xs border border-orange-200"
              >
                {symptom}
                <button
                  type="button"
                  onClick={() => onRemoveAllergy(symptom)}
                  className="hover:text-orange-900"
                  aria-label={`${symptom} 제거`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
