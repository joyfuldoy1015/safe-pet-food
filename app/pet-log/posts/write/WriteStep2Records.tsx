import { Plus, ArrowLeft, X, Star } from 'lucide-react'
import { FeedingRecord, categoryConfig, statusConfig } from './types'
import FeedingRecordForm from './FeedingRecordForm'

interface WriteStep2RecordsProps {
  feedingRecords: FeedingRecord[]
  showRecordForm: boolean
  setShowRecordForm: (show: boolean) => void
  currentRecord: Partial<FeedingRecord>
  setCurrentRecord: (record: Partial<FeedingRecord>) => void
  newBenefit: string
  setNewBenefit: (value: string) => void
  newSideEffect: string
  setNewSideEffect: (value: string) => void
  addBenefit: () => void
  removeBenefit: (benefit: string) => void
  addSideEffect: () => void
  removeSideEffect: (sideEffect: string) => void
  addFeedingRecord: () => void
  removeFeedingRecord: (recordId: string) => void
  onNext: () => void
  onPrev: () => void
}

export default function WriteStep2Records({
  feedingRecords,
  showRecordForm,
  setShowRecordForm,
  currentRecord,
  setCurrentRecord,
  newBenefit,
  setNewBenefit,
  newSideEffect,
  setNewSideEffect,
  addBenefit,
  removeBenefit,
  addSideEffect,
  removeSideEffect,
  addFeedingRecord,
  removeFeedingRecord,
  onNext,
  onPrev
}: WriteStep2RecordsProps) {
  const canProceedToStep3 = feedingRecords.length > 0

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
      {/* 기존 급여 기록들 */}
      {feedingRecords.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-900 mb-4">등록된 급여 기록 ({feedingRecords.length}개)</h2>
          
          <div className="space-y-4">
            {feedingRecords.map((record) => (
              <div key={record.id} className="border border-gray-200 rounded-lg p-4">
                {/* 행으로 정렬된 레이아웃 */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  {/* 왼쪽: 아이콘, 제품 정보 */}
                  <div className="flex items-center space-x-3 flex-1 min-w-0">
                    <span className="text-2xl flex-shrink-0">{categoryConfig[record.category].icon}</span>
                    <div className="min-w-0 flex-1">
                      <h3 className="font-bold text-gray-900 truncate">{record.productName}</h3>
                      <p className="text-sm text-gray-600 truncate">{record.brand}</p>
                    </div>
                  </div>
                  
                  {/* 중앙: 카테고리, 상태, 평가 정보 - 행으로 정렬 */}
                  <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-sm">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${categoryConfig[record.category].color}`}>
                      {record.category}
                    </span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border whitespace-nowrap ${statusConfig[record.status].color}`}>
                      {record.status}
                    </span>
                    <div className="flex items-center space-x-1 whitespace-nowrap">
                      <span className="text-gray-600">기호성:</span>
                      <div className="flex items-center">{renderStars(record.palatability)}</div>
                    </div>
                    <div className="flex items-center space-x-1 whitespace-nowrap">
                      <span className="text-gray-600">만족도:</span>
                      <div className="flex items-center">{renderStars(record.satisfaction)}</div>
                    </div>
                  </div>
                  
                  {/* 오른쪽: 삭제 버튼 */}
                  <button
                    onClick={() => removeFeedingRecord(record.id)}
                    className="p-1 text-red-500 hover:bg-red-50 rounded flex-shrink-0 self-start sm:self-center"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 급여 기록 추가 폼 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold text-gray-900">급여 기록 추가</h2>
          {!showRecordForm && (
            <button
              onClick={() => setShowRecordForm(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-violet-500 text-white text-sm rounded-xl hover:bg-violet-600 transition-colors"
            >
              <Plus className="h-4 w-4" />
              <span>기록 추가</span>
            </button>
          )}
        </div>

        {showRecordForm && (
          <FeedingRecordForm
            currentRecord={currentRecord}
            setCurrentRecord={setCurrentRecord}
            newBenefit={newBenefit}
            setNewBenefit={setNewBenefit}
            newSideEffect={newSideEffect}
            setNewSideEffect={setNewSideEffect}
            addBenefit={addBenefit}
            removeBenefit={removeBenefit}
            addSideEffect={addSideEffect}
            removeSideEffect={removeSideEffect}
            addFeedingRecord={addFeedingRecord}
            onCancel={() => setShowRecordForm(false)}
          />
        )}
      </div>

      {/* 네비게이션 */}
      <div className="flex items-center justify-between">
        <button
          onClick={onPrev}
          className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>이전 단계</span>
        </button>
        
        <button
          onClick={onNext}
          disabled={!canProceedToStep3}
          className={`px-6 py-2 rounded-lg font-medium transition-colors ${
            canProceedToStep3
              ? 'bg-violet-500 text-white hover:bg-violet-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          미리보기
        </button>
      </div>
    </div>
  )
}
