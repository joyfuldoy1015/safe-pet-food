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
 * PUT /api/review-logs/[reviewId]/helpful
 * 리뷰의 '도움됨' 카운트를 증가/감소시킵니다.
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
    const { increment } = body

    if (typeof increment !== 'number' || (increment !== 1 && increment !== -1)) {
      return NextResponse.json(
        { error: 'increment must be 1 or -1' },
        { status: 400 }
      )
    }

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
  } catch (error) {
    console.error('Failed to update helpful count:', error)
    return NextResponse.json(
      { error: 'Failed to update helpful count' },
      { status: 500 }
    )
  }
}

