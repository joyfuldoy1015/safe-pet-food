import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, isAdmin } from '@/lib/supa/serverAdmin'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

/**
 * GET /api/admin/logs/export
 * 로그 데이터를 CSV 형식으로 내보내기
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

    // 모든 로그 조회 (관리자는 모든 로그 조회 가능)
    const { data: logs, error } = await adminSupabase
      .from('review_logs')
      .select(`
        *,
        profiles!review_logs_owner_id_fkey(nickname, id),
        pets!review_logs_pet_id_fkey(name, species, id)
      `)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[API /admin/logs/export] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch logs', details: error.message },
        { status: 500 }
      )
    }

    // CSV 헤더
    const headers = [
      'ID',
      '생성일',
      '업데이트일',
      '소유자',
      '반려동물',
      '종류',
      '카테고리',
      '브랜드',
      '제품명',
      '상태',
      '시작일',
      '종료일',
      '기간(일)',
      '평점',
      '추천',
      '계속 이유',
      '중단 이유',
      '요약',
      '메모',
      '좋아요',
      '조회수',
      '댓글 수',
      '관리자 상태'
    ]

    // CSV 데이터 변환
    const csvRows = [
      headers.join(','),
      ...(logs || []).map((log: any) => {
        const profile = Array.isArray(log.profiles) ? log.profiles[0] : log.profiles
        const pet = Array.isArray(log.pets) ? log.pets[0] : log.pets
        
        return [
          log.id || '',
          log.created_at || '',
          log.updated_at || '',
          profile?.nickname || '',
          pet?.name || '',
          pet?.species || '',
          log.category || '',
          log.brand || '',
          log.product || '',
          log.status || '',
          log.period_start || '',
          log.period_end || '',
          log.duration_days || '',
          log.rating || '',
          log.recommend ? '예' : '아니오',
          Array.isArray(log.continue_reasons) ? log.continue_reasons.join('; ') : '',
          Array.isArray(log.stop_reasons) ? log.stop_reasons.join('; ') : '',
          (log.excerpt || '').replace(/"/g, '""').replace(/\n/g, ' '),
          (log.notes || '').replace(/"/g, '""').replace(/\n/g, ' '),
          log.likes || 0,
          log.views || 0,
          log.comments_count || 0,
          log.admin_status || 'visible'
        ].map(field => {
          // CSV 이스케이프 처리
          const str = String(field)
          if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`
          }
          return str
        }).join(',')
      })
    ]

    const csvContent = csvRows.join('\n')

    // CSV 파일로 응답
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="logs_export_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error) {
    console.error('[API /admin/logs/export] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

