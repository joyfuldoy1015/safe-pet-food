# SAFI 실제 데이터 연결 - 단계별 작업 가이드

## 🎯 전체 작업 순서

### Phase 1: 데이터베이스 준비 (가장 먼저!)
### Phase 2: API 엔드포인트 생성
### Phase 3: 관리자 페이지 업데이트
### Phase 4: 프론트엔드 수정
### Phase 5: 테스트 및 검증

---

## 📋 Phase 1: 데이터베이스 준비 (1단계 - 필수)

### 1.1 review_logs 테이블에 SAFI 필드 추가

**파일 생성**: `scripts/supabase-safi-fields-migration.sql`

```sql
-- ============================================
-- SAFI 필드 추가 마이그레이션
-- ============================================

-- 1. SAFI 입력 필드 추가
ALTER TABLE review_logs
ADD COLUMN IF NOT EXISTS stool_score INTEGER CHECK (stool_score >= 1 AND stool_score <= 5),
ADD COLUMN IF NOT EXISTS allergy_symptoms TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS vomiting BOOLEAN,
ADD COLUMN IF NOT EXISTS appetite_change TEXT CHECK (appetite_change IN ('INCREASED', 'NORMAL', 'DECREASED', 'REFUSED'));

-- 2. SAFI 계산 결과 필드 추가 (선택사항 - 계산된 점수 저장)
ALTER TABLE review_logs
ADD COLUMN IF NOT EXISTS safi_score NUMERIC(5,2) CHECK (safi_score >= 0 AND safi_score <= 100),
ADD COLUMN IF NOT EXISTS safi_level TEXT CHECK (safi_level IN ('SAFE', 'NORMAL', 'CAUTION')),
ADD COLUMN IF NOT EXISTS safi_detail JSONB;

-- 3. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_review_logs_safi_score ON review_logs(safi_score DESC);
CREATE INDEX IF NOT EXISTS idx_review_logs_safi_level ON review_logs(safi_level);
CREATE INDEX IF NOT EXISTS idx_review_logs_brand_product ON review_logs(brand, product);

-- 4. 기존 데이터 확인 (NULL로 시작하는 것이 정상)
SELECT 
  COUNT(*) as total_logs,
  COUNT(stool_score) as logs_with_stool_score,
  COUNT(allergy_symptoms) as logs_with_allergy_symptoms,
  COUNT(vomiting) as logs_with_vomiting,
  COUNT(appetite_change) as logs_with_appetite_change
FROM review_logs;
```

**실행 방법**:
1. Supabase 대시보드 → SQL Editor
2. 위 SQL 스크립트 복사/붙여넣기
3. 실행

**확인 사항**:
- ✅ 컬럼이 정상적으로 추가되었는지 확인
- ✅ 기존 데이터는 NULL로 유지되는지 확인
- ✅ 인덱스가 생성되었는지 확인

### 1.2 products 테이블 확인 또는 생성

**옵션 A: products 테이블이 이미 있는 경우**
```sql
-- 테이블 존재 확인
SELECT EXISTS (
  SELECT FROM information_schema.tables 
  WHERE table_schema = 'public' 
  AND table_name = 'products'
);

-- ingredients 컬럼 확인
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'products' AND column_name = 'ingredients';
```

**옵션 B: products 테이블 생성 (없는 경우)**
```sql
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('feed', 'snack', 'supplement', 'toilet')),
  image TEXT,
  description TEXT,
  certifications TEXT[] DEFAULT '{}',
  origin_info JSONB,
  ingredients TEXT[] DEFAULT '{}',  -- SAFI 계산에 필수!
  guaranteed_analysis JSONB,
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);
```

---

## 📋 Phase 2: API 엔드포인트 생성 (2단계)

### 2.1 브랜드별 리뷰 조회 API

**파일 생성**: `app/api/brands/[brandName]/reviews/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(
  request: NextRequest,
  { params }: { params: { brandName: string } }
) {
  try {
    const brandName = decodeURIComponent(params.brandName)
    
    const { data, error } = await supabase
      .from('review_logs')
      .select(`
        id,
        brand,
        product,
        stool_score,
        allergy_symptoms,
        vomiting,
        appetite_change,
        safi_score,
        safi_level,
        safi_detail
      `)
      .eq('brand', brandName)
      .or('admin_status.eq.visible,admin_status.is.null')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('[GET /api/brands/[brandName]/reviews] Error:', error)
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('[GET /api/brands/[brandName]/reviews] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 2.2 브랜드별 SAFI 점수 계산 API

**파일 생성**: `app/api/brands/[brandName]/safi/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calculateSafiScore } from '@/lib/safi-calculator'

export async function GET(
  request: NextRequest,
  { params }: { params: { brandName: string } }
) {
  try {
    const brandName = decodeURIComponent(params.brandName)

    // 1. 브랜드의 모든 리뷰 가져오기
    const { data: reviews, error: reviewsError } = await supabase
      .from('review_logs')
      .select('stool_score, allergy_symptoms, vomiting, appetite_change, product')
      .eq('brand', brandName)
      .or('admin_status.eq.visible,admin_status.is.null')

    if (reviewsError) {
      console.error('[GET /api/brands/[brandName]/safi] Reviews error:', reviewsError)
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    // 2. 브랜드 정보 가져오기
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select('id, recall_history')
      .eq('name', brandName)
      .single()

    if (brandError) {
      console.error('[GET /api/brands/[brandName]/safi] Brand error:', brandError)
      // 브랜드가 없어도 리뷰만으로 계산 가능
    }

    // 3. 제품들의 원재료 정보 가져오기
    let allIngredients: string[] = []
    if (brand?.id) {
      const { data: products } = await supabase
        .from('products')
        .select('ingredients')
        .eq('brand_id', brand.id)
      
      allIngredients = products?.flatMap(p => p.ingredients || []) || []
    }

    // 4. SAFI 점수 계산을 위한 데이터 변환
    const safiReviews = (reviews || []).map(r => ({
      stoolScore: r.stool_score,
      allergySymptoms: r.allergy_symptoms || [],
      vomiting: r.vomiting,
      appetiteChange: r.appetite_change
    }))

    // 5. 리콜 이력 변환
    const recallHistory = (brand?.recall_history || []).map((recall: any) => ({
      date: recall.date,
      severity: (recall.severity === 'high' ? 'high' : 
                 recall.severity === 'medium' ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    }))

    // 6. SAFI 점수 계산
    const safiResult = calculateSafiScore({
      reviews: safiReviews,
      recallHistory,
      ingredients: allIngredients
    })

    return NextResponse.json(safiResult)
  } catch (error) {
    console.error('[GET /api/brands/[brandName]/safi] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 2.3 SAFI 평가 저장 API

**파일 생성**: `app/api/review-logs/[logId]/safi/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { calculateSafiScore } from '@/lib/safi-calculator'

export async function POST(
  request: NextRequest,
  { params }: { params: { logId: string } }
) {
  try {
    const logId = params.logId
    const body = await request.json()
    
    const { stool_score, allergy_symptoms, vomiting, appetite_change } = body

    // 1. 리뷰 로그 업데이트
    const { data: reviewLog, error: updateError } = await supabase
      .from('review_logs')
      .update({
        stool_score,
        allergy_symptoms: allergy_symptoms || [],
        vomiting,
        appetite_change
      })
      .eq('id', logId)
      .select()
      .single()

    if (updateError) {
      console.error('[POST /api/review-logs/[logId]/safi] Update error:', updateError)
      return NextResponse.json({ error: 'Failed to update review log' }, { status: 500 })
    }

    if (!reviewLog) {
      return NextResponse.json({ error: 'Review log not found' }, { status: 404 })
    }

    // 2. 같은 브랜드+제품의 모든 리뷰 가져오기 (SAFI 계산용)
    const { data: brandReviews } = await supabase
      .from('review_logs')
      .select('stool_score, allergy_symptoms, vomiting, appetite_change')
      .eq('brand', reviewLog.brand)
      .eq('product', reviewLog.product)
      .or('admin_status.eq.visible,admin_status.is.null')

    // 3. 브랜드 리콜 이력 가져오기
    const { data: brand } = await supabase
      .from('brands')
      .select('id, recall_history')
      .eq('name', reviewLog.brand)
      .single()

    // 4. 제품 원재료 정보 가져오기
    let allIngredients: string[] = []
    if (brand?.id) {
      const { data: products } = await supabase
        .from('products')
        .select('ingredients')
        .eq('brand_id', brand.id)
        .eq('name', reviewLog.product)
      
      allIngredients = products?.[0]?.ingredients || []
    }

    // 5. SAFI 점수 계산
    const safiReviews = (brandReviews || []).map(r => ({
      stoolScore: r.stool_score,
      allergySymptoms: r.allergy_symptoms || [],
      vomiting: r.vomiting,
      appetiteChange: r.appetite_change
    }))

    const recallHistory = (brand?.recall_history || []).map((recall: any) => ({
      date: recall.date,
      severity: (recall.severity === 'high' ? 'high' : 
                 recall.severity === 'medium' ? 'medium' : 'low') as 'high' | 'medium' | 'low'
    }))

    const safiResult = calculateSafiScore({
      reviews: safiReviews,
      recallHistory,
      ingredients: allIngredients
    })

    // 6. SAFI 점수 저장 (선택사항)
    const { error: safiError } = await supabase
      .from('review_logs')
      .update({
        safi_score: safiResult.overallScore,
        safi_level: safiResult.level,
        safi_detail: safiResult.detail
      })
      .eq('id', logId)

    if (safiError) {
      console.error('[POST /api/review-logs/[logId]/safi] SAFI save error:', safiError)
      // 에러가 나도 계산 결과는 반환
    }

    return NextResponse.json({ success: true, safiResult })
  } catch (error) {
    console.error('[POST /api/review-logs/[logId]/safi] Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

---

## 📋 Phase 3: 관리자 페이지 업데이트 (3단계)

### 3.1 관리자 로그 페이지에 SAFI 필드 추가

**파일 수정**: `app/admin/logs/page.tsx`

**추가할 내용**:

1. **인터페이스에 SAFI 필드 추가**:
```typescript
interface ReviewLog {
  // ... 기존 필드들 ...
  stool_score?: number | null
  allergy_symptoms?: string[] | null
  vomiting?: boolean | null
  appetite_change?: string | null
  safi_score?: number | null
  safi_level?: 'SAFE' | 'NORMAL' | 'CAUTION' | null
}
```

2. **컬럼에 SAFI 점수 추가**:
```typescript
const columns: Column<ReviewLog>[] = [
  // ... 기존 컬럼들 ...
  {
    key: 'safi_score',
    label: 'SAFI 점수',
    sortable: true,
    render: (log) => {
      if (!log.safi_score) return <span className="text-gray-400">-</span>
      
      const levelColors = {
        SAFE: 'bg-green-100 text-green-700 border-green-200',
        NORMAL: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        CAUTION: 'bg-red-100 text-red-800 border-red-200'
      }
      
      return (
        <div className="flex items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
            levelColors[log.safi_level || 'NORMAL']
          }`}>
            {log.safi_score.toFixed(1)} ({log.safi_level || 'NORMAL'})
          </span>
        </div>
      )
    }
  },
  {
    key: 'safi_details',
    label: 'SAFI 상세',
    render: (log) => {
      if (!log.stool_score && !log.vomiting && !log.appetite_change) {
        return <span className="text-gray-400 text-xs">미입력</span>
      }
      
      return (
        <div className="text-xs space-y-1">
          {log.stool_score && (
            <div>변 상태: {log.stool_score}점</div>
          )}
          {log.vomiting !== null && (
            <div>구토: {log.vomiting ? '있음' : '없음'}</div>
          )}
          {log.appetite_change && (
            <div>식욕: {
              log.appetite_change === 'INCREASED' ? '증가' :
              log.appetite_change === 'NORMAL' ? '정상' :
              log.appetite_change === 'DECREASED' ? '감소' : '거부'
            }</div>
          )}
          {log.allergy_symptoms && log.allergy_symptoms.length > 0 && (
            <div>알레르기: {log.allergy_symptoms.join(', ')}</div>
          )}
        </div>
      )
    }
  }
]
```

3. **필터에 SAFI 필터 추가** (선택사항):
```typescript
<select
  className="px-3 py-1 border border-gray-300 rounded-lg text-sm"
  value={filters.has_safi || ''}
  onChange={(e) => setFilters({ ...filters, has_safi: e.target.value })}
>
  <option value="">SAFI 평가 전체</option>
  <option value="yes">평가 있음</option>
  <option value="no">평가 없음</option>
</select>
```

### 3.2 관리자 API에 SAFI 필드 포함

**파일 수정**: `app/api/admin/logs/list/route.ts`

**수정할 내용**:
```typescript
// select 문에 SAFI 필드 추가
.select(`
  id,
  category,
  brand,
  product,
  status,
  period_start,
  period_end,
  duration_days,
  owner_id,
  admin_status,
  created_at,
  updated_at,
  stool_score,
  allergy_symptoms,
  vomiting,
  appetite_change,
  safi_score,
  safi_level,
  safi_detail
`)
```

---

## 📋 Phase 4: 프론트엔드 수정 (4단계)

### 4.1 브랜드 목록 페이지

**파일 수정**: `app/brands/page.tsx`

**변경 사항**:
- `mockReviewLogs` import 제거
- `useMemo`에서 mock 데이터 사용 제거
- API 호출로 변경

### 4.2 브랜드 상세 페이지

**파일 수정**: `app/brands/[brandName]/page.tsx`

**변경 사항**:
- `mockReviewLogs` import 제거
- `calculateSafiForBrand` 함수를 API 호출로 변경

### 4.3 SAFI 평가 다이얼로그

**파일 수정**: `components/safi/SafiEvaluationDialog.tsx`

**변경 사항**:
- `handleSubmit`에서 실제 API 호출 구현

---

## 📋 Phase 5: TypeScript 타입 업데이트

### 5.1 database.ts 업데이트

**파일 수정**: `lib/types/database.ts`

**추가할 내용**:
```typescript
review_logs: {
  Row: {
    // ... 기존 필드들 ...
    stool_score: number | null
    allergy_symptoms: string[] | null
    vomiting: boolean | null
    appetite_change: 'INCREASED' | 'NORMAL' | 'DECREASED' | 'REFUSED' | null
    safi_score: number | null
    safi_level: 'SAFE' | 'NORMAL' | 'CAUTION' | null
    safi_detail: Json | null
  }
  // Insert, Update도 동일하게 추가
}
```

---

## ✅ 체크리스트

### Phase 1: 데이터베이스
- [ ] `review_logs` 테이블에 SAFI 필드 추가
- [ ] 인덱스 생성
- [ ] `products` 테이블 확인/생성
- [ ] 마이그레이션 테스트

### Phase 2: API
- [ ] `/api/brands/[brandName]/reviews` 생성
- [ ] `/api/brands/[brandName]/safi` 생성
- [ ] `/api/review-logs/[logId]/safi` 생성
- [ ] API 테스트

### Phase 3: 관리자 페이지
- [ ] 관리자 로그 페이지에 SAFI 컬럼 추가
- [ ] 관리자 API에 SAFI 필드 포함
- [ ] 필터 기능 추가 (선택사항)

### Phase 4: 프론트엔드
- [ ] 브랜드 목록 페이지 수정
- [ ] 브랜드 상세 페이지 수정
- [ ] SAFI 평가 다이얼로그 수정

### Phase 5: 타입
- [ ] `database.ts` 타입 업데이트

---

## 🚀 시작하기

**가장 먼저 해야 할 것**:
1. ✅ Phase 1.1 실행 (데이터베이스 마이그레이션)
2. ✅ Phase 1.2 확인 (products 테이블)
3. ✅ Phase 2 API 엔드포인트 생성
4. ✅ Phase 3 관리자 페이지 업데이트
5. ✅ Phase 4 프론트엔드 수정

**각 단계를 완료한 후 다음 단계로 진행하세요!**

