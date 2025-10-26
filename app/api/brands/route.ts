import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { 
  validateBrandCreate, 
  validateBrandUpdate,
  formatValidationErrors 
} from '../../../lib/validations/brand'
import brandsData from '../../../data/brands.json'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// 환경 변수 체크 헬퍼 함수
function checkSupabaseConfig() {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    return false
  }
  return true
}

// GET - 브랜드 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const country = searchParams.get('country')
    const sortBy = searchParams.get('sortBy') || 'name'
    const order = searchParams.get('order') || 'asc'

    let brands = []

    // Supabase 설정이 있으면 데이터베이스에서 가져오기
    if (checkSupabaseConfig()) {
      let query = supabase
        .from('brands')
        .select('*')

      // 검색 필터
      if (search) {
        query = query.or(`name.ilike.%${search}%,manufacturer.ilike.%${search}%`)
      }

      // 국가 필터
      if (country) {
        query = query.eq('country', country)
      }

      // 정렬
      query = query.order(sortBy, { ascending: order === 'asc' })

      const { data: brandsData, error } = await query

      if (error) {
        console.error('Supabase error:', error)
        // Supabase 오류 시 JSON 파일로 폴백
        brands = brandsData as any[]
      } else {
        brands = brandsData || []
      }
    } else {
      // Supabase 설정이 없으면 JSON 파일에서 가져오기
      console.log('Using JSON data fallback for brands')
      brands = brandsData as any[]
    }

    // JSON 데이터 사용 시 클라이언트 사이드 필터링
    if (!checkSupabaseConfig()) {
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
    }

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

// POST - 브랜드 생성
export async function POST(request: NextRequest) {
  try {
    if (!checkSupabaseConfig()) {
      return NextResponse.json(
        { error: 'Supabase configuration is missing. Please check environment variables.' },
        { status: 500 }
      )
    }
    const body = await request.json()
    
    // 🔒 데이터 검증
    const validation = validateBrandCreate(body)
    if (!validation.success) {
      const errors = formatValidationErrors(validation.error)
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: errors
        },
        { status: 400 }
      )
    }

    const validatedData = validation.data

    // 🔒 이름 중복 체크
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id')
      .eq('name', validatedData.name)
      .single()

    if (existingBrand) {
      return NextResponse.json(
        { 
          error: 'Brand name already exists',
          details: [{ 
            field: 'name', 
            message: `브랜드명 "${validatedData.name}"은(는) 이미 사용 중입니다` 
          }]
        },
        { status: 409 }
      )
    }

    // 브랜드 생성
    const { data: newBrand, error } = await supabase
      .from('brands')
      .insert([validatedData])
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create brand', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Created brand: ${newBrand.name} (ID: ${newBrand.id})`)

    return NextResponse.json(newBrand, { status: 201 })
  } catch (error) {
    console.error('Failed to create brand:', error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON',
          details: [{ field: 'body', message: '유효하지 않은 JSON 형식입니다' }]
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to create brand',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// PUT - 브랜드 수정
export async function PUT(request: NextRequest) {
  try {
    if (!checkSupabaseConfig()) {
      return NextResponse.json(
        { error: 'Supabase configuration is missing. Please check environment variables.' },
        { status: 500 }
      )
    }
    const body = await request.json()
    
    // 🔒 데이터 검증
    const validation = validateBrandUpdate(body)
    if (!validation.success) {
      const errors = formatValidationErrors(validation.error)
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: errors
        },
        { status: 400 }
      )
    }

    const { id, ...validatedData } = validation.data

    if (!id) {
      return NextResponse.json(
        { 
          error: 'Brand ID is required',
          details: [{ field: 'id', message: '브랜드 ID는 필수입니다' }]
        },
        { status: 400 }
      )
    }

    // 🔒 브랜드 존재 확인
    const { data: existingBrand } = await supabase
      .from('brands')
      .select('id')
      .eq('id', id)
      .single()

    if (!existingBrand) {
      return NextResponse.json(
        { 
          error: 'Brand not found',
          details: [{ field: 'id', message: `ID ${id}에 해당하는 브랜드를 찾을 수 없습니다` }]
        },
        { status: 404 }
      )
    }

    // 🔒 이름 중복 체크 (다른 브랜드와)
    if (validatedData.name) {
      const { data: duplicateBrand } = await supabase
        .from('brands')
        .select('id')
        .eq('name', validatedData.name)
        .neq('id', id)
        .single()

      if (duplicateBrand) {
        return NextResponse.json(
          { 
            error: 'Brand name already exists',
            details: [{ 
              field: 'name', 
              message: `브랜드명 "${validatedData.name}"은(는) 이미 사용 중입니다` 
            }]
          },
          { status: 409 }
        )
      }
    }

    // 브랜드 업데이트
    const { data: updatedBrand, error } = await supabase
      .from('brands')
      .update(validatedData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to update brand', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Updated brand: ${updatedBrand.name} (ID: ${updatedBrand.id})`)

    return NextResponse.json(updatedBrand)
  } catch (error) {
    console.error('Failed to update brand:', error)
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { 
          error: 'Invalid JSON',
          details: [{ field: 'body', message: '유효하지 않은 JSON 형식입니다' }]
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to update brand',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

// DELETE - 브랜드 삭제
export async function DELETE(request: NextRequest) {
  try {
    if (!checkSupabaseConfig()) {
      return NextResponse.json(
        { error: 'Supabase configuration is missing. Please check environment variables.' },
        { status: 500 }
      )
    }
    const brandId = request.nextUrl.searchParams.get('id')
    
    if (!brandId) {
      return NextResponse.json(
        { 
          error: 'Brand ID is required',
          details: [{ field: 'id', message: '브랜드 ID는 필수입니다' }]
        },
        { status: 400 }
      )
    }

    // 브랜드 삭제
    const { data: deletedBrand, error } = await supabase
      .from('brands')
      .delete()
      .eq('id', brandId)
      .select()
      .single()

    if (error) {
      if (error.code === 'PGRST116') {
        return NextResponse.json(
          { 
            error: 'Brand not found',
            details: [{ field: 'id', message: `ID ${brandId}에 해당하는 브랜드를 찾을 수 없습니다` }]
          },
          { status: 404 }
        )
      }

      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to delete brand', details: error.message },
        { status: 500 }
      )
    }

    console.log(`✅ Deleted brand: ${deletedBrand.name} (ID: ${deletedBrand.id})`)

    return NextResponse.json({ 
      message: 'Brand deleted successfully', 
      brand: deletedBrand 
    })
  } catch (error) {
    console.error('Failed to delete brand:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete brand',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    )
  }
}

