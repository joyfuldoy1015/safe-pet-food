/**
 * 제품 자동 등급 산정 시스템
 *
 * 4개 항목의 가중 합산으로 등급을 결정합니다.
 * - 안전성 (리콜 이력): 30%
 * - 원료 투명성: 25%
 * - 사용자 만족도 (review_logs): 25%
 * - 영양 기준 충족 (AAFCO 대비): 20%
 */

export type AutoGradeLetter = 'S' | 'A' | 'B' | 'C' | 'D' | 'F'

export interface GradeBreakdownItem {
  criterion: string
  score: number | null
  maxScore: 100
  weight: number
  weightedScore: number
  source: 'auto' | 'insufficient_data'
  detail: string
}

export interface AutoGradeResult {
  grade: AutoGradeLetter
  gradeText: string
  totalScore: number
  evaluatedCount: number
  totalCriteria: 4
  breakdown: GradeBreakdownItem[]
  lastUpdated: string
}

// AAFCO 최소 영양 기준 (건물 기준, %)
const AAFCO_ADULT_DOG = { protein: 18, fat: 5.5 }
const AAFCO_PUPPY_DOG = { protein: 22.5, fat: 8.5 }
const AAFCO_ADULT_CAT = { protein: 26, fat: 9 }
const AAFCO_KITTEN = { protein: 30, fat: 9 }

const GRADE_THRESHOLDS: { grade: AutoGradeLetter; min: number; text: string }[] = [
  { grade: 'S', min: 90, text: '최고급' },
  { grade: 'A', min: 80, text: '우수' },
  { grade: 'B', min: 70, text: '양호' },
  { grade: 'C', min: 60, text: '보통' },
  { grade: 'D', min: 50, text: '미흡' },
  { grade: 'F', min: 0, text: '부적합' },
]

const WEIGHTS = {
  safety: 30,
  transparency: 25,
  satisfaction: 25,
  nutrition: 20,
}

// ─── 1. 안전성 점수 (리콜 이력) ───

interface RecallItem {
  date?: string
  reason?: string
  severity?: 'low' | 'medium' | 'high'
  resolved?: boolean
}

export function calculateSafetyScore(recallHistory: RecallItem[] | null | undefined): {
  score: number | null
  detail: string
} {
  if (!recallHistory || !Array.isArray(recallHistory)) {
    return { score: 100, detail: '리콜 이력 없음' }
  }

  const validRecalls = recallHistory.filter(r => r && r.date)
  if (validRecalls.length === 0) {
    return { score: 100, detail: '리콜 이력 없음' }
  }

  const now = new Date()
  let minScore = 100

  for (const recall of validRecalls) {
    const recallDate = new Date(recall.date!)
    const yearsAgo = (now.getTime() - recallDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000)

    let baseScore: number
    if (yearsAgo > 10) baseScore = 90
    else if (yearsAgo > 5) baseScore = 75
    else if (yearsAgo > 3) baseScore = 55
    else if (yearsAgo > 1) baseScore = 35
    else baseScore = 15

    const severityPenalty = recall.severity === 'high' ? 10 : recall.severity === 'medium' ? 5 : 0
    baseScore = Math.max(0, baseScore - severityPenalty)

    if (baseScore < minScore) minScore = baseScore
  }

  const recentRecall = validRecalls
    .map(r => new Date(r.date!))
    .sort((a, b) => b.getTime() - a.getTime())[0]
  const yearsAgo = ((now.getTime() - recentRecall.getTime()) / (365.25 * 24 * 60 * 60 * 1000))

  let detail: string
  if (yearsAgo > 10) detail = `${validRecalls.length}건 (10년 이상 전)`
  else if (yearsAgo > 5) detail = `${validRecalls.length}건 (최근 10년 이내)`
  else if (yearsAgo > 3) detail = `${validRecalls.length}건 (최근 5년 이내)`
  else detail = `${validRecalls.length}건 (최근 3년 이내)`

  return { score: minScore, detail }
}

// ─── 2. 원료 투명성 점수 ───

const VAGUE_PATTERNS = [
  /^동물성/, /^식물성/, /^곡류/, /^육류/, /^어류/,
  /부산물/, /기타/, /혼합/, /등$/, /외$/
]

export function calculateTransparencyScore(
  ingredients: any[] | null | undefined
): { score: number | null; detail: string } {
  if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0) {
    return { score: null, detail: '원료 정보 없음' }
  }

  const normalized = ingredients.map(item => {
    if (typeof item === 'string') return { name: item }
    if (item && typeof item === 'object' && item.name) return item
    return null
  }).filter(Boolean)

  if (normalized.length === 0) {
    return { score: null, detail: '원료 정보 없음' }
  }

  let fullCount = 0
  let partialCount = 0
  let noneCount = 0

  for (const ing of normalized) {
    const name = ing.name || ''
    const isVague = VAGUE_PATTERNS.some(p => p.test(name))
    if (isVague) {
      noneCount++
    } else if (/\(.+\)/.test(name)) {
      fullCount++
    } else {
      partialCount++
    }
  }

  const total = normalized.length
  const score = Math.round((fullCount * 100 + partialCount * 80 + noneCount * 0) / total)
  const detail = `${total}개 원료 중 완전공개 ${fullCount}개, 부분공개 ${partialCount}개, 미공개 ${noneCount}개`

  return { score, detail }
}

// ─── 3. 사용자 만족도 점수 ───

interface ReviewRatings {
  palatability?: number
  digestibility?: number
  coat_quality?: number
  stool_quality?: number
  overall_satisfaction?: number
}

const MIN_REVIEWS_FOR_GRADE = 3

export function calculateSatisfactionScore(
  ratings: ReviewRatings | null | undefined,
  reviewCount: number
): { score: number | null; detail: string } {
  if (!ratings || reviewCount < MIN_REVIEWS_FOR_GRADE) {
    return {
      score: null,
      detail: reviewCount === 0
        ? '리뷰 없음'
        : `리뷰 ${reviewCount}건 (최소 ${MIN_REVIEWS_FOR_GRADE}건 필요)`
    }
  }

  const scores = [
    ratings.palatability,
    ratings.digestibility,
    ratings.coat_quality,
    ratings.stool_quality,
    ratings.overall_satisfaction
  ].filter((v): v is number => v != null && v > 0)

  if (scores.length === 0) {
    return { score: null, detail: '평가 데이터 부족' }
  }

  const avg = scores.reduce((a, b) => a + b, 0) / scores.length
  const score = Math.round((avg / 5) * 100)
  const detail = `평균 ${avg.toFixed(1)}점 (${reviewCount}건 기반)`

  return { score, detail }
}

// ─── 4. 영양 기준 충족 점수 ───

function parseNumericValue(val: any): number | null {
  if (typeof val === 'number') return val
  if (typeof val === 'string') {
    const match = val.match(/([\d.]+)/)
    return match ? parseFloat(match[1]) : null
  }
  return null
}

export function calculateNutritionScore(
  guaranteedAnalysis: Record<string, any> | null | undefined,
  targetSpecies?: 'dog' | 'cat' | 'all'
): { score: number | null; detail: string } {
  if (!guaranteedAnalysis) {
    return { score: null, detail: '성분 정보 없음' }
  }

  const protein = parseNumericValue(guaranteedAnalysis.protein)
  const fat = parseNumericValue(guaranteedAnalysis.fat)

  if (protein === null && fat === null) {
    return { score: null, detail: '성분 정보 부족' }
  }

  const standard = targetSpecies === 'cat' ? AAFCO_ADULT_CAT : AAFCO_ADULT_DOG
  let totalChecks = 0
  let passedChecks = 0
  let excellentChecks = 0
  const details: string[] = []

  if (protein !== null) {
    totalChecks++
    if (protein >= standard.protein) {
      passedChecks++
      if (protein >= standard.protein * 1.2) {
        excellentChecks++
        details.push(`조단백 ${protein}% (기준 대비 우수)`)
      } else {
        details.push(`조단백 ${protein}% (기준 충족)`)
      }
    } else {
      details.push(`조단백 ${protein}% (기준 ${standard.protein}% 미달)`)
    }
  }

  if (fat !== null) {
    totalChecks++
    if (fat >= standard.fat) {
      passedChecks++
      if (fat >= standard.fat * 1.2) {
        excellentChecks++
        details.push(`조지방 ${fat}% (기준 대비 우수)`)
      } else {
        details.push(`조지방 ${fat}% (기준 충족)`)
      }
    } else {
      details.push(`조지방 ${fat}% (기준 ${standard.fat}% 미달)`)
    }
  }

  const fiber = parseNumericValue(guaranteedAnalysis.fiber)
  if (fiber !== null) {
    totalChecks++
    if (fiber <= 7) {
      passedChecks++
      if (fiber <= 4) excellentChecks++
    }
  }

  if (totalChecks === 0) {
    return { score: null, detail: '성분 정보 부족' }
  }

  const passRate = passedChecks / totalChecks
  const excellentRate = excellentChecks / totalChecks

  let score: number
  if (passRate === 1 && excellentRate >= 0.5) score = 95
  else if (passRate === 1) score = 85
  else if (passRate >= 0.5) score = 65
  else score = 35

  return { score, detail: details.join(', ') }
}

// ─── 종합 등급 계산 ───

export interface AutoGradeInput {
  recallHistory?: RecallItem[] | null
  ingredients?: any[] | null
  ratings?: ReviewRatings | null
  reviewCount?: number
  guaranteedAnalysis?: Record<string, any> | null
  targetSpecies?: 'dog' | 'cat' | 'all'
}

export function calculateAutoGrade(input: AutoGradeInput): AutoGradeResult {
  const safety = calculateSafetyScore(input.recallHistory)
  const transparency = calculateTransparencyScore(input.ingredients)
  const satisfaction = calculateSatisfactionScore(input.ratings, input.reviewCount || 0)
  const nutrition = calculateNutritionScore(input.guaranteedAnalysis, input.targetSpecies)

  const items: { criterion: string; score: number | null; weight: number; detail: string }[] = [
    { criterion: '안전성 (리콜 이력)', score: safety.score, weight: WEIGHTS.safety, detail: safety.detail },
    { criterion: '원료 투명성', score: transparency.score, weight: WEIGHTS.transparency, detail: transparency.detail },
    { criterion: '사용자 만족도', score: satisfaction.score, weight: WEIGHTS.satisfaction, detail: satisfaction.detail },
    { criterion: '영양 기준 충족', score: nutrition.score, weight: WEIGHTS.nutrition, detail: nutrition.detail },
  ]

  const evaluated = items.filter(i => i.score !== null)
  const evaluatedCount = evaluated.length

  let totalScore: number

  if (evaluatedCount === 0) {
    totalScore = 0
  } else {
    const totalWeight = evaluated.reduce((sum, i) => sum + i.weight, 0)
    totalScore = Math.round(
      evaluated.reduce((sum, i) => sum + (i.score! * i.weight / totalWeight), 0)
    )
  }

  const gradeInfo = GRADE_THRESHOLDS.find(g => totalScore >= g.min) || GRADE_THRESHOLDS[GRADE_THRESHOLDS.length - 1]

  const breakdown: GradeBreakdownItem[] = items.map(item => ({
    criterion: item.criterion,
    score: item.score,
    maxScore: 100 as const,
    weight: item.weight,
    weightedScore: item.score !== null
      ? Math.round(item.score * item.weight / (evaluatedCount > 0 ? items.filter(i => i.score !== null).reduce((s, i) => s + i.weight, 0) : 100))
      : 0,
    source: item.score !== null ? 'auto' as const : 'insufficient_data' as const,
    detail: item.detail,
  }))

  return {
    grade: evaluatedCount >= 2 ? gradeInfo.grade : 'F',
    gradeText: evaluatedCount >= 2 ? gradeInfo.text : '평가 불가',
    totalScore: evaluatedCount >= 2 ? totalScore : 0,
    evaluatedCount,
    totalCriteria: 4,
    breakdown,
    lastUpdated: new Date().toISOString(),
  }
}
