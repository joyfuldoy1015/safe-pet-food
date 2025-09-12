import { NextResponse } from 'next/server'
import treatProducts from '@/data/cat-treats-products.json'
import treatReviews from '@/data/cat-treats-reviews.json'

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId

    // 제품 정보 찾기
    const product = treatProducts.find((p: any) => p.id === productId)
    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // 해당 제품의 리뷰들 찾기
    const reviewsArray = Array.isArray(treatReviews) ? treatReviews : []
    const reviews = reviewsArray.filter((review: any) => review.productId === productId)

    // 추천/비추천 통계 계산
    const recommendedReviews = reviews.filter((review: any) => review.recommendation === true)
    const notRecommendedReviews = reviews.filter((review: any) => review.recommendation === false)

    // 재구매 의사 통계 계산
    const willBuyAgainCount = reviews.filter((review: any) => review.repurchaseIntention === 'willBuyAgain').length
    const consideringCount = reviews.filter((review: any) => review.repurchaseIntention === 'considering').length
    const wontBuyAgainCount = reviews.filter((review: any) => review.repurchaseIntention === 'wontBuyAgain').length

    // 기호성 상세 통계 계산
    const palatabilityStats = {
      ateEagerly: reviews.filter((r: any) => r.palatabilityDetail === 'ateEagerly').length,
      ateWell: reviews.filter((r: any) => r.palatabilityDetail === 'ateWell').length,
      ateWhenGiven: reviews.filter((r: any) => r.palatabilityDetail === 'ateWhenGiven').length,
      smelledOnly: reviews.filter((r: any) => r.palatabilityDetail === 'smelledOnly').length,
      ignored: reviews.filter((r: any) => r.palatabilityDetail === 'ignored').length
    }

    const responseData = {
      product,
      reviews,
      stats: {
        totalReviews: reviews.length,
        recommendationStats: {
          totalRecommendations: recommendedReviews.length,
          totalNotRecommendations: notRecommendedReviews.length,
          recommendationRate: reviews.length > 0 
            ? Math.round((recommendedReviews.length / reviews.length) * 100) 
            : 0
        },
        repurchaseStats: {
          willBuyAgain: willBuyAgainCount,
          considering: consideringCount,
          wontBuyAgain: wontBuyAgainCount,
          repurchaseRate: reviews.length > 0 
            ? Math.round((willBuyAgainCount / reviews.length) * 100) 
            : 0
        },
        palatabilityStats: {
          ...palatabilityStats,
          successRate: reviews.length > 0 
            ? Math.round(((palatabilityStats.ateEagerly + palatabilityStats.ateWell) / reviews.length) * 100)
            : 0
        }
      }
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching product details:', error)
    return NextResponse.json(
      { error: 'Failed to fetch product details' },
      { status: 500 }
    )
  }
} 