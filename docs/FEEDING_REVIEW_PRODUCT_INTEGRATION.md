# 급여 후기 - 제품 평가 연동 시스템

## 개요
급여 후기 작성 시 제품 평가가 자동으로 연동되어, 제품 상세 페이지에 실시간 반영되는 시스템

## 데이터 구조

### 1. review_logs 테이블 확장

```sql
-- 기존 컬럼
pet_id UUID REFERENCES pets(id)
brand TEXT
product TEXT  -- 기존: 단순 텍스트
category TEXT
status TEXT

-- 🆕 추가 컬럼
product_id TEXT  -- 제품 ID (예: 'product-royal-canin-adult')

-- 🆕 세부 평가 점수 (1-5)
palatability_score INTEGER  -- 기호성
digestibility_score INTEGER  -- 소화력
coat_quality_score INTEGER  -- 털 상태
stool_quality_score INTEGER  -- 변 상태

rating INTEGER  -- 기존: 전체 만족도 (1-5)
recommend BOOLEAN  -- 기존: 추천 여부

-- 텍스트
excerpt TEXT  -- 간단한 요약
notes TEXT  -- 상세 후기

-- 🆕 도움됨 카운트
helpful_count INTEGER DEFAULT 0
```

### 2. 제품 상세 페이지 실시간 집계

```typescript
// lib/services/products.ts

export async function getProductReviews(productId: string) {
  const { data: reviews } = await supabase
    .from('review_logs')
    .select(`
      *,
      pet:pets(name, species, breed),
      user:profiles(name, avatar)
    `)
    .eq('product_id', productId)
    .order('created_at', { ascending: false })

  return reviews
}

export function aggregateProductRatings(reviews: ReviewLog[]) {
  if (!reviews.length) return null
  
  return {
    palatability: avg(reviews.map(r => r.palatability_score)),
    digestibility: avg(reviews.map(r => r.digestibility_score)),
    coat_quality: avg(reviews.map(r => r.coat_quality_score)),
    stool_quality: avg(reviews.map(r => r.stool_quality_score)),
    overall_satisfaction: avg(reviews.map(r => r.rating))
  }
}

export function aggregateCommunityFeedback(reviews: ReviewLog[]) {
  const recommendYes = reviews.filter(r => r.recommend === true).length
  const recommendNo = reviews.filter(r => r.recommend === false).length
  
  return {
    recommend_yes: recommendYes,
    recommend_no: recommendNo,
    total_votes: reviews.length
  }
}
```

## UI/UX 개선

### 1. 급여 후기 작성 폼 개선

**브랜드 선택 → 제품 선택 2단계:**

```typescript
// Step 1: 브랜드 선택
<select onChange={(e) => loadProducts(e.target.value)}>
  <option value="">브랜드 선택</option>
  <option value="로얄캐닌">로얄캐닌</option>
  <option value="오리젠">오리젠</option>
</select>

// Step 2: 제품 선택 (브랜드 선택 후 활성화)
<select disabled={!selectedBrand}>
  <option value="">제품 선택</option>
  {products.map(p => (
    <option value={p.id} key={p.id}>
      {p.name}
    </option>
  ))}
</select>
```

**세부 평가 항목:**

```typescript
// 기존: rating 하나만
<StarRating value={rating} onChange={setRating} />

// 개선: 4개 세부 항목 + 전체
<div className="space-y-4">
  <RatingItem label="기호성" value={palatability} onChange={setPalatability} />
  <RatingItem label="소화력" value={digestibility} onChange={setDigestibility} />
  <RatingItem label="털 상태" value={coatQuality} onChange={setCoatQuality} />
  <RatingItem label="변 상태" value={stoolQuality} onChange={setStoolQuality} />
  
  <div className="pt-4 border-t">
    <RatingItem label="전체 만족도" value={rating} onChange={setRating} size="lg" />
  </div>
</div>
```

### 2. 제품 상세 페이지 실시간 표시

```typescript
// app/products/[productId]/page.tsx

export default async function ProductDetailPage({ params }) {
  const product = await getProductById(params.productId)
  const reviews = await getProductReviews(params.productId)
  
  // 실시간 집계
  const consumerRatings = aggregateProductRatings(reviews)
  const communityFeedback = aggregateCommunityFeedback(reviews)
  
  return (
    <div>
      {/* 소비자 평가 (실시간) */}
      <ConsumerRatings ratings={consumerRatings} />
      
      {/* 추천/비추천 (실시간) */}
      <CommunityFeedback feedback={communityFeedback} />
      
      {/* 리뷰 목록 (실시간) */}
      <ReviewList reviews={reviews} />
    </div>
  )
}
```

## 데이터 흐름

```
┌─────────────────────────────────────────────────────────┐
│                  급여 후기 작성                           │
│  /pet-log/posts/write 또는 /profile                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│              review_logs 테이블에 저장                    │
│  - product_id ✅                                         │
│  - palatability_score, digestibility_score ✅            │
│  - rating, recommend ✅                                  │
│  - excerpt, notes ✅                                     │
└────────────────┬────────────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────────────┐
│           제품 상세 페이지 자동 반영                        │
│  /products/[productId]                                  │
│                                                         │
│  1. 소비자 평가 (평균 계산)                               │
│     - 기호성: 4.5/5.0                                    │
│     - 소화력: 4.3/5.0                                    │
│     - 털 상태: 4.2/5.0                                   │
│     - 변 상태: 4.4/5.0                                   │
│                                                         │
│  2. 추천/비추천 (집계)                                    │
│     👍 842 | 👎 158 (추천률 84%)                         │
│                                                         │
│  3. 리뷰 목록 (최신순)                                    │
│     - "우리 강아지가 잘 먹어요!" ⭐⭐⭐⭐⭐                  │
│     - "소화도 잘 되고 변 상태 좋아요!" ⭐⭐⭐⭐              │
└─────────────────────────────────────────────────────────┘
```

## 구현 우선순위

### Phase 1: 데이터 구조 (필수)
- [ ] `review_logs` 테이블에 `product_id` 컬럼 추가
- [ ] `palatability_score`, `digestibility_score`, `coat_quality_score`, `stool_quality_score` 컬럼 추가
- [ ] `helpful_count` 컬럼 추가

### Phase 2: 급여 후기 폼 개선
- [ ] 브랜드 선택 → 제품 목록 로드 UI
- [ ] 세부 평가 항목 (4개) 추가
- [ ] 제품 선택 시 product_id 저장

### Phase 3: 제품 상세 페이지 연동
- [ ] `getProductReviews(productId)` 함수 구현
- [ ] `aggregateProductRatings()` 함수 구현
- [ ] `aggregateCommunityFeedback()` 함수 구현
- [ ] 실시간 데이터로 UI 렌더링

### Phase 4: 추가 기능
- [ ] 리뷰 도움됨 기능
- [ ] 리뷰 정렬/필터 (최신순/평점순/반려동물 종류별)
- [ ] 내 리뷰 수정/삭제

## 장점

1. **중복 작성 제거**: 한 번 작성으로 급여 후기 + 제품 평가 완료
2. **실제 사용 기반**: Mock 데이터 아닌 실제 반려동물 급여 경험
3. **데이터 일관성**: 단일 소스에서 모든 평가 데이터 관리
4. **신뢰도 향상**: 반려동물 정보 + 급여 기간 포함된 후기
5. **UX 개선**: 사용자는 자연스럽게 급여 후기 작성
6. **확장 가능**: 나중에 제품별 통계, 반려동물 특성별 추천 가능

## 예상 결과

```
급여 후기 100개 작성
  ↓
제품 A: 45개 리뷰 (자동 집계)
  - 평균 평점: 4.5
  - 추천률: 89%
  - 기호성: 4.6
  - 소화력: 4.4

제품 B: 30개 리뷰 (자동 집계)
  - 평균 평점: 3.8
  - 추천률: 67%
  - 기호성: 4.0
  - 소화력: 3.5

제품 C: 25개 리뷰 (자동 집계)
  - 평균 평점: 4.8
  - 추천률: 96%
  - 기호성: 4.9
  - 소화력: 4.7
```

→ 실시간 데이터 기반 제품 비교 및 추천 시스템 구축 가능
