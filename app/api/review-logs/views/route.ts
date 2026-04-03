import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supa/serverAdmin'
import { rateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.read)
  if (!rl.success) return rateLimitResponse(rl)

  try {
    const { logId } = await request.json()
    if (!logId) {
      return NextResponse.json({ error: 'logId required' }, { status: 400 })
    }

    const supabase = getAdminClient()

    // 원자적 증가 (docs/migrations/001_brand_votes.sql 의 RPC 함수 필요)
    const { error } = await (supabase.rpc as any)('increment_review_log_views', {
      log_id: logId,
    })

    if (error) {
      console.error('[review-logs/views] rpc error:', error)
      return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
