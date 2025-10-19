import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import brandsData from '../../../data/brands.json'
import { 
  validateBrandCreate, 
  validateBrandUpdate,
  formatValidationErrors 
} from '../../../lib/validations/brand'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

const BRANDS_KEY = 'brands:all'

// KV 초기화 (첫 실행 시 JSON 데이터 로드)
async function initializeData() {
  try {
    const existing = await kv.get(BRANDS_KEY)
    if (!existing || (Array.isArray(existing) && existing.length === 0)) {
      await kv.set(BRANDS_KEY, brandsData)
      console.log('✅ Initialized KV with JSON data')
      return brandsData
    }
    return existing
  } catch (error) {
    console.error('❌ Failed to initialize KV, falling back to JSON:', error)
    return brandsData
  }
}

// GET - 브랜드 목록 조회
export async function GET() {
  try {
    const brands = await initializeData()
    
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

// POST - 새 브랜드 추가
export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 🔒 데이터 검증
    const validation = validateBrandCreate(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: formatValidationErrors(validation.error)
        },
        { status: 400 }
      )
    }

    const validatedData = validation.data
    
    // 기존 브랜드 조회
    const brands = await kv.get(BRANDS_KEY) as any[] || []
    
    // 🔒 중복 체크
    const existingBrand = brands.find(
      b => b.name.toLowerCase() === validatedData.name.toLowerCase()
    )
    
    if (existingBrand) {
      return NextResponse.json(
        { 
          error: 'Brand already exists',
          details: [{ 
            field: 'name', 
            message: `브랜드 "${validatedData.name}"은(는) 이미 등록되어 있습니다` 
          }]
        },
        { status: 409 }
      )
    }

    // ID 생성 (더 안전한 방식)
    const maxId = brands.length > 0 
      ? Math.max(...brands.map(b => parseInt(b.id) || 0), 0)
      : 0
    
    const newBrand = {
      id: (maxId + 1).toString(),
      ...validatedData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // KV에 저장
    brands.push(newBrand)
    await kv.set(BRANDS_KEY, brands)

    console.log(`✅ Created brand: ${newBrand.name} (ID: ${newBrand.id})`)

    return NextResponse.json(newBrand, { status: 201 })
  } catch (error) {
    console.error('Failed to create brand:', error)
    
    // JSON 파싱 에러 처리
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

// PUT - 브랜드 업데이트
export async function PUT(request: Request) {
  try {
    const body = await request.json()
    
    // 🔒 데이터 검증
    const validation = validateBrandUpdate(body)
    
    if (!validation.success) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: formatValidationErrors(validation.error)
        },
        { status: 400 }
      )
    }

    const validatedData = validation.data
    
    if (!validatedData.id) {
      return NextResponse.json(
        { 
          error: 'Brand ID is required',
          details: [{ field: 'id', message: '브랜드 ID는 필수입니다' }]
        },
        { status: 400 }
      )
    }

    const brands = await kv.get(BRANDS_KEY) as any[] || []
    const brandIndex = brands.findIndex(b => b.id === validatedData.id)
    
    if (brandIndex === -1) {
      return NextResponse.json(
        { 
          error: 'Brand not found',
          details: [{ field: 'id', message: `ID ${validatedData.id}에 해당하는 브랜드를 찾을 수 없습니다` }]
        },
        { status: 404 }
      )
    }

    // 🔒 이름 중복 체크 (다른 브랜드와)
    if (validatedData.name) {
      const duplicateBrand = brands.find(
        b => b.id !== validatedData.id && 
             b.name.toLowerCase() === validatedData.name.toLowerCase()
      )
      
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

    // 업데이트
    const updatedBrand = {
      ...brands[brandIndex],
      ...validatedData,
      id: brands[brandIndex].id, // ID는 변경 불가
      created_at: brands[brandIndex].created_at, // 생성일 유지
      updated_at: new Date().toISOString()
    }
    
    brands[brandIndex] = updatedBrand
    await kv.set(BRANDS_KEY, brands)

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

    // 🔒 ID 형식 검증
    if (!/^[0-9a-zA-Z_-]+$/.test(brandId)) {
      return NextResponse.json(
        { 
          error: 'Invalid brand ID',
          details: [{ field: 'id', message: '유효하지 않은 브랜드 ID 형식입니다' }]
        },
        { status: 400 }
      )
    }

    const brands = await kv.get(BRANDS_KEY) as any[] || []
    const brandIndex = brands.findIndex(b => b.id === brandId)
    
    if (brandIndex === -1) {
      return NextResponse.json(
        { 
          error: 'Brand not found',
          details: [{ field: 'id', message: `ID ${brandId}에 해당하는 브랜드를 찾을 수 없습니다` }]
        },
        { status: 404 }
      )
    }

    // 삭제
    const deletedBrand = brands.splice(brandIndex, 1)[0]
    await kv.set(BRANDS_KEY, brands)

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
