import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/supa/serverAdmin'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const serverSupabase = getServerClient()
    const { data: { user }, error: authError } = await serverSupabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: '로그인이 필요합니다.' }, { status: 401 })
    }

    const body = await request.json()

    const excerpt = (body.excerpt || '').toString().trim()
    if (!excerpt) {
      return NextResponse.json({ error: '급여 후기를 입력해주세요.' }, { status: 400 })
    }

    let durationDays: number | null = null
    if (body.period_start && body.period_end) {
      const start = new Date(body.period_start)
      const end = new Date(body.period_end)
      durationDays = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }

    const data = {
      pet_id: body.pet_id,
      owner_id: user.id,
      category: body.category || 'feed',
      brand: body.brand || '',
      product: body.product || '',
      status: body.status || 'feeding',
      period_start: body.period_start,
      period_end: body.period_end || null,
      duration_days: durationDays,
      rating: body.rating ?? null,
      palatability_score: body.palatability_score ?? null,
      digestibility_score: body.digestibility_score ?? null,
      coat_quality_score: body.coat_quality_score ?? null,
      recommend: body.recommend ?? null,
      continue_reasons: body.continue_reasons?.length > 0 ? body.continue_reasons : null,
      stop_reasons: body.stop_reasons?.length > 0 ? body.stop_reasons : null,
      excerpt,
      notes: body.notes || null,
      stool_score: body.stool_score ?? null,
      appetite_change: body.appetite_change || null,
      vomiting: body.vomiting ?? null,
      allergy_symptoms: body.allergy_symptoms?.length > 0 ? body.allergy_symptoms : null,
      likes: 0,
      views: 0,
      comments_count: 0,
    }

    console.error('[API review-logs POST] excerpt received:', JSON.stringify(excerpt), 'length:', excerpt.length)
    console.error('[API review-logs POST] data.excerpt:', JSON.stringify(data.excerpt), 'length:', data.excerpt.length)

    const adminSupabase = getAdminClient()
    const { error: insertError } = await (adminSupabase
      .from('review_logs') as any)
      .insert(data)

    if (insertError) {
      console.error('[API review-logs POST] Insert error:', insertError)
      console.error('[API review-logs POST] Full data sent:', JSON.stringify(data))
      return NextResponse.json(
        { error: insertError.message || '작성에 실패했습니다.', debug_excerpt_length: excerpt.length, debug_excerpt_preview: excerpt.substring(0, 50) },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API review-logs POST] Error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
