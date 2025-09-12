import { NextRequest, NextResponse } from 'next/server'
import treatProducts from '@/data/cat-treats-products.json'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const treatType = request.nextUrl.searchParams.get('treatType')
    const functionality = request.nextUrl.searchParams.get('functionality')
    const sortBy = request.nextUrl.searchParams.get('sortBy') || 'recommended'

    let filteredProducts = [...treatProducts]

    // 간식 종류 필터링
    if (treatType && treatType !== '전체') {
      filteredProducts = filteredProducts.filter(product => 
        product.treatType === treatType
      )
    }

    // 기능성 필터링
    if (functionality) {
      const functionalities = functionality.split(',')
      filteredProducts = filteredProducts.filter(product =>
        functionalities.some(func => 
          product.functionality.includes(func)
        )
      )
    }

    // 정렬
    switch (sortBy) {
      case 'recommended':
        filteredProducts.sort((a, b) => 
          b.recommendationStats.recommendationRate - a.recommendationStats.recommendationRate
        )
        break
      case 'repurchase':
        filteredProducts.sort((a, b) => 
          b.repurchaseStats.repurchaseRate - a.repurchaseStats.repurchaseRate
        )
        break
      case 'palatability':
        filteredProducts.sort((a, b) => 
          b.palatabilityStats.successRate - a.palatabilityStats.successRate
        )
        break
      case 'reviews':
        filteredProducts.sort((a, b) => b.reviewCount - a.reviewCount)
        break
      case 'rating':
        filteredProducts.sort((a, b) => b.overallRating - a.overallRating)
        break
      case 'price':
        filteredProducts.sort((a, b) => a.priceInfo.pricePerPiece - b.priceInfo.pricePerPiece)
        break
      default:
        break
    }

    return NextResponse.json(filteredProducts)
  } catch (error) {
    console.error('Error fetching cat treats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch cat treats' },
      { status: 500 }
    )
  }
} 