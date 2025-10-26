import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // JSON 파일 읽기
    const dataPath = path.join(process.cwd(), 'data', 'feed-grade-data.json')
    const feedGradeData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))

    const { searchParams } = new URL(request.url)
    const species = searchParams.get('species')
    const lifeStage = searchParams.get('life_stage')
    const brand = searchParams.get('brand')
    const minGrade = searchParams.get('min_grade')

    let feeds = feedGradeData.feeds

    // 필터링 적용
    if (species) {
      feeds = feeds.filter((feed: any) => feed.target_species === species)
    }

    if (lifeStage) {
      feeds = feeds.filter((feed: any) => feed.life_stage === lifeStage)
    }

    if (brand) {
      feeds = feeds.filter((feed: any) => 
        feed.brand.toLowerCase().includes(brand.toLowerCase())
      )
    }

    // 등급별 필터링 (향후 구현)
    if (minGrade) {
      // 등급별 최소 점수 기준으로 필터링
      const gradeThresholds = {
        'S': 90, 'A': 80, 'B': 70, 'C': 60, 'D': 50, 'F': 0
      }
      const minScore = gradeThresholds[minGrade as keyof typeof gradeThresholds] || 0
      // 실제 점수 계산은 클라이언트에서 수행
    }

    return NextResponse.json({
      feeds,
      total: feeds.length,
      filters: {
        species,
        life_stage: lifeStage,
        brand,
        min_grade: minGrade
      }
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })

  } catch (error) {
    console.error('Failed to fetch feed grade data:', error)
    return NextResponse.json(
      {
        error: '사료 등급 데이터를 가져오는데 실패했습니다',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}
