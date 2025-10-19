# 데이터베이스 마이그레이션 가이드

## 📋 개요

현재 JSON 파일 기반 데이터 관리를 실제 데이터베이스로 전환하는 가이드입니다.

## 🎯 현재 문제점

### JSON 파일 방식의 한계

1. **프로덕션 환경 제약**
   ```
   - Vercel 서버리스 환경에서 파일 쓰기 불가능
   - 신규 데이터 추가 → 서버 재시작 시 사라짐
   - 메모리에만 저장되어 휘발성
   ```

2. **확장성 문제**
   ```
   - 동시 사용자 처리 불가
   - 트랜잭션 지원 안 됨
   - 데이터 무결성 보장 어려움
   ```

3. **협업 문제**
   ```
   - Git 충돌 발생
   - 데이터 버전 관리 어려움
   ```

## 🗄️ 권장 데이터베이스 옵션

### 옵션 1: Vercel Postgres (가장 추천 ⭐️⭐️⭐️⭐️⭐️)

**장점:**
- Vercel과 완벽 통합
- 자동 확장 및 백업
- 무료 티어 제공 (60시간 컴퓨트)
- 설정 간단

**가격:**
- Hobby: 무료 (60시간 컴퓨트/월, 256MB 스토리지)
- Pro: $20/월 (1000시간 컴퓨트, 30GB 스토리지)

**설치:**
```bash
npm install @vercel/postgres
```

### 옵션 2: Supabase (무료 추천 ⭐️⭐️⭐️⭐️)

**장점:**
- 완전 무료 티어 (500MB DB, 무제한 API 요청)
- PostgreSQL 기반
- 실시간 기능 내장
- 관리자 대시보드 제공

**가격:**
- Free: $0 (500MB DB, 2GB 파일 저장)
- Pro: $25/월 (8GB DB, 100GB 파일 저장)

**설치:**
```bash
npm install @supabase/supabase-js
```

### 옵션 3: PlanetScale (무료 추천 ⭐️⭐️⭐️)

**장점:**
- MySQL 기반
- 무료 티어 관대 (5GB 스토리지, 10억 row reads/월)
- 브랜치 기능 (Git처럼 DB 버전 관리)

**가격:**
- Hobby: $0 (5GB 스토리지, 1억 row reads/월)
- Scaler: $39/월 (10GB, 100억 row reads)

**설치:**
```bash
npm install @planetscale/database
```

## 🚀 추천: Vercel Postgres 마이그레이션

### 1단계: Vercel Postgres 설정

1. **Vercel 대시보드에서 설정**
   ```
   프로젝트 선택 → Storage → Create Database → Postgres
   ```

2. **환경 변수 자동 설정**
   ```
   POSTGRES_URL
   POSTGRES_PRISMA_URL
   POSTGRES_URL_NON_POOLING
   ```

### 2단계: 프로젝트 설정

**필요한 패키지 설치:**
```bash
npm install @vercel/postgres
npm install -D prisma
npm install @prisma/client
```

**Prisma 초기화:**
```bash
npx prisma init
```

### 3단계: 스키마 정의

**`prisma/schema.prisma` 작성:**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("POSTGRES_PRISMA_URL")
}

model Brand {
  id                String         @id @default(cuid())
  name              String         @unique
  manufacturer      String
  overall_rating    Float          @default(0)
  established_year  Int
  country           String
  image             String?
  product_lines     String[]
  certifications    String[]
  created_at        DateTime       @default(now())
  updated_at        DateTime       @updatedAt
  
  recall_history    RecallHistory[]
  products          Product[]
  
  @@index([name])
}

model RecallHistory {
  id        String   @id @default(cuid())
  brand_id  String
  brand     Brand    @relation(fields: [brand_id], references: [id], onDelete: Cascade)
  date      DateTime
  reason    String
  severity  String   // 'low' | 'medium' | 'high'
  resolved  Boolean  @default(false)
  
  @@index([brand_id])
}

model Product {
  id          String   @id @default(cuid())
  brand_id    String
  brand       Brand    @relation(fields: [brand_id], references: [id], onDelete: Cascade)
  name        String
  image       String
  description String   @db.Text
  created_at  DateTime @default(now())
  updated_at  DateTime @updatedAt
  
  @@index([brand_id])
  @@index([name])
}

model User {
  id         String   @id @default(cuid())
  email      String   @unique
  name       String
  role       String   @default("user") // 'user' | 'admin'
  created_at DateTime @default(now())
  updated_at DateTime @updatedAt
  
  @@index([email])
}
```

### 4단계: 데이터베이스 마이그레이션

**마이그레이션 생성:**
```bash
npx prisma migrate dev --name init
```

**기존 JSON 데이터 마이그레이션:**
```bash
node scripts/migrate-json-to-db.js
```

### 5단계: API 라우트 업데이트

**새로운 `app/api/brands/route.ts`:**
```typescript
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export const dynamic = 'force-dynamic'

// GET - 브랜드 목록 조회
export async function GET() {
  try {
    const brands = await prisma.brand.findMany({
      include: {
        recall_history: true,
        products: true
      },
      orderBy: {
        name: 'asc'
      }
    })
    
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
    const data = await request.json()
    
    const brand = await prisma.brand.create({
      data: {
        name: data.name,
        manufacturer: data.manufacturer,
        overall_rating: data.overall_rating || 0,
        established_year: data.established_year,
        country: data.country,
        image: data.image,
        product_lines: data.product_lines || [],
        certifications: data.certifications || [],
        recall_history: {
          create: data.recall_history || []
        }
      },
      include: {
        recall_history: true
      }
    })
    
    return NextResponse.json(brand, { status: 201 })
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
    const data = await request.json()
    
    const brand = await prisma.brand.update({
      where: { id: data.id },
      data: {
        name: data.name,
        manufacturer: data.manufacturer,
        overall_rating: data.overall_rating,
        established_year: data.established_year,
        country: data.country,
        image: data.image,
        product_lines: data.product_lines,
        certifications: data.certifications
      },
      include: {
        recall_history: true
      }
    })
    
    return NextResponse.json(brand)
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
    
    await prisma.brand.delete({
      where: { id: brandId }
    })
    
    return NextResponse.json({ message: 'Brand deleted successfully' })
  } catch (error) {
    console.error('Failed to delete brand:', error)
    return NextResponse.json(
      { error: 'Failed to delete brand' },
      { status: 500 }
    )
  }
}
```

## 📦 마이그레이션 스크립트

**`scripts/migrate-json-to-db.js` 작성:**
```javascript
const { PrismaClient } = require('@prisma/client')
const brandsData = require('../data/brands.json')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting migration...')
  
  for (const brand of brandsData) {
    try {
      await prisma.brand.create({
        data: {
          name: brand.name,
          manufacturer: brand.manufacturer,
          overall_rating: brand.overall_rating,
          established_year: brand.established_year,
          country: brand.country,
          image: brand.image,
          product_lines: brand.product_lines,
          certifications: brand.certifications,
          recall_history: {
            create: brand.recall_history.map(recall => ({
              date: new Date(recall.date),
              reason: recall.reason,
              severity: recall.severity,
              resolved: recall.resolved
            }))
          }
        }
      })
      console.log(`✓ Migrated: ${brand.name}`)
    } catch (error) {
      console.error(`✗ Failed to migrate ${brand.name}:`, error.message)
    }
  }
  
  console.log('Migration completed!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
```

## 🧪 테스트

**로컬 테스트:**
```bash
# 1. 마이그레이션 실행
npx prisma migrate dev

# 2. 데이터 마이그레이션
node scripts/migrate-json-to-db.js

# 3. Prisma Studio로 확인
npx prisma studio

# 4. 개발 서버 실행
npm run dev
```

## 📊 비용 비교

| 옵션 | 무료 티어 | 유료 시작 가격 | 추천 용도 |
|------|----------|--------------|----------|
| Vercel Postgres | 60시간/월 | $20/월 | Vercel 사용 시 최적 |
| Supabase | 500MB DB | $25/월 | 완전 무료로 시작 |
| PlanetScale | 5GB | $39/월 | 대규모 트래픽 |

## ⚠️ 주의사항

1. **백업 설정**
   - 프로덕션 배포 전 자동 백업 활성화
   - 정기적인 수동 백업 권장

2. **환경 변수**
   - `.env.local`은 절대 Git에 커밋하지 않기
   - Vercel에서 환경 변수 설정 필수

3. **마이그레이션 테스트**
   - 로컬에서 충분히 테스트 후 프로덕션 적용
   - 롤백 계획 수립

## 🎯 마이그레이션 체크리스트

- [ ] 데이터베이스 선택 및 생성
- [ ] 환경 변수 설정
- [ ] Prisma 설치 및 스키마 작성
- [ ] 마이그레이션 실행
- [ ] JSON 데이터 마이그레이션
- [ ] API 라우트 업데이트
- [ ] 로컬 테스트 완료
- [ ] 프로덕션 배포
- [ ] 백업 설정 확인

---

**작성일**: 2024년 10월
**최종 수정**: 2024년 10월

