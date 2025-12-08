# 투명성 점수(Transparency Score) 가이드

## 📋 현재 상태

### 투명성 점수가 어떻게 사용되는가?

브랜드 상세 페이지(`/brands/[brandName]`)에서 투명성 점수는 다음과 같이 표시됩니다:
- 점수 표시: `{brand.transparency_score}점` (예: 78점)
- 진행 바: 점수에 따른 색상 표시
- 등급 표시: "매우 투명" / "보통 투명" / "투명성 부족"
- 성분 공개 상태 분포: 완전 공개 / 부분 공개 / 미공개 비율

## 🔍 현재 구현 방식

### 1. 데이터 소스

**현재 투명성 점수는 하드코딩되어 있습니다:**

```typescript
// app/brands/[brandName]/page.tsx
transparency_score: apiData.transparency_score || 75,  // 기본값 75

// 하드코딩된 예시 (getBrandDataLegacy 함수 내)
{
  name: '로얄캐닌',
  transparency_score: 78,  // 하드코딩
  ...
}
{
  name: '힐스',
  transparency_score: 85,  // 하드코딩
  ...
}
```

### 2. Supabase 저장 여부

**현재 Supabase에 저장되지 않습니다:**
- `brands` 테이블 스키마에 `transparency_score` 컬럼이 없음
- API에서도 `transparency_score` 필드를 반환하지 않음
- 기본값 75점이 사용됨

### 3. 브랜드 목록 페이지의 투명성 점수

**다른 용도로 사용됨:**
- `app/brands/page.tsx`의 `getTransparencyScore()` 함수는 리콜 이력 기반으로 계산
- 5점 만점 시스템 (투명성 점수와는 별개)
- 리콜 횟수, 심각도, 미해결 여부에 따라 감점

## 💡 투명성 점수를 Supabase에 저장하려면?

### 방법 1: Supabase에 컬럼 추가 (권장)

#### 1단계: 스키마에 컬럼 추가

```sql
-- Supabase SQL Editor에서 실행
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS transparency_score INTEGER DEFAULT 75 
CHECK (transparency_score >= 0 AND transparency_score <= 100);

-- 인덱스 추가 (선택사항)
CREATE INDEX IF NOT EXISTS idx_brands_transparency_score 
ON brands(transparency_score DESC);
```

#### 2단계: API 응답에 포함

`app/api/brands/route.ts`의 `transformSupabaseToJsonFormat` 함수에 추가:

```typescript
return {
  // ... 기존 필드들
  transparency_score: supabaseData.transparency_score || 75,
  // ...
}
```

#### 3단계: 데이터 입력

**Supabase Dashboard에서:**
- Table Editor → `brands` 테이블
- 각 브랜드의 `transparency_score` 필드에 점수 입력 (0-100)

**또는 SQL로:**
```sql
UPDATE brands 
SET transparency_score = 78 
WHERE name = '로얄캐닌';

UPDATE brands 
SET transparency_score = 85 
WHERE name = '힐스';
```

### 방법 2: 자동 계산 로직 구현 (고급)

투명성 점수를 자동으로 계산하려면:

```typescript
function calculateTransparencyScore(brand: any): number {
  let score = 100
  
  // 리콜 이력 감점
  const recallCount = brand.recall_history?.length || 0
  score -= recallCount * 5
  
  // 고심각도 리콜 추가 감점
  const highSeverityCount = brand.recall_history?.filter(
    (r: any) => r.severity === 'high'
  ).length || 0
  score -= highSeverityCount * 10
  
  // 미해결 리콜 추가 감점
  const unresolvedCount = brand.recall_history?.filter(
    (r: any) => !r.resolved
  ).length || 0
  score -= unresolvedCount * 15
  
  // 인증서 보유 가산점
  if (brand.certifications?.length >= 2) {
    score += 5
  }
  
  // 제조 정보 공개 여부
  if (brand.manufacturing_info && brand.manufacturing_info.length > 50) {
    score += 5
  }
  
  return Math.max(0, Math.min(100, score))
}
```

## 📊 현재 투명성 점수 사용 위치

1. **브랜드 상세 페이지** (`/brands/[brandName]`)
   - 투명성 점수 카드 표시
   - 성분 공개 상태 분포 표시

2. **브랜드 비교 페이지** (`/brands/compare`)
   - 비교 테이블에 투명성 점수 컬럼 표시

3. **브랜드 목록 페이지** (`/brands`)
   - 정렬 옵션에 "투명성 높은 순" 포함
   - 하지만 실제로는 `getTransparencyScore()` 함수 사용 (리콜 기반)

## ⚠️ 주의사항

1. **데이터 불일치**: 
   - 브랜드 상세 페이지: `transparency_score` (0-100점)
   - 브랜드 목록 페이지: `getTransparencyScore()` (0-5점, 리콜 기반)
   - 두 점수는 서로 다른 시스템입니다

2. **기본값 사용**: 
   - API에서 `transparency_score`가 없으면 기본값 75점 사용
   - 모든 브랜드가 동일한 점수를 가질 수 있음

3. **하드코딩된 값**: 
   - 일부 브랜드는 하드코딩된 값 사용 (로얄캐닌: 78, 힐스: 85)
   - Supabase 데이터와 일치하지 않을 수 있음

## ✅ 권장 사항

1. **Supabase에 컬럼 추가**: 투명성 점수를 데이터베이스에 저장
2. **일관된 점수 시스템**: 모든 페이지에서 동일한 점수 사용
3. **자동 계산 고려**: 리콜 이력, 인증서, 제조 정보 등을 기반으로 자동 계산
4. **데이터 입력**: 각 브랜드의 실제 투명성 점수 입력

---

**업데이트 날짜**: 2024년 12월

