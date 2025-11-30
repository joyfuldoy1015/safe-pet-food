'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Scale, Tag } from 'lucide-react'
import type { Pet, Owner, ReviewLog } from '@/lib/types/review-log'

interface PetProfileHeaderProps {
  pet: Pet
  owner: Owner
  logs: ReviewLog[]
  calculateAge: (birthDate: string) => string
  onAddLog?: () => void
}

/**
 * Pet profile header with KPIs
 */
export default function PetProfileHeader({
  pet,
  owner,
  logs,
  calculateAge,
  onAddLog
}: PetProfileHeaderProps) {
  // Calculate KPIs
  const currentFeeding = logs.filter((l) => l.status === 'feeding').length
  const recentUpdate = logs.length > 0
    ? logs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())[0]
    : null
  const uniqueBrands = new Set(logs.map((l) => l.brand)).size

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-soft border border-gray-100 p-6 mb-6"
    >
      {/* Pet Info & Action */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between mb-6">
        <div className="flex items-start gap-4">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-4xl flex-shrink-0">
            {pet.species === 'dog' ? '🐕' : '🐱'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{pet.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
              <span className="inline-flex items-center gap-1">
                <span>{pet.species === 'dog' ? '강아지' : '고양이'}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                <span>{calculateAge(pet.birthDate)}</span>
              </span>
              {pet.weightKg && (
                <span className="inline-flex items-center gap-1">
                  <Scale className="h-4 w-4" />
                  <span>{pet.weightKg}kg</span>
                </span>
              )}
              <span className="text-gray-400">·</span>
              <span>{owner.nickname} 집사</span>
            </div>
            {pet.tags && pet.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-3">
                {pet.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs border border-blue-100"
                  >
                    <Tag className="h-3 w-3" />
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        {onAddLog && (
          <div className="flex md:justify-end">
            <button
              onClick={onAddLog}
              className="w-full md:w-auto rounded-xl bg-[#3056F5] text-white px-4 py-2 text-sm font-medium hover:bg-[#2648e6] transition-colors shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#3056F5] focus:ring-offset-2 whitespace-nowrap"
              aria-label="새 로그 추가"
            >
              + 새 로그 추가
            </button>
          </div>
        )}
      </div>

      {/* KPI Chips */}
      <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-100">
        <div className="px-4 py-2 bg-emerald-50 rounded-xl border border-emerald-200">
          <div className="text-xs text-emerald-600 font-medium mb-1">현재 급여</div>
          <div className="text-lg font-bold text-emerald-700">{currentFeeding}개</div>
        </div>
        <div className="px-4 py-2 bg-blue-50 rounded-xl border border-blue-200">
          <div className="text-xs text-blue-600 font-medium mb-1">최근 변경일</div>
          <div className="text-sm font-bold text-blue-700">
            {recentUpdate
              ? new Date(recentUpdate.updatedAt).toLocaleDateString('ko-KR', {
                  month: '2-digit',
                  day: '2-digit'
                })
              : '-'}
          </div>
        </div>
        <div className="px-4 py-2 bg-purple-50 rounded-xl border border-purple-200">
          <div className="text-xs text-purple-600 font-medium mb-1">누적 브랜드</div>
          <div className="text-lg font-bold text-purple-700">{uniqueBrands}개</div>
        </div>
      </div>
    </motion.div>
  )
}
