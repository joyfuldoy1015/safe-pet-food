import { Star, ArrowLeft } from 'lucide-react'
import { FeedingRecord, ProductCategory, PetInfo, categoryConfig, statusConfig } from './types'

interface WriteStep3PreviewProps {
  petInfo: PetInfo
  feedingRecords: FeedingRecord[]
  onSubmit: () => void
  onPrev: () => void
}

export default function WriteStep3Preview({
  petInfo,
  feedingRecords,
  onSubmit,
  onPrev
}: WriteStep3PreviewProps) {
  const renderStars = (rating: number, onRate?: (rating: number) => void) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-5 w-5 cursor-pointer transition-colors ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300 hover:text-yellow-300'
        }`}
        onClick={() => onRate && onRate(i + 1)}
      />
    ))
  }

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <h2 className="text-sm font-semibold text-gray-900 mb-5">포스트 미리보기</h2>
        
        {/* 반려동물 정보 */}
        <div className="bg-gray-50 rounded-xl p-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-violet-100 rounded-xl flex items-center justify-center">
              <span className="text-xl">🐕</span>
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">{petInfo.petName}</h3>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>{petInfo.petBreed}</span>
                <span>•</span>
                <span>{petInfo.petAge}</span>
                <span>•</span>
                <span>{petInfo.petWeight}</span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">집사: {petInfo.ownerName}</p>
            </div>
          </div>
        </div>

        {/* 급여 기록들 */}
        <div className="space-y-6">
          {Object.entries(
            feedingRecords.reduce((acc, record) => {
              if (!acc[record.category]) acc[record.category] = []
              acc[record.category].push(record)
              return acc
            }, {} as Record<ProductCategory, FeedingRecord[]>)
          ).map(([category, records]) => (
            <div key={category}>
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">{categoryConfig[category as ProductCategory].icon}</span>
                <h3 className="text-lg font-bold text-gray-900">{category}</h3>
                <span className="text-sm text-gray-500">({records.length}개)</span>
              </div>

              <div className="space-y-4">
                {records
                  .sort((a, b) => {
                    if (a.status !== b.status) {
                      return a.status === '급여중' ? -1 : 1
                    }
                    return new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
                  })
                  .map((record) => (
                    <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-gray-900">{record.productName}</h4>
                          <p className="text-sm text-gray-600">{record.brand}</p>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${statusConfig[record.status].color}`}>
                          {record.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                        <div>
                          <span className="text-gray-600">급여 기간:</span>
                          <p className="font-medium">{record.duration}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">기호성:</span>
                          <div className="flex items-center space-x-1">
                            {renderStars(record.palatability)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">만족도:</span>
                          <div className="flex items-center space-x-1">
                            {renderStars(record.satisfaction)}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">재구매:</span>
                          <p className={`font-medium ${record.repurchaseIntent ? 'text-green-600' : 'text-red-600'}`}>
                            {record.repurchaseIntent ? '의사 있음' : '의사 없음'}
                          </p>
                        </div>
                      </div>

                      {(record.benefits && record.benefits.length > 0) && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-600 block mb-1">좋은 점:</span>
                          <div className="flex flex-wrap gap-1">
                            {record.benefits.map((benefit, index) => (
                              <span key={index} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                {benefit}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {(record.sideEffects && record.sideEffects.length > 0) && (
                        <div className="mb-3">
                          <span className="text-sm text-gray-600 block mb-1">부작용/단점:</span>
                          <div className="flex flex-wrap gap-1">
                            {record.sideEffects.map((sideEffect, index) => (
                              <span key={index} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                {sideEffect}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {record.comment && (
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm text-gray-700">{record.comment}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 네비게이션 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="flex items-center gap-1.5 px-4 py-2.5 bg-gray-100 text-gray-700 text-sm rounded-xl hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>이전 단계</span>
        </button>
        
        <button
          onClick={onSubmit}
          className="px-5 py-2.5 bg-green-500 text-white text-sm rounded-xl hover:bg-green-600 font-medium transition-colors"
        >
          포스트 게시하기
        </button>
      </div>
    </div>
  )
}
