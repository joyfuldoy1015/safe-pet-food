'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { ReviewLog } from '@/lib/types/review-log'
import LogCompactCard from './LogCompactCard'
import { getCategoryStats } from '@/lib/group'

import type { Comment, QAThread, QAPostWithAuthor } from '@/lib/types/review-log'

interface CategorySectionProps {
  category: 'feed' | 'snack' | 'supplement' | 'toilet'
  logs: ReviewLog[]
  onLogClick: (log: ReviewLog) => void
  formatPeriodLabel: (status: 'feeding' | 'paused' | 'completed', start: string, end?: string, days?: number) => string
  calculateAge: (birthDate: string) => string
  getPetInfo: (petId: string) => { name: string; birthDate: string; weightKg?: number } | null
  getOwnerInfo: (ownerId: string) => { nickname: string } | null
  getBestAnswerExcerpt?: (logId: string) => string | null
  getLatestCommentExcerpt?: (logId: string) => string | null
  getCommentsForLog?: (logId: string) => Comment[]
  getQAThreadsForLog?: (logId: string) => QAThread[]
  getQAPostsForLog?: (logId: string) => QAPostWithAuthor[]
  formatTimeAgo?: (date: string) => string
}

const categoryConfig = {
  feed: { label: '사료', emoji: '🍽️', color: 'bg-blue-50 text-blue-700 border-blue-200' },
  snack: { label: '간식', emoji: '🦴', color: 'bg-green-50 text-green-700 border-green-200' },
  supplement: { label: '영양제', emoji: '💊', color: 'bg-purple-50 text-purple-700 border-purple-200' },
  toilet: { label: '화장실', emoji: '🚽', color: 'bg-orange-50 text-orange-700 border-orange-200' }
}

/**
 * Category section with grouped logs
 */
export default function CategorySection({
  category,
  logs,
  onLogClick,
  formatPeriodLabel,
  calculateAge,
  getPetInfo,
  getOwnerInfo,
  getBestAnswerExcerpt,
  getLatestCommentExcerpt,
  getCommentsForLog,
  getQAThreadsForLog,
  getQAPostsForLog,
  formatTimeAgo
}: CategorySectionProps) {
  if (logs.length === 0) return null

  const config = categoryConfig[category]
  const stats = getCategoryStats(logs)

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-8"
    >
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-2xl ${config.color} flex items-center justify-center text-2xl border`}>
            {config.emoji}
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900">{config.label}</h2>
            <p className="text-sm text-gray-600">
              전체 {stats.total} · 급여 중 {stats.feeding} · 완료 {stats.completed} · 중지 {stats.paused}
            </p>
          </div>
        </div>
      </div>

      {/* Logs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {logs.map((log, index) => {
          const owner = getOwnerInfo(log.ownerId)
          const pet = getPetInfo(log.petId)
          if (!owner || !pet) return null

          return (
            <motion.div
              key={log.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <LogCompactCard
                log={log}
                owner={owner}
                pet={pet}
                formatPeriodLabel={formatPeriodLabel}
                calculateAge={calculateAge}
                onOpenDetail={() => onLogClick(log)}
                bestAnswerExcerpt={getBestAnswerExcerpt?.(log.id)}
                latestCommentExcerpt={getLatestCommentExcerpt?.(log.id)}
                comments={getCommentsForLog?.(log.id) || []}
                qaThreads={getQAThreadsForLog?.(log.id) || []}
                qaPosts={getQAPostsForLog?.(log.id) || []}
                formatTimeAgo={formatTimeAgo}
                getAuthorInfo={getOwnerInfo}
              />
            </motion.div>
          )
        })}
      </div>
    </motion.section>
  )
}

