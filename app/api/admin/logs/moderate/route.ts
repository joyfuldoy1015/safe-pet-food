import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, setAdminStatus, isModerator } from '@/lib/supa/serverAdmin'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

/**
 * POST /api/admin/logs/moderate
 * 로그 모더레이션 (hide/unhide/delete/restore)
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
    const { id, action, reason } = body

    if (!id || !action) {
      return NextResponse.json(
        { error: 'Missing required fields: id and action' },
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

    // 상태 변경
    await setAdminStatus({
      table: 'review_logs',
      id,
      status: adminStatus,
      actorId: userId,
      reason
    })

    return NextResponse.json({ 
      success: true,
      message: `Log ${action} successfully`
    })
  } catch (error) {
    console.error('[API /admin/logs/moderate] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}


