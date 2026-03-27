import { Shield } from 'lucide-react'
import { getSafiLevelLabel, type SafiResult } from '@/lib/safi-calculator'

interface SAFIScoreSectionProps {
  safiScore: SafiResult | null
  safiReviewCount: number
}

export default function SAFIScoreSection({ safiScore, safiReviewCount }: SAFIScoreSectionProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 sm:p-6 mb-4">
      <h2 className="text-sm font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span className={`w-7 h-7 rounded-full flex items-center justify-center ${safiScore ? 'bg-blue-50' : 'bg-gray-100'}`}>
          <Shield className={`h-4 w-4 ${safiScore ? 'text-blue-500' : 'text-gray-300'}`} />
        </span>
        SAFI 안전성 점수
      </h2>

      {safiScore ? (
        <>
          {/* 전체 점수 */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">종합 안전성 점수</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-900">{safiScore.overallScore.toFixed(1)}</span>
                  <span className="text-sm text-gray-400">/ 100</span>
                </div>
              </div>
              <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold ${
                safiScore.level === 'SAFE' ? 'bg-green-100 text-green-700' :
                safiScore.level === 'NORMAL' ? 'bg-yellow-100 text-yellow-700' :
                'bg-red-100 text-red-700'
              }`}>
                <Shield className="h-3.5 w-3.5 mr-1" />
                {getSafiLevelLabel(safiScore.level)}
              </span>
            </div>

            {/* 진행 바 */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  safiScore.level === 'SAFE' ? 'bg-green-500' :
                  safiScore.level === 'NORMAL' ? 'bg-yellow-500' :
                  'bg-red-500'
                }`}
                style={{ width: `${safiScore.overallScore}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500">
              {safiScore.level === 'SAFE' && '✅ 안전한 제품으로 평가됩니다'}
              {safiScore.level === 'NORMAL' && '⚠️ 보통 수준의 안전성을 가진 제품입니다'}
              {safiScore.level === 'CAUTION' && '⚠️ 주의가 필요한 제품입니다'}
            </p>
          </div>

          {/* 세부 지수 */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-500 mb-1">부작용 지수</p>
              <p className="text-lg font-bold text-gray-900">{safiScore.detail.A.toFixed(1)}</p>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div className="bg-blue-500 h-1 rounded-full" style={{ width: `${safiScore.detail.A}%` }}></div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-500 mb-1">변 상태 지수</p>
              <p className="text-lg font-bold text-gray-900">{safiScore.detail.B.toFixed(1)}</p>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div className="bg-green-500 h-1 rounded-full" style={{ width: `${safiScore.detail.B}%` }}></div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-500 mb-1">식욕 지수</p>
              <p className="text-lg font-bold text-gray-900">{safiScore.detail.C.toFixed(1)}</p>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div className="bg-yellow-500 h-1 rounded-full" style={{ width: `${safiScore.detail.C}%` }}></div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-500 mb-1">원재료 안전</p>
              <p className="text-lg font-bold text-gray-900">{safiScore.detail.D.toFixed(1)}</p>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div className="bg-purple-500 h-1 rounded-full" style={{ width: `${safiScore.detail.D}%` }}></div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-[10px] text-gray-500 mb-1">브랜드 신뢰</p>
              <p className="text-lg font-bold text-gray-900">{safiScore.detail.E.toFixed(1)}</p>
              <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                <div className="bg-indigo-500 h-1 rounded-full" style={{ width: `${safiScore.detail.E}%` }}></div>
              </div>
            </div>
          </div>

          {/* 평가 건수 안내 */}
          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              {safiReviewCount}건의 급여 후기 기반으로 산출된 점수입니다
            </p>
          </div>
        </>
      ) : (
        <>
          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">종합 안전성 점수</p>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-gray-300">0</span>
                  <span className="text-sm text-gray-300">/ 100</span>
                </div>
              </div>
              <span className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">
                <Shield className="h-3.5 w-3.5 mr-1" />
                평가 전
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div className="h-2 rounded-full bg-gray-300" style={{ width: '0%' }}></div>
            </div>
          </div>

          {/* 세부 지수 - 회색 처리 */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {['부작용 지수', '변 상태 지수', '식욕 지수', '원재료 안전', '브랜드 신뢰'].map((label) => (
              <div key={label} className="bg-gray-50 rounded-xl p-3">
                <p className="text-[10px] text-gray-400 mb-1">{label}</p>
                <p className="text-lg font-bold text-gray-300">0</p>
                <div className="w-full bg-gray-200 rounded-full h-1 mt-1">
                  <div className="bg-gray-300 h-1 rounded-full" style={{ width: '0%' }}></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-400 text-center">
              아직 급여 후기가 없습니다. 급여 후기 작성 시 안전성 평가가 반영됩니다.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
