'use client'

import { Shield, CheckCircle } from 'lucide-react'

interface GradeCredibilityProps {
  grade?: string
}

const criteriaList = [
  '주요 원료의 원산지 및 비율 공개 여부',
  'AAFCO, FDA 등 공인 기준 충족 여부',
  '과거 리콜 발생 여부 및 대응 수준',
  '보증분석치의 적정성 및 영양 균형',
]

export default function GradeCredibility({ grade }: GradeCredibilityProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
          <Shield className="h-3.5 w-3.5 text-gray-600" />
        </span>
        등급 산정 기준
      </h3>

      {grade ? (
        <>
          <p className="text-xs text-gray-600 mb-3">
            본 등급은 관리자가 아래 항목을 종합 평가하여 산정합니다.
          </p>
          <div className="space-y-2 mb-4">
            {criteriaList.map((item, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="h-3.5 w-3.5 text-violet-400 mt-0.5 flex-shrink-0" />
                <span className="text-xs text-gray-600">{item}</span>
              </div>
            ))}
          </div>
          <div className="p-3 bg-violet-50 rounded-xl">
            <p className="text-xs text-gray-500">
              <span className="font-medium text-violet-600">참고: </span>
              소비자 평가(기호성, 만족도 등)는 등급에 포함되지 않으며 별도로 표시됩니다.
            </p>
          </div>
        </>
      ) : (
        <div className="p-4 bg-gray-50 rounded-xl text-center">
          <p className="text-xs text-gray-500">
            아직 등급이 산정되지 않은 제품입니다.<br />
            충분한 정보가 확보되면 평가가 진행됩니다.
          </p>
        </div>
      )}
    </div>
  )
}
