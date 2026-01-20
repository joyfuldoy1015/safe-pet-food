'use client'

import { Shield, FileText, Users, AlertCircle, BookOpen } from 'lucide-react'

interface GradeCredibilityProps {
  credibility: {
    ingredient_disclosure: number
    standard_compliance: number
    consumer_rating: number
    recall_response: number
    research_backing: number
  }
}

const criteriaInfo = [
  {
    key: 'ingredient_disclosure',
    label: '원료 공개도',
    icon: FileText,
    description: '원료 원산지 및 정보 공개'
  },
  {
    key: 'standard_compliance',
    label: '기준 충족도',
    icon: Shield,
    description: 'AAFCO, FDA 등 기준'
  },
  {
    key: 'consumer_rating',
    label: '소비자 평가',
    icon: Users,
    description: '실사용자 만족도'
  },
  {
    key: 'recall_response',
    label: '리콜 대응',
    icon: AlertCircle,
    description: '리콜 이력 및 대응'
  },
  {
    key: 'research_backing',
    label: '근거/연구',
    icon: BookOpen,
    description: '과학적 연구 데이터'
  }
]

export default function GradeCredibility({ credibility }: GradeCredibilityProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
          <Shield className="h-3.5 w-3.5 text-gray-600" />
        </span>
        등급 산정 근거
      </h3>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {criteriaInfo.map((criteria) => {
          const Icon = criteria.icon
          const score = credibility[criteria.key as keyof typeof credibility]
          const percentage = Math.round(score)
          const isHigh = percentage >= 80
          const isMedium = percentage >= 60 && percentage < 80

          return (
            <div
              key={criteria.key}
              className="bg-gray-50 rounded-xl p-3 text-center"
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 ${
                isHigh ? 'bg-green-100' : isMedium ? 'bg-yellow-100' : 'bg-gray-100'
              }`}>
                <Icon className={`h-4 w-4 ${
                  isHigh ? 'text-green-500' : isMedium ? 'text-yellow-500' : 'text-gray-400'
                }`} />
              </div>
              
              <div className={`text-lg font-bold mb-0.5 ${
                isHigh ? 'text-green-600' : isMedium ? 'text-yellow-600' : 'text-gray-500'
              }`}>
                {percentage}
              </div>

              <div className="w-full bg-gray-200 rounded-full h-1 mb-1.5">
                <div
                  className={`h-1 rounded-full transition-all duration-500 ${
                    isHigh ? 'bg-green-500' : isMedium ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="text-[10px] text-gray-500 font-medium">{criteria.label}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-4 p-3 bg-violet-50 rounded-xl">
        <p className="text-xs text-gray-600">
          <span className="font-medium text-violet-600">평가 방식:</span> 각 항목은 동일 카테고리 제품들과의 비교를 통해 산정됩니다.
        </p>
      </div>
    </div>
  )
}
