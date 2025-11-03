import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// Supabase 사용 여부 확인
const useSupabase = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  )
}

// POST - 사료 등급 분석 결과 저장
export async function POST(request: Request) {
  try {
    if (!useSupabase()) {
      // Supabase가 없으면 localStorage에 저장하도록 안내 (클라이언트에서 처리)
      return NextResponse.json(
        { 
          error: 'Supabase not configured',
          message: '데이터베이스가 설정되지 않았습니다. 로컬 스토리지에 저장됩니다.'
        },
        { status: 501 }
      )
    }

    const body = await request.json()
    const { analysis, userId } = body

    if (!analysis) {
      return NextResponse.json(
        { error: 'Analysis data is required' },
        { status: 400 }
      )
    }

    const { data: savedAnalysis, error } = await supabase
      .from('feed_grade_analyses')
      .insert([{
        user_id: userId || null,
        feed_name: analysis.feedName || analysis.feed_name || '',
        brand_name: analysis.brandName || analysis.brand_name || null,
        category: analysis.category || null,
        raw_material_quality: analysis.rawMaterialQuality || analysis.raw_material_quality || 0,
        detailed_labeling: analysis.detailedLabeling || analysis.detailed_labeling || 0,
        safety: analysis.safety || 0,
        nutritional_standard: analysis.nutritionalStandard || analysis.nutritional_standard || 0,
        preservative_type: analysis.preservativeType || analysis.preservative_type || 0,
        total_score: analysis.totalScore || analysis.total_score || 0,
        grade: analysis.grade || '',
        strengths: analysis.strengths || analysis.strengths || [],
        weaknesses: analysis.weaknesses || [],
        recommendations: analysis.recommendations || []
      }])
      .select()
      .single()

    if (error) {
      console.error('Failed to save feed grade analysis:', error)
      return NextResponse.json(
        { error: 'Failed to save analysis', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(savedAnalysis, { status: 201 })
  } catch (error) {
    console.error('Failed to save feed grade analysis:', error)
    return NextResponse.json(
      { error: 'Failed to save feed grade analysis' },
      { status: 500 }
    )
  }
}

// GET - 사료 등급 분석 결과 조회
export async function GET(request: NextRequest) {
  try {
    if (!useSupabase()) {
      return NextResponse.json([], { status: 200 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '100')

    let query = supabase
      .from('feed_grade_analyses')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch analyses:', error)
      return NextResponse.json(
        { error: 'Failed to fetch analyses', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(data || [], {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    console.error('Failed to fetch feed grade analyses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analyses' },
      { status: 500 }
    )
  }
}

