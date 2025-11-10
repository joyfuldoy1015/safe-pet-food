'use client'

import React from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import FeedingLeaderboard from '@/components/rank/FeedingLeaderboard'

export default function AdminRankingsPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">랭킹 관리</h1>
          <p className="text-gray-600 mt-1">제품 랭킹을 확인하고 관리하세요</p>
        </div>

        <FeedingLeaderboard initialSpecies="all" initialCategory="all" />
      </div>
    </AdminLayout>
  )
}


