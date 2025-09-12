import { NextResponse } from 'next/server'
import brandsData from '../../../data/brands.json'
import fs from 'fs'
import path from 'path'

// GET - 브랜드 목록 조회
export async function GET() {
  try {
    return NextResponse.json(brandsData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch brands' },
      { status: 500 }
    )
  }
}

// POST - 새 브랜드 추가
export async function POST(request: Request) {
  try {
    const newBrand = await request.json()
    
    // 브랜드 데이터 검증
    if (!newBrand.name || !newBrand.manufacturer) {
      return NextResponse.json(
        { error: 'Name and manufacturer are required' },
        { status: 400 }
      )
    }

    // ID 생성
    const maxId = Math.max(...brandsData.map(b => parseInt(b.id)), 0)
    const brandWithId = {
      id: (maxId + 1).toString(),
      ...newBrand,
      recall_history: newBrand.recall_history || []
    }

    // 메모리에서 업데이트 (실제 환경에서는 데이터베이스 사용)
    brandsData.push(brandWithId)

    // 개발 환경에서는 파일도 업데이트
    if (process.env.NODE_ENV === 'development') {
      const filePath = path.join(process.cwd(), 'data', 'brands.json')
      fs.writeFileSync(filePath, JSON.stringify(brandsData, null, 2))
    }

    return NextResponse.json(brandWithId, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}

// PUT - 브랜드 업데이트
export async function PUT(request: Request) {
  try {
    const updatedBrand = await request.json()
    
    if (!updatedBrand.id) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    const brandIndex = brandsData.findIndex(b => b.id === updatedBrand.id)
    if (brandIndex === -1) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // 브랜드 업데이트
    brandsData[brandIndex] = { ...brandsData[brandIndex], ...updatedBrand }

    // 개발 환경에서는 파일도 업데이트
    if (process.env.NODE_ENV === 'development') {
      const filePath = path.join(process.cwd(), 'data', 'brands.json')
      fs.writeFileSync(filePath, JSON.stringify(brandsData, null, 2))
    }

    return NextResponse.json(brandsData[brandIndex])
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update brand' },
      { status: 500 }
    )
  }
}

// DELETE - 브랜드 삭제
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const brandId = searchParams.get('id')
    
    if (!brandId) {
      return NextResponse.json(
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    const brandIndex = brandsData.findIndex(b => b.id === brandId)
    if (brandIndex === -1) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    // 브랜드 삭제
    const deletedBrand = brandsData.splice(brandIndex, 1)[0]

    // 개발 환경에서는 파일도 업데이트
    if (process.env.NODE_ENV === 'development') {
      const filePath = path.join(process.cwd(), 'data', 'brands.json')
      fs.writeFileSync(filePath, JSON.stringify(brandsData, null, 2))
    }

    return NextResponse.json({ message: 'Brand deleted successfully', brand: deletedBrand })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    )
  }
} 