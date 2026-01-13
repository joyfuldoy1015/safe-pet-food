import { NextRequest, NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

// GET - 브랜드별 Q&A 목록 조회
export async function GET(
  request: NextRequest,
  { params }: { params: { brandName: string } }
) {
  try {
    const brandName = decodeURIComponent(params.brandName)
    const supabase = getServerClient()

    // 브랜드 ID 조회
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('name', brandName)
      .single()

    if (brandError || !brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    const brandId = (brand as any).id

    // 해당 브랜드의 Q&A 조회
    const { data: questions, error } = await (supabase
      .from('brand_questions') as any)
      .select(`
        id,
        user_name,
        question,
        answer,
        is_answered,
        likes,
        created_at,
        answered_at
      `)
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch brand questions:', error)
      return NextResponse.json(
        { error: 'Failed to fetch questions' },
        { status: 500 }
      )
    }

    // 날짜 포맷 변환
    const formattedQuestions = (questions || []).map((q: any) => ({
      id: q.id,
      user_name: q.user_name,
      question: q.question,
      answer: q.answer,
      is_answered: q.is_answered,
      likes: q.likes,
      date: q.created_at ? new Date(q.created_at).toISOString().split('T')[0] : ''
    }))

    return NextResponse.json(formattedQuestions)
  } catch (error) {
    console.error('Failed to fetch brand questions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch questions' },
      { status: 500 }
    )
  }
}

// POST - 새 질문 등록
export async function POST(
  request: NextRequest,
  { params }: { params: { brandName: string } }
) {
  try {
    const brandName = decodeURIComponent(params.brandName)
    const body = await request.json()
    const { question, user_name } = body

    if (!question || question.trim().length === 0) {
      return NextResponse.json(
        { error: 'Question is required' },
        { status: 400 }
      )
    }

    const supabase = getServerClient()

    // 브랜드 ID 조회
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id')
      .eq('name', brandName)
      .single()

    if (brandError || !brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    const brandId = (brand as any).id

    // 현재 사용자 정보 (로그인한 경우)
    const { data: { user } } = await supabase.auth.getUser()

    // 질문 저장
    const { data: newQuestion, error } = await (supabase
      .from('brand_questions') as any)
      .insert([{
        brand_id: brandId,
        user_id: user?.id || null,
        user_name: user_name || '익명',
        question: question.trim(),
        is_answered: false,
        likes: 0
      }])
      .select()
      .single()

    if (error) {
      console.error('Failed to create question:', error)
      return NextResponse.json(
        { error: 'Failed to create question', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: newQuestion.id,
      user_name: newQuestion.user_name,
      question: newQuestion.question,
      answer: null,
      is_answered: false,
      likes: 0,
      date: new Date(newQuestion.created_at).toISOString().split('T')[0]
    })
  } catch (error) {
    console.error('Failed to create question:', error)
    return NextResponse.json(
      { error: 'Failed to create question' },
      { status: 500 }
    )
  }
}
