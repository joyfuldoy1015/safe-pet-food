import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// Supabase 사용 여부 확인
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  )
}

// GET - 전체 제품 목록 조회
export async function GET(request: NextRequest) {
  try {
    const supabase = getServerClient()
    const { searchParams } = new URL(request.url)
    
    const brandId = searchParams.get('brand_id')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '100')

    if (!isSupabaseConfigured()) {
      // Mock 데이터 반환
      return NextResponse.json([])
    }

    let query = supabase
      .from('products')
      .select(`
        *,
        brands:brand_id (
          id,
          name,
          manufacturer,
          country
        )
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    // 브랜드 필터
    if (brandId) {
      query = query.eq('brand_id', brandId)
    }

    // 검색어 필터
    if (search) {
      query = query.ilike('name', `%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch products:', error)
      return NextResponse.json(
        { error: 'Failed to fetch products', details: error.message },
        { status: 500 }
      )
    }

    // 데이터 변환 (컴포넌트 호환 형식)
    const products = (data || []).map((product: any) => ({
      id: product.id,
      brand_id: product.brand_id,
      brand_name: product.brands?.name || '',
      brand_country: product.brands?.country || '',
      name: product.name,
      image: product.image,
      description: product.description,
      grade: product.grade || null,
      grade_text: product.grade_text || null,
      certifications: product.certifications || [],
      ingredients: product.ingredients || [],
      guaranteed_analysis: product.guaranteed_analysis,
      pros: product.pros || [],
      cons: product.cons || [],
      consumer_ratings: product.consumer_ratings,
      community_feedback: product.community_feedback,
      consumer_reviews: product.consumer_reviews || [],
      created_at: product.created_at,
      updated_at: product.updated_at
    }))

    return NextResponse.json(products)
  } catch (error) {
    console.error('Failed to fetch products:', error)
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    )
  }
}
