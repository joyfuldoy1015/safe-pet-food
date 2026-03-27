import { getServerClient } from '@/lib/supabase-server'
import { getAdminClient } from '@/lib/supa/serverAdmin'
import { Product, BrandBasic } from '@/types/product'

// Supabase 사용 여부 확인
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  )
}

// 서버용 Supabase 클라이언트 가져오기
const getSupabase = () => getServerClient()

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
    return []
  }

  try {
    const supabase = getSupabase()
    
    // 제품 정보 가져오기
    const { data: productData } = await supabase
      .from('products')
      .select('name, brand_id')
      .eq('id', productId)
      .single() as { data: { name: string; brand_id: string } | null }
    
    if (!productData) {
      console.warn('[getProductReviews] Product not found:', productId)
      return []
    }
    
    // 브랜드명 가져오기
    const { data: brandData } = await supabase
      .from('brands')
      .select('name')
      .eq('id', productData.brand_id)
      .single() as { data: { name: string } | null }
    
    if (!brandData) {
      console.warn('[getProductReviews] Brand not found for product:', productId)
      return []
    }
    
    // 브랜드명과 제품명으로 리뷰 매칭
    // 제품명에서 앞부분 키워드로 매칭 (정확도 향상)
    const productKeyword = productData.name.split(' ').slice(0, 3).join(' ')
    
    const { data, error } = await supabase
      .from('review_logs')
      .select(`
        *,
        pet:pets(name, species),
        user:profiles(nickname)
      `)
      .eq('brand', brandData.name)
      .ilike('product', `%${productKeyword}%`)
      .order('created_at', { ascending: false })
    
    if (error) {
      console.warn('[getProductReviews] Supabase error:', error)
      return []
    }

    // 데이터 변환 (DB 컬럼명 → 인터페이스 매핑)
    return (data || []).map((r: any) => ({
      ...r,
      stool_quality_score: r.stool_quality_score ?? r.stool_score ?? null,
      user: r.user ? { name: r.user.nickname } : null,
      pet: r.pet ? { ...r.pet, breed: null } : null
    })) as FeedingReview[]
  } catch (error) {
    console.error('[getProductReviews] Error:', error)
    return []
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
  const speciesKorean = (species: string) => {
    switch (species) {
      case 'dog': return '강아지'
      case 'cat': return '고양이'
      default: return species
    }
  }
  
  return reviews.map(r => ({
    id: r.id,
    user_name: r.user?.name || '익명',
    rating: r.rating || 0,
    comment: r.excerpt,
    date: new Date(r.created_at).toISOString().split('T')[0],
    helpful_count: r.helpful_count || 0,
    pet_info: r.pet ? speciesKorean(r.pet.species) : null
  }))
}

// ============================================
// 기존 함수들
// ============================================

/**
 * 제품 ID로 제품 상세 정보 조회 (브랜드 정보 포함)
 */
export async function getProductById(productId: string): Promise<(Product & { brand?: BrandBasic }) | null> {
  if (!isSupabaseConfigured()) {
    return null
  }

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('products')
      .select(`
        *,
        brands:brand_id (
          id,
          name,
          manufacturer,
          country
        )
      `)
      .eq('id', productId)
      .single()

    if (error || !data) {
      console.warn('[getProductById] Supabase error:', error)
      return null
    }

    const { brands, ...productData } = data as any
    return {
      ...productData,
      brand: brands || null
    } as Product & { brand?: BrandBasic }
  } catch (error) {
    console.error('[getProductById] Error:', error)
    return null
  }
}

/**
 * 브랜드 ID로 기본 정보 조회
 */
export async function getBrandById(brandId: string): Promise<BrandBasic | null> {
  if (!isSupabaseConfigured()) {
    return null
  }

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('brands')
      .select('id, name, manufacturer, country')
      .eq('id', brandId)
      .single()

    if (error || !data) {
      console.warn('[getBrandById] Supabase error:', error)
      return null
    }

    return data as BrandBasic
  } catch (error) {
    console.error('[getBrandById] Error:', error)
    return null
  }
}

export async function getBrandGradeData(brandId: string): Promise<{
  recallHistory: any[] | null
  ingredients: any[] | null
} | null> {
  if (!isSupabaseConfigured()) return null
  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('brands')
      .select('recall_history, ingredients, representative_product_id')
      .eq('id', brandId)
      .single()

    if (error || !data) return null

    let ingredients = (data as any).ingredients || null

    if ((data as any).representative_product_id) {
      const { data: repProduct } = await supabase
        .from('products')
        .select('ingredients')
        .eq('id', (data as any).representative_product_id)
        .single() as { data: { ingredients: any } | null }
      if (repProduct?.ingredients) {
        ingredients = repProduct.ingredients
      }
    }

    return {
      recallHistory: (data as any).recall_history || null,
      ingredients,
    }
  } catch {
    return null
  }
}

/**
 * 자동 등급을 DB에 캐싱 (기존 값과 다를 때만 업데이트)
 */
export async function cacheProductGrade(
  productId: string,
  grade: string,
  gradeText: string,
  totalScore: number
): Promise<void> {
  if (!isSupabaseConfigured()) return
  try {
    const admin = getAdminClient()
    const { data: current } = await admin
      .from('products')
      .select('grade, grade_text')
      .eq('id', productId)
      .single() as { data: { grade: string | null; grade_text: string | null } | null }

    const newGradeText = `${gradeText} (${totalScore}점)`
    if (current && current.grade === grade && current.grade_text === newGradeText) return

    await (admin.from('products') as any)
      .update({ grade, grade_text: newGradeText })
      .eq('id', productId)
  } catch {
    // 캐싱 실패는 무시 (다음 조회 시 재시도)
  }
}

/**
 * 브랜드 ID로 해당 브랜드의 다른 제품들 조회
 */
export async function getProductsByBrandId(brandId: string, limit: number = 6): Promise<Product[]> {
  if (!isSupabaseConfigured()) {
    return []
  }

  try {
    const supabase = getSupabase()
    const { data, error } = await supabase
      .from('products')
      .select('id, brand_id, name, description, grade, grade_text, certifications')
      .eq('brand_id', brandId)
      .limit(limit)

    if (error || !data) {
      console.warn('[getProductsByBrandId] Supabase error:', error)
      return []
    }

    return data as Product[]
  } catch (error) {
    console.error('[getProductsByBrandId] Error:', error)
    return []
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

