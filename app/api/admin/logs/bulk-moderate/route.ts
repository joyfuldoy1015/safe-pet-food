import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, setAdminStatus, isModerator } from '@/lib/supa/serverAdmin'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

/**
 * POST /api/admin/logs/bulk-moderate
 * 로그 일괄 모더레이션 (hide/unhide/delete/restore)
 */
export async function POST(request: NextRequest) {
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

    // Check if user is moderator or admin
    const isMod = await isModerator(user.id)
    if (!isMod) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const userId = user.id

    const body = await request.json()
    const { ids, action, reason } = body

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: ids (array)' },
        { status: 400 }
      )
    }

    if (!action) {
      return NextResponse.json(
        { error: 'Missing required field: action' },
        { status: 400 }
      )
    }

    // action을 admin_status로 변환
    const statusMap: Record<string, 'visible' | 'hidden' | 'deleted'> = {
      hide: 'hidden',
      unhide: 'visible',
      delete: 'deleted',
      restore: 'visible'
    }

    const adminStatus = statusMap[action]
    if (!adminStatus) {
      return NextResponse.json(
        { error: 'Invalid action. Must be one of: hide, unhide, delete, restore' },
        { status: 400 }
      )
    }

    // 모든 ID에 대해 상태 변경
    const results = await Promise.allSettled(
      ids.map((id: string) =>
        setAdminStatus({
          table: 'review_logs',
          id,
          status: adminStatus,
          actorId: userId,
          reason: reason || `Bulk ${action}`
        })
      )
    )

    // 성공/실패 개수 계산
    const successful = results.filter(r => r.status === 'fulfilled').length
    const failed = results.filter(r => r.status === 'rejected').length

    return NextResponse.json({
      success: true,
      message: `Bulk ${action} completed`,
      results: {
        total: ids.length,
        successful,
        failed
      }
    })
  } catch (error) {
    console.error('[API /admin/logs/bulk-moderate] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

