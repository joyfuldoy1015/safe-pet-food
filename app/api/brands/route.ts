import { NextRequest, NextResponse } from 'next/server'
import brandsData from '../../../data/brands.json'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

// JSON 데이터 사용 (Supabase 없이)

// GET - 브랜드 목록 조회
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search')
    const country = searchParams.get('country')
    const sortBy = searchParams.get('sortBy') || 'name'
    const order = searchParams.get('order') || 'asc'

    // JSON 파일에서 브랜드 데이터 가져오기
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

// POST - 브랜드 생성 (JSON 파일 기반 - 읽기 전용)
export async function POST(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Brand creation not supported',
      message: '현재 JSON 파일 기반으로 운영 중입니다. 브랜드 추가는 관리자에게 문의하세요.'
    },
    { status: 501 }
  )
}

// PUT - 브랜드 수정 (JSON 파일 기반 - 읽기 전용)
export async function PUT(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Brand update not supported',
      message: '현재 JSON 파일 기반으로 운영 중입니다. 브랜드 수정은 관리자에게 문의하세요.'
    },
    { status: 501 }
  )
}

// DELETE - 브랜드 삭제 (JSON 파일 기반 - 읽기 전용)
export async function DELETE(request: NextRequest) {
  return NextResponse.json(
    { 
      error: 'Brand deletion not supported',
      message: '현재 JSON 파일 기반으로 운영 중입니다. 브랜드 삭제는 관리자에게 문의하세요.'
    },
    { status: 501 }
  )
}

