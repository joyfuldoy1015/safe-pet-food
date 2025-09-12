import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const litterType = request.nextUrl.searchParams.get('litterType')
    const features = request.nextUrl.searchParams.get('features')?.split(',') || []
    const sortBy = request.nextUrl.searchParams.get('sortBy') || 'recommended'

    // Read products data
    const jsonDirectory = path.join(process.cwd(), 'data')
    const fileContents = await fs.readFile(jsonDirectory + '/cat-litter-products.json', 'utf8')
    let products = JSON.parse(fileContents)

    // Filter by litter type
    if (litterType && litterType !== 'all') {
      products = products.filter((product: any) => product.litterType === litterType)
    }

    // Filter by features
    if (features.length > 0 && features[0] !== '') {
      products = products.filter((product: any) => 
        features.some((feature: string) => product.keyFeatures.includes(feature))
      )
    }

    // Sort products
    switch (sortBy) {
      case 'rating':
        products.sort((a: any, b: any) => b.overallRating - a.overallRating)
        break
      case 'reviews':
        products.sort((a: any, b: any) => b.reviewCount - a.reviewCount)
        break
      case 'price':
        products.sort((a: any, b: any) => a.priceInfo - b.priceInfo)
        break
      case 'recommended':
      default:
        // Sort by recommendation rate (percentage of users who recommend)
        products.sort((a: any, b: any) => {
          // Primary sort: recommendation rate
          const rateA = a.recommendationStats.recommendationRate
          const rateB = b.recommendationStats.recommendationRate
          if (rateB !== rateA) {
            return rateB - rateA
          }
          // Secondary sort: total number of recommendations
          return b.recommendationStats.totalRecommendations - a.recommendationStats.totalRecommendations
        })
        break
    }

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching cat litter products:', error)
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }
} 