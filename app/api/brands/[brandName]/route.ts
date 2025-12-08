import { NextRequest, NextResponse } from 'next/server'
import brandsData from '../../../../data/brands.json'
import reviewsData from '../../../../data/reviews.json'
import { supabase } from '@/lib/supabase'

// Supabase 사용 여부 확인
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  )
}

// 성분 공개 상태 자동 계산 함수
function calculateIngredientDisclosure(ingredients: Array<{
  name: string
  percentage?: number
  disclosure_level?: 'full' | 'partial' | 'none'
}>): {
  fully_disclosed: number
  partially_disclosed: number
  not_disclosed: number
} {
  if (!ingredients || ingredients.length === 0) {
    return { fully_disclosed: 0, partially_disclosed: 0, not_disclosed: 0 }
  }

  let totalPercentage = 0
  let fullyDisclosed = 0
  let partiallyDisclosed = 0
  let notDisclosed = 0

  ingredients.forEach(ing => {
    // percentage가 있으면 사용, 없으면 균등 분배
    const percentage = ing.percentage || (100 / ingredients.length)
    totalPercentage += percentage

    const disclosureLevel = ing.disclosure_level || 'none'
    switch (disclosureLevel) {
      case 'full':
        fullyDisclosed += percentage
        break
      case 'partial':
        partiallyDisclosed += percentage
        break
      case 'none':
        notDisclosed += percentage
        break
    }
  })

  // 정규화 (총합이 100%가 되도록)
  const normalizer = totalPercentage > 0 ? 100 / totalPercentage : 1

  return {
    fully_disclosed: Math.round(fullyDisclosed * normalizer),
    partially_disclosed: Math.round(partiallyDisclosed * normalizer),
    not_disclosed: Math.round(notDisclosed * normalizer)
  }
}

// Supabase 데이터를 JSON 형식으로 변환
const transformSupabaseToJsonFormat = (supabaseData: any, ingredients?: Array<{
  name: string
  percentage?: number
  disclosure_level?: 'full' | 'partial' | 'none'
}>) => {
  // ingredients 배열이 있으면 자동 계산, 없으면 기본값
  const ingredientDisclosure = ingredients && ingredients.length > 0
    ? calculateIngredientDisclosure(ingredients)
    : { fully_disclosed: 0, partially_disclosed: 0, not_disclosed: 0 }

  return {
    id: supabaseData.id,
    name: supabaseData.name,
    manufacturer: supabaseData.manufacturer,
    country: supabaseData.country,
    description: supabaseData.brand_description,
    brand_description: supabaseData.brand_description,
    manufacturing_info: supabaseData.manufacturing_info || '',
    manufacturing_locations: supabaseData.manufacturing_locations || [],
    recall_history: supabaseData.recall_history,
    overall_rating: parseFloat(supabaseData.overall_rating) || 0,
    product_lines: supabaseData.product_lines || [],
    established_year: supabaseData.established_year,
    certifications: supabaseData.certifications || [],
    image: supabaseData.image,
    brand_pros: supabaseData.brand_pros || [],
    brand_cons: supabaseData.brand_cons || [],
    transparency_score: supabaseData.transparency_score || 75,
    ingredient_disclosure: ingredientDisclosure,
    ingredients: ingredients || []
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { brandName: string } }
) {
  try {
    const brandName = decodeURIComponent(params.brandName)
    
    // Supabase 사용 가능하면 Supabase에서 가져오기
    if (isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from('brands')
          .select('*')
          .eq('name', brandName)
          .single()

        if (!error && data) {
          // Supabase에서 ingredients 데이터 가져오기
          // JSONB 필드를 파싱하여 배열로 변환
          let ingredients: Array<{
            name: string
            percentage?: number
            source?: string
            disclosure_level?: 'full' | 'partial' | 'none'
          }> | null = null
          
          if (data.ingredients) {
            try {
              // JSONB 필드가 이미 파싱된 객체/배열인 경우
              if (Array.isArray(data.ingredients)) {
                ingredients = data.ingredients
              } else if (typeof data.ingredients === 'string') {
                // 문자열인 경우 JSON 파싱
                ingredients = JSON.parse(data.ingredients)
              } else {
                ingredients = []
              }
            } catch (e) {
              console.warn('Failed to parse ingredients:', e)
              ingredients = []
            }
          }
          
          const brand = transformSupabaseToJsonFormat(data, ingredients || undefined)
          
          // Get products for this brand from Supabase
          let products: any[] = []
          try {
            const { data: productsData, error: productsError } = await supabase
              .from('products')
              .select('*')
              .eq('brand_id', data.id)
              .order('created_at', { ascending: true })
            
            if (!productsError && productsData && productsData.length > 0) {
              products = productsData.map((product: any) => ({
                id: product.id,
                name: product.name,
                image: product.image || '📦',
                description: product.description || '',
                certifications: product.certifications || [],
                origin_info: product.origin_info || {},
                ingredients: product.ingredients || [],
                guaranteed_analysis: product.guaranteed_analysis || {},
                pros: product.pros || [],
                cons: product.cons || [],
                consumer_ratings: product.consumer_ratings || {
                  palatability: 0,
                  digestibility: 0,
                  coat_quality: 0,
                  stool_quality: 0,
                  overall_satisfaction: 0
                },
                community_feedback: product.community_feedback || {
                  recommend_yes: 0,
                  recommend_no: 0,
                  total_votes: 0
                },
                consumer_reviews: product.consumer_reviews || []
              }))
            }
          } catch (productsError) {
            console.warn('Failed to fetch products from Supabase:', productsError)
          }
          
          // Get reviews for this brand (현재는 reviews 테이블이 없으므로 JSON 사용)
          const brandReviews = reviewsData.filter(review => review.brand_id === brand.id)
          
          // Calculate review statistics
          const reviewStats = calculateReviewStats(brandReviews)
          
          // Calculate trust metrics based on brand data and reviews
          const trustMetrics = calculateTrustMetrics(brand, brandReviews)
          
          return NextResponse.json({
            ...brand,
            products: products.length > 0 ? products : brand.products || [],
            reviews: brandReviews,
            review_stats: reviewStats,
            trust_metrics: trustMetrics
          })
        }
      } catch (supabaseError) {
        console.warn('Supabase error, falling back to JSON:', supabaseError)
      }
    }

    // Fallback: JSON 파일에서 브랜드 데이터 가져오기
    const brand = brandsData.find((b: any) => b.name === brandName)
    
    if (!brand) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // ingredients 배열이 있으면 ingredient_disclosure 자동 계산
    let ingredientDisclosure = brand.ingredient_disclosure || {
      fully_disclosed: 0,
      partially_disclosed: 0,
      not_disclosed: 0
    }
    
    // ingredients 배열이 있고 disclosure_level이 있으면 자동 계산
    if (brand.ingredients && Array.isArray(brand.ingredients) && brand.ingredients.length > 0) {
      const hasDisclosureLevels = brand.ingredients.some((ing: any) => ing.disclosure_level)
      if (hasDisclosureLevels) {
        ingredientDisclosure = calculateIngredientDisclosure(brand.ingredients)
      }
    }

    // Get reviews for this brand
    const brandReviews = reviewsData.filter((review: any) => review.brand_id === brand.id)
    
    // Calculate review statistics
    const reviewStats = calculateReviewStats(brandReviews)
    
    // Calculate trust metrics based on brand data and reviews
    const trustMetrics = calculateTrustMetrics(brand, brandReviews)
    
    return NextResponse.json({
      ...brand,
      ingredient_disclosure: ingredientDisclosure,
      reviews: brandReviews,
      review_stats: reviewStats,
      trust_metrics: trustMetrics
    })
  } catch (error) {
    console.error('Failed to fetch brand data:', error)
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