import { NextRequest, NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const SYSTEM_PROMPT = `
당신은 반려동물 사료 전문가입니다. 다음 역할을 수행해주세요:

역할:
- 반려동물(개, 고양이) 사료에 대한 전문적이고 정확한 정보 제공
- 사료 성분, 영양, 급여 방법, 보관법 등에 대한 상담
- 반려동물의 건강과 안전을 최우선으로 고려한 조언

응답 가이드라인:
1. 친근하고 이해하기 쉬운 한국어로 답변
2. 과학적 근거가 있는 정보 제공
3. 개별 반려동물의 상황에 따라 다를 수 있음을 안내
4. 심각한 건강 문제는 수의사 상담 권유
5. 구체적이고 실용적인 조언 제공

주요 전문 분야:
- 사료 성분 분석 및 해석
- 연령별, 크기별 사료 선택법
- 알레르기 및 특수 상황 대응
- 사료 급여량 및 횟수
- 사료 보관 및 안전성
- 브랜드별 특징 및 비교

답변 시 이모지를 적절히 사용하여 친근함을 표현하세요.
`

interface Message {
  id: string
  content: string
  role: 'user' | 'assistant'
  timestamp: Date
}

export async function POST(request: NextRequest) {
  try {
    const { message, history } = await request.json()

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      )
    }

    // Convert history to OpenAI format
    const openaiMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...history.slice(-10).map((msg: Message) => ({
        role: msg.role,
        content: msg.content
      })),
      { role: 'user', content: message }
    ]

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: openaiMessages as any,
      temperature: 0.7,
      max_tokens: 1000,
      presence_penalty: 0.1,
      frequency_penalty: 0.1
    })

    const responseMessage = completion.choices[0]?.message?.content

    if (!responseMessage) {
      throw new Error('AI 응답을 생성할 수 없습니다.')
    }

    return NextResponse.json({ message: responseMessage })

  } catch (error) {
    console.error('Chat API error:', error)
    
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: 'OpenAI API 키가 설정되지 않았습니다.' },
        { status: 500 }
      )
    }
    
    return NextResponse.json(
      { error: '일시적인 오류가 발생했습니다. 다시 시도해주세요.' },
      { status: 500 }
    )
  }
} 
