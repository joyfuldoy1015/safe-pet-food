import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'
import { rateLimit, getClientIp, rateLimitResponse, RATE_LIMITS } from '@/lib/rate-limit'
import { QUESTIONS } from '@/lib/butler/questions'
import { getJipsaDescription } from '@/lib/butler/scoreCalc'

const OPENAI_API_KEY = process.env.OPENAI_API_KEY

export async function POST(request: NextRequest) {
  const ip = getClientIp(request)
  const rl = rateLimit(ip, RATE_LIMITS.aiCall)
  if (!rl.success) return rateLimitResponse(rl)

  try {
    if (!OPENAI_API_KEY) {
      return NextResponse.json({ error: 'AI 분석 기능이 설정되지 않았습니다.' }, { status: 503 })
    }

    const body = await request.json()
    const { petName, petType, petAge, healthStatus, foodInput, feedCount, answers, productId } = body

    if (!petName || !petType || !foodInput) {
      return NextResponse.json({ error: '필수 정보가 누락되었습니다.' }, { status: 400 })
    }

    // productId가 있으면 Supabase에서 실제 제품 정보 조회
    let productInfo = ''
    if (productId) {
      const supabase = getServerClient()
      const { data: product } = await supabase
        .from('products')
        .select(`
          name, grade, grade_text, target_species,
          ingredients, pros, cons,
          brands:brand_id (name, country)
        `)
        .eq('id', productId)
        .single()

      if (product) {
        const p = product as any
        const brand = p.brands
        const ingredients = Array.isArray(p.ingredients) ? p.ingredients.slice(0, 6).join(', ') : ''
        const pros = Array.isArray(p.pros) ? p.pros.slice(0, 3).join(', ') : ''
        const cons = Array.isArray(p.cons) ? p.cons.slice(0, 2).join(', ') : ''

        productInfo = [
          `제품명: ${p.name}`,
          brand?.name ? `브랜드: ${brand.name}${brand.country ? ` (${brand.country})` : ''}` : '',
          p.grade ? `등급: ${p.grade}${p.grade_text ? ` (${p.grade_text})` : ''}` : '',
          ingredients ? `주요 성분: ${ingredients}` : '',
          pros ? `장점: ${pros}` : '',
          cons ? `주의사항: ${cons}` : '',
        ].filter(Boolean).join('\n')
      }
    }

    // productId로 상세 조회 실패하거나 없으면 입력 텍스트 사용
    if (!productInfo) {
      productInfo = `제품명/브랜드: ${foodInput}`
    }

    // 질문 전체 텍스트 + 선택한 답변 내용을 포함해 AI가 맥락을 파악할 수 있도록 구성
    const answersText = answers
      ? QUESTIONS.map(q => {
          const selectedKey = (answers as Record<string, string>)[q.id]
          if (!selectedKey) return null
          const selectedOption = q.options.find(o => o.key === selectedKey)
          return `[${q.id}] ${q.text}\n→ 선택: ${selectedOption?.label ?? selectedKey}`
        }).filter(Boolean).join('\n\n')
      : ''

    const TONES = [
      '냉소적이지만 속은 다정한 고양이 시점',
      '과하게 감성적인 드라마 주인공 시점',
      '쿨하게 팩폭 날리는 MZ 친구 시점',
      '숨겨진 관종 끼를 폭발시키는 반려동물 시점',
    ]
    const selectedTone = TONES[Math.floor(Math.random() * TONES.length)]

    const prompt = `다음 정보를 바탕으로 집사력 테스트 결과를 JSON으로 생성해줘.

이번 결과의 말투 톤: ${selectedTone}
위 톤을 jipsaType · petMessage · highlight 전반에 일관되게 유지할 것.

반려동물 정보:
- 이름: ${petName}, 종: ${petType}, 나이: ${petAge || '알 수 없음'}, 건강상태: ${healthStatus || '알 수 없음'}

사료 정보:
${productInfo}
하루 급식 횟수: ${feedCount || '알 수 없음'}

설문 응답:
${answersText}

다음 JSON 형식으로 정확히 응답해:
{
  "jipsaType": "집사 타입 이름 (4–8자)",
  "jipsaScore": 숫자 (0–100),
  "stats": {
    "애정력": 숫자,
    "책임감": 숫자,
    "관찰력": 숫자,
    "영양관리": 숫자
  },
  "petMessage": "반려동물 시점에서 집사에게 보내는 멘트 (2–4문장, 반말)",
  "happinessLevel": 숫자 (1–5),
  "typeEmoji": "이 타입을 대표하는 이모지 1개",
  "highlight": "결과 카드 상단에 들어갈 짧고 임팩트있는 한 줄 카피"
}

스탯 평가 기준 (각 0–100):
- 애정력: Q2(교감 시간), Q3(생일 인지), Q5(최근 행동) 기반 — 교감·관심·애정 표현 빈도로 판단
- 책임감: Q1(아픔 대처), Q4(건강 체크), Q5(최근 행동) 기반 — 빠른 대처, 일상 케어, 능동적 행동으로 판단
- 관찰력: Q1(아픔 인지 후 행동), Q4(배변/건강 체크 빈도) 기반 — 이상 징후 파악과 모니터링 습관으로 판단
- 영양관리: 사료 정보(등급·성분·브랜드) + 급식 횟수 기반 — 설문보다 사료 품질이 주 판단 기준

응답 기준:
- 점수는 설문 응답과 사료/건강 정보를 종합해서 합리적으로 산정
- 관찰력은 Q1, Q4 답변을 엄격하게 반영할 것 (D 선택 시 관찰력 20 이하)
- 책임감은 Q1, Q4, Q5 답변을 종합해 산정할 것
- 사료 등급이나 성분이 좋을수록 영양관리 점수 높게

jipsaType 기준:
- 좋은 예: "분석형 과몰입", "나름 챙기는 편", "위기의 집사", "직관형 수호자"
- 나쁜 예: "최고의 집사", "사랑이 넘치는 집사", "훌륭한 보호자"
- 4–8자 내외, 밈·일상 언어·자조적 표현 환영

petMessage 기준:
- 현재 톤(${selectedTone})에 맞게 개성 있게 작성
- 2–4문장 (짧고 임팩트 있으면 2문장도 OK)
- 질문형 / 독백형 / 고백형 / 팩폭형 중 하나의 구조로 작성
- 반드시 ${petName}(이)의 1인칭 반말

highlight 기준:
- 읽는 즉시 피식 웃게 만드는 한 줄
- 감동보다 공감, 칭찬보다 현실 반영 우선
- 예시 스타일: "나름 노력은 해요. 나름." / "집사 자격증 재발급 검토 필요" / "의식은 있음. 행동은 미정."

[절대 사용 금지]
- "~덕분에 행복해요", "최고의 집사", "사랑해요", "잘 부탁해요"
- "우리 집사님", "정말 고마워요", "항상 곁에 있어줘서"
- 연속 긍정 칭찬 나열 ("최고야 짱이야 완벽해" 류)
- 모든 문장이 "~고, ~고, ~야" 구조로 반복되는 것`

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        temperature: 0.85,
        max_tokens: 900,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              '당신은 재치있고 따뜻하고 약간 장난기 있는 AI로, 집사(펫 오너) 데이터를 분석해 재미있는 성격 테스트 결과를 한국어로 생성합니다. 반드시 유효한 JSON만 반환하세요. 마크다운 없이.',
          },
          { role: 'user', content: prompt },
        ],
      }),
    })

    if (!response.ok) {
      console.error('[butler-test] OpenAI error:', response.status)
      return NextResponse.json({ error: '분석 생성에 실패했습니다.' }, { status: 502 })
    }

    const data = await response.json()
    const raw = data.choices?.[0]?.message?.content?.trim()
    if (!raw) return NextResponse.json({ error: '분석 결과가 비어있습니다.' }, { status: 502 })

    const result = JSON.parse(raw)
    result.jipsaScore = Math.max(0, Math.min(100, Math.round(result.jipsaScore ?? 50)))
    result.happinessLevel = Math.max(1, Math.min(5, Math.round(result.happinessLevel ?? 3)))
    result.jipsaDescription = getJipsaDescription(result.jipsaScore)

    return NextResponse.json(result)
  } catch (error) {
    console.error('[butler-test] error:', error)
    return NextResponse.json({ error: '분석 중 오류가 발생했습니다.' }, { status: 500 })
  }
}
