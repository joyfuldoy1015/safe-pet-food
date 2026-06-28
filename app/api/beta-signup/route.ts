import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supa/serverAdmin'
import { rateLimit, getClientIp, rateLimitResponse } from '@/lib/rate-limit'

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = rateLimit(ip, { key: 'beta-signup', limit: 3, windowSeconds: 3600 })
  if (!rl.success) return rateLimitResponse(rl)

  try {
    const body = await request.json()
    const { name, email, petType, interestedProducts } = body

    if (!name?.trim() || !email?.trim() || !petType) {
      return NextResponse.json({ error: '이름, 이메일, 반려동물 종류를 모두 입력해주세요.' }, { status: 400 })
    }

    if (!EMAIL_REGEX.test(email)) {
      return NextResponse.json({ error: '올바른 이메일 형식이 아니에요.' }, { status: 400 })
    }

    if (!['dog', 'cat', 'both'].includes(petType)) {
      return NextResponse.json({ error: '반려동물 종류를 선택해주세요.' }, { status: 400 })
    }

    const supabase = getAdminClient()

    const { error } = await supabase
      .from('beta_signups' as any)
      .insert({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        pet_type: petType,
        interested_products: Array.isArray(interestedProducts) ? interestedProducts : [],
      } as any)

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: '이미 신청하셨어요. 초대 이메일을 기다려주세요!' }, { status: 409 })
      }
      console.error('[beta-signup] DB error:', error)
      return NextResponse.json({ error: '신청 중 오류가 발생했습니다.' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('[beta-signup] error:', err)
    return NextResponse.json({ error: '신청 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
