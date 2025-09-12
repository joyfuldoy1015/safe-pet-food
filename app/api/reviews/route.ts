import { NextRequest, NextResponse } from 'next/server'
import { writeFile, readFile } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = ['brand_id', 'user_name', 'rating_palatability', 'rating_repurchase', 'rating_convenience', 'comment']
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        )
      }
    }

    // Read current reviews
    const reviewsPath = join(process.cwd(), 'data', 'reviews.json')
    const reviewsData = JSON.parse(await readFile(reviewsPath, 'utf8'))
    
    // Create new review
    const newReview = {
      id: (reviewsData.length + 1).toString(),
      brand_id: body.brand_id,
      user_id: `user_${Date.now()}`,
      user_name: body.user_name,
      rating_palatability: parseInt(body.rating_palatability),
      rating_repurchase: parseInt(body.rating_repurchase),
      rating_convenience: parseInt(body.rating_convenience),
      comment: body.comment,
      pet_breed: body.pet_breed || '',
      pet_age: body.pet_age || '',
      date_created: new Date().toISOString().split('T')[0],
      verified_purchase: false // Default to false for new submissions
    }

    // Add to reviews array
    reviewsData.push(newReview)
    
    // Write back to file (in production, this would be a database operation)
    await writeFile(reviewsPath, JSON.stringify(reviewsData, null, 2))
    
    return NextResponse.json({ 
      success: true, 
      review: newReview,
      message: 'Review submitted successfully!' 
    })
    
  } catch (error) {
    console.error('Error submitting review:', error)
    return NextResponse.json(
      { error: 'Failed to submit review' },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const reviewsPath = join(process.cwd(), 'data', 'reviews.json')
    const reviewsData = JSON.parse(await readFile(reviewsPath, 'utf8'))
    return NextResponse.json(reviewsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    )
  }
} 