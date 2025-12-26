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
    description: '원료의 원산지 및 상세 정보 공개 수준'
  },
  {
    key: 'standard_compliance',
    label: '기준 충족도',
    icon: Shield,
    description: 'AAFCO, FDA 등 국제 기준 충족 정도'
  },
  {
    key: 'consumer_rating',
    label: '소비자 평가',
    icon: Users,
    description: '실제 사용자들의 만족도 평가'
  },
  {
    key: 'recall_response',
    label: '리콜 대응',
    icon: AlertCircle,
    description: '과거 리콜 이력 및 대응 품질'
  },
  {
    key: 'research_backing',
    label: '근거/연구',
    icon: BookOpen,
    description: '과학적 연구 및 임상시험 데이터'
  }
]

export default function GradeCredibility({ credibility }: GradeCredibilityProps) {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8">
      <div className="mb-6">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">등급 산정 근거</h3>
        <p className="text-gray-600">
          이 제품의 등급은 다음 항목들을 종합적으로 평가하여 산정되었습니다.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {criteriaInfo.map((criteria) => {
          const Icon = criteria.icon
          const score = credibility[criteria.key as keyof typeof credibility]
          const percentage = Math.round(score)
          const isHigh = percentage >= 80
          const isMedium = percentage >= 60 && percentage < 80

          return (
            <div
              key={criteria.key}
              className="bg-gray-50 rounded-xl p-4 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                    isHigh ? 'bg-green-100' : isMedium ? 'bg-yellow-100' : 'bg-gray-100'
                  }`}>
                    <Icon className={`h-4 w-4 ${
                      isHigh ? 'text-green-600' : isMedium ? 'text-yellow-600' : 'text-gray-600'
                    }`} />
                  </div>
                  <h4 className="font-semibold text-gray-900">{criteria.label}</h4>
                </div>
                <span className={`text-lg font-bold ${
                  isHigh ? 'text-green-600' : isMedium ? 'text-yellow-600' : 'text-gray-600'
                }`}>
                  {percentage}%
                </span>
              </div>

              <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    isHigh ? 'bg-green-500' : isMedium ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              <p className="text-xs text-gray-600 mt-2">{criteria.description}</p>
            </div>
          )
        })}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-100">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">💡 평가 방식:</span> 각 항목은 업계 평균 대비 상대적 수준을 나타냅니다. 
          절대적 기준이 아닌, 동일 카테고리 제품들과의 비교를 통해 산정됩니다.
        </p>
      </div>
    </div>
  )
}
