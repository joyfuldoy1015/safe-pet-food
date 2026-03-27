import { Clock, Star, Heart } from 'lucide-react'
import { FeedingRecord, statusConfig } from './types'

interface FeedingRecordCardProps {
  record: FeedingRecord
}

function renderStars(rating: number) {
  return (
    <div className="flex items-center space-x-0.5 sm:space-x-1">
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${
            i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
          }`}
        />
      ))}
    </div>
  )
}

export default function FeedingRecordCard({ record }: FeedingRecordCardProps) {
  return (
    <div key={record.id} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 sm:p-6 hover:shadow-2xl transition-all duration-300">
      {/* Product Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-gray-900 leading-tight mb-2">{record.productName}</h3>
          {record.brand && (
            <div className="flex flex-col gap-1 text-xs sm:text-sm text-gray-600">
              <span>{record.brand}</span>
              {record.price && (
                <div className="flex flex-col sm:flex-row sm:items-center sm:gap-1">
                  <span>{record.price}</span>
                  {record.purchaseLocation && (
                    <>
                      <span className="hidden sm:inline"> · </span>
                      <span>{record.purchaseLocation}</span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 flex-shrink-0 self-start sm:self-auto">
          <span className={`px-2.5 sm:px-3 py-1.5 rounded-full font-semibold whitespace-nowrap ${
            record.status === '급여중' ? 'bg-green-100 text-green-800 border border-green-200' :
            record.status === '급여완료' ? 'bg-gray-100 text-gray-800 border border-gray-200' :
            'bg-red-100 text-red-800 border border-red-200'
          }`} style={{ fontSize: '15px' }}>
            {statusConfig[record.status].icon} {record.category === '화장실' 
              ? statusConfig[record.status].label.replace('급여', '사용')
              : statusConfig[record.status].label}
          </span>
        </div>
      </div>

      {/* Main Info Grid - 2x2 */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
        {/* 급여 기간 */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1.5 sm:mb-2 font-medium">급여 기간</p>
          <p className="text-sm sm:text-base font-semibold text-gray-900 break-words mb-1">
            {record.startDate} ~ {record.endDate || '현재'}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
            <Clock className="h-3 w-3 text-gray-500" />
            <span>총 {record.duration}</span>
          </p>
        </div>
        {/* 재구매 의향 */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1.5 sm:mb-2 font-medium">재구매 의향</p>
          <div className="flex items-center">
            {record.repurchaseIntent ? (
              <span className="text-green-700 flex items-center font-semibold text-sm sm:text-base">
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5 fill-current" />
                있음
              </span>
            ) : (
              <span className="text-gray-600 flex items-center font-semibold text-sm sm:text-base">
                <Heart className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-1.5" />
                없음
              </span>
            )}
          </div>
        </div>
        {/* 기호성 */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1.5 sm:mb-2 font-medium">
            {record.category === '화장실' ? '사용성' : '기호성'}
          </p>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {renderStars(record.palatability)}
            <span className="text-sm sm:text-base font-semibold text-gray-900">
              {record.palatability}/5
            </span>
          </div>
        </div>
        {/* 만족도 */}
        <div className="bg-gray-50 rounded-xl p-3 sm:p-4 border border-gray-200">
          <p className="text-xs text-gray-500 mb-1.5 sm:mb-2 font-medium">만족도</p>
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            {renderStars(record.satisfaction)}
            <span className="text-sm sm:text-base font-semibold text-gray-900">
              {record.satisfaction}/5
            </span>
          </div>
        </div>
      </div>

      {/* Benefits & Side Effects - 좌우 배치 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        {/* 장점 */}
        {record.benefits && record.benefits.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="text-green-600 text-base sm:text-lg">👍</span>
              <h4 className="text-xs sm:text-sm font-semibold text-green-700">장점</h4>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {record.benefits.map((benefit, index) => (
                <span key={index} className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-green-100 text-green-800 text-xs rounded-full font-medium border border-green-200">
                  {benefit}
                </span>
              ))}
            </div>
          </div>
        )}
        {/* 단점 */}
        {record.sideEffects && record.sideEffects.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <span className="text-red-600 text-base sm:text-lg">👎</span>
              <h4 className="text-xs sm:text-sm font-semibold text-red-700">단점</h4>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {record.sideEffects.map((effect, index) => (
                <span key={index} className="px-2.5 sm:px-3 py-1 sm:py-1.5 bg-red-100 text-red-800 text-xs rounded-full font-medium border border-red-200">
                  {effect}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Comment Section */}
      {record.comment && (
        <div className="bg-gray-100 rounded-lg p-3 sm:p-4">
          <p className="text-xs sm:text-sm text-gray-700 leading-relaxed">{record.comment}</p>
        </div>
      )}
    </div>
  )
}
