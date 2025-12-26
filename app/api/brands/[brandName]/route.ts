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
    ingredients: ingredients || [],
    products: [] // products는 별도로 조회하여 추가됨
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { brandName: string } }
) {
  try {
    const brandName = decodeURIComponent(params.brandName)
    
    console.log('[API brands] Request for brand:', brandName)
    
    // Supabase에서만 가져오기 (mock fallback 제거)
    if (!isSupabaseConfigured()) {
      console.error('[API brands] Supabase not configured')
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 500 }
      )
    }

    try {
      const { data, error } = await supabase
        .from('brands')
        .select('*')
        .eq('name', brandName)
        .single()

      if (error) {
        console.error('[API brands] Supabase error:', error)
        return NextResponse.json(
          { error: 'Brand not found' },
          { status: 404 }
        )
      }

      if (!data) {
        console.error('[API brands] No data returned for brand:', brandName)
        return NextResponse.json(
          { error: 'Brand not found' },
          { status: 404 }
        )
      }

      // 브랜드 데이터 변환
      if (data) {
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
            console.log('[API] Fetching products for brand_id:', data.id, 'brand_name:', brandName)
            const { data: productsData, error: productsError } = await supabase
              .from('products')
              .select('*')
              .eq('brand_id', data.id)
              .order('created_at', { ascending: true })
            
            console.log('[API] Products query result:', {
              hasData: !!productsData,
              dataLength: productsData?.length || 0,
              error: productsError ? {
                message: productsError.message,
                code: productsError.code,
                details: productsError.details
              } : null
            })
            
            if (productsError) {
              console.error('[API] Products query error:', productsError)
            }
            
            if (!productsError && productsData && productsData.length > 0) {
              console.log('[API] Found', productsData.length, 'products for brand:', brandName)
              
              // 각 제품에 대해 실제 사용자 리뷰 조회
              products = await Promise.all(productsData.map(async (product: any) => {
                // review_logs에서 해당 브랜드/제품명으로 리뷰 조회
                let userReviews: any[] = []
                try {
                  // review_logs에서 해당 브랜드/제품명으로 리뷰 조회
                  let reviewQuery = supabase
                    .from('review_logs')
                    .select(`
                      id,
                      rating,
                      excerpt,
                      owner_id,
                      created_at,
                      likes,
                      profiles!review_logs_owner_id_fkey(nickname)
                    `)
                    .eq('brand', brandName)
                    .eq('product', product.name)
                    .not('rating', 'is', null) // 평점이 있는 리뷰만
                    .order('created_at', { ascending: false })
                    .limit(10) // 최대 10개만
                  
                  // admin_status 필드가 있으면 필터링 (없을 수도 있음)
                  // RLS 정책에서 이미 처리되므로 여기서는 선택적 필터링
                  const { data: reviewLogs, error: reviewError } = await reviewQuery
                  
                  if (!reviewError && reviewLogs && reviewLogs.length > 0) {
                    userReviews = reviewLogs.map((log: any) => ({
                      id: log.id,
                      user_name: log.profiles?.nickname || '익명',
                      rating: log.rating || 0,
                      comment: log.excerpt || '',
                      date: log.created_at ? new Date(log.created_at).toISOString().split('T')[0] : '',
                      helpful_count: log.likes || 0
                    }))
                    console.log('[API] Found', userReviews.length, 'user reviews for product:', product.name)
                  }
                } catch (reviewError: any) {
                  console.warn('[API] Error fetching reviews for product:', product.name, reviewError)
                }
                
                // Supabase의 consumer_reviews와 병합 (우선순위: review_logs > Supabase)
                const supabaseReviews = product.consumer_reviews || []
                const mergedReviews = [...userReviews, ...supabaseReviews].slice(0, 10) // 최대 10개
                
                return {
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
                  consumer_reviews: mergedReviews
                }
              }))
            } else {
              console.log('[API] No products found for brand:', brandName, 'brand_id:', data.id)
            }
          } catch (productsError: any) {
            console.error('[API] Exception while fetching products:', {
              message: productsError?.message,
              stack: productsError?.stack
            })
          }
          
          // Get reviews for this brand (현재는 reviews 테이블이 없으므로 빈 배열)
          const brandReviews: any[] = []
          
          // Calculate review statistics
          const reviewStats = calculateReviewStats(brandReviews)
          
          // Calculate trust metrics based on brand data and reviews
          const trustMetrics = calculateTrustMetrics(brand, brandReviews)
          
          const responseData = {
            ...brand,
            products: products.length > 0 ? products : [], // Supabase에 products가 없으면 빈 배열 (레거시 데이터는 프론트엔드에서 처리)
            reviews: brandReviews,
            review_stats: reviewStats,
            trust_metrics: trustMetrics
          }
          
          console.log('[API] Response data:', {
            brandName: brandName,
            productsCount: responseData.products.length,
            hasProducts: responseData.products.length > 0,
            brandId: data.id
          })
          
          return NextResponse.json(responseData)
        }
    } catch (supabaseError) {
      console.error('[API brands] Supabase error:', supabaseError)
      return NextResponse.json(
        { error: 'Failed to fetch brand data' },
        { status: 500 }
      )
    }
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