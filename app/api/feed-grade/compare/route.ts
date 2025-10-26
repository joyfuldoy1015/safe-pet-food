import { NextRequest, NextResponse } from 'next/server'
import { feedGradeAnalyzer, FeedAnalysisInput } from '../../../../lib/feed-grade-analyzer'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { feeds }: { feeds: FeedAnalysisInput[] } = body

    // 입력 데이터 검증
    if (!feeds || !Array.isArray(feeds) || feeds.length < 2) {
      return NextResponse.json(
        { error: '비교할 사료가 2개 이상 필요합니다' },
        { status: 400 }
      )
    }

    // 각 사료별 분석 수행
    const analyses = feeds.map(feed => feedGradeAnalyzer.analyzeFeedGrade(feed))
    
    // 비교 분석 수행
    const comparison = feedGradeAnalyzer.compareFeeds(feeds)

    return NextResponse.json({
      analyses,
      comparison,
      summary: {
        total_feeds: feeds.length,
        best_grade: analyses[comparison.best_feed].overall_grade,
        worst_grade: analyses[comparison.worst_feed].overall_grade,
        average_score: Math.round(
          analyses.reduce((sum, analysis) => sum + analysis.overall_score, 0) / analyses.length
        )
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }
    })

  } catch (error) {
    console.error('Feed comparison error:', error)
    return NextResponse.json(
      {
        error: '사료 비교 분석 중 오류가 발생했습니다',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
