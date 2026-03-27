export interface BrandQuestion {
  id: string
  user_name: string
  question: string
  date: string
  answer?: {
    content: string
    answerer: string
    date: string
  }
  likes: number
  is_answered: boolean
}

export interface ProductInfo {
  id: string
  name: string
  description: string
  certifications: string[]
  origin_info: {
    country_of_origin?: string
    manufacturing_country?: string
    manufacturing_facilities?: string[]
  }
  ingredients: string[]
  guaranteed_analysis: {
    protein: string
    fat: string
    fiber: string
    moisture: string
    ash?: string
    calcium?: string
    phosphorus?: string
  }
  pros: string[]
  cons: string[]
  consumer_ratings: {
    palatability: number
    digestibility: number
    coat_quality: number
    stool_quality: number
    overall_satisfaction: number
    review_count?: number
  }
  community_feedback: {
    recommend_yes: number
    recommend_no: number
    total_votes: number
  }
  consumer_reviews: Array<{
    id: string
    user_name: string
    rating: number
    comment: string
    date: string
    helpful_count: number
  }>
  grade?: string
  grade_text?: string
  target_species?: 'dog' | 'cat' | 'all'
}

export interface Brand {
  id: string
  name: string
  logo: string
  manufacturer: string
  country_of_origin: string
  manufacturing_locations: string[]
  established_year: number
  certifications: string[]
  brand_description: string
  manufacturing_info: string
  brand_pros: string[]
  brand_cons: string[]
  product_lines?: string[]
  recall_history: Array<{
    date: string
    reason: string
    severity: 'low' | 'medium' | 'high'
    resolved: boolean
  }>
  transparency_score: number
  representative_product?: string
  ingredient_disclosure: {
    fully_disclosed: number
    partially_disclosed: number
    not_disclosed: number
  }
  nutrition_analysis: {
    protein: number
    fat: number
    carbohydrates: number
    fiber: number
    moisture: number
    calories_per_100g: number
  }
  consumer_ratings: {
    palatability: number
    digestibility: number
    coat_quality: number
    stool_quality: number
    overall_satisfaction: number
  }
  expert_reviews: Array<{
    expert_name: string
    rating: number
    comment: string
    date: string
  }>
  ingredients: Array<{
    name: string
    percentage?: number
    source?: string
    disclosure_level: 'full' | 'partial' | 'none'
  }>
  community_feedback: {
    recommend_yes: number
    recommend_no: number
    total_votes: number
  }
  qa_section: BrandQuestion[]
  products: ProductInfo[]
}
