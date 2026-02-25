import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'
import { rateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

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
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.write)
  if (!rl.success) return rateLimitResponse(rl)

  try {
    const supabase = getServerClient()
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

    const { data: newComment, error } = await (supabase
      .from('pet_log_comments') as any)
      .insert([{
        id: comment.id,
        post_id: postId,
        user_id: comment.userId,
        user_name: comment.userName,
        user_avatar: comment.userAvatar || null,
        content: comment.content,
        likes: comment.likes || 0,
        is_liked: comment.isLiked || false,
        replies: comment.replies || [],
        type: comment.type || 'comment'
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
    try {
      const { error: rpcError } = await (supabase as any).rpc('increment_comments_count', { post_id: postId })
      if (rpcError) {
        // RPC가 없으면 현재 값을 가져와서 +1 해서 업데이트
        const { data: post, error: fetchError } = await supabase
          .from('pet_log_posts')
          .select('comments_count')
          .eq('id', postId)
          .single()
        
        if (!fetchError && post) {
          await (supabase
            .from('pet_log_posts') as any)
            .update({ comments_count: ((post as any).comments_count || 0) + 1 })
            .eq('id', postId)
        }
      }
    } catch (error) {
      // RPC가 없으면 현재 값을 가져와서 +1 해서 업데이트
      const { data: post, error: fetchError } = await supabase
        .from('pet_log_posts')
        .select('comments_count')
        .eq('id', postId)
        .single()
      
      if (!fetchError && post) {
        await (supabase
          .from('pet_log_posts') as any)
          .update({ comments_count: ((post as any).comments_count || 0) + 1 })
          .eq('id', postId)
      }
    }

    return NextResponse.json(newComment, { status: 201 })
  } catch (error) {
    console.error('Failed to create comment:', error)
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    )
  }
}

// PUT - 댓글 업데이트 (좋아요, 내용 수정 등)
export async function PUT(request: Request) {
  try {
    const supabase = getServerClient()
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

    // 업데이트할 필드 구성
    const updateData: any = {}
    if (updates.likes !== undefined) updateData.likes = updates.likes
    if (updates.isLiked !== undefined) updateData.is_liked = updates.isLiked
    if (updates.replies !== undefined) updateData.replies = updates.replies
    if (updates.content !== undefined) updateData.content = updates.content

    const { data: updatedComment, error } = await (supabase
      .from('pet_log_comments') as any)
      .update(updateData)
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

// DELETE - 댓글 삭제
export async function DELETE(request: Request) {
  try {
    const supabase = getServerClient()
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 501 }
      )
    }

    const body = await request.json()
    const { commentId } = body

    if (!commentId) {
      return NextResponse.json(
        { error: 'commentId is required' },
        { status: 400 }
      )
    }

    // 댓글이 속한 포스트 ID 가져오기
    const { data: comment, error: fetchError } = await supabase
      .from('pet_log_comments')
      .select('post_id')
      .eq('id', commentId)
      .single()

    if (fetchError || !comment) {
      return NextResponse.json(
        { error: 'Comment not found' },
        { status: 404 }
      )
    }

    const postId = (comment as any).post_id

    // 댓글 삭제
    const { error } = await supabase
      .from('pet_log_comments')
      .delete()
      .eq('id', commentId)

    if (error) {
      console.error('Failed to delete comment:', error)
      return NextResponse.json(
        { error: 'Failed to delete comment', details: error.message },
        { status: 500 }
      )
    }

    // 포스트의 댓글 수 감소
    try {
      const { data: post, error: fetchError } = await supabase
        .from('pet_log_posts')
        .select('comments_count')
        .eq('id', postId)
        .single()
      
      if (!fetchError && post) {
        const newCount = Math.max(0, ((post as any).comments_count || 1) - 1)
        await (supabase
          .from('pet_log_posts') as any)
          .update({ comments_count: newCount })
          .eq('id', postId)
      }
    } catch (error) {
      console.warn('Failed to update comments count:', error)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete comment:', error)
    return NextResponse.json(
      { error: 'Failed to delete comment' },
      { status: 500 }
    )
  }
}

