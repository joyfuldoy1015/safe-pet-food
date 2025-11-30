# SAFI 실제 데이터 연결 가이드

## 📋 현재 상황 분석

### Mock Data 사용 위치
1. **브랜드 목록 페이지** (`app/brands/page.tsx`)
   - `mockReviewLogs`를 사용하여 브랜드별 SAFI 점수 계산

2. **브랜드 상세 페이지** (`app/brands/[brandName]/page.tsx`)
   - `mockReviewLogs`를 사용하여 브랜드별 SAFI 점수 계산

3. **기타 페이지들**
   - `app/pet-log/page.tsx` - 펫 로그 목록
   - `app/page.tsx` - 홈페이지 커뮤니티 피드
   - `app/explore/page.tsx` - 탐색 페이지
   - `app/owners/[ownerId]/pets/[petId]/page.tsx` - 펫 상세 페이지

### 데이터베이스 현황
- ✅ `review_logs` 테이블 존재
- ❌ `review_logs` 테이블에 SAFI 관련 필드 없음
- ✅ `brands` 테이블 존재
- ❓ `products` 테이블 존재 여부 확인 필요

## 🔧 필요한 작업

### 1. 데이터베이스 스키마 확장

#### 1.1 review_logs 테이블에 SAFI 필드 추가

```sql
-- SAFI 관련 컬럼 추가
ALTER TABLE review_logs
ADD COLUMN IF NOT EXISTS stool_score INTEGER CHECK (stool_score >= 1 AND stool_score <= 5),
ADD COLUMN IF NOT EXISTS allergy_symptoms TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS vomiting BOOLEAN,
ADD COLUMN IF NOT EXISTS appetite_change TEXT CHECK (appetite_change IN ('INCREASED', 'NORMAL', 'DECREASED', 'REFUSED'));

-- SAFI 계산 결과 저장 컬럼 (선택사항 - 계산된 점수를 저장)
ALTER TABLE review_logs
ADD COLUMN IF NOT EXISTS safi_score NUMERIC(5,2) CHECK (safi_score >= 0 AND safi_score <= 100),
ADD COLUMN IF NOT EXISTS safi_level TEXT CHECK (safi_level IN ('SAFE', 'NORMAL', 'CAUTION')),
ADD COLUMN IF NOT EXISTS safi_detail JSONB;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_review_logs_safi_score ON review_logs(safi_score DESC);
CREATE INDEX IF NOT EXISTS idx_review_logs_safi_level ON review_logs(safi_level);
CREATE INDEX IF NOT EXISTS idx_review_logs_brand_product ON review_logs(brand, product);
```

#### 1.2 products 테이블 확인 및 생성 (필요시)

현재 `brands` 테이블에는 `product_lines`만 있고 실제 제품 정보가 없습니다.
제품 원재료 정보를 가져오기 위해 다음 중 하나를 선택:

**옵션 A: products 테이블 생성 (권장)**
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
  ingredients TEXT[] DEFAULT '{}',  -- SAFI 계산에 필요
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

**옵션 B: brands 테이블에 products JSONB 필드 추가**
```sql
ALTER TABLE brands
ADD COLUMN IF NOT EXISTS products JSONB DEFAULT '[]';
```

### 2. API 엔드포인트 생성

#### 2.1 브랜드별 리뷰 로그 조회 API

**파일**: `app/api/brands/[brandName]/reviews/route.ts`

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
      .eq('admin_status', 'visible')  // 또는 IS NULL
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching reviews:', error)
      return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
    }

    return NextResponse.json(data || [])
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

#### 2.2 SAFI 평가 데이터 저장 API

**파일**: `app/api/review-logs/[logId]/safi/route.ts`

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

    // 리뷰 로그 업데이트
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
      return NextResponse.json({ error: 'Failed to update review log' }, { status: 500 })
    }

    // SAFI 점수 계산을 위한 데이터 수집
    // 1. 같은 브랜드+제품의 모든 리뷰 가져오기
    const { data: brandReviews } = await supabase
      .from('review_logs')
      .select('stool_score, allergy_symptoms, vomiting, appetite_change')
      .eq('brand', reviewLog.brand)
      .eq('product', reviewLog.product)
      .eq('admin_status', 'visible')

    // 2. 브랜드 리콜 이력 가져오기
    const { data: brand } = await supabase
      .from('brands')
      .select('recall_history')
      .eq('name', reviewLog.brand)
      .single()

    // 3. 제품 원재료 정보 가져오기
    const { data: products } = await supabase
      .from('products')
      .select('ingredients')
      .eq('brand_id', brand?.id)
      .eq('name', reviewLog.product)

    // SAFI 점수 계산
    const safiResult = calculateSafiScore({
      reviews: brandReviews || [],
      recallHistory: brand?.recall_history || [],
      ingredients: products?.[0]?.ingredients || []
    })

    // SAFI 점수 저장
    const { error: safiError } = await supabase
      .from('review_logs')
      .update({
        safi_score: safiResult.overallScore,
        safi_level: safiResult.level,
        safi_detail: safiResult.detail
      })
      .eq('id', logId)

    if (safiError) {
      console.error('Error saving SAFI score:', safiError)
    }

    return NextResponse.json({ success: true, safiResult })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

#### 2.3 브랜드별 평균 SAFI 점수 조회 API

**파일**: `app/api/brands/[brandName]/safi/route.ts`

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

    // 브랜드의 모든 리뷰 가져오기
    const { data: reviews } = await supabase
      .from('review_logs')
      .select('stool_score, allergy_symptoms, vomiting, appetite_change, product')
      .eq('brand', brandName)
      .eq('admin_status', 'visible')

    // 브랜드 정보 가져오기
    const { data: brand } = await supabase
      .from('brands')
      .select('id, recall_history')
      .eq('name', brandName)
      .single()

    // 제품들의 원재료 정보 가져오기
    const { data: products } = await supabase
      .from('products')
      .select('ingredients')
      .eq('brand_id', brand?.id)

    // 모든 제품의 원재료 합치기
    const allIngredients = products?.flatMap(p => p.ingredients || []) || []

    // SAFI 점수 계산
    const safiReviews = (reviews || []).map(r => ({
      stoolScore: r.stool_score,
      allergySymptoms: r.allergy_symptoms,
      vomiting: r.vomiting,
      appetiteChange: r.appetite_change
    }))

    const safiResult = calculateSafiScore({
      reviews: safiReviews,
      recallHistory: brand?.recall_history || [],
      ingredients: allIngredients
    })

    return NextResponse.json(safiResult)
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
```

### 3. 프론트엔드 코드 수정

#### 3.1 브랜드 목록 페이지 (`app/brands/page.tsx`)

```typescript
// 변경 전
import { mockReviewLogs } from '@/lib/mock/review-log'

const brandsWithSafi = useMemo(() => {
  return brands.map(brand => {
    const brandReviews = mockReviewLogs.filter(review => review.brand === brand.name)
    // ...
  })
}, [brands])

// 변경 후
const [brandsWithSafi, setBrandsWithSafi] = useState<Brand[]>([])

useEffect(() => {
  const fetchSafiScores = async () => {
    const safiPromises = brands.map(async (brand) => {
      try {
        const response = await fetch(`/api/brands/${encodeURIComponent(brand.name)}/safi`)
        if (response.ok) {
          const safiResult = await response.json()
          return { ...brand, safiScore: safiResult }
        }
      } catch (error) {
        console.error(`Failed to fetch SAFI for ${brand.name}:`, error)
      }
      return { ...brand, safiScore: null }
    })
    
    const results = await Promise.all(safiPromises)
    setBrandsWithSafi(results)
  }

  if (brands.length > 0) {
    fetchSafiScores()
  }
}, [brands])
```

#### 3.2 브랜드 상세 페이지 (`app/brands/[brandName]/page.tsx`)

```typescript
// 변경 전
const calculateSafiForBrand = () => {
  if (!brand) return
  const brandReviews = mockReviewLogs.filter(review => review.brand === brand.name)
  // ...
}

// 변경 후
const calculateSafiForBrand = async () => {
  if (!brand) return

  try {
    const response = await fetch(`/api/brands/${encodeURIComponent(brand.name)}/safi`)
    if (response.ok) {
      const safiResult = await response.json()
      setSafiScore(safiResult)
    }
  } catch (error) {
    console.error('Failed to calculate SAFI score:', error)
  }
}
```

#### 3.3 SAFI 평가 다이얼로그 (`components/safi/SafiEvaluationDialog.tsx`)

```typescript
// handleSubmit 함수 수정
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  
  if (!user) {
    setError('로그인이 필요합니다.')
    return
  }

  setError(null)
  setIsLoading(true)

  try {
    // 1. 리뷰 로그 생성 또는 업데이트
    // (기존 로그가 있으면 업데이트, 없으면 생성)
    
    // 2. SAFI 평가 데이터 저장
    const response = await fetch(`/api/review-logs/${logId}/safi`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        stool_score: formData.stoolScore,
        allergy_symptoms: formData.allergySymptoms,
        vomiting: formData.vomiting,
        appetite_change: formData.appetiteChange
      })
    })

    if (!response.ok) {
      throw new Error('평가 등록에 실패했습니다.')
    }

    if (onSuccess) {
      onSuccess()
    }
    
    handleClose()
    alert('SAFI 평가가 등록되었습니다. 감사합니다!')
  } catch (err) {
    console.error('SAFI 평가 등록 오류:', err)
    setError('평가 등록에 실패했습니다. 다시 시도해주세요.')
  } finally {
    setIsLoading(false)
  }
}
```

### 4. TypeScript 타입 업데이트

#### 4.1 `lib/types/database.ts` 업데이트

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

## 📝 작업 순서

1. **데이터베이스 마이그레이션**
   - [ ] `review_logs` 테이블에 SAFI 필드 추가
   - [ ] `products` 테이블 생성 또는 확인
   - [ ] 인덱스 생성

2. **API 엔드포인트 생성**
   - [ ] `/api/brands/[brandName]/reviews` - 브랜드별 리뷰 조회
   - [ ] `/api/brands/[brandName]/safi` - 브랜드별 SAFI 점수 계산
   - [ ] `/api/review-logs/[logId]/safi` - SAFI 평가 저장

3. **프론트엔드 수정**
   - [ ] `app/brands/page.tsx` - mockReviewLogs 제거
   - [ ] `app/brands/[brandName]/page.tsx` - mockReviewLogs 제거
   - [ ] `components/safi/SafiEvaluationDialog.tsx` - 실제 API 호출

4. **타입 정의 업데이트**
   - [ ] `lib/types/database.ts` - SAFI 필드 추가

5. **테스트**
   - [ ] 브랜드 목록에서 SAFI 점수 표시 확인
   - [ ] 브랜드 상세에서 SAFI 점수 계산 확인
   - [ ] SAFI 평가 저장 기능 확인

## ⚠️ 주의사항

1. **기존 데이터 마이그레이션**: 기존 `review_logs` 데이터가 있다면 SAFI 필드는 NULL로 시작
2. **RLS 정책**: `review_logs` 테이블의 RLS 정책이 SAFI 필드에도 적용되는지 확인
3. **성능 최적화**: 브랜드별 SAFI 점수 계산은 캐싱 고려 (예: Redis 또는 Supabase Edge Functions)
4. **에러 핸들링**: API 호출 실패 시 fallback 로직 구현

## 🔄 점진적 마이그레이션 전략

1. **1단계**: 데이터베이스 스키마 확장 (기존 기능 유지)
2. **2단계**: API 엔드포인트 생성 및 테스트
3. **3단계**: 프론트엔드에서 mock data와 실제 데이터 병행 사용
4. **4단계**: mock data 제거 및 실제 데이터만 사용

