import { Star, CheckCircle, AlertCircle, X } from 'lucide-react'
import { FeedingRecord, ProductCategory, FeedingStatus } from './types'

interface FeedingRecordFormProps {
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
  onCancel: () => void
}

export default function FeedingRecordForm({
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
  onCancel
}: FeedingRecordFormProps) {
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
    <div className="space-y-6">
      {/* 기본 정보 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            제품명 *
          </label>
          <input
            type="text"
            value={currentRecord.productName}
            onChange={(e) => setCurrentRecord({...currentRecord, productName: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="예: 힐스 어덜트 라지 브리드"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            브랜드 *
          </label>
          <input
            type="text"
            value={currentRecord.brand}
            onChange={(e) => setCurrentRecord({...currentRecord, brand: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="예: 힐스"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            카테고리
          </label>
          <select
            value={currentRecord.category}
            onChange={(e) => setCurrentRecord({...currentRecord, category: e.target.value as ProductCategory})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="사료">🍽️ 사료</option>
            <option value="간식">🦴 간식</option>
            <option value="영양제">💊 영양제</option>
            <option value="화장실">🚽 화장실</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            급여 상태
          </label>
          <select
            value={currentRecord.status}
            onChange={(e) => setCurrentRecord({...currentRecord, status: e.target.value as FeedingStatus})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="급여중">🟢 급여중</option>
            <option value="급여완료">⚫ 급여완료</option>
            <option value="급여중지">🔴 급여중지</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            급여 시작일 *
          </label>
          <input
            type="date"
            value={currentRecord.startDate}
            onChange={(e) => setCurrentRecord({...currentRecord, startDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            급여 종료일 <span className="text-xs text-gray-500 font-normal">(선택)</span>
          </label>
          <input
            type="date"
            value={currentRecord.endDate || ''}
            onChange={(e) => setCurrentRecord({...currentRecord, endDate: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            min={currentRecord.startDate || undefined}
            max={new Date().toISOString().split('T')[0]}
            disabled={!currentRecord.startDate}
          />
          {!currentRecord.startDate && (
            <p className="mt-1 text-xs text-gray-500">시작일을 먼저 입력해주세요</p>
          )}
          {currentRecord.status === '급여중' && currentRecord.endDate && (
            <p className="mt-1 text-xs text-amber-600">급여중 상태에서는 종료일이 있어도 오늘까지 계산됩니다</p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            급여 기간 <span className="text-xs text-gray-500 font-normal">(자동 계산)</span>
          </label>
          <input
            type="text"
            value={currentRecord.duration || ''}
            readOnly
            className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-700 cursor-not-allowed"
            placeholder={currentRecord.startDate ? '날짜를 입력하면 자동으로 계산됩니다' : '예: 3개월, 1년 2개월'}
          />
          {currentRecord.startDate && !currentRecord.duration && (
            <p className="mt-1 text-xs text-gray-500">
              종료일을 입력하면 기간이 자동으로 계산됩니다
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            가격 (선택)
          </label>
          <input
            type="text"
            value={currentRecord.price}
            onChange={(e) => setCurrentRecord({...currentRecord, price: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="예: 50,000원"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            구매처 (선택)
          </label>
          <input
            type="text"
            value={currentRecord.purchaseLocation}
            onChange={(e) => setCurrentRecord({...currentRecord, purchaseLocation: e.target.value})}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="예: 동물병원, 온라인몰"
          />
        </div>
      </div>

      {/* 평가 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            기호성
          </label>
          <div className="flex items-center space-x-1">
            {renderStars(currentRecord.palatability || 5, (rating) => 
              setCurrentRecord({...currentRecord, palatability: rating})
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            만족도
          </label>
          <div className="flex items-center space-x-1">
            {renderStars(currentRecord.satisfaction || 5, (rating) => 
              setCurrentRecord({...currentRecord, satisfaction: rating})
            )}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            재구매 의사
          </label>
          <div className="flex items-center space-x-4">
            <label className="flex items-center">
              <input
                type="radio"
                checked={currentRecord.repurchaseIntent === true}
                onChange={() => setCurrentRecord({...currentRecord, repurchaseIntent: true})}
                className="mr-2"
              />
              <span>예</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                checked={currentRecord.repurchaseIntent === false}
                onChange={() => setCurrentRecord({...currentRecord, repurchaseIntent: false})}
                className="mr-2"
              />
              <span>아니오</span>
            </label>
          </div>
        </div>
      </div>

      {/* 혜택 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          좋은 점/효과 (선택)
        </label>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={newBenefit}
            onChange={(e) => setNewBenefit(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="예: 털 윤기 개선, 소화 잘됨"
            onKeyPress={(e) => e.key === 'Enter' && addBenefit()}
          />
          <button
            onClick={addBenefit}
            className="px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            추가
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(currentRecord.benefits || []).map((benefit, index) => (
            <span
              key={index}
              className="flex items-center space-x-1 px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm"
            >
              <CheckCircle className="h-3 w-3" />
              <span>{benefit}</span>
              <button
                onClick={() => removeBenefit(benefit)}
                className="ml-1 text-green-600 hover:text-green-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 부작용 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          부작용/단점 (선택)
        </label>
        <div className="flex items-center space-x-2 mb-2">
          <input
            type="text"
            value={newSideEffect}
            onChange={(e) => setNewSideEffect(e.target.value)}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            placeholder="예: 가격이 비쌈, 알레르기 반응"
            onKeyPress={(e) => e.key === 'Enter' && addSideEffect()}
          />
          <button
            onClick={addSideEffect}
            className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
          >
            추가
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {(currentRecord.sideEffects || []).map((sideEffect, index) => (
            <span
              key={index}
              className="flex items-center space-x-1 px-2 py-1 bg-red-100 text-red-800 rounded-full text-sm"
            >
              <AlertCircle className="h-3 w-3" />
              <span>{sideEffect}</span>
              <button
                onClick={() => removeSideEffect(sideEffect)}
                className="ml-1 text-red-600 hover:text-red-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* 상세 후기 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          상세 후기 (선택)
        </label>
        <textarea
          value={currentRecord.comment}
          onChange={(e) => setCurrentRecord({...currentRecord, comment: e.target.value})}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          placeholder="이 제품에 대한 자세한 경험과 느낀 점을 공유해주세요..."
        />
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button
          onClick={addFeedingRecord}
          disabled={!currentRecord.productName || !currentRecord.brand}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            currentRecord.productName && currentRecord.brand
              ? 'bg-violet-500 text-white hover:bg-violet-600'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          기록 추가
        </button>
      </div>
    </div>
  )
}
