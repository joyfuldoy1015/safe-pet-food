import { NextRequest, NextResponse } from 'next/server'

// 임시 메모리 저장소 (실제로는 데이터베이스 사용)
const evaluationsStorage: Record<string, any[]> = {
  'royal-canin': [
    {
      id: 'eval-demo-1',
      brandName: 'royal-canin',
      overall_rating: 4,
      palatability: 4,
      digestibility: 5,
      coat_quality: 4,
      stool_quality: 5,
      value_for_money: 3,
      packaging_quality: 4,
      availability: 5,
      brand_trust: 4,
      ingredient_transparency: 3,
      customer_service: 4,
      written_review: '우리 골든 리트리버가 정말 잘 먹어요. 소화도 잘 되고 변 상태가 좋아졌습니다. 다만 가격이 조금 비싼 편이에요.',
      recommend: true,
      pet_info: {
        species: 'dog',
        age: '3세',
        breed: '골든 리트리버',
        weight: '28kg',
        health_conditions: ['없음']
      },
      purchase_info: {
        product_line: '어덜트',
        feeding_duration: '6개월-1년',
        purchase_frequency: '월 1회',
        price_range: '8-12만원'
      },
      submittedAt: '2024-01-15T10:30:00.000Z',
      userId: 'user-demo-1',
      helpful_votes: 5,
      verified_purchase: true
    },
    {
      id: 'eval-demo-2',
      brandName: 'royal-canin',
      overall_rating: 3,
      palatability: 3,
      digestibility: 4,
      coat_quality: 3,
      stool_quality: 4,
      value_for_money: 2,
      packaging_quality: 4,
      availability: 5,
      brand_trust: 4,
      ingredient_transparency: 2,
      customer_service: 3,
      written_review: '품질은 괜찮지만 가격 대비해서는 아쉬운 부분이 있어요. 성분 정보도 좀 더 자세히 알려주면 좋겠습니다.',
      recommend: false,
      pet_info: {
        species: 'dog',
        age: '5세',
        breed: '시바견',
        weight: '12kg',
        health_conditions: ['알레르기']
      },
      purchase_info: {
        product_line: '어덜트',
        feeding_duration: '1-3개월',
        purchase_frequency: '첫 구매',
        price_range: '5-8만원'
      },
      submittedAt: '2024-01-20T14:20:00.000Z',
      userId: 'user-demo-2',
      helpful_votes: 2,
      verified_purchase: true
    }
  ],
  'hills': [],
  'orijen': [],
  'acana': []
}

export async function GET(
  request: NextRequest,
  { params }: { params: { brandName: string } }
) {
  try {
    const brandName = decodeURIComponent(params.brandName)
    
    if (!evaluationsStorage[brandName]) {
      evaluationsStorage[brandName] = []
    }

    const evaluations = evaluationsStorage[brandName]
    
    // 통계 계산
    const totalEvaluations = evaluations.length
    const averageRatings = {
      overall: 0,
      palatability: 0,
      digestibility: 0,
      coat_quality: 0,
      stool_quality: 0,
      value_for_money: 0,
      packaging_quality: 0,
      availability: 0,
      brand_trust: 0,
      ingredient_transparency: 0,
      customer_service: 0
    }

    const recommendCount = evaluations.filter(e => e.recommend).length
    const recommendationRate = totalEvaluations > 0 ? Math.round((recommendCount / totalEvaluations) * 100) : 0

    if (totalEvaluations > 0) {
      Object.keys(averageRatings).forEach(key => {
        const sum = evaluations.reduce((acc, evaluation) => acc + (evaluation[key] || 0), 0)
        averageRatings[key as keyof typeof averageRatings] = Math.round((sum / totalEvaluations) * 10) / 10
      })
    }

    return NextResponse.json({
      brandName,
      totalEvaluations,
      averageRatings,
      recommendationRate,
      recentEvaluations: evaluations.slice(-10).reverse() // 최근 10개
    })

  } catch (error) {
    console.error('평가 데이터 조회 오류:', error)
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
    const evaluationData = await request.json()

    if (!evaluationsStorage[brandName]) {
      evaluationsStorage[brandName] = []
    }

    // 평가 데이터에 메타데이터 추가
    const evaluation = {
      ...evaluationData,
      id: `eval-${Date.now()}`,
      submittedAt: new Date().toISOString(),
      userId: `user-${Date.now()}`, // 실제로는 로그인 시스템에서 가져옴
      helpful_votes: 0,
      verified_purchase: false // 실제로는 구매 이력 확인
    }

    // 데이터 유효성 검사
    if (!evaluation.brandName || evaluation.overall_rating < 1 || evaluation.overall_rating > 5) {
      return NextResponse.json(
        { error: '유효하지 않은 평가 데이터입니다.' },
        { status: 400 }
      )
    }

    evaluationsStorage[brandName].push(evaluation)

    // 성공 응답
    return NextResponse.json({
      success: true,
      message: '평가가 성공적으로 등록되었습니다.',
      evaluationId: evaluation.id,
      totalEvaluations: evaluationsStorage[brandName].length
    })

  } catch (error) {
    console.error('평가 저장 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { brandName: string } }
) {
  try {
    const brandName = decodeURIComponent(params.brandName)
    const { evaluationId, helpful } = await request.json()

    if (!evaluationsStorage[brandName]) {
      return NextResponse.json(
        { error: '브랜드를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    const evaluation = evaluationsStorage[brandName].find(e => e.id === evaluationId)
    if (!evaluation) {
      return NextResponse.json(
        { error: '평가를 찾을 수 없습니다.' },
        { status: 404 }
      )
    }

    // 도움이 됨 투표
    if (helpful !== undefined) {
      evaluation.helpful_votes += helpful ? 1 : -1
      evaluation.helpful_votes = Math.max(0, evaluation.helpful_votes)
    }

    return NextResponse.json({
      success: true,
      helpful_votes: evaluation.helpful_votes
    })

  } catch (error) {
    console.error('평가 업데이트 오류:', error)
    return NextResponse.json(
      { error: '서버 오류가 발생했습니다.' },
      { status: 500 }
    )
  }
}
