import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

function isSupabaseConfigured() {
  return !!supabaseUrl && !!supabaseKey && !supabaseUrl.includes('placeholder')
}

const supabase = isSupabaseConfigured()
  ? createClient(supabaseUrl!, supabaseKey!)
  : null

/**
 * UUID 형식인지 확인하는 함수
 */
function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}

/**
 * PUT /api/review-logs/[reviewId]/helpful
 * 리뷰의 '도움됨' 카운트를 증가/감소시킵니다.
 * 
 * 리뷰는 두 가지 소스에서 올 수 있습니다:
 * 1. review_logs 테이블의 실제 레코드 (UUID ID)
 * 2. products 테이블의 consumer_reviews JSONB 필드 (문자열 ID)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { reviewId: string } }
) {
  try {
    if (!isSupabaseConfigured() || !supabase) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 501 }
      )
    }

    const reviewId = params.reviewId
    const body = await request.json()
    const { increment, productId, brandName } = body

    if (typeof increment !== 'number' || (increment !== 1 && increment !== -1)) {
      return NextResponse.json(
        { error: 'increment must be 1 or -1' },
        { status: 400 }
      )
    }

    // UUID 형식이면 review_logs 테이블에서 업데이트
    if (isUUID(reviewId)) {
      // 현재 likes 값 조회
      const { data: currentReview, error: fetchError } = await supabase
        .from('review_logs')
        .select('likes')
        .eq('id', reviewId)
        .single()

      if (fetchError) {
        console.error('Failed to fetch review:', fetchError)
        return NextResponse.json(
          { error: 'Review not found', details: fetchError.message },
          { status: 404 }
        )
      }

      // 새로운 likes 값 계산 (0 이상으로 제한)
      const newLikes = Math.max(0, (currentReview.likes || 0) + increment)

      // 업데이트
      const { data: updatedReview, error: updateError } = await supabase
        .from('review_logs')
        .update({ likes: newLikes })
        .eq('id', reviewId)
        .select('likes')
        .single()

      if (updateError) {
        console.error('Failed to update review:', updateError)
        return NextResponse.json(
          { error: 'Failed to update review', details: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        likes: updatedReview.likes,
        increment
      })
    } else {
      // UUID가 아니면 products 테이블의 consumer_reviews JSONB 업데이트
      if (!productId || !brandName) {
        return NextResponse.json(
          { error: 'productId and brandName are required for non-UUID review IDs' },
          { status: 400 }
        )
      }

      // products 테이블에서 해당 제품 조회
      const { data: brandData, error: brandError } = await supabase
        .from('brands')
        .select('id')
        .eq('name', brandName)
        .single()

      if (brandError || !brandData) {
        return NextResponse.json(
          { error: 'Brand not found', details: brandError?.message },
          { status: 404 }
        )
      }

      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('consumer_reviews')
        .eq('id', productId)
        .eq('brand_id', brandData.id)
        .single()

      if (productError || !productData) {
        return NextResponse.json(
          { error: 'Product not found', details: productError?.message },
          { status: 404 }
        )
      }

      // consumer_reviews 배열에서 해당 리뷰 찾기 및 업데이트
      const reviews = (productData.consumer_reviews || []) as Array<{
        id: string
        helpful_count?: number
        [key: string]: any
      }>

      const reviewIndex = reviews.findIndex((r: any) => r.id === reviewId)
      if (reviewIndex === -1) {
        return NextResponse.json(
          { error: 'Review not found in product consumer_reviews' },
          { status: 404 }
        )
      }

      // helpful_count 업데이트
      const currentCount = reviews[reviewIndex].helpful_count || 0
      const newCount = Math.max(0, currentCount + increment)
      reviews[reviewIndex].helpful_count = newCount

      // products 테이블 업데이트
      const { data: updatedProduct, error: updateError } = await supabase
        .from('products')
        .update({ consumer_reviews: reviews })
        .eq('id', productId)
        .select('consumer_reviews')
        .single()

      if (updateError) {
        console.error('Failed to update product consumer_reviews:', updateError)
        return NextResponse.json(
          { error: 'Failed to update review', details: updateError.message },
          { status: 500 }
        )
      }

      return NextResponse.json({
        success: true,
        likes: newCount,
        increment
      })
    }
  } catch (error) {
    console.error('Failed to update helpful count:', error)
    return NextResponse.json(
      { error: 'Failed to update helpful count' },
      { status: 500 }
    )
  }
}

