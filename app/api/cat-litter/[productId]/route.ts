import { NextResponse } from 'next/server'
import path from 'path'
import { promises as fs } from 'fs'

export async function GET(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    const productId = params.productId

    // Read products data
    const jsonDirectory = path.join(process.cwd(), 'data')
    const productsFile = await fs.readFile(jsonDirectory + '/cat-litter-products.json', 'utf8')
    const products = JSON.parse(productsFile)
    
    const product = products.find((p: any) => p.id === productId)
    
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Read reviews data
    const reviewsFile = await fs.readFile(jsonDirectory + '/cat-litter-reviews.json', 'utf8')
    const allReviews = JSON.parse(reviewsFile)
    
    // Filter reviews for this product
    const productReviews = allReviews.filter((review: any) => review.productId === productId)
    
    // Sort reviews by helpful count (Hacker News style algorithm)
    const sortedReviews = productReviews.sort((a: any, b: any) => {
      const now = new Date().getTime()
      const timeA = new Date(a.createdAt).getTime()
      const timeB = new Date(b.createdAt).getTime()
      
      const ageA = (now - timeA) / (1000 * 60 * 60) // hours
      const ageB = (now - timeB) / (1000 * 60 * 60) // hours
      
      const scoreA = a.helpfulCount / Math.pow(ageA + 2, 1.8)
      const scoreB = b.helpfulCount / Math.pow(ageB + 2, 1.8)
      
      return scoreB - scoreA
    })

    return NextResponse.json({
      product,
      reviews: sortedReviews
    })
  } catch (error) {
    console.error('Error fetching product details:', error)
    return NextResponse.json({ error: 'Failed to fetch product details' }, { status: 500 })
  }
} 