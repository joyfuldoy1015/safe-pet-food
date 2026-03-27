'use client'

import { motion } from 'framer-motion'
import type { ReviewLog } from '@/lib/types/review-log'

interface LogProductSummaryCardProps {
  log: ReviewLog
  daysUsed: number
  formatDate: (dateString: string) => string
}

export default function LogProductSummaryCard({ log, daysUsed, formatDate }: LogProductSummaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.05 }}
      className="mx-4 my-4 bg-white rounded-2xl border border-gray-100 p-4 relative"
    >
      {/* 카테고리 레이블 + 배지 */}
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-medium text-violet-500 tracking-wider">
          {log.category === 'feed' ? '사료 기록' :
           log.category === 'snack' ? '간식 기록' :
           log.category === 'supplement' ? '영양제 기록' :
           log.category === 'toilet' ? '화장실 기록' : '기록'}
        </p>
        <div className="flex items-center gap-1.5">
          {log.recommend !== undefined && log.recommend !== null && (
            log.recommend ? (
              <span className="px-3 py-1.5 bg-green-50 text-green-600 text-xs font-medium rounded-full border border-green-100">
                👍 추천
              </span>
            ) : (
              <span className="px-3 py-1.5 bg-red-50 text-red-500 text-xs font-medium rounded-full border border-red-100">
                👎 비추천
              </span>
            )
          )}
          <span className={`px-3 py-1.5 rounded-full text-xs font-medium ${
            log.status === 'feeding' ? 'bg-green-50 text-green-600' :
            log.status === 'completed' ? 'bg-gray-100 text-gray-600' :
            'bg-red-50 text-red-600'
          }`}>
            {log.status === 'feeding' 
              ? `${daysUsed}일째 사용 중`
              : log.status === 'completed' ? '사용 완료' : '사용 중지'
            }
          </span>
        </div>
      </div>

      {/* 제품명 */}
      <h2 className="text-lg font-bold text-gray-900 mb-2 pr-24">
        {log.product}
      </h2>

      {/* 기록 시작일 */}
      <p className="text-sm text-gray-500">
        기록 시작: {formatDate(log.periodStart)}
      </p>
    </motion.div>
  )
}
