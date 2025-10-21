import { createClient } from '@supabase/supabase-js'

// Supabase 프로젝트 URL과 API Key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Supabase 클라이언트 생성
// 빌드 타임에는 환경 변수가 없을 수 있으므로, 더미 값으로 클라이언트 생성
// 실제 API 호출 시에는 런타임에서 환경 변수를 확인함
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
)

// 타입 정의 (데이터베이스 스키마에 맞춰 추후 업데이트)
export type Brand = {
  id: string
  name: string
  manufacturer: string
  country: string
  overall_rating: number
  established_year: number
  product_lines: string[]
  certifications: string[]
  recall_history: {
    date: string
    reason: string
    severity: 'low' | 'medium' | 'high'
  }[]
  brand_description?: string
  manufacturing_info?: string
  brand_pros?: string[]
  brand_cons?: string[]
  created_at?: string
  updated_at?: string
}

export type Product = {
  id: string
  brand_id: string
  name: string
  category: 'food' | 'treats' | 'supplements' | 'litter'
  image?: string
  description?: string
  certifications?: string[]
  origin_info?: {
    origin_country: string
    manufacturing_country: string
    factory_location?: string
  }
  ingredients?: string[]
  guaranteed_analysis?: {
    protein: number
    fat: number
    fiber: number
    moisture: number
    ash?: number
  }
  pros?: string[]
  cons?: string[]
  created_at?: string
  updated_at?: string
}

export type Review = {
  id: string
  product_id: string
  brand_id: string
  user_id: string
  rating: number
  palatability: number
  satisfaction: number
  repurchase_intent: boolean
  comment?: string
  benefits?: string[]
  side_effects?: string[]
  helpful_count: number
  created_at?: string
  updated_at?: string
}

export type PetLog = {
  id: string
  user_id: string
  pet_id: string
  product_id: string
  start_date: string
  end_date?: string
  status: 'feeding' | 'completed' | 'stopped'
  duration: string
  palatability: number
  satisfaction: number
  repurchase_intent: boolean
  comment?: string
  price?: string
  purchase_location?: string
  side_effects?: string[]
  benefits?: string[]
  created_at?: string
  updated_at?: string
}

export type QAPost = {
  id: string
  user_id: string
  category: string
  title: string
  content: string
  views: number
  likes: number
  comments_count: number
  is_resolved: boolean
  created_at?: string
  updated_at?: string
}

