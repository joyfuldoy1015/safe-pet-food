/**
 * SAFI (Safety & Fit Index) Score Calculator
 * Calculates safety and fit index based on review, brand, and food data
 */

export type SafiLevel = 'SAFE' | 'NORMAL' | 'CAUTION'

export interface SafiInput {
  // Review data
  reviews: Array<{
    stoolScore?: number | null // 1-5
    allergySymptoms?: string[] | null
    vomiting?: boolean | null
    appetiteChange?: 'INCREASED' | 'NORMAL' | 'DECREASED' | 'REFUSED' | null
  }>
  // Brand data
  recallHistory: Array<{
    date: string
    severity: 'high' | 'medium' | 'low'
  }>
  // Food data
  ingredients: string[]
}

export interface SafiResult {
  overallScore: number
  level: SafiLevel
  detail: {
    A: number // Side Effect Index
    B: number // Stool Condition Index
    C: number // Appetite Index
    D: number // Ingredient Safety Index
    E: number // Brand Trust Index
  }
}

/**
 * Calculate SAFI score
 */
export function calculateSafiScore(input: SafiInput): SafiResult {
  const { reviews, recallHistory, ingredients } = input

  // A. Side Effect Index (35%)
  // 알레르기 발생률 70% + 구토 발생률 30%로 가중 평균
  const allergyCount = reviews.filter(r => r.allergySymptoms && r.allergySymptoms.length > 0).length
  const vomitCount = reviews.filter(r => r.vomiting === true).length
  const totalReviews = reviews.length || 1 // Division by zero 방지
  
  const allergyRate = allergyCount / totalReviews
  const vomitRate = vomitCount / totalReviews
  const sideEffectScore = Math.max(0, 100 - (0.7 * allergyRate + 0.3 * vomitRate) * 100)
  const A = Math.round(sideEffectScore * 100) / 100

  // B. Stool Condition Index (25%)
  // 평균 stoolScore(1~5)를 0~100으로 변환
  const stoolScores = reviews
    .map(r => r.stoolScore)
    .filter((score): score is number => score !== null && score !== undefined && score >= 1 && score <= 5)
  
  let B = 100 // 기본값
  if (stoolScores.length > 0) {
    const avgStoolScore = stoolScores.reduce((sum, score) => sum + score, 0) / stoolScores.length
    B = ((avgStoolScore - 1) / 4) * 100
    B = Math.round(B * 100) / 100
  }

  // C. Appetite Index (10%)
  // INCREASED/NORMAL 비율은 가산(+), DECREASED는 0.5배, REFUSED는 1배로 감점
  const positiveCount = reviews.filter(r => 
    r.appetiteChange === 'INCREASED' || r.appetiteChange === 'NORMAL'
  ).length
  const decreasedCount = reviews.filter(r => r.appetiteChange === 'DECREASED').length
  const refusedCount = reviews.filter(r => r.appetiteChange === 'REFUSED').length
  
  const positiveRate = totalReviews > 0 ? positiveCount / totalReviews : 0
  const negativeRate = totalReviews > 0 ? (decreasedCount * 0.5 + refusedCount) / totalReviews : 0
  const appetiteScore = Math.max(0, positiveRate * 100 - negativeRate * 50)
  const C = Math.round(appetiteScore * 100) / 100

  // D. Ingredient Safety Index (20%)
  // 위험 키워드: 개당 -10, 안전 키워드: 개당 +15
  const dangerKeywords = [
    'BHA', 'BHT', 'ethoxyquin', 'unnamed meat', 'meat by-product',
    'artificial color', 'artificial flavor', 'corn syrup', 'sugar', 'excessive salt'
  ]
  const safeKeywords = [
    'limited ingredient', 'single protein', 'grain-free', 'organic',
    'human-grade', 'no artificial preservatives', 'no artificial colors',
    'no artificial flavors'
  ]

  const ingredientsLower = ingredients.map(ing => ing.toLowerCase())
  let dangerCount = 0
  let safeCount = 0

  dangerKeywords.forEach(keyword => {
    if (ingredientsLower.some(ing => ing.includes(keyword.toLowerCase()))) {
      dangerCount++
    }
  })

  safeKeywords.forEach(keyword => {
    if (ingredientsLower.some(ing => ing.includes(keyword.toLowerCase()))) {
      safeCount++
    }
  })

  let D = 50 - (dangerCount * 10) + (safeCount * 15)
  D = Math.max(0, Math.min(100, D)) // 0~100 범위 클램프
  D = Math.round(D * 100) / 100

  // E. Brand Trust Index (10%)
  // 리콜 severity별 감점: high -30, medium -15, low -5
  let penalty = 0
  recallHistory.forEach(recall => {
    if (recall.severity === 'high') penalty += 30
    else if (recall.severity === 'medium') penalty += 15
    else if (recall.severity === 'low') penalty += 5
  })

  const brandScore = Math.max(0, 100 - penalty)
  const E = Math.round(brandScore * 100) / 100

  // 최종 점수 계산
  const overallScore = A * 0.35 + B * 0.25 + C * 0.10 + D * 0.20 + E * 0.10
  const roundedScore = Math.round(overallScore * 100) / 100

  // 등급 분류
  let level: SafiLevel
  if (roundedScore >= 80) {
    level = 'SAFE'
  } else if (roundedScore >= 60) {
    level = 'NORMAL'
  } else {
    level = 'CAUTION'
  }

  return {
    overallScore: roundedScore,
    level,
    detail: { A, B, C, D, E }
  }
}

/**
 * Get SAFI level color class
 */
export function getSafiLevelColor(level: SafiLevel): string {
  switch (level) {
    case 'SAFE':
      return 'bg-green-100 text-green-800 border-green-200'
    case 'NORMAL':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    case 'CAUTION':
      return 'bg-red-100 text-red-800 border-red-200'
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200'
  }
}

/**
 * Get SAFI level label (Korean)
 */
export function getSafiLevelLabel(level: SafiLevel): string {
  switch (level) {
    case 'SAFE':
      return '안전'
    case 'NORMAL':
      return '보통'
    case 'CAUTION':
      return '주의'
    default:
      return '알 수 없음'
  }
}

