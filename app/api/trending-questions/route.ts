import { NextResponse } from 'next/server'
import { getServerClient } from '@/lib/supabase-server'

export const dynamic = 'force-dynamic'

/**
 * 트렌딩 점수 계산 공식:
 * - votes × 2 (투표 가중치)
 * - views × 0.1 (조회수 가중치)
 * - answerCount × 1.5 (답변수 가중치)
 * - 최신성 보너스:
 *   - 24시간 이내: +10점
 *   - 3일 이내: +5점
 *   - 7일 이내: +2점
 */
function calculateTrendingScore(
  votes: number,
  views: number,
  answerCount: number,
  createdAt: string
): number {
  const now = new Date()
  const created = new Date(createdAt)
  const hoursAgo = (now.getTime() - created.getTime()) / (1000 * 60 * 60)

  // 기본 점수 계산
  let score = (votes * 2) + (views * 0.1) + (answerCount * 1.5)

  // 최신성 보너스
  if (hoursAgo <= 24) {
    score += 10
  } else if (hoursAgo <= 72) { // 3일
    score += 5
  } else if (hoursAgo <= 168) { // 7일
    score += 2
  }

  return Math.round(score * 100) / 100
}

export async function GET() {
  try {
    const supabase = getServerClient()

    // community_questions 테이블에서 질문 가져오기
    const { data: questions, error: questionsError } = await supabase
      .from('community_questions')
      .select(`
        id,
        title,
        content,
        category,
        votes,
        views,
        created_at,
        author:profiles!author_id(nickname)
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(50) // 최근 50개 중에서 트렌딩 계산

    if (questionsError) {
      console.error('Questions fetch error:', questionsError)
      return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 })
    }

    if (!questions || questions.length === 0) {
      return NextResponse.json([])
    }

    // 각 질문의 답변 수 가져오기
    const questionsWithAnswerCount = await Promise.all(
      questions.map(async (q: any) => {
        const { count } = await supabase
          .from('community_answers')
          .select('*', { count: 'exact', head: true })
          .eq('question_id', q.id)

        return {
          ...q,
          answerCount: count || 0
        }
      })
    )

    // 트렌딩 점수 계산 및 정렬
    const trendingQuestions = questionsWithAnswerCount
      .map((q: any) => ({
        id: q.id,
        title: q.title,
        category: q.category,
        votes: q.votes || 0,
        views: q.views || 0,
        answerCount: q.answerCount,
        author: {
          name: q.author?.nickname || '익명',
          level: 'beginner'
        },
        createdAt: q.created_at,
        trendingScore: calculateTrendingScore(
          q.votes || 0,
          q.views || 0,
          q.answerCount,
          q.created_at
        )
      }))
      .sort((a, b) => b.trendingScore - a.trendingScore)
      .slice(0, 5) // 상위 5개

    return NextResponse.json(trendingQuestions)
  } catch (error) {
    console.error('Trending questions error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
