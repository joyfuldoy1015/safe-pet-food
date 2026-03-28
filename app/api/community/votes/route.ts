import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supa/serverAdmin'
import { getServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const serverClient = getServerClient()
    const { data: { user }, error: authError } = await serverClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { targetType, targetId } = await request.json()
    if (!targetType || !targetId) {
      return NextResponse.json({ error: 'targetType and targetId required' }, { status: 400 })
    }
    if (!['question', 'answer'].includes(targetType)) {
      return NextResponse.json({ error: 'Invalid targetType' }, { status: 400 })
    }

    const admin = getAdminClient()
    const table = targetType === 'question' ? 'community_questions' : 'community_answers'

    const { data: existingVote } = await admin
      .from('community_votes' as any)
      .select('id')
      .eq('user_id', user.id)
      .eq('target_type', targetType)
      .eq('target_id', targetId)
      .single() as { data: { id: string } | null }

    const { data: target } = await admin
      .from(table)
      .select('votes')
      .eq('id', targetId)
      .single() as { data: { votes: number } | null }

    if (!target) {
      return NextResponse.json({ error: 'Target not found' }, { status: 404 })
    }

    const currentVotes = target.votes || 0

    if (existingVote) {
      await (admin.from('community_votes' as any) as any)
        .delete()
        .eq('id', existingVote.id)

      await (admin.from(table) as any)
        .update({ votes: Math.max(0, currentVotes - 1) })
        .eq('id', targetId)

      return NextResponse.json({
        success: true,
        voted: false,
        votes: Math.max(0, currentVotes - 1)
      })
    } else {
      await (admin.from('community_votes' as any) as any)
        .insert({
          user_id: user.id,
          target_type: targetType,
          target_id: targetId,
          vote_value: 1
        })

      await (admin.from(table) as any)
        .update({ votes: currentVotes + 1 })
        .eq('id', targetId)

      return NextResponse.json({
        success: true,
        voted: true,
        votes: currentVotes + 1
      })
    }
  } catch (error) {
    console.error('Vote API error:', error)
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const serverClient = getServerClient()
    const { data: { user }, error: authError } = await serverClient.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ votes: {} })
    }

    const { searchParams } = new URL(request.url)
    const targetIds = searchParams.get('targetIds')?.split(',').filter(Boolean)
    if (!targetIds?.length) {
      return NextResponse.json({ votes: {} })
    }

    const admin = getAdminClient()
    const { data } = await admin
      .from('community_votes' as any)
      .select('target_id')
      .eq('user_id', user.id)
      .in('target_id', targetIds) as { data: { target_id: string }[] | null }

    const voteMap: Record<string, boolean> = {}
    data?.forEach((v) => { voteMap[v.target_id] = true })

    return NextResponse.json({ votes: voteMap })
  } catch {
    return NextResponse.json({ votes: {} })
  }
}
