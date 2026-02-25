import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'
import { rateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

// POST: 새 제품 등록 요청 생성
export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.write)
  if (!rl.success) return rateLimitResponse(rl)

  try {
    const supabase = getServerClient()
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { brand_name, product_name, category, description } = body

    if (!brand_name || !product_name) {
      return NextResponse.json(
        { error: '브랜드명과 제품명은 필수입니다.' },
        { status: 400 }
      )
    }

    // 사용자 프로필에서 닉네임 가져오기
    const { data: profile } = await (supabase
      .from('profiles') as any)
      .select('nickname')
      .eq('id', user.id)
      .maybeSingle()

    const requesterName = profile?.nickname || '익명'

    // 제품 등록 요청 생성
    const { data, error } = await (supabase
      .from('product_requests') as any)
      .insert({
        requester_id: user.id,
        requester_name: requesterName,
        brand_name,
        product_name,
        category: category || 'feed',
        description: description || null,
        status: 'pending'
      })
      .select()
      .single()

    if (error) {
      console.error('제품 요청 생성 오류:', error)
      return NextResponse.json(
        { error: '제품 등록 요청에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: '제품 등록 요청이 접수되었습니다. 운영자 검토 후 등록됩니다.',
      data
    })
  } catch (error) {
    console.error('제품 요청 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// GET: 제품 등록 요청 목록 조회 (관리자용)
export async function GET(request: NextRequest) {
  try {
    const supabase = getServerClient()
    
    // 현재 사용자 확인
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    // 관리자 권한 확인 (roles 테이블 사용)
    const { data: roleData } = await supabase
      .from('roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    const isAdmin = !!roleData

    const searchParams = request.nextUrl.searchParams
    const status = searchParams.get('status') // pending, approved, rejected, all
    const myRequests = searchParams.get('my') === 'true' // 내 요청만 보기

    let query = (supabase.from('product_requests') as any).select('*')

    if (myRequests) {
      // 일반 사용자: 자신의 요청만 조회
      query = query.eq('requester_id', user.id)
    } else if (!isAdmin) {
      // 관리자가 아니면 자신의 요청만
      query = query.eq('requester_id', user.id)
    }

    if (status && status !== 'all') {
      query = query.eq('status', status)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query

    if (error) {
      console.error('제품 요청 조회 오류:', error)
      return NextResponse.json(
        { error: '요청 목록 조회에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('제품 요청 조회 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
