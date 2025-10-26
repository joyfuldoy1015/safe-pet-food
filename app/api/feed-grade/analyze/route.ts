import { NextRequest, NextResponse } from 'next/server'
import { feedGradeAnalyzer, FeedAnalysisInput } from '../../../../lib/feed-grade-analyzer'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { analysis_input }: { analysis_input: FeedAnalysisInput } = body

    // 입력 데이터 검증
    if (!analysis_input) {
      return NextResponse.json(
        { error: '분석 입력 데이터가 필요합니다' },
        { status: 400 }
      )
    }

    // 필수 필드 검증
    const requiredFields = [
      'ingredient_quality',
      'ingredient_transparency', 
      'safety_record',
      'nutritional_standards',
      'preservative_type'
    ]

    for (const field of requiredFields) {
      if (!analysis_input[field as keyof FeedAnalysisInput]) {
        return NextResponse.json(
          { error: `${field} 필드가 필요합니다` },
          { status: 400 }
        )
      }
    }

    // 등급 분석 수행
    const result = feedGradeAnalyzer.analyzeFeedGrade(analysis_input)

    return NextResponse.json(result, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Feed grade analysis error:', error)
    return NextResponse.json(
      {
        error: '사료 등급 분석 중 오류가 발생했습니다',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
