'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import type { ReviewLog } from '@/lib/types/review-log'

interface LogReviewSectionProps {
  log: ReviewLog
  hasMarkedHelpful: boolean
  helpfulCount: number
  isMarkingHelpful: boolean
  onToggleHelpful: () => void
}

export default function LogReviewSection({
  log,
  hasMarkedHelpful,
  helpfulCount,
  isMarkingHelpful,
  onToggleHelpful,
}: LogReviewSectionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="mx-4 mb-4 bg-white rounded-2xl border border-gray-100 p-5"
    >
      <h3 className="text-base font-bold text-gray-900 mb-3">사용 후기</h3>
      {log.excerpt ? (
        <p className="text-base text-gray-700 leading-relaxed whitespace-pre-line">
          {log.excerpt}
        </p>
      ) : (
        <p className="text-base text-gray-400 italic">
          아직 작성된 후기가 없습니다.
        </p>
      )}
      {log.notes && (
        <div className="mt-4 pt-4 border-t border-gray-100">
          <h4 className="text-sm font-medium text-gray-500 mb-2">추가 메모</h4>
          <p className="text-base text-gray-600 leading-relaxed whitespace-pre-line">
            {log.notes}
          </p>
        </div>
      )}

      {/* 도움돼요 버튼 */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <button
          onClick={onToggleHelpful}
          disabled={isMarkingHelpful}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all ${
            hasMarkedHelpful
              ? 'bg-red-100 text-red-500'
              : 'bg-red-50 text-red-400 hover:bg-red-100 hover:text-red-500'
          } disabled:opacity-50`}
        >
          <Heart className={`h-4 w-4 ${hasMarkedHelpful ? 'fill-current' : ''}`} />
          도움돼요 {helpfulCount > 0 && helpfulCount}
        </button>
      </div>
    </motion.div>
  )
}
