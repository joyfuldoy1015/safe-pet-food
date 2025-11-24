import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, isAdmin } from '@/lib/supa/serverAdmin'
import { parsePaginationParams, parseSortParams, buildFilterQuery, buildDateRangeQuery } from '@/lib/supa/adminQueries'
import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

// Force dynamic rendering + disable caching (uses headers & auth)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

/**
 * GET /api/admin/logs/list
 * 로그 목록 조회 (필터, 정렬, 페이지네이션 지원)
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

    // 파라미터 파싱
    const searchParams = request.nextUrl.searchParams
    const { limit, offset } = parsePaginationParams(searchParams)
    const { sortColumn, sortDirection } = parseSortParams(searchParams)
    
    // 필터 파싱
    const filters: Record<string, string> = {}
    if (searchParams.get('category')) filters.category = searchParams.get('category')!
    if (searchParams.get('status')) filters.status = searchParams.get('status')!
    if (searchParams.get('admin_status')) filters.admin_status = searchParams.get('admin_status')!
    if (searchParams.get('search')) filters.search = searchParams.get('search')!

    // 쿼리 빌드
    let query = adminSupabase
      .from('review_logs')
      .select(`
        *,
        profiles!review_logs_owner_id_fkey(nickname, avatar_url),
        pets!review_logs_pet_id_fkey(name, species)
      `, { count: 'exact' })

    // 필터 적용
    query = buildFilterQuery(query, filters)
    query = buildDateRangeQuery(query, searchParams, 'created_at')

    // 정렬 적용
    query = query.order(sortColumn, { ascending: sortDirection === 'asc' })

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1)

    // 실행
    const { data, error, count } = await query

    if (error) {
      console.error('[API /admin/logs/list] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch logs', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      data: data || [],
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('[API /admin/logs/list] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


