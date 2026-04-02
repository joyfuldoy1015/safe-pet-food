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

    const fullExcerpt = (body.excerpt || '').toString().trim()
    if (!fullExcerpt) {
      return NextResponse.json({ error: '급여 후기를 입력해주세요.' }, { status: 400 })
    }

    // DB check_excerpt_length 제약: 최대 80자
    const excerpt = fullExcerpt.length > 80 ? fullExcerpt.substring(0, 77) + '...' : fullExcerpt
    const notes = fullExcerpt.length > 80
      ? (body.notes ? fullExcerpt + '\n\n' + body.notes : fullExcerpt)
      : (body.notes || null)

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
      notes: notes || null,
      stool_score: body.stool_score ?? null,
      appetite_change: body.appetite_change || null,
      vomiting: body.vomiting ?? null,
      allergy_symptoms: body.allergy_symptoms?.length > 0 ? body.allergy_symptoms : null,
      likes: 0,
      views: 0,
      comments_count: 0,
    }

    const adminSupabase = getAdminClient()
    const { error: insertError } = await (adminSupabase
      .from('review_logs') as any)
      .insert(data)

    if (insertError) {
      console.error('[API review-logs POST] Insert error:', insertError)
      return NextResponse.json(
        { error: insertError.message || '작성에 실패했습니다.' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[API review-logs POST] Error:', error)
    return NextResponse.json({ error: '서버 오류가 발생했습니다.' }, { status: 500 })
  }
}
