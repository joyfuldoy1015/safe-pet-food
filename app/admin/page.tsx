/*
 * AUDIT SUMMARY:
 * 
 * Routes found:
 * - / (Homepage): Hero, Feature Cards, UGC Feed Preview (Q&A/Reviews)
 * - /explore: Full listing with filters/sorting/search
 * - /pet-log (/reviews): Cards grid, filters, Log Drawer, Activity Panel
 * - /owners/[ownerId]/pets/[petId]: Pet-centric history, grouped by category
 * - /community/qa-forum: Q&A threads & posts
 * - /community/qa-forum/[questionId]: Question detail page
 * 
 * Shared components:
 * - CommunityReviewCard: Review log cards
 * - LogDrawer: Detail drawer for logs
 * - FeedFilters: Filter bar for reviews
 * - QuestionCard: Q&A question cards
 * - CommentThread: Comment threads
 * - UnifiedCard: Unified feed item card
 * 
 * Data models detected:
 * - profiles: User profiles
 * - pets: Pet information
 * - review_logs: Feeding review logs
 * - comments: Comments on logs
 * - qa_threads: Q&A threads (attached to logs)
 * - qa_posts: Q&A posts (questions/answers)
 * - product_longest_feeding: View for longest feeding rankings
 * - product_mentions: View for mentions rankings
 * 
 * Missing or TODO:
 * - app_settings table (for feature flags)
 * - Some views may need to be created in Supabase
 * 
 * Mapping public → admin sections:
 * - Homepage → Dashboard (analytics)
 * - /explore → Explore QA page
 * - /pet-log → Logs page
 * - /owners/[ownerId]/pets/[petId] → Users/Pets pages
 * - /community/qa-forum → Q&A page
 * - Comments → Comments page
 * - Leaderboards → Rankings page
 * - Settings → Settings page
 */

'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import AdminLayout from '@/components/admin/AdminLayout'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { getBrowserClient } from '@/lib/supabase-client'
import { 
  Users, 
  FileText,
  MessageSquare,
  HelpCircle,
  TrendingUp,
  AlertTriangle,
  BarChart3,
  Calendar
} from 'lucide-react'

interface KPI {
  label: string
  value: string | number
  change?: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

export default function AdminDashboard() {
  const { user, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [kpis, setKPIs] = useState<KPI[]>([])
  const [recentModerations, setRecentModerations] = useState<any[]>([])
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // Safety timeout: if loading takes more than 5 seconds, show error
    const timeoutId = setTimeout(() => {
      console.error('[AdminDashboard] Loading timeout after 5 seconds')
      setLoading(false)
    }, 5000)

    // Wait for auth to load
    if (authLoading) {
      console.log('[AdminDashboard] Waiting for auth to load...')
      return () => clearTimeout(timeoutId)
    }

    // Check admin access and load dashboard data
    const checkAdminAccessAndLoadData = async () => {
      console.log('[AdminDashboard] Checking admin access...', { user: user?.id, authLoading })
      
      if (!user) {
        console.log('[AdminDashboard] No user, redirecting to login')
        clearTimeout(timeoutId)
        setLoading(false)
        router.push('/login?redirect=/admin')
        return
      }

      try {
        // Get session token from Supabase
        const supabase = getBrowserClient()
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('[AdminDashboard] Session error:', sessionError)
          clearTimeout(timeoutId)
          setLoading(false)
          router.push('/login?redirect=/admin')
          return
        }
        
        if (!session) {
          console.log('[AdminDashboard] No session, redirecting to login')
          clearTimeout(timeoutId)
          setLoading(false)
          router.push('/login?redirect=/admin')
          return
        }

        console.log('[AdminDashboard] Checking admin status via API...')
        // Check if user is admin via API with session token (with timeout)
        const controller = new AbortController()
        const fetchTimeout = setTimeout(() => controller.abort(), 3000) // 3 second timeout
        
        let response
        try {
          response = await fetch('/api/admin/check', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            },
            signal: controller.signal
          })
          clearTimeout(fetchTimeout)
        } catch (fetchError: any) {
          clearTimeout(fetchTimeout)
          if (fetchError.name === 'AbortError') {
            console.error('[AdminDashboard] API request timeout')
            clearTimeout(timeoutId)
            setLoading(false)
            router.push('/?error=500&message=요청 시간이 초과되었습니다')
            return
          }
          throw fetchError
        }
        
        if (!response.ok) {
          console.error('[AdminDashboard] Admin check failed:', response.status)
          clearTimeout(timeoutId)
          setLoading(false)
          router.push('/?error=403&message=관리자 권한이 필요합니다')
          return
        }

        const data = await response.json()
        console.log('[AdminDashboard] Admin check result:', data)

        if (!data.isAdmin) {
          console.log('[AdminDashboard] User is not admin')
          clearTimeout(timeoutId)
          setLoading(false)
          router.push('/?error=403&message=관리자 권한이 필요합니다')
          return
        }

        console.log('[AdminDashboard] User is admin, loading dashboard data...')
        // User is admin, load dashboard data from API
        try {
          const statsResponse = await fetch('/api/admin/stats', {
            headers: {
              'Authorization': `Bearer ${session.access_token}`
            }
          })

          if (statsResponse.ok) {
            const statsData = await statsResponse.json()
            const { kpis, recentModerations } = statsData

            setKPIs([
              {
                label: '신규 로그 (7일)',
                value: kpis.newLogs.value,
                change: kpis.newLogs.change,
                icon: FileText,
                color: 'text-blue-600'
              },
              {
                label: 'Q&A 질문 수',
                value: kpis.qaThreads.value,
                change: kpis.qaThreads.change,
                icon: HelpCircle,
                color: 'text-purple-600'
              },
              {
                label: '활성 사용자 (7일)',
                value: kpis.activeUsers.value,
                change: kpis.activeUsers.change,
                icon: Users,
                color: 'text-green-600'
              },
              {
                label: '숨김 콘텐츠',
                value: kpis.hiddenContent.value,
                change: kpis.hiddenContent.change,
                icon: AlertTriangle,
                color: 'text-red-600'
              }
            ])
            setRecentModerations(recentModerations || [])
          } else {
            console.error('[AdminDashboard] Failed to load stats:', statsResponse.status)
            // Fallback to empty data
            setKPIs([
              {
                label: '신규 로그 (7일)',
                value: 0,
                change: '0%',
                icon: FileText,
                color: 'text-blue-600'
              },
              {
                label: 'Q&A 질문 수',
                value: 0,
                change: '0%',
                icon: HelpCircle,
                color: 'text-purple-600'
              },
              {
                label: '활성 사용자 (7일)',
                value: 0,
                change: '0%',
                icon: Users,
                color: 'text-green-600'
              },
              {
                label: '숨김 콘텐츠',
                value: 0,
                change: '0',
                icon: AlertTriangle,
                color: 'text-red-600'
              }
            ])
            setRecentModerations([])
          }
        } catch (statsError) {
          console.error('[AdminDashboard] Error loading stats:', statsError)
          // Fallback to empty data
          setKPIs([
            {
              label: '신규 로그 (7일)',
              value: 0,
              change: '0%',
              icon: FileText,
              color: 'text-blue-600'
            },
            {
              label: 'Q&A 질문 수',
              value: 0,
              change: '0%',
              icon: HelpCircle,
              color: 'text-purple-600'
            },
            {
              label: '활성 사용자 (7일)',
              value: 0,
              change: '0%',
              icon: Users,
              color: 'text-green-600'
            },
            {
              label: '숨김 콘텐츠',
              value: 0,
              change: '0',
              icon: AlertTriangle,
              color: 'text-red-600'
            }
          ])
          setRecentModerations([])
        }
        
        console.log('[AdminDashboard] Dashboard data loaded')
        clearTimeout(timeoutId)
        setLoading(false)
      } catch (error) {
        console.error('[AdminDashboard] Error checking admin access:', error)
        clearTimeout(timeoutId)
        setLoading(false) // Ensure loading state is cleared even on error
        router.push('/?error=500&message=권한 확인 중 오류가 발생했습니다')
      }
    }

    checkAdminAccessAndLoadData()

    return () => clearTimeout(timeoutId)
  }, [user, authLoading, router])

  // Prevent hydration mismatch by ensuring consistent initial render
  if (loading || !mounted) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">로딩 중...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
            <div>
          <h1 className="text-2xl font-bold text-gray-900">대시보드</h1>
          <p className="text-gray-600 mt-1">시스템 현황 및 최근 활동을 확인하세요</p>
          </div>
          
        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <div
                key={index}
                className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className={`p-2 rounded-lg bg-gray-50 ${kpi.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  {kpi.change && (
                    <span className={`text-sm font-medium ${
                      kpi.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {kpi.change}
                    </span>
                  )}
                </div>
                <div className="text-2xl font-bold text-gray-900">{kpi.value}</div>
                <div className="text-sm text-gray-600 mt-1">{kpi.label}</div>
              </div>
            )
          })}
            </div>
            
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Activity Chart */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">일자별 활동 추이</h2>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded-lg">
                  30일
                </button>
                <button className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-50 rounded-lg">
                  90일
                </button>
              </div>
            </div>
            <div className="h-64 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                <p>차트 데이터 준비 중</p>
              </div>
            </div>
            </div>
            
          {/* Recent Activity */}
          <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">최근 모더레이션</h2>
            {recentModerations.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <AlertTriangle className="w-12 h-12 mx-auto mb-2" />
                <p>최근 모더레이션 활동이 없습니다</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentModerations.map((action, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <AlertTriangle className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{action.action}</p>
                      <p className="text-xs text-gray-500">{action.target_table}</p>
                    </div>
                    <span className="text-xs text-gray-400">{action.created_at}</span>
                  </div>
                ))}
            </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">빠른 작업</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link
              href="/admin/logs"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <FileText className="w-6 h-6 text-blue-600 mb-2" />
              <div className="font-medium text-gray-900">로그 검토</div>
              <div className="text-sm text-gray-500">대기 중인 로그</div>
            </Link>
            <Link
              href="/admin/comments"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <MessageSquare className="w-6 h-6 text-purple-600 mb-2" />
              <div className="font-medium text-gray-900">댓글 검토</div>
              <div className="text-sm text-gray-500">신고된 댓글</div>
            </Link>
            <Link
              href="/admin/qa"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <HelpCircle className="w-6 h-6 text-green-600 mb-2" />
              <div className="font-medium text-gray-900">Q&A 검토</div>
              <div className="text-sm text-gray-500">대기 중인 질문</div>
            </Link>
            <Link
              href="/admin/users"
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left"
            >
              <Users className="w-6 h-6 text-orange-600 mb-2" />
              <div className="font-medium text-gray-900">사용자 관리</div>
              <div className="text-sm text-gray-500">신규 가입자</div>
            </Link>
          </div>
        </div>
    </div>
    </AdminLayout>
  )
}
