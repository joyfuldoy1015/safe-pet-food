import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supa/serverAdmin'

export async function POST(request: NextRequest) {
  try {
    const { questionId } = await request.json()
    if (!questionId) {
      return NextResponse.json({ error: 'questionId required' }, { status: 400 })
    }

    const supabase = getAdminClient()

    const { data } = await supabase
      .from('community_questions')
      .select('views')
      .eq('id', questionId)
      .single() as { data: { views: number } | null }

    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await (supabase.from('community_questions') as any)
      .update({ views: (data.views || 0) + 1 })
      .eq('id', questionId)

    return NextResponse.json({ success: true, views: (data.views || 0) + 1 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
