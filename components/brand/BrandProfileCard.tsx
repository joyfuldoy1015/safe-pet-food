import { Globe, Calendar, Factory, AlertTriangle, CheckCircle } from 'lucide-react'
import { getSeverityColor } from './IngredientTransparencySection'
import type { Brand } from './types'

interface BrandProfileCardProps {
  brand: Brand
}

export default function BrandProfileCard({ brand }: BrandProfileCardProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-4">
      {/* 브랜드 헤더 */}
      <div className="flex items-center gap-4 mb-6 pb-5 border-b border-gray-100">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center text-3xl">
          {brand.logo}
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-900">{brand.name}</h1>
          <p className="text-sm text-gray-500">{brand.manufacturer}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-3 mb-5">
        {/* 제조국 */}
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-2">
            <Globe className="h-4 w-4 text-blue-500" />
          </div>
          <p className="text-xs text-gray-500 mb-0.5">원산지</p>
          <p className="text-sm font-semibold text-gray-900">{brand.country_of_origin}</p>
        </div>

        {/* 설립연도 */}
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-2">
            <Calendar className="h-4 w-4 text-green-500" />
          </div>
          <p className="text-xs text-gray-500 mb-0.5">설립연도</p>
          <p className="text-sm font-semibold text-gray-900">{brand.established_year}년</p>
        </div>

        {/* 제조 공장 */}
        <div className="text-center p-3 bg-gray-50 rounded-xl">
          <div className="w-9 h-9 rounded-full bg-purple-50 flex items-center justify-center mx-auto mb-2">
            <Factory className="h-4 w-4 text-purple-500" />
          </div>
          <p className="text-xs text-gray-500 mb-0.5">제조 공장</p>
          <p className="text-sm font-semibold text-gray-900">{brand.manufacturing_locations.length}개 지역</p>
        </div>
      </div>

      {/* 브랜드 정보 */}
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center text-xs">📖</span>
          {brand.name}에 대해서
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{brand.brand_description}</p>
      </div>

      {/* 제조 및 소싱 정보 */}
      <div className="mb-5 pt-5 border-t border-gray-100">
        <h3 className="text-sm font-semibold text-gray-900 mb-2 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-purple-50 flex items-center justify-center text-xs">🏭</span>
          제조 및 소싱에 대해서
        </h3>
        <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">{brand.manufacturing_info}</p>
      </div>

      {/* 리콜 이력 */}
      {brand.recall_history.length > 0 && (
        <div className="pt-5 border-t border-gray-100">
          <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-orange-50 flex items-center justify-center text-xs">⚠️</span>
            리콜 이력
          </h3>
          <div className="space-y-2">
            {brand.recall_history.map((recall, index) => (
              <div key={index} className={`p-3 rounded-xl text-sm ${getSeverityColor(recall.severity)}`}>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-medium">{recall.reason}</span>
                    <div className="flex items-center justify-end gap-2 mt-1.5">
                      <span className="text-xs text-gray-500">{recall.date}</span>
                      {recall.resolved && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">해결 완료</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
