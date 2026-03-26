import { NextRequest, NextResponse } from 'next/server'
import brandsData from '../../../data/brands.json'
import { getServerClient } from '@/lib/supabase-server'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// Supabase 사용 여부 확인
const isSupabaseConfigured = () => {
  return !!(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  )
}

// JSON 데이터를 Supabase 형식으로 변환
const transformJsonToSupabaseFormat = (jsonData: any) => {
  return {
    id: jsonData.id || crypto.randomUUID(),
    name: jsonData.name,
    manufacturer: jsonData.manufacturer || '',
    country: jsonData.country || '',
    overall_rating: jsonData.overall_rating || 0,
    established_year: jsonData.established_year || null,
    product_lines: jsonData.product_lines || [],
    certifications: jsonData.certifications || [],
    recall_history: jsonData.recall_history || [],
    brand_description: jsonData.description || jsonData.brand_description || '',
    manufacturing_info: jsonData.manufacturing_info || '',
    brand_pros: jsonData.brand_pros || [],
    brand_cons: jsonData.brand_cons || [],
    transparency_score: jsonData.transparency_score || 75,
    image: jsonData.image || null
  }
}

// 모호한 원료명 패턴
const VAGUE_PATTERNS = [
  /부산물/, /동물성\s*(유지|단백|지방)/, /식물성\s*(유지|단백|지방)/,
  /가금류/, /육류/, /어류/, /곡류/, /기타/, /혼합/, /향료/, /착색료/, /보존료/,
]

const DISCLOSURE_SCORE = { full: 100, partial: 80, none: 0 }

function estimateLevel(name: string): 'full' | 'partial' | 'none' {
  if (!name) return 'none'
  if (VAGUE_PATTERNS.some(p => p.test(name))) return 'none'
  if (/\(.+\)/.test(name)) return 'full'
  return 'partial'
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
  transparency_score: number
} {
  if (!ingredients || ingredients.length === 0) {
    return { fully_disclosed: 0, partially_disclosed: 0, not_disclosed: 0, transparency_score: 0 }
  }

  let fullCount = 0
  let partialCount = 0
  let noneCount = 0

  ingredients.forEach(ing => {
    const level = ing.disclosure_level || estimateLevel(ing.name)
    switch (level) {
      case 'full': fullCount++; break
      case 'partial': partialCount++; break
      case 'none': noneCount++; break
    }
  })

  const total = ingredients.length
  const score = Math.round(
    (fullCount * DISCLOSURE_SCORE.full +
     partialCount * DISCLOSURE_SCORE.partial +
     noneCount * DISCLOSURE_SCORE.none) / total
  )

  return {
    fully_disclosed: Math.round((fullCount / total) * 100),
    partially_disclosed: Math.round((partialCount / total) * 100),
    not_disclosed: Math.round((noneCount / total) * 100),
    transparency_score: score
  }
}

// Supabase 데이터를 JSON 형식으로 변환
const transformSupabaseToJsonFormat = (supabaseData: any) => {
  // product_lines 처리: 배열이거나 텍스트 필드일 수 있음
  let productLines: string[] = []
  if (supabaseData.product_lines) {
    // 이미 배열인 경우
    if (Array.isArray(supabaseData.product_lines)) {
      productLines = supabaseData.product_lines
    } else {
      // 문자열인 경우 (product_lines_text 등)
      productLines = [supabaseData.product_lines]
    }
  } else if (supabaseData.product_lines_text) {
    // product_lines_text 필드가 있는 경우 (쉼표로 구분된 문자열 또는 배열)
    if (Array.isArray(supabaseData.product_lines_text)) {
      productLines = supabaseData.product_lines_text
    } else if (typeof supabaseData.product_lines_text === 'string') {
      // 쉼표로 구분된 문자열을 배열로 변환
      productLines = supabaseData.product_lines_text.split(',').map((line: string) => line.trim()).filter((line: string) => line.length > 0)
    }
  }

  // ingredients 처리: JSONB 필드를 배열로 변환
  let ingredients: Array<{
    name: string
    percentage?: number
    source?: string
    disclosure_level?: 'full' | 'partial' | 'none'
  }> = []
  
  if (supabaseData.ingredients) {
    try {
      let rawIngs: any[] = []
      if (Array.isArray(supabaseData.ingredients)) {
        rawIngs = supabaseData.ingredients
      } else if (typeof supabaseData.ingredients === 'string') {
        rawIngs = JSON.parse(supabaseData.ingredients)
      }
      ingredients = rawIngs.map((item: any) => {
        if (typeof item === 'string') return { name: item }
        if (item && typeof item === 'object' && item.name) return item
        return null
      }).filter(Boolean)
    } catch (e) {
      console.warn('Failed to parse ingredients:', e)
      ingredients = []
    }
  }

  // ingredient_disclosure 자동 계산
  const ingredientDisclosure = ingredients.length > 0
    ? calculateIngredientDisclosure(ingredients)
    : { fully_disclosed: 0, partially_disclosed: 0, not_disclosed: 0, transparency_score: 0 }

  return {
    id: supabaseData.id,
    name: supabaseData.name,
    manufacturer: supabaseData.manufacturer,
    country: supabaseData.country,
    description: supabaseData.brand_description || supabaseData.description || '',
    brand_description: supabaseData.brand_description || supabaseData.description || '',
    manufacturing_info: supabaseData.manufacturing_info || '',
    manufacturing_locations: supabaseData.manufacturing_locations || [],
    recall_history: supabaseData.recall_history || [],
    overall_rating: parseFloat(supabaseData.overall_rating) || 0,
    product_lines: productLines,
    established_year: supabaseData.established_year,
    certifications: supabaseData.certifications || [],
    image: supabaseData.image,
    brand_pros: supabaseData.brand_pros || [],
    brand_cons: supabaseData.brand_cons || [],
    transparency_score: ingredientDisclosure.transparency_score || supabaseData.transparency_score || 0,
    ingredients: ingredients,
    ingredient_disclosure: ingredientDisclosure
  }
}

// GET - 브랜드 목록 조회 (Supabase 우선, 실패 시 JSON fallback)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const country = searchParams.get('country')
    const sortBy = searchParams.get('sortBy') || 'name'
    const order = searchParams.get('order') || 'asc'

    // Supabase 사용 가능하면 Supabase에서 가져오기
    if (isSupabaseConfigured()) {
      try {
        const supabase = getServerClient()
        // products 테이블과 조인하여 각 브랜드의 제품 개수도 함께 가져오기
        let query = supabase
          .from('brands')
          .select(`
            *,
            products:products!brand_id(id)
          `)

        // 검색 필터
        if (search) {
          query = query.or(`name.ilike.%${search}%,manufacturer.ilike.%${search}%`)
        }

        // 국가 필터
        if (country) {
          query = query.eq('country', country)
        }

        // 정렬
        const ascending = order === 'asc'
        if (sortBy === 'overall_rating') {
          query = query.order('overall_rating', { ascending: !ascending })
        } else {
          query = query.order('name', { ascending })
        }

        const { data, error } = await query

        if (!error && data && data.length > 0) {
          // Supabase 데이터를 JSON 형식으로 변환하고 products 개수 추가
          const transformedData = data.map((brandData: any) => {
            const transformed = transformSupabaseToJsonFormat(brandData)
            // products 개수 추가 (products 배열의 길이)
            const productsCount = Array.isArray(brandData.products) 
              ? brandData.products.length 
              : 0
            return {
              ...transformed,
              products_count: productsCount
            }
          })
          return NextResponse.json(transformedData, {
            status: 200,
            headers: {
              'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
            }
          })
        }

        // Supabase에 데이터가 없으면 fallback
        console.warn('Supabase returned no data, falling back to JSON')
      } catch (supabaseError) {
        console.warn('Supabase error, falling back to JSON:', supabaseError)
      }
    }

    // Fallback: JSON 파일에서 브랜드 데이터 가져오기
    let brands = brandsData as any[]

    // 검색 필터
    if (search) {
      brands = brands.filter((brand: any) => 
        brand.name.toLowerCase().includes(search.toLowerCase()) ||
        brand.manufacturer.toLowerCase().includes(search.toLowerCase())
      )
    }

    // 국가 필터
    if (country) {
      brands = brands.filter((brand: any) => brand.country === country)
    }

    // 정렬
    brands.sort((a: any, b: any) => {
      const aValue = a[sortBy]
      const bValue = b[sortBy]
      
      if (order === 'desc') {
        return bValue > aValue ? 1 : -1
      } else {
        return aValue > bValue ? 1 : -1
      }
    })

    return NextResponse.json(brands, {
      status: 200,
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300'
      }
    })
  } catch (error) {
    console.error('Failed to fetch brands:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch brands',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// POST - 브랜드 생성 (Supabase 사용)
export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { 
          error: 'Brand creation not supported',
          message: 'Supabase가 설정되지 않았습니다. 환경 변수를 확인해주세요.'
        },
        { status: 501 }
      )
    }

    const data = await request.json()
    const brandData = transformJsonToSupabaseFormat(data)

    const supabase = getServerClient()
    const { data: newBrand, error } = await (supabase
      .from('brands') as any)
      .insert([brandData])
      .select()
      .single()

    if (error) {
      console.error('Failed to create brand:', error)
      return NextResponse.json(
        { error: 'Failed to create brand', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(transformSupabaseToJsonFormat(newBrand), { status: 201 })
  } catch (error) {
    console.error('Failed to create brand:', error)
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}

// PUT - 브랜드 수정 (Supabase 사용)
export async function PUT(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { 
          error: 'Brand update not supported',
          message: 'Supabase가 설정되지 않았습니다. 환경 변수를 확인해주세요.'
        },
        { status: 501 }
      )
    }

    const data = await request.json()
    if (!data.id) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    const brandData = transformJsonToSupabaseFormat(data)
    const { id, ...updateData } = brandData

    const supabase = getServerClient()
    const { data: updatedBrand, error } = await (supabase
      .from('brands') as any)
      .update(updateData)
      .eq('id', data.id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update brand:', error)
      return NextResponse.json(
        { error: 'Failed to update brand', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json(transformSupabaseToJsonFormat(updatedBrand))
  } catch (error) {
    console.error('Failed to update brand:', error)
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    )
  }
}

// DELETE - 브랜드 삭제 (Supabase 사용)
export async function DELETE(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { 
          error: 'Brand deletion not supported',
          message: 'Supabase가 설정되지 않았습니다. 환경 변수를 확인해주세요.'
        },
        { status: 501 }
      )
    }

    const brandId = request.nextUrl.searchParams.get('id')
    
    if (!brandId) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    const supabase = getServerClient()
    const { error } = await supabase
      .from('brands')
      .delete()
      .eq('id', brandId)

    if (error) {
      console.error('Failed to delete brand:', error)
      return NextResponse.json(
        { error: 'Failed to delete brand', details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'Brand deleted successfully' })
  } catch (error) {
    console.error('Failed to delete brand:', error)
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    )
  }
}

