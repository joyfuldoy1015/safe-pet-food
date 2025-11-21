import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, isAdmin } from '@/lib/supa/serverAdmin'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

// Force dynamic rendering (uses headers)
export const dynamic = 'force-dynamic'

/**
 * GET /api/admin/stats
 * 대시보드 통계 데이터 조회
 */
export async function GET(request: NextRequest) {
  try {
    // 권한 확인 - 세션에서 사용자 ID 가져오기
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Get Authorization header (Bearer token)
    const authHeader = request.headers.get('Authorization')
    const accessToken = authHeader?.replace('Bearer ', '')

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Create Supabase client with access token
    const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      },
      global: {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    })

    // Get current user using the access token
    const { data: { user }, error: authError } = await supabase.auth.getUser(accessToken)
    
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const admin = await isAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Admin client for queries
    const adminSupabase = getAdminClient()

    // 7일 전 날짜 계산
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    const sevenDaysAgoISO = sevenDaysAgo.toISOString()

    // 14일 전 날짜 계산 (변화율 계산용)
    const fourteenDaysAgo = new Date()
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14)
    const fourteenDaysAgoISO = fourteenDaysAgo.toISOString()

    // 병렬로 모든 통계 조회
    const [
      newLogsResult,
      previousLogsResult,
      qaThreadsResult,
      activeUsersResult,
      hiddenContentResult,
      recentModerationsResult
    ] = await Promise.all([
      // 신규 로그 (7일)
      adminSupabase
        .from('review_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgoISO),
      
      // 이전 기간 로그 (8-14일 전) - 변화율 계산용
      adminSupabase
        .from('review_logs')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', fourteenDaysAgoISO)
        .lt('created_at', sevenDaysAgoISO),
      
      // Q&A 질문 수 (전체)
      adminSupabase
        .from('qa_threads')
        .select('*', { count: 'exact', head: true }),
      
      // 활성 사용자 (7일)
      adminSupabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', sevenDaysAgoISO),
      
      // 숨김 콘텐츠
      adminSupabase
        .from('review_logs')
        .select('*', { count: 'exact', head: true })
        .in('admin_status', ['hidden', 'deleted']),
      
      // 최근 모더레이션 (10개)
      adminSupabase
        .from('moderation_actions')
        .select(`
          *,
          profiles!moderation_actions_actor_id_fkey(nickname)
        `)
        .order('created_at', { ascending: false })
        .limit(10)
    ])

    // 에러 처리
    if (newLogsResult.error) {
      console.error('[API /admin/stats] Error fetching new logs:', newLogsResult.error)
    }
    if (previousLogsResult.error) {
      console.error('[API /admin/stats] Error fetching previous logs:', previousLogsResult.error)
    }
    if (qaThreadsResult.error) {
      console.error('[API /admin/stats] Error fetching QA threads:', qaThreadsResult.error)
    }
    if (activeUsersResult.error) {
      console.error('[API /admin/stats] Error fetching active users:', activeUsersResult.error)
    }
    if (hiddenContentResult.error) {
      console.error('[API /admin/stats] Error fetching hidden content:', hiddenContentResult.error)
    }
    if (recentModerationsResult.error) {
      console.error('[API /admin/stats] Error fetching recent moderations:', recentModerationsResult.error)
    }

    // 변화율 계산
    const newLogsCount = newLogsResult.count || 0
    const previousLogsCount = previousLogsResult.count || 0
    const logsChange = previousLogsCount > 0
      ? `+${Math.round(((newLogsCount - previousLogsCount) / previousLogsCount) * 100)}%`
      : newLogsCount > 0 ? '+100%' : '0%'

    return NextResponse.json({
      kpis: {
        newLogs: {
          value: newLogsCount,
          change: logsChange
        },
        qaThreads: {
          value: qaThreadsResult.count || 0,
          change: '+5%' // TODO: 실제 변화율 계산 필요
        },
        activeUsers: {
          value: activeUsersResult.count || 0,
          change: '+8%' // TODO: 실제 변화율 계산 필요
        },
        hiddenContent: {
          value: hiddenContentResult.count || 0,
          change: '-2' // TODO: 실제 변화율 계산 필요
        }
      },
      recentModerations: recentModerationsResult.data || []
    })
  } catch (error) {
    console.error('[API /admin/stats] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

