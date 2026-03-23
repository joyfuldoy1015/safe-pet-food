import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'
import { rateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.analyzeHealth)
  if (!rl.success) return rateLimitResponse(rl)

  try {
    const supabase = getServerClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI 요약 기능이 설정되지 않았습니다.' }, { status: 503 })
    }

    const { content, title } = await request.json()

    if (!content || typeof content !== 'string' || content.trim().length < 200) {
      return NextResponse.json({ error: '요약 대상 내용이 부족합니다.' }, { status: 400 })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.3,
        max_tokens: 300,
        messages: [
          {
            role: 'system',
            content: `당신은 반려동물 커뮤니티 Q&A 게시판의 질문 요약 도우미입니다.
사용자의 질문 본문을 읽고, 답변자가 핵심을 빠르게 파악할 수 있도록 2~3문장으로 요약해주세요.

규칙:
- 질문자의 상황과 핵심 질문을 간결하게 포함
- 반말/존댓말은 원문의 어투를 따름
- 불필요한 감정 표현이나 인사말은 제외
- 구체적인 정보(품종, 나이, 증상 등)는 보존`
          },
          {
            role: 'user',
            content: `제목: ${title || '(없음)'}\n\n본문:\n${content.trim()}`
          }
        ]
      })
    })

    if (!response.ok) {
      console.error('OpenAI API error:', response.status)
      return NextResponse.json({ error: '요약 생성에 실패했습니다.' }, { status: 502 })
    }

    const data = await response.json()
    const summary = data.choices?.[0]?.message?.content?.trim()

    if (!summary) {
      return NextResponse.json({ error: '요약 결과가 비어있습니다.' }, { status: 502 })
    }

    return NextResponse.json({ summary })
  } catch (error) {
    console.error('Summarize error:', error)
    return NextResponse.json({ error: '요약 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
