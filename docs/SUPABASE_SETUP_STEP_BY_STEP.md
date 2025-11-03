# Supabase 설정 단계별 가이드

## ✅ 현재 상태
- Supabase 프로젝트 생성 완료 (`safe-pet-food`)

## 📋 다음 단계

### 1단계: 환경 변수 확인 및 설정 (2분)

#### Supabase에서 API 키 가져오기

1. **Supabase 대시보드 접속**
   - https://supabase.com/dashboard
   - `safe-pet-food` 프로젝트 선택

2. **Settings → API 클릭**
   - `Project URL` 복사 → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` 키 복사 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **로컬 환경 변수 설정**

프로젝트 루트에 `.env.local` 파일 생성 또는 수정:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

4. **Vercel 환경 변수 설정**

Vercel 대시보드에서:
- 프로젝트 선택
- **Settings** → **Environment Variables**
- 위 두 변수 추가

### 2단계: 데이터베이스 스키마 생성 (5분)

1. **Supabase 대시보드 → SQL Editor 클릭**

2. **아래 SQL 스크립트 복사하여 실행**

`scripts/supabase-schema.sql` 파일 내용을 복사하거나, 다음 단계를 따르세요:

- **새 쿼리** 버튼 클릭
- `scripts/supabase-schema.sql` 파일 열기
- 전체 내용 복사하여 붙여넣기
- **Run** 버튼 클릭

3. **테이블 생성 확인**

**Table Editor**에서 다음 테이블들이 생성되었는지 확인:
- ✅ `brands`
- ✅ `pet_log_posts`
- ✅ `pet_log_feeding_records`
- ✅ `pet_log_comments`
- ✅ `feed_grade_analyses`
- ✅ `health_analyses`
- ✅ `pet_profiles`

### 3단계: 기존 JSON 데이터 마이그레이션 (5분)

#### Brands 데이터 마이그레이션

1. **필요한 패키지 설치**
```bash
npm install tsx --save-dev
```

2. **마이그레이션 스크립트 실행**
```bash
npx tsx scripts/migrate-brands-to-supabase.ts
```

또는 직접 실행:
```bash
node --loader tsx scripts/migrate-brands-to-supabase.ts
```

3. **결과 확인**

- Supabase 대시보드 → **Table Editor** → **brands** 테이블 확인
- 데이터가 제대로 들어갔는지 확인

### 4단계: API 라우트 업데이트 (각 기능별로 진행)

이제 API 라우트를 Supabase를 사용하도록 업데이트합니다.

먼저 Brands API부터 시작하는 것을 추천합니다.

#### Brands API 업데이트 예시

**`app/api/brands/route.ts` 수정:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export const dynamic = 'force-dynamic'

// GET - 브랜드 목록 조회
export async function GET() {
  try {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('overall_rating', { ascending: false })

    if (error) throw error

    return NextResponse.json(data || [])
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
    
    const { data: brand, error } = await supabase
      .from('brands')
      .insert([data])
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(brand, { status: 201 })
  } catch (error) {
    console.error('Failed to create brand:', error)
    return NextResponse.json(
      { error: 'Failed to create brand' },
      { status: 500 }
    )
  }
}
```

### 5단계: 테스트

1. **로컬 개발 서버 실행**
```bash
npm run dev
```

2. **API 테스트**
- 브라우저에서 `http://localhost:3000/api/brands` 접속
- 데이터가 제대로 반환되는지 확인

3. **프론트엔드 테스트**
- `/brands` 페이지 접속
- 브랜드 목록이 제대로 표시되는지 확인

## 🎯 마이그레이션 순서 추천

1. **Phase 1: Brands** (가장 먼저)
   - ✅ 스키마 생성 완료
   - ✅ 데이터 마이그레이션 완료
   - ⏳ API 업데이트 필요

2. **Phase 2: Pet Logs** (다음)
   - ⏳ 스키마 생성 완료 (위에서 생성됨)
   - ⏳ API 생성 필요
   - ⏳ 프론트엔드 업데이트 필요

3. **Phase 3: Feed Grade Analysis** (그 다음)
   - ⏳ 스키마 생성 완료 (위에서 생성됨)
   - ⏳ API 생성 필요

4. **Phase 4: Health Analysis** (마지막)
   - ⏳ 스키마 생성 완료 (위에서 생성됨)
   - ⏳ API 생성 필요

## 📝 체크리스트

- [ ] 환경 변수 설정 완료 (로컬 & Vercel)
- [ ] 데이터베이스 스키마 생성 완료
- [ ] Brands 데이터 마이그레이션 완료
- [ ] Brands API 업데이트 완료
- [ ] Brands 프론트엔드 테스트 완료
- [ ] Pet Logs API 생성 완료
- [ ] Feed Grade Analysis API 생성 완료
- [ ] Health Analysis API 생성 완료
- [ ] 프로덕션 배포 및 테스트 완료

## ⚠️ 주의사항

1. **환경 변수 보안**: `.env.local`은 절대 Git에 커밋하지 않기
2. **점진적 전환**: 한 번에 모두 전환하지 말고 단계별로 진행
3. **백업**: 마이그레이션 전 기존 데이터 백업 권장
4. **에러 핸들링**: 모든 API 호출에 에러 처리 필수

## 🔗 관련 파일

- `scripts/supabase-schema.sql` - 데이터베이스 스키마
- `scripts/migrate-brands-to-supabase.ts` - Brands 마이그레이션 스크립트
- `lib/supabase.ts` - Supabase 클라이언트 설정
- `docs/MOCK_TO_REAL_DATA_MIGRATION.md` - 전체 마이그레이션 가이드

