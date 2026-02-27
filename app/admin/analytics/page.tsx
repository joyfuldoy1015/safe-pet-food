'use client'

import React, { useState, useEffect } from 'react'
import AdminLayout from '@/components/admin/AdminLayout'
import { getBrowserClient } from '@/lib/supabase-client'
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  MessageSquare,
  Heart,
  HelpCircle,
  RefreshCw
} from 'lucide-react'

interface Stats {
  totalUsers: number
  totalPets: number
  totalReviewLogs: number
  totalComments: number
  totalQAThreads: number
  totalQAPosts: number
  totalCommunityQuestions: number
  recentUsers7d: number
  recentLogs7d: number
  recentComments7d: number
  topBrands: { brand: string; count: number }[]
  speciesDistribution: { dog: number; cat: number }
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  const loadStats = async () => {
    setLoading(true)
    try {
      const supabase = getBrowserClient()
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      const sevenDaysAgoISO = sevenDaysAgo.toISOString()

      const [
        usersRes, petsRes, logsRes, commentsRes,
        threadsRes, postsRes, communityRes,
        recentUsersRes, recentLogsRes, recentCommentsRes,
        topBrandsRes, dogsRes, catsRes
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('pets').select('*', { count: 'exact', head: true }),
        supabase.from('review_logs').select('*', { count: 'exact', head: true }),
        supabase.from('comments').select('*', { count: 'exact', head: true }),
        supabase.from('qa_threads').select('*', { count: 'exact', head: true }),
        supabase.from('qa_posts').select('*', { count: 'exact', head: true }),
        supabase.from('community_questions').select('*', { count: 'exact', head: true }),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgoISO),
        supabase.from('review_logs').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgoISO),
        supabase.from('comments').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgoISO),
        supabase.from('review_logs').select('brand').not('brand', 'is', null).limit(1000),
        supabase.from('pets').select('*', { count: 'exact', head: true }).eq('species', 'dog'),
        supabase.from('pets').select('*', { count: 'exact', head: true }).eq('species', 'cat'),
      ])

      const brandCounts: Record<string, number> = {}
      if (topBrandsRes.data) {
        topBrandsRes.data.forEach((r: any) => {
          if (r.brand) brandCounts[r.brand] = (brandCounts[r.brand] || 0) + 1
        })
      }
      const topBrands = Object.entries(brandCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([brand, count]) => ({ brand, count }))

      setStats({
        totalUsers: usersRes.count || 0,
        totalPets: petsRes.count || 0,
        totalReviewLogs: logsRes.count || 0,
        totalComments: commentsRes.count || 0,
        totalQAThreads: threadsRes.count || 0,
        totalQAPosts: postsRes.count || 0,
        totalCommunityQuestions: communityRes.count || 0,
        recentUsers7d: recentUsersRes.count || 0,
        recentLogs7d: recentLogsRes.count || 0,
        recentComments7d: recentCommentsRes.count || 0,
        topBrands,
        speciesDistribution: {
          dog: dogsRes.count || 0,
          cat: catsRes.count || 0
        }
      })
    } catch (error) {
      console.error('[AdminAnalytics] Error:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadStats()
  }, [])

  const StatCard = ({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: number | string; sub?: string; color: string }) => (
    <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{typeof value === 'number' ? value.toLocaleString() : value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <Icon className={`h-8 w-8 ${color}`} />
      </div>
    </div>
  )

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">통계 분석</h1>
            <p className="text-gray-600 mt-1">실시간 데이터 기반 서비스 현황</p>
          </div>
          <button
            onClick={loadStats}
            disabled={loading}
            className="px-4 py-2 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 text-sm disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            새로고침
          </button>
        </div>

        {loading && !stats ? (
          <div className="bg-white rounded-xl border border-gray-200 p-12 text-center text-gray-500">로딩 중...</div>
        ) : stats && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard icon={Users} label="전체 사용자" value={stats.totalUsers} sub={`최근 7일: +${stats.recentUsers7d}`} color="text-blue-500" />
              <StatCard icon={Heart} label="등록 반려동물" value={stats.totalPets} sub={`강아지 ${stats.speciesDistribution.dog} / 고양이 ${stats.speciesDistribution.cat}`} color="text-pink-500" />
              <StatCard icon={FileText} label="급여 후기" value={stats.totalReviewLogs} sub={`최근 7일: +${stats.recentLogs7d}`} color="text-green-500" />
              <StatCard icon={MessageSquare} label="댓글" value={stats.totalComments} sub={`최근 7일: +${stats.recentComments7d}`} color="text-purple-500" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard icon={HelpCircle} label="Q&A 스레드" value={stats.totalQAThreads} color="text-indigo-500" />
              <StatCard icon={MessageSquare} label="Q&A 게시물" value={stats.totalQAPosts} color="text-cyan-500" />
              <StatCard icon={BarChart3} label="커뮤니티 질문" value={stats.totalCommunityQuestions} color="text-orange-500" />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">인기 브랜드 (급여 후기 기준)</h2>
              {stats.topBrands.length > 0 ? (
                <div className="space-y-3">
                  {stats.topBrands.map((item, index) => {
                    const maxCount = stats.topBrands[0].count
                    const percentage = maxCount > 0 ? (item.count / maxCount) * 100 : 0
                    return (
                      <div key={item.brand} className="flex items-center gap-4">
                        <span className="w-6 h-6 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium text-gray-900">{item.brand}</span>
                            <span className="text-sm text-gray-500">{item.count}건</span>
                          </div>
                          <div className="w-full bg-gray-100 rounded-full h-2">
                            <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">데이터가 없습니다</p>
              )}
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
