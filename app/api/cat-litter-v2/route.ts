import { NextRequest, NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

// Multiple dynamic flags to ensure no static generation
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
export const revalidate = 0
export const fetchCache = 'force-no-store'

export async function GET(request: NextRequest) {
  // Add timestamp to prevent any caching
  const requestId = `${Date.now()}-${Math.random()}`
  console.log(`[API-v2] Processing request ${requestId}`)
  
  try {
    // Use URL constructor as backup method
    const url = new URL(request.url)
    const litterType = url.searchParams.get('litterType') || request.nextUrl.searchParams.get('litterType')
    const features = (url.searchParams.get('features') || request.nextUrl.searchParams.get('features'))?.split(',') || []
    const sortBy = url.searchParams.get('sortBy') || request.nextUrl.searchParams.get('sortBy') || 'recommended'

    // Read products data with dynamic path
    const jsonDirectory = path.join(process.cwd(), 'data')
    const filePath = path.join(jsonDirectory, 'cat-litter-products.json')
    
    // Force file system read (no caching)
    const fileContents = await fs.readFile(filePath, 'utf8')
    let products = JSON.parse(fileContents)

    // Add timestamp to response to verify it's dynamic
    const responseTimestamp = new Date().toISOString()

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
        products.sort((a: any, b: any) => {
          const rateA = a.recommendationStats.recommendationRate
          const rateB = b.recommendationStats.recommendationRate
          if (rateB !== rateA) {
            return rateB - rateA
          }
          return b.recommendationStats.totalRecommendations - a.recommendationStats.totalRecommendations
        })
        break
    }

    const response = NextResponse.json({
      products,
      meta: {
        timestamp: responseTimestamp,
        requestId,
        dynamic: true
      }
    })

    // Add no-cache headers
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error(`[API-v2] Error in request ${requestId}:`, error)
    return NextResponse.json({ 
      error: 'Failed to fetch products',
      requestId,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
