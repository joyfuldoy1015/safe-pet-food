import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'

// PATCH: 제품 등록 요청 승인/거절 (관리자용)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params
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

    if (!roleData) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { status, review_notes } = body

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: '유효한 상태값이 필요합니다. (approved 또는 rejected)' },
        { status: 400 }
      )
    }

    // 요청 정보 가져오기
    const { data: requestData, error: fetchError } = await (supabase
      .from('product_requests') as any)
      .select('*')
      .eq('id', requestId)
      .single()

    if (fetchError || !requestData) {
      return NextResponse.json(
        { error: '요청을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    if (requestData.status !== 'pending') {
      return NextResponse.json(
        { error: '이미 처리된 요청입니다.' },
        { status: 400 }
      )
    }

    let approvedProductId = null

    // 승인 시 제품 생성
    if (status === 'approved') {
      // 브랜드 찾기 또는 생성
      let brandId = null
      const { data: existingBrand } = await (supabase
        .from('brands') as any)
        .select('id')
        .ilike('name', requestData.brand_name)
        .maybeSingle()

      if (existingBrand) {
        brandId = existingBrand.id
      } else {
        // 브랜드가 없으면 새로 생성
        const { data: newBrand, error: brandError } = await (supabase
          .from('brands') as any)
          .insert({
            name: requestData.brand_name,
            logo: '📦',
            category: 'pet_food',
            description: `${requestData.brand_name} 브랜드`
          })
          .select()
          .single()

        if (brandError) {
          console.error('브랜드 생성 오류:', brandError)
          return NextResponse.json(
            { error: '브랜드 생성에 실패했습니다.' },
            { status: 500 }
          )
        }
        brandId = newBrand.id
      }

      // 제품 생성
      const { data: newProduct, error: productError } = await (supabase
        .from('products') as any)
        .insert({
          brand_id: brandId,
          name: requestData.product_name,
          description: requestData.description || `${requestData.brand_name} ${requestData.product_name}`
        })
        .select()
        .single()

      if (productError) {
        console.error('제품 생성 오류:', productError)
        return NextResponse.json(
          { error: '제품 생성에 실패했습니다.' },
          { status: 500 }
        )
      }

      approvedProductId = newProduct.id
    }

    // 요청 상태 업데이트
    const { data, error } = await (supabase
      .from('product_requests') as any)
      .update({
        status,
        reviewed_by: user.id,
        reviewed_at: new Date().toISOString(),
        review_notes: review_notes || null,
        approved_product_id: approvedProductId
      })
      .eq('id', requestId)
      .select()
      .single()

    if (error) {
      console.error('요청 상태 업데이트 오류:', error)
      return NextResponse.json(
        { error: '요청 처리에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: status === 'approved' 
        ? '제품이 승인되어 등록되었습니다.' 
        : '요청이 거절되었습니다.',
      data
    })
  } catch (error) {
    console.error('제품 요청 처리 API 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

// GET: 단일 요청 조회
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ requestId: string }> }
) {
  try {
    const { requestId } = await params
    const supabase = getServerClient()
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: '로그인이 필요합니다.' },
        { status: 401 }
      )
    }

    const { data, error } = await (supabase
      .from('product_requests') as any)
      .select('*')
      .eq('id', requestId)
      .single()

    if (error) {
      return NextResponse.json(
        { error: '요청을 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 본인 요청이거나 관리자인지 확인
    const { data: roleData } = await supabase
      .from('roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .maybeSingle()

    const isAdmin = !!roleData
    if (data.requester_id !== user.id && !isAdmin) {
      return NextResponse.json(
        { error: '접근 권한이 없습니다.' },
        { status: 403 }
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
