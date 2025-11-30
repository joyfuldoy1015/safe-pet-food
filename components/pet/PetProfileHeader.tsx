'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, Scale, User, Plus, Package, Clock } from 'lucide-react'
import type { Pet, Owner, ReviewLog } from '@/lib/types/review-log'
import HealthBadge from './HealthBadge'
import StatCard from './StatCard'

interface PetProfileHeaderProps {
  pet: Pet
  owner: Owner
  logs: ReviewLog[]
  calculateAge: (birthDate: string) => string
  onAddLog?: () => void
}

/**
 * Pet profile header with Health & Care Minimalism design
 * Information hierarchy: Name → Key Info → Health Tags → Stat Cards
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

  // Format recent update date
  const formatRecentDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffInDays === 0) return '오늘'
    if (diffInDays === 1) return '어제'
    if (diffInDays < 7) return `${diffInDays}일 전`
    if (diffInDays < 30) return `${Math.floor(diffInDays / 7)}주 전`
    
    return date.toLocaleDateString('ko-KR', {
      month: '2-digit',
      day: '2-digit'
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 overflow-hidden mb-8"
    >
      {/* Main Profile Section */}
      <div className="p-8 pb-6">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          {/* Left: Profile Info */}
          <div className="flex items-start gap-6 flex-1">
            {/* Avatar */}
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#0D1B2A] to-[#1B263B] flex items-center justify-center text-5xl flex-shrink-0 shadow-lg">
              {pet.species === 'dog' ? '🐕' : '🐱'}
            </div>

            {/* Name & Info */}
            <div className="flex-1 min-w-0">
              {/* Name */}
              <h1 className="text-3xl md:text-4xl font-bold text-[#0D1B2A] mb-4 tracking-tight">
                {pet.name}
              </h1>

              {/* Key Info: Age, Weight, Owner */}
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                <span className="inline-flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{calculateAge(pet.birthDate)}</span>
                </span>
                {pet.weightKg && (
                  <span className="inline-flex items-center gap-2">
                    <Scale className="h-4 w-4 text-gray-400" />
                    <span className="font-medium">{pet.weightKg}kg</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-2">
                  <User className="h-4 w-4 text-gray-400" />
                  <span className="font-medium">{owner.nickname} 집사</span>
                </span>
              </div>

              {/* Health Tags */}
              {pet.tags && pet.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-4">
                  {pet.tags.map((tag) => (
                    <HealthBadge key={tag} tag={tag} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Add Log Button */}
          {onAddLog && (
            <div className="flex md:justify-end">
              <button
                onClick={onAddLog}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[#0D1B2A] text-white text-sm font-semibold hover:bg-[#1B263B] transition-all duration-200 shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#0D1B2A] focus:ring-offset-2 whitespace-nowrap"
                aria-label="새 로그 추가"
              >
                <Plus className="h-4 w-4" />
                새 로그 추가
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Stat Cards Section */}
      <div className="px-8 pb-8 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <StatCard
            label="현재 급여 개수"
            value={currentFeeding}
            icon={<Package className="h-5 w-5" />}
          />
          <StatCard
            label="최근 변경일"
            value={recentUpdate ? formatRecentDate(recentUpdate.updatedAt) : '-'}
            icon={<Clock className="h-5 w-5" />}
          />
          <StatCard
            label="누적 브랜드"
            value={uniqueBrands}
            icon={<Package className="h-5 w-5" />}
          />
        </div>
      </div>
    </motion.div>
  )
}
