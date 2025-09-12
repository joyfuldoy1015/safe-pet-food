import { NextRequest, NextResponse } from 'next/server'

// 임시 메모리 저장소 (실제로는 데이터베이스 사용)
const voteStorage: Record<string, { recommend_yes: number; recommend_no: number; total_votes: number; user_votes: Record<string, 'yes' | 'no'> }> = {
  'royal-canin': {
    recommend_yes: 1247,
    recommend_no: 358,
    total_votes: 1605,
    user_votes: {}
  },
  'hills': {
    recommend_yes: 892,
    recommend_no: 201,
    total_votes: 1093,
    user_votes: {}
  },
  'orijen': {
    recommend_yes: 456,
    recommend_no: 89,
    total_votes: 545,
    user_votes: {}
  },
  'acana': {
    recommend_yes: 234,
    recommend_no: 67,
    total_votes: 301,
    user_votes: {}
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { brandName: string } }
) {
  try {
    const brandName = decodeURIComponent(params.brandName)
    
    if (!voteStorage[brandName]) {
      return NextResponse.json(
        { error: '브랜드를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const data = voteStorage[brandName]
    const percentage = Math.round((data.recommend_yes / data.total_votes) * 100)

    return NextResponse.json({
      brandName,
      recommend_yes: data.recommend_yes,
      recommend_no: data.recommend_no,
      total_votes: data.total_votes,
      recommendation_percentage: percentage
    })

  } catch (error) {
    console.error('투표 데이터 조회 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { brandName: string } }
) {
  try {
    const brandName = decodeURIComponent(params.brandName)
    const { vote, userId } = await request.json()

    if (!voteStorage[brandName]) {
      voteStorage[brandName] = {
        recommend_yes: 0,
        recommend_no: 0,
        total_votes: 0,
        user_votes: {}
      }
    }

    if (!vote || !userId || !['yes', 'no'].includes(vote)) {
      return NextResponse.json(
        { error: '잘못된 요청입니다.' },
        { status: 400 }
      )
    }

    const brandData = voteStorage[brandName]
    const previousVote = brandData.user_votes[userId]

    // 이전 투표가 있다면 제거
    if (previousVote) {
      if (previousVote === 'yes') {
        brandData.recommend_yes = Math.max(0, brandData.recommend_yes - 1)
      } else {
        brandData.recommend_no = Math.max(0, brandData.recommend_no - 1)
      }
      brandData.total_votes = Math.max(0, brandData.total_votes - 1)
    }

    // 새 투표 추가
    if (vote === 'yes') {
      brandData.recommend_yes += 1
    } else {
      brandData.recommend_no += 1
    }
    brandData.total_votes += 1
    brandData.user_votes[userId] = vote

    const percentage = Math.round((brandData.recommend_yes / brandData.total_votes) * 100)

    return NextResponse.json({
      success: true,
      brandName,
      recommend_yes: brandData.recommend_yes,
      recommend_no: brandData.recommend_no,
      total_votes: brandData.total_votes,
      recommendation_percentage: percentage,
      user_vote: vote
    })

  } catch (error) {
    console.error('투표 저장 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { brandName: string } }
) {
  try {
    const brandName = decodeURIComponent(params.brandName)
    const { userId } = await request.json()

    if (!voteStorage[brandName] || !userId) {
      return NextResponse.json(
        { error: '잘못된 요청입니다.' },
        { status: 400 }
      )
    }

    const brandData = voteStorage[brandName]
    const previousVote = brandData.user_votes[userId]

    if (previousVote) {
      if (previousVote === 'yes') {
        brandData.recommend_yes = Math.max(0, brandData.recommend_yes - 1)
      } else {
        brandData.recommend_no = Math.max(0, brandData.recommend_no - 1)
      }
      brandData.total_votes = Math.max(0, brandData.total_votes - 1)
      delete brandData.user_votes[userId]
    }

    const percentage = brandData.total_votes > 0 
      ? Math.round((brandData.recommend_yes / brandData.total_votes) * 100) 
      : 0

    return NextResponse.json({
      success: true,
      brandName,
      recommend_yes: brandData.recommend_yes,
      recommend_no: brandData.recommend_no,
      total_votes: brandData.total_votes,
      recommendation_percentage: percentage,
      user_vote: null
    })

  } catch (error) {
    console.error('투표 삭제 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
