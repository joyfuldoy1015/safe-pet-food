import { NextRequest, NextResponse } from 'next/server'
import brandsData from '../../../../data/brands.json'
import reviewsData from '../../../../data/reviews.json'

export async function GET(
  request: NextRequest,
  { params }: { params: { brandName: string } }
) {
  try {
    const brandName = decodeURIComponent(params.brandName)
    
    // Find brand by name
    const brand = brandsData.find(b => b.name === brandName)
    
    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // Get reviews for this brand
    const brandReviews = reviewsData.filter(review => review.brand_id === brand.id)
    
    // Calculate review statistics
    const reviewStats = calculateReviewStats(brandReviews)
    
    // Calculate trust metrics based on brand data and reviews
    const trustMetrics = calculateTrustMetrics(brand, brandReviews)
    
    return NextResponse.json({
      ...brand,
      reviews: brandReviews,
      review_stats: reviewStats,
      trust_metrics: trustMetrics
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch brand data' },
      { status: 500 }
    )
  }
}

function calculateReviewStats(reviews: any[]) {
  if (reviews.length === 0) {
    return {
      total_reviews: 0,
      average_palatability: 0,
      average_repurchase: 0,
      average_convenience: 0,
      overall_average: 0
    }
  }

  const avgPalatability = reviews.reduce((sum, r) => sum + r.rating_palatability, 0) / reviews.length
  const avgRepurchase = reviews.reduce((sum, r) => sum + r.rating_repurchase, 0) / reviews.length
  const avgConvenience = reviews.reduce((sum, r) => sum + r.rating_convenience, 0) / reviews.length
  const overallAverage = (avgPalatability + avgRepurchase + avgConvenience) / 3

  return {
    total_reviews: reviews.length,
    average_palatability: Math.round(avgPalatability * 10) / 10,
    average_repurchase: Math.round(avgRepurchase * 10) / 10,
    average_convenience: Math.round(avgConvenience * 10) / 10,
    overall_average: Math.round(overallAverage * 10) / 10
  }
}

function calculateTrustMetrics(brand: any, reviews: any[]) {
  // Base scores from brand data
  let ingredientOriginScore = 0
  let facilityTransparencyScore = 0
  let facilityExperienceScore = 0
  let ingredientDataScore = 0
  let certificationScore = 0

  // Ingredient origin transparency (북미/유럽 vs 중국 등)
  if (brand.country === '미국' || brand.country === '캐나다' || brand.country === '호주' || brand.country === '뉴질랜드') {
    ingredientOriginScore = 5.0
  } else if (brand.country === '프랑스' || brand.country === '독일' || brand.country === '영국') {
    ingredientOriginScore = 4.5
  } else if (brand.country === '한국' || brand.country === '일본') {
    ingredientOriginScore = 4.0
  } else {
    ingredientOriginScore = 3.0
  }

  // Manufacturing facility experience (established year based)
  const currentYear = new Date().getFullYear()
  const yearsInBusiness = currentYear - brand.established_year
  
  if (yearsInBusiness >= 50) {
    facilityExperienceScore = 5.0
  } else if (yearsInBusiness >= 30) {
    facilityExperienceScore = 4.5
  } else if (yearsInBusiness >= 20) {
    facilityExperienceScore = 4.0
  } else if (yearsInBusiness >= 10) {
    facilityExperienceScore = 3.5
  } else if (yearsInBusiness >= 5) {
    facilityExperienceScore = 3.0
  } else {
    facilityExperienceScore = 2.0
  }

  // Certification status (AAFCO, FDA, etc.)
  const hasAAFCO = brand.certifications.some((cert: string) => 
    cert.toLowerCase().includes('aafco')
  )
  const hasFDA = brand.certifications.some((cert: string) => 
    cert.toLowerCase().includes('fda')
  )
  const hasISO = brand.certifications.some((cert: string) => 
    cert.toLowerCase().includes('iso')
  )
  
  if (hasAAFCO && (hasFDA || hasISO)) {
    certificationScore = 5.0
  } else if (hasAAFCO) {
    certificationScore = 4.5
  } else if (hasFDA || hasISO) {
    certificationScore = 3.5
  } else if (brand.certifications.length > 0) {
    certificationScore = 3.0
  } else {
    certificationScore = 2.0
  }

  // Facility transparency (assume premium brands have better transparency)
  // This would ideally be based on actual transparency data
  if (brand.overall_rating >= 4.5) {
    facilityTransparencyScore = 4.5
  } else if (brand.overall_rating >= 4.0) {
    facilityTransparencyScore = 4.0
  } else if (brand.overall_rating >= 3.5) {
    facilityTransparencyScore = 3.5
  } else {
    facilityTransparencyScore = 3.0
  }

  // Ingredient data transparency (assume premium brands provide better data)
  if (brand.overall_rating >= 4.5 && brand.certifications.length >= 2) {
    ingredientDataScore = 4.5
  } else if (brand.overall_rating >= 4.0) {
    ingredientDataScore = 4.0
  } else if (brand.overall_rating >= 3.5) {
    ingredientDataScore = 3.5
  } else {
    ingredientDataScore = 3.0
  }

  // Analyze reviews for trust-related keywords (simplified simulation)
  if (reviews.length > 0) {
    const trustKeywords = ['투명', '신뢰', '원산지', '공개', '인증', '품질', '안전']
    const negativeKeywords = ['의심', '불신', '숨김', '모호', '불투명']
    
    let positiveCount = 0
    let negativeCount = 0
    
    reviews.forEach(review => {
      const comment = review.comment?.toLowerCase() || ''
      trustKeywords.forEach(keyword => {
        if (comment.includes(keyword)) positiveCount++
      })
      negativeKeywords.forEach(keyword => {
        if (comment.includes(keyword)) negativeCount++
      })
    })

    // Adjust scores based on review sentiment
    const trustSentiment = (positiveCount - negativeCount) / reviews.length
    const adjustment = Math.max(-0.5, Math.min(0.5, trustSentiment * 0.3))
    
    ingredientOriginScore = Math.max(1, Math.min(5, ingredientOriginScore + adjustment))
    facilityTransparencyScore = Math.max(1, Math.min(5, facilityTransparencyScore + adjustment))
    ingredientDataScore = Math.max(1, Math.min(5, ingredientDataScore + adjustment))
  }

  // Calculate overall trust score
  const overallTrustScore = (
    ingredientOriginScore + 
    facilityTransparencyScore + 
    facilityExperienceScore + 
    ingredientDataScore + 
    certificationScore
  ) / 5

  return {
    ingredient_origin_transparency: Math.round(ingredientOriginScore * 10) / 10,
    manufacturing_facility_transparency: Math.round(facilityTransparencyScore * 10) / 10,
    facility_experience: Math.round(facilityExperienceScore * 10) / 10,
    ingredient_data_transparency: Math.round(ingredientDataScore * 10) / 10,
    certification_status: Math.round(certificationScore * 10) / 10,
    overall_trust_score: Math.round(overallTrustScore * 10) / 10
  }
} 