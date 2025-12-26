// 제품 상세 타입 정의
export type ProductGrade = 'A' | 'B' | 'C' | 'D' | 'F'

export interface Product {
  id: string
  brand_id: string
  name: string
  description?: string
  grade?: ProductGrade
  grade_text?: string
  image?: string
  certifications?: string[]
  
  // 원산지 & 제조
  origin_info?: {
    origin_country?: string
    manufacturing_country?: string
    factory_location?: string
  }
  
  // 원료
  ingredients?: string[] | Array<{
    name: string
    percentage?: number
    source?: string
  }>
  
  // 등록성분량
  guaranteed_analysis?: {
    protein?: number
    fat?: number
    fiber?: number
    moisture?: number
    ash?: number
    calcium?: number
    phosphorus?: number
    [key: string]: number | undefined
  }
  
  // 소비자 평가
  consumer_ratings?: {
    palatability?: number
    digestibility?: number
    coat_quality?: number
    stool_quality?: number
    overall_satisfaction?: number
  }
  
  // 추천/비추천
  community_feedback?: {
    recommend_yes: number
    recommend_no: number
    total_votes: number
  }
  
  // 리뷰
  consumer_reviews?: Array<{
    id: string
    user_name: string
    rating: number
    comment: string
    date: string
    helpful_count: number
  }>
  
  // 장단점
  pros?: string[]
  cons?: string[]
  
  created_at?: string
  updated_at?: string
}

// 등급 산정 근거
export interface GradeCredibility {
  ingredient_disclosure: number // 원료 공개도
  standard_compliance: number // 기준 충족도
  consumer_rating: number // 소비자 평가
  recall_response: number // 리콜 대응
  research_backing: number // 근거/연구
}

// 브랜드 기본 정보 (제품 페이지용)
export interface BrandBasic {
  id: string
  name: string
  manufacturer?: string
  country?: string
  image?: string
}
