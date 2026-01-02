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

// GET - 특정 review log 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { logId: string } }
) {
  try {
    const supabase = getServerClient()
    const { logId } = params

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 501 }
      )
    }

    const { data, error } = await supabase
      .from('review_logs')
      .select('*')
      .eq('id', logId)
      .single()

    if (error || !data) {
      return NextResponse.json(
        { error: 'Review log not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Failed to fetch review log:', error)
    return NextResponse.json(
      { error: 'Failed to fetch review log' },
      { status: 500 }
    )
  }
}

// PATCH - review log 수정
export async function PATCH(
  request: NextRequest,
  { params }: { params: { logId: string } }
) {
  try {
    const { logId } = params

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 501 }
      )
    }

    const body = await request.json()

    // 서버 사이드 Supabase 클라이언트로 인증 확인
    const serverSupabase = getServerClient()
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 기존 로그 조회 및 권한 확인
    const { data: existingLog, error: fetchError } = await serverSupabase
      .from('review_logs')
      .select('owner_id')
      .eq('id', logId)
      .single()

    if (fetchError || !existingLog) {
      return NextResponse.json(
        { error: 'Review log not found' },
        { status: 404 }
      )
    }

    // 작성자 확인
    if ((existingLog as any).owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only edit your own review logs' },
        { status: 403 }
      )
    }

    // 로그 업데이트
    const { data: updatedLog, error: updateError } = await (serverSupabase
      .from('review_logs') as any)
      .update({
        ...body,
        updated_at: new Date().toISOString()
      })
      .eq('id', logId)
      .select()
      .single()

    if (updateError) {
      console.error('Failed to update review log:', updateError)
      return NextResponse.json(
        { error: 'Failed to update review log', details: updateError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(updatedLog)
  } catch (error) {
    console.error('Failed to update review log:', error)
    return NextResponse.json(
      { error: 'Failed to update review log' },
      { status: 500 }
    )
  }
}

// DELETE - review log 삭제
export async function DELETE(
  request: NextRequest,
  { params }: { params: { logId: string } }
) {
  try {
    const { logId } = params

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

    // 기존 로그 조회 및 권한 확인
    const { data: existingLog, error: fetchError } = await serverSupabase
      .from('review_logs')
      .select('owner_id')
      .eq('id', logId)
      .single()

    if (fetchError || !existingLog) {
      return NextResponse.json(
        { error: 'Review log not found' },
        { status: 404 }
      )
    }

    // 작성자 확인
    if ((existingLog as any).owner_id !== user.id) {
      return NextResponse.json(
        { error: 'Forbidden - You can only delete your own review logs' },
        { status: 403 }
      )
    }

    // 로그 삭제
    const { error: deleteError } = await serverSupabase
      .from('review_logs')
      .delete()
      .eq('id', logId)

    if (deleteError) {
      console.error('Failed to delete review log:', deleteError)
      return NextResponse.json(
        { error: 'Failed to delete review log', details: deleteError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete review log:', error)
    return NextResponse.json(
      { error: 'Failed to delete review log' },
      { status: 500 }
    )
  }
}
