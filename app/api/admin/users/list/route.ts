import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient, isAdmin } from '@/lib/supa/serverAdmin'
import { parsePaginationParams, parseSortParams, buildFilterQuery } from '@/lib/supa/adminQueries'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'
export const revalidate = 0

/**
 * GET /api/admin/users/list
 * 사용자 목록 조회 (admin 전용)
 */
export async function GET(request: NextRequest) {
  try {
    // Bearer 토큰으로 사용자 인증
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const authHeader = request.headers.get('Authorization')
    const accessToken = authHeader?.replace('Bearer ', '')
    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const authClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: { persistSession: false, autoRefreshToken: false }
    })
    const { data: { user }, error: authError } = await authClient.auth.getUser(accessToken)
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const admin = await isAdmin(user.id)
    if (!admin) {
      return NextResponse.json({ error: 'Forbidden: admin only' }, { status: 403 })
    }

    let supabase
    try {
      supabase = getAdminClient()
    } catch (error) {
      console.error('[API /admin/users/list] Admin client error:', error)
      return NextResponse.json(
        { error: 'Admin credentials not configured', details: 'SUPABASE_SERVICE_ROLE_KEY is required' },
        { status: 503 }
      )
    }
    
    // 파라미터 파싱
    const searchParams = request.nextUrl.searchParams
    const { limit, offset } = parsePaginationParams(searchParams)
    const { sortColumn, sortDirection } = parseSortParams(searchParams)
    
    // 필터 파싱
    const filters: Record<string, string> = {}
    if (searchParams.get('role')) filters.role = searchParams.get('role')!
    if (searchParams.get('email')) filters.email = searchParams.get('email')!
    if (searchParams.get('nickname')) filters.nickname = searchParams.get('nickname')!

    // 쿼리 빌드
    let query = supabase
      .from('profiles')
      .select(`
        *,
        roles(role),
        pets(count),
        review_logs(count)
      `, { count: 'exact' })

    // 필터 적용
    if (filters.role) {
      query = query.eq('roles.role', filters.role)
    }
    if (filters.nickname) {
      query = query.ilike('nickname', `%${filters.nickname}%`)
    }

    // 정렬 적용
    query = query.order(sortColumn, { ascending: sortDirection === 'asc' })

    // 페이지네이션 적용
    query = query.range(offset, offset + limit - 1)

    // 실행
    const { data, error, count } = await query

    if (error) {
      console.error('[API /admin/users/list] Error:', error)
      return NextResponse.json(
        { error: 'Failed to fetch users', details: error.message },
        { status: 500 }
      )
    }

    // 데이터 변환 (pets와 review_logs는 count로 변환)
    const transformedData = (data || []).map((user: any) => ({
      id: user.id,
      nickname: user.nickname,
      email: user.email || 'N/A', // auth.users에서 가져와야 함
      role: user.roles?.[0]?.role || 'user',
      pets_count: user.pets?.[0]?.count || 0,
      logs_count: user.review_logs?.[0]?.count || 0,
      created_at: user.created_at
    }))

    return NextResponse.json({
      data: transformedData,
      pagination: {
        page: Math.floor(offset / limit) + 1,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    })
  } catch (error) {
    console.error('[API /admin/users/list] Exception:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


