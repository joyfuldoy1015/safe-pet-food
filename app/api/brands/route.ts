import { NextRequest, NextResponse } from 'next/server'
import brandsData from '../../../data/brands.json'
import { supabase } from '@/lib/supabase'

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
    image: jsonData.image || null
  }
}

// Supabase 데이터를 JSON 형식으로 변환
const transformSupabaseToJsonFormat = (supabaseData: any) => {
  return {
    id: supabaseData.id,
    name: supabaseData.name,
    manufacturer: supabaseData.manufacturer,
    country: supabaseData.country,
    description: supabaseData.brand_description,
    brand_description: supabaseData.brand_description,
    manufacturing_info: supabaseData.manufacturing_info || '',
    recall_history: supabaseData.recall_history,
    overall_rating: parseFloat(supabaseData.overall_rating) || 0,
    product_lines: supabaseData.product_lines || [],
    established_year: supabaseData.established_year,
    certifications: supabaseData.certifications || [],
    image: supabaseData.image,
    brand_pros: supabaseData.brand_pros || [],
    brand_cons: supabaseData.brand_cons || []
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
        let query = supabase.from('brands').select('*')

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
          // Supabase 데이터를 JSON 형식으로 변환
          const transformedData = data.map(transformSupabaseToJsonFormat)
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

    const { data: newBrand, error } = await supabase
      .from('brands')
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

    const { data: updatedBrand, error } = await supabase
      .from('brands')
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

