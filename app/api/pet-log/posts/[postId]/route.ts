import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Supabase 사용 여부 확인
const useSupabase = () => {
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
    const postId = params.postId

    // Supabase 사용 가능하면 Supabase에서 가져오기
    if (useSupabase()) {
      try {
        // 포스트 가져오기
        const { data: post, error: postError } = await supabase
          .from('pet_log_posts')
          .select('*')
          .eq('id', postId)
          .single()

        if (!postError && post) {
          // 급여 기록 가져오기
          const { data: records } = await supabase
            .from('pet_log_feeding_records')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: false })

          // 댓글 가져오기
          const { data: comments } = await supabase
            .from('pet_log_comments')
            .select('*')
            .eq('post_id', postId)
            .order('created_at', { ascending: true })

          // 데이터 형식 변환 (Supabase → JSON 형식)
          const transformedPost = {
            ...post,
            petName: post.pet_name,
            petBreed: post.pet_breed,
            petAge: post.pet_age,
            petWeight: post.pet_weight,
            ownerName: post.owner_name,
            ownerId: post.user_id,
            ownerAvatar: post.owner_avatar,
            petAvatar: post.pet_avatar,
            petSpecies: post.pet_species,
            createdAt: post.created_at,
            updatedAt: post.updated_at,
            totalRecords: post.total_records,
            views: post.views,
            likes: post.likes,
            comments: (comments || []).map((comment: any) => ({
              ...comment,
              userName: comment.user_name,
              userAvatar: comment.user_avatar,
              userId: comment.user_id,
              createdAt: comment.created_at,
              replies: comment.replies || []
            })),
            totalComments: comments?.length || 0,
            feedingRecords: (records || []).map((record: any) => ({
              ...record,
              productName: record.product_name,
              startDate: record.start_date,
              endDate: record.end_date,
              repurchaseIntent: record.repurchase_intent,
              sideEffects: record.side_effects || [],
              benefits: record.benefits || []
            }))
          }

          return NextResponse.json(transformedPost, {
            status: 200,
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
          })
        }
      } catch (supabaseError) {
        console.warn('Supabase error, returning null:', supabaseError)
      }
    }

    // Supabase가 없거나 데이터가 없으면 null 반환
    // 클라이언트에서 localStorage fallback 사용
    return NextResponse.json(null, { status: 404 })
  } catch (error) {
    console.error('Failed to fetch pet log post:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pet log post' },
      { status: 500 }
    )
  }
}

// PUT - 펫 로그 포스트 업데이트
export async function PUT(
  request: NextRequest,
  { params }: { params: { postId: string } }
) {
  try {
    if (!useSupabase()) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 501 }
      )
    }

    const postId = params.postId
    const body = await request.json()

    const { data: updatedPost, error } = await supabase
      .from('pet_log_posts')
      .update({
        pet_name: body.petName,
        pet_breed: body.petBreed,
        pet_age: body.petAge,
        pet_weight: body.petWeight,
        total_records: body.totalRecords,
        views: body.views,
        likes: body.likes,
        comments_count: body.commentsCount || body.comments?.length || 0
      })
      .eq('id', postId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update post:', error)
      return NextResponse.json(
        { error: 'Failed to update post', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedPost)
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
    if (!useSupabase()) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 501 }
      )
    }

    const postId = params.postId

    const { error } = await supabase
      .from('pet_log_posts')
      .delete()
      .eq('id', postId)

    if (error) {
      console.error('Failed to delete post:', error)
      return NextResponse.json(
        { error: 'Failed to delete post', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Post deleted successfully' })
  } catch (error) {
    console.error('Failed to delete pet log post:', error)
    return NextResponse.json(
      { error: 'Failed to delete pet log post' },
      { status: 500 }
    )
  }
}

