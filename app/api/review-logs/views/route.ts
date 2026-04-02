import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supa/serverAdmin'

export async function POST(request: NextRequest) {
  try {
    const { logId } = await request.json()
    if (!logId) {
      return NextResponse.json({ error: 'logId required' }, { status: 400 })
    }

    const supabase = getAdminClient()

    const { data } = await supabase
      .from('review_logs')
      .select('views')
      .eq('id', logId)
      .single() as { data: { views: number } | null }

    if (!data) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    await (supabase.from('review_logs') as any)
      .update({ views: (data.views || 0) + 1 })
      .eq('id', logId)

    return NextResponse.json({ success: true, views: (data.views || 0) + 1 })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
