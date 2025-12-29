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

// GET - 특정 펫 로그 포스트 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 501 }
      )
    }

    // 포스트 조회
    const { data: post, error: postError } = await supabase
      .from('pet_log_posts')
      .select('*')
      .eq('id', postId)
      .single()

    if (postError || !post) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // 급여 기록 조회
    const { data: records } = await supabase
      .from('pet_log_feeding_records')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: false })

    // 댓글 조회
    const { data: comments } = await supabase
      .from('pet_log_comments')
      .select('*')
      .eq('post_id', postId)
      .order('created_at', { ascending: true })

    return NextResponse.json({
      ...post,
      feedingRecords: records || [],
      comments: comments || [],
      totalComments: comments?.length || 0
    })
  } catch (error) {
    console.error('Failed to fetch pet log post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pet log post' },
      { status: 500 }
    )
  }
}

// PATCH - 펫 로그 포스트 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 501 }
      )
    }

    const body = await request.json()
    const { post, feedingRecords } = body

    // 서버 사이드 Supabase 클라이언트로 인증 확인
    const serverSupabase = getServerClient()
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 기존 포스트 조회 및 권한 확인
    const { data: existingPost, error: fetchError } = await supabase
      .from('pet_log_posts')
      .select('user_id')
      .eq('id', postId)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // 작성자 확인
    if (existingPost.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own posts' },
        { status: 403 }
      )
    }

    // 포스트 업데이트
    const { data: updatedPost, error: updateError } = await supabase
      .from('pet_log_posts')
      .update({
        pet_name: post.petName,
        pet_breed: post.petBreed,
        pet_age: post.petAge,
        pet_weight: post.petWeight,
        owner_name: post.ownerName,
        pet_avatar: post.petAvatar || null,
        pet_species: post.petSpecies || 'dog',
        total_records: feedingRecords?.length || 0,
        updated_at: new Date().toISOString()
      })
      .eq('id', postId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update post:', updateError)
      return NextResponse.json(
        { error: 'Failed to update post', details: updateError.message },
        { status: 500 }
      )
    }

    // 기존 급여 기록 삭제
    await supabase
      .from('pet_log_feeding_records')
      .delete()
      .eq('post_id', postId)

    // 새로운 급여 기록 추가
    if (feedingRecords && feedingRecords.length > 0) {
      const recordsToInsert = feedingRecords.map((record: any) => ({
        id: record.id,
        post_id: postId,
        product_name: record.productName,
        category: record.category,
        brand: record.brand || null,
        start_date: record.startDate,
        end_date: record.endDate || null,
        status: record.status,
        duration: record.duration || '',
        palatability: record.palatability || 0,
        satisfaction: record.satisfaction || 0,
        repurchase_intent: record.repurchaseIntent || false,
        comment: record.comment || null,
        price: record.price || null,
        purchase_location: record.purchaseLocation || null,
        side_effects: record.sideEffects || [],
        benefits: record.benefits || []
      }))

      const { error: recordsError } = await supabase
        .from('pet_log_feeding_records')
        .insert(recordsToInsert)

      if (recordsError) {
        console.error('Failed to update feeding records:', recordsError)
      }
    }

    return NextResponse.json({
      ...updatedPost,
      feedingRecords: feedingRecords || []
    })
  } catch (error) {
    console.error('Failed to update pet log post:', error)
    return NextResponse.json(
      { error: 'Failed to update pet log post' },
      { status: 500 }
    )
  }
}

// DELETE - 펫 로그 포스트 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    const { postId } = params

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 501 }
      )
    }

    // 서버 사이드 Supabase 클라이언트로 인증 확인
    const serverSupabase = getServerClient()
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 기존 포스트 조회 및 권한 확인
    const { data: existingPost, error: fetchError } = await supabase
      .from('pet_log_posts')
      .select('user_id')
      .eq('id', postId)
      .single()

    if (fetchError || !existingPost) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      )
    }

    // 작성자 확인
    if (existingPost.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own posts' },
        { status: 403 }
      )
    }

    // 연관된 급여 기록 삭제
    await supabase
      .from('pet_log_feeding_records')
      .delete()
      .eq('post_id', postId)

    // 연관된 댓글 삭제
    await supabase
      .from('pet_log_comments')
      .delete()
      .eq('post_id', postId)

    // 포스트 삭제
    const { error: deleteError } = await supabase
      .from('pet_log_posts')
      .delete()
      .eq('id', postId)

    if (deleteError) {
      console.error('Failed to delete post:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete post', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete pet log post:', error)
    return NextResponse.json(
      { error: 'Failed to delete pet log post' },
      { status: 500 }
    )
  }
}
