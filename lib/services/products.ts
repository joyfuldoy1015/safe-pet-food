import { supabase } from '@/lib/supabase'
import { Product, BrandBasic } from '@/types/product'

// Supabase 사용 여부 확인
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  )
}

// ============================================
// 급여 후기 리뷰 타입
// ============================================

export interface FeedingReview {
  id: string
  user_id: string
  pet_id: string
  product_id: string | null
  brand: string
  product: string
  rating: number | null
  palatability_score: number | null
  digestibility_score: number | null
  coat_quality_score: number | null
  stool_quality_score: number | null
  recommend: boolean | null
  excerpt: string
  notes: string | null
  helpful_count: number
  created_at: string
  pet?: {
    name: string
    species: string
    breed: string | null
  }
  user?: {
    name: string | null
  }
}

export interface AggregatedRatings {
  palatability: number
  digestibility: number
  coat_quality: number
  stool_quality: number
  overall_satisfaction: number
}

export interface CommunityFeedback {
  recommend_yes: number
  recommend_no: number
  total_votes: number
}

// ============================================
// 제품 리뷰 관련 함수
// ============================================

/**
 * 제품 ID로 급여 후기 리뷰 가져오기
 */
export async function getProductReviews(productId: string): Promise<FeedingReview[]> {
  if (!isSupabaseConfigured()) {
    return getMockReviews(productId)
  }

  try {
    const { data, error } = await supabase
      .from('review_logs')
      .select(`
        *,
        pet:pets(name, species, breed),
        user:profiles(name)
      `)
      .eq('product_id', productId)
      .order('created_at', { ascending: false })

    if (error) {
      console.warn('[getProductReviews] Supabase error, falling back to mock:', error)
      return getMockReviews(productId)
    }

    return (data || []) as FeedingReview[]
  } catch (error) {
    console.error('[getProductReviews] Error:', error)
    return getMockReviews(productId)
  }
}

/**
 * 리뷰 데이터로부터 평균 평점 계산
 */
export function aggregateProductRatings(reviews: FeedingReview[]): AggregatedRatings | null {
  if (!reviews.length) return null

  const validReviews = reviews.filter(r => 
    r.palatability_score !== null ||
    r.digestibility_score !== null ||
    r.coat_quality_score !== null ||
    r.stool_quality_score !== null ||
    r.rating !== null
  )

  if (!validReviews.length) return null

  const avg = (values: (number | null)[]) => {
    const valid = values.filter((v): v is number => v !== null)
    return valid.length > 0 
      ? Math.round((valid.reduce((a, b) => a + b, 0) / valid.length) * 10) / 10
      : 0
  }

  return {
    palatability: avg(validReviews.map(r => r.palatability_score)),
    digestibility: avg(validReviews.map(r => r.digestibility_score)),
    coat_quality: avg(validReviews.map(r => r.coat_quality_score)),
    stool_quality: avg(validReviews.map(r => r.stool_quality_score)),
    overall_satisfaction: avg(validReviews.map(r => r.rating))
  }
}

/**
 * 추천/비추천 집계
 */
export function aggregateCommunityFeedback(reviews: FeedingReview[]): CommunityFeedback {
  const recommendYes = reviews.filter(r => r.recommend === true).length
  const recommendNo = reviews.filter(r => r.recommend === false).length
  
  return {
    recommend_yes: recommendYes,
    recommend_no: recommendNo,
    total_votes: reviews.length
  }
}

/**
 * 리뷰를 소비자 리뷰 형식으로 변환
 */
export function formatReviewsForDisplay(reviews: FeedingReview[]) {
  return reviews.map(r => ({
    id: r.id,
    user_name: r.user?.name || '익명',
    rating: r.rating || 0,
    comment: r.excerpt,
    date: new Date(r.created_at).toISOString().split('T')[0],
    helpful_count: r.helpful_count || 0,
    pet_info: r.pet ? `${r.pet.species} · ${r.pet.breed || '품종 미상'}` : null
  }))
}

// ============================================
// 기존 함수들
// ============================================

/**
 * 제품 ID로 제품 상세 정보 조회
 */
export async function getProductById(productId: string): Promise<Product | null> {
  if (!isSupabaseConfigured()) {
    return getMockProduct(productId)
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single()

    if (error || !data) {
      console.warn('[getProductById] Supabase error, falling back to mock:', error)
      return getMockProduct(productId)
    }

    return data as Product
  } catch (error) {
    console.error('[getProductById] Error:', error)
    return getMockProduct(productId)
  }
}

/**
 * 브랜드 ID로 기본 정보 조회
 */
export async function getBrandById(brandId: string): Promise<BrandBasic | null> {
  if (!isSupabaseConfigured()) {
    return getMockBrand(brandId)
  }

  try {
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, manufacturer, country, image')
      .eq('id', brandId)
      .single()

    if (error || !data) {
      console.warn('[getBrandById] Supabase error, falling back to mock:', error)
      return getMockBrand(brandId)
    }

    return data as BrandBasic
  } catch (error) {
    console.error('[getBrandById] Error:', error)
    return getMockBrand(brandId)
  }
}

/**
 * 브랜드 ID로 해당 브랜드의 다른 제품들 조회
 */
export async function getProductsByBrandId(brandId: string, limit: number = 6): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return getMockProductsByBrand(brandId, limit)
  }

  try {
    const { data, error } = await supabase
      .from('products')
      .select('id, brand_id, name, description, grade, grade_text, image, certifications')
      .eq('brand_id', brandId)
      .limit(limit)

    if (error || !data) {
      console.warn('[getProductsByBrandId] Supabase error, falling back to mock:', error)
      return getMockProductsByBrand(brandId, limit)
    }

    return data as Product[]
  } catch (error) {
    console.error('[getProductsByBrandId] Error:', error)
    return getMockProductsByBrand(brandId, limit)
  }
}

// ============================================
// Mock 데이터
// ============================================

function getMockReviews(productId: string): FeedingReview[] {
  return [
    {
      id: 'review-1',
      user_id: 'user-1',
      pet_id: 'pet-1',
      product_id: productId,
      brand: '로얄캐닌',
      product: '로얄캐닌 독 어덜트',
      rating: 5,
      palatability_score: 5,
      digestibility_score: 4,
      coat_quality_score: 5,
      stool_quality_score: 4,
      recommend: true,
      excerpt: '우리 강아지가 정말 잘 먹어요! 털도 윤기가 나고 변 상태도 좋아졌습니다.',
      notes: null,
      helpful_count: 24,
      created_at: '2024-01-15T00:00:00Z',
      pet: {
        name: '뽀삐',
        species: '강아지',
        breed: '골든 리트리버'
      },
      user: {
        name: '행복한집사'
      }
    },
    {
      id: 'review-2',
      user_id: 'user-2',
      pet_id: 'pet-2',
      product_id: productId,
      brand: '로얄캐닌',
      product: '로얄캐닌 독 어덜트',
      rating: 4,
      palatability_score: 4,
      digestibility_score: 4,
      coat_quality_score: 4,
      stool_quality_score: 4,
      recommend: true,
      excerpt: '가격은 조금 비싸지만 품질이 좋은 것 같아요. 기호성도 좋습니다.',
      notes: null,
      helpful_count: 18,
      created_at: '2024-01-10T00:00:00Z',
      pet: {
        name: '초코',
        species: '강아지',
        breed: '시츄'
      },
      user: {
        name: '초보집사'
      }
    }
  ]
}

function getMockProduct(productId: string): Product {
  return {
    id: productId,
    brand_id: 'brand-royal-canin',
    name: '로얄캐닌 독 어덜트',
    description: '성견을 위한 종합 영양 사료입니다.',
    grade: 'A',
    grade_text: '매우 우수',
    image: '🍖',
    certifications: ['AAFCO 승인', 'FDA 등록', 'ISO 9001'],
    origin_info: {
      origin_country: '프랑스',
      manufacturing_country: '한국',
      factory_location: '경기도 평택시'
    },
    ingredients: [
      { name: '닭고기', percentage: 28, source: '프랑스산' },
      { name: '쌀', percentage: 22, source: '국내산' },
      { name: '옥수수', percentage: 15, source: '미국산' },
      { name: '치킨 부산물', percentage: 12, source: '프랑스산' },
      { name: '비트펄프', percentage: 8, source: '독일산' }
    ],
    guaranteed_analysis: {
      protein: 25.0,
      fat: 14.0,
      fiber: 3.5,
      moisture: 10.0,
      ash: 6.8,
      calcium: 1.2,
      phosphorus: 1.0
    },
    consumer_ratings: {
      palatability: 4.5,
      digestibility: 4.2,
      coat_quality: 4.3,
      stool_quality: 4.1,
      overall_satisfaction: 4.4
    },
    community_feedback: {
      recommend_yes: 842,
      recommend_no: 158,
      total_votes: 1000
    },
    consumer_reviews: [
      {
        id: 'review-1',
        user_name: '행복한집사',
        rating: 5,
        comment: '우리 강아지가 정말 잘 먹어요! 털도 윤기가 나고 변 상태도 좋아졌습니다.',
        date: '2024-01-15',
        helpful_count: 24
      },
      {
        id: 'review-2',
        user_name: '초보집사',
        rating: 4,
        comment: '가격은 조금 비싸지만 품질이 좋은 것 같아요. 기호성도 좋습니다.',
        date: '2024-01-10',
        helpful_count: 18
      }
    ],
    pros: [
      '높은 기호성과 소화율',
      '프리미엄 원료 사용',
      '국제 인증 획득',
      '일관된 품질 관리'
    ],
    cons: [
      '상대적으로 높은 가격',
      '일부 부산물 포함',
      '곡물 함량이 다소 높음'
    ]
  }
}

function getMockBrand(brandId: string): BrandBasic {
  return {
    id: brandId,
    name: '로얄캐닌',
    manufacturer: 'Royal Canin SAS',
    country: '프랑스',
    image: '🏰'
  }
}

function getMockProductsByBrand(brandId: string, limit: number): Product[] {
  const products: Product[] = [
    {
      id: 'product-royal-canin-puppy',
      brand_id: brandId,
      name: '로얄캐닌 퍼피',
      description: '자견용 사료',
      grade: 'A',
      grade_text: '매우 우수',
      image: '🐕',
      certifications: ['AAFCO 승인']
    },
    {
      id: 'product-royal-canin-senior',
      brand_id: brandId,
      name: '로얄캐닌 시니어',
      description: '노견용 사료',
      grade: 'A',
      grade_text: '매우 우수',
      image: '🦴',
      certifications: ['AAFCO 승인']
    },
    {
      id: 'product-royal-canin-mini',
      brand_id: brandId,
      name: '로얄캐닌 미니',
      description: '소형견용 사료',
      grade: 'B',
      grade_text: '우수',
      image: '🐩',
      certifications: ['AAFCO 승인']
    }
  ]

  return products.slice(0, limit)
}
