import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Supabase 사용 여부 확인
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  )
}

// POST - 댓글 생성
export async function POST(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 501 }
      )
    }

    const body = await request.json()
    const { postId, comment } = body

    if (!postId || !comment) {
      return NextResponse.json(
        { error: 'postId and comment are required' },
        { status: 400 }
      )
    }

    const { data: newComment, error } = await supabase
      .from('pet_log_comments')
      .insert([{
        id: comment.id,
        post_id: postId,
        user_id: comment.userId,
        user_name: comment.userName,
        user_avatar: comment.userAvatar || null,
        content: comment.content,
        likes: comment.likes || 0,
        is_liked: comment.isLiked || false,
        replies: comment.replies || []
      }])
      .select()
      .single()

    if (error) {
      console.error('Failed to create comment:', error)
      return NextResponse.json(
        { error: 'Failed to create comment', details: error.message },
        { status: 500 }
      )
    }

    // 포스트의 댓글 수 업데이트
    await supabase.rpc('increment_comments_count', { post_id: postId })
      .catch(() => {
        // RPC가 없으면 직접 업데이트
        supabase
          .from('pet_log_posts')
          .update({ comments_count: supabase.raw('comments_count + 1') })
          .eq('id', postId)
      })

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

// PUT - 댓글 업데이트 (좋아요 등)
export async function PUT(request: Request) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 501 }
      )
    }

    const body = await request.json()
    const { commentId, updates } = body

    if (!commentId || !updates) {
      return NextResponse.json(
        { error: 'commentId and updates are required' },
        { status: 400 }
      )
    }

    const { data: updatedComment, error } = await supabase
      .from('pet_log_comments')
      .update({
        likes: updates.likes,
        is_liked: updates.isLiked,
        replies: updates.replies || []
      })
      .eq('id', commentId)
      .select()
      .single()

    if (error) {
      console.error('Failed to update comment:', error)
      return NextResponse.json(
        { error: 'Failed to update comment', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error('Failed to update comment:', error)
    return NextResponse.json(
      { error: 'Failed to update comment' },
      { status: 500 }
    )
  }
}

