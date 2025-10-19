# Vercel KV 빠른 설정 가이드 (Redis)

## 🚀 가장 빠른 해결책

설정 시간: **10분 이내**  
난이도: ⭐️ (매우 쉬움)

## 📋 장점

- ✅ 설정이 매우 간단 (클릭 몇 번)
- ✅ Vercel과 완벽 통합
- ✅ 무료 티어 관대 (256MB, 3,000 명령/일)
- ✅ 즉시 사용 가능
- ✅ JSON 데이터 그대로 사용

## 🔧 설정 방법

### 1단계: Vercel KV 생성 (2분)

1. Vercel 대시보드 접속
2. 프로젝트 선택
3. **Storage** 탭 클릭
4. **Create Database** → **KV (Redis)** 선택
5. 데이터베이스 이름: `safe-pet-food-kv`
6. 지역 선택: **가장 가까운 지역**
7. **Create** 클릭

→ 환경 변수 자동으로 설정됨!

### 2단계: 패키지 설치 (1분)

```bash
npm install @vercel/kv
```

### 3단계: API 라우트 수정 (5분)

**`app/api/brands/route.ts` 전체 교체:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { kv } from '@vercel/kv'
import brandsData from '../../../data/brands.json'

export const dynamic = 'force-dynamic'

const BRANDS_KEY = 'brands:all'

// 초기 데이터 로드 (KV에 데이터가 없을 경우)
async function initializeData() {
  const existing = await kv.get(BRANDS_KEY)
  if (!existing) {
    await kv.set(BRANDS_KEY, brandsData)
    console.log('Initialized KV with JSON data')
  }
}

// GET - 브랜드 목록 조회
export async function GET() {
  try {
    await initializeData()
    const brands = await kv.get(BRANDS_KEY) || []
    return NextResponse.json(brands)
  } catch (error) {
    console.error('Failed to fetch brands:', error)
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
    
    if (!newBrand.name || !newBrand.manufacturer) {
      return NextResponse.json(
        { error: 'Name and manufacturer are required' },
        { status: 400 }
      )
    }

    const brands = await kv.get(BRANDS_KEY) as any[] || []
    
    // ID 생성
    const maxId = Math.max(...brands.map(b => parseInt(b.id)), 0)
    const brandWithId = {
      id: (maxId + 1).toString(),
      ...newBrand,
      recall_history: newBrand.recall_history || []
    }

    // KV에 저장
    brands.push(brandWithId)
    await kv.set(BRANDS_KEY, brands)

    return NextResponse.json(brandWithId, { status: 201 })
  } catch (error) {
    console.error('Failed to create brand:', error)
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

    const brands = await kv.get(BRANDS_KEY) as any[] || []
    const brandIndex = brands.findIndex(b => b.id === updatedBrand.id)
    
    if (brandIndex === -1) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    brands[brandIndex] = { ...brands[brandIndex], ...updatedBrand }
    await kv.set(BRANDS_KEY, brands)

    return NextResponse.json(brands[brandIndex])
  } catch (error) {
    console.error('Failed to update brand:', error)
    return NextResponse.json(
      { error: 'Failed to update brand' },
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
        { error: 'Brand ID is required' },
        { status: 400 }
      )
    }

    const brands = await kv.get(BRANDS_KEY) as any[] || []
    const brandIndex = brands.findIndex(b => b.id === brandId)
    
    if (brandIndex === -1) {
      return NextResponse.json(
        { error: 'Brand not found' },
        { status: 404 }
      )
    }

    const deletedBrand = brands.splice(brandIndex, 1)[0]
    await kv.set(BRANDS_KEY, brands)

    return NextResponse.json({ 
      message: 'Brand deleted successfully', 
      brand: deletedBrand 
    })
  } catch (error) {
    console.error('Failed to delete brand:', error)
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    )
  }
}
```

### 4단계: 로컬 개발 설정

**`.env.local` 파일에 추가:**
```bash
# Vercel KV (대시보드에서 복사)
KV_URL="redis://..."
KV_REST_API_URL="https://..."
KV_REST_API_TOKEN="..."
KV_REST_API_READ_ONLY_TOKEN="..."
```

→ Vercel 대시보드 Storage → KV → .env.local 탭에서 복사!

### 5단계: 테스트 (2분)

```bash
npm run dev
```

http://localhost:3000/admin/brands 접속하여 테스트!

## 💰 비용

| 플랜 | 스토리지 | 명령 수/일 | 가격 |
|------|----------|-----------|------|
| Hobby | 256 MB | 3,000 | **무료** |
| Pro | 512 MB | 30,000 | $1/월 |

→ 대부분의 경우 **무료 티어로 충분**!

## ✅ 완료 확인

1. 관리자 페이지에서 브랜드 추가 테스트
2. 페이지 새로고침 → 데이터 유지되는지 확인
3. Vercel에 배포 → 프로덕션에서도 동작 확인

## 🎯 이 방법이 적합한 경우

- ✅ 빠르게 시작하고 싶을 때
- ✅ 간단한 CRUD 기능만 필요할 때
- ✅ 데이터 양이 적을 때 (수백~수천 건)
- ✅ 복잡한 쿼리가 필요 없을 때

## ⚠️ 제한사항

- 복잡한 관계형 쿼리 어려움
- 트랜잭션 제한적
- 대용량 데이터 처리 느림

→ 나중에 데이터베이스로 쉽게 마이그레이션 가능!

## 🔄 나중에 PostgreSQL로 마이그레이션

서비스가 커지면 `DATABASE_MIGRATION_GUIDE.md` 참고하여 
PostgreSQL로 쉽게 전환 가능합니다.

---

**추천**: 일단 KV로 시작 → 필요시 PostgreSQL 전환!

