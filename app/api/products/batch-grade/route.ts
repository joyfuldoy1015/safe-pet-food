import { NextRequest, NextResponse } from 'next/server'
import { getAdminClient } from '@/lib/supa/serverAdmin'
import { calculateAutoGrade } from '@/lib/auto-grade-calculator'

export const dynamic = 'force-dynamic'

/**
 * Vercel Cron은 GET으로 호출합니다. 수동 실행은 POST(또는 GET + 동일 헤더)도 가능합니다.
 * 프로덕션에서는 Vercel 프로젝트 환경변수 CRON_SECRET을 설정하면
 * Authorization: Bearer <CRON_SECRET> 가 자동으로 붙습니다.
 */
function isAuthorized(request: NextRequest): boolean {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    return process.env.NODE_ENV !== 'production'
  }
  const auth = request.headers.get('authorization')
  return auth === `Bearer ${secret}`
}

async function runBatchGrade() {
  const supabase = getAdminClient()

  const { data: products, error: pErr } = await supabase
    .from('products')
    .select('id, brand_id, ingredients, guaranteed_analysis, target_species') as { data: any[] | null; error: any }

  if (pErr || !products) {
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 })
  }

  const brandIds = Array.from(new Set(products.map((p: any) => p.brand_id).filter(Boolean)))

  const { data: brands } = await supabase
    .from('brands')
    .select('id, recall_history, ingredients, representative_product_id')
    .in('id', brandIds) as { data: any[] | null }

  const brandMap = new Map<string, any>()
  for (const b of brands || []) {
    brandMap.set(b.id, b)
  }

  const repProductIds = (brands || [])
    .map((b: any) => b.representative_product_id)
    .filter(Boolean)

  const repProductMap = new Map<string, any>()
  if (repProductIds.length > 0) {
    const { data: repProducts } = await supabase
      .from('products')
      .select('id, ingredients')
      .in('id', repProductIds) as { data: any[] | null }

    for (const rp of repProducts || []) {
      repProductMap.set(rp.id, rp)
    }
  }

  const { data: reviewAgg } = await supabase
    .from('review_logs')
    .select('product_id, rating, palatability_score, digestibility_score, coat_quality_score, stool_quality_score') as { data: any[] | null }

  const reviewsByProduct = new Map<string, any[]>()
  for (const r of reviewAgg || []) {
    if (!r.product_id) continue
    const list = reviewsByProduct.get(r.product_id) || []
    list.push(r)
    reviewsByProduct.set(r.product_id, list)
  }

  let updated = 0
  let skipped = 0

  for (const product of products) {
    const brand = brandMap.get(product.brand_id)
    let ingredients = brand?.ingredients || product.ingredients
    if (brand?.representative_product_id) {
      const repProd = repProductMap.get(brand.representative_product_id)
      if (repProd?.ingredients) ingredients = repProd.ingredients
    }

    const reviews = reviewsByProduct.get(product.id) || []
    const ratings = reviews.length > 0 ? {
      overall: avg(reviews.map((r: any) => r.rating)),
      palatability: avg(reviews.map((r: any) => r.palatability_score)),
      digestibility: avg(reviews.map((r: any) => r.digestibility_score)),
      coat_quality: avg(reviews.map((r: any) => r.coat_quality_score)),
      stool_quality: avg(reviews.map((r: any) => r.stool_quality_score)),
    } : null

    const autoGrade = calculateAutoGrade({
      recallHistory: brand?.recall_history,
      ingredients,
      ratings,
      reviewCount: reviews.length,
      guaranteedAnalysis: product.guaranteed_analysis,
      targetSpecies: product.target_species,
    })

    if (autoGrade.evaluatedCount < 2) {
      skipped++
      continue
    }

    const newGrade = autoGrade.grade
    const newGradeText = `${autoGrade.gradeText} (${autoGrade.totalScore}점)`

    await (supabase.from('products') as any)
      .update({ grade: newGrade, grade_text: newGradeText })
      .eq('id', product.id)

    updated++
  }

  return NextResponse.json({
    success: true,
    total: products.length,
    updated,
    skipped,
  })
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    return await runBatchGrade()
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    return await runBatchGrade()
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

function avg(nums: (number | null | undefined)[]): number {
  const valid = nums.filter((n): n is number => typeof n === 'number')
  if (valid.length === 0) return 0
  return valid.reduce((a, b) => a + b, 0) / valid.length
}
