# 성분 공개 상태 자동 계산 가이드

## 📋 개요

성분 공개 상태(완전 공개, 부분 공개, 미공개)는 이제 `ingredients` 배열의 `disclosure_level`을 기반으로 **자동 계산**됩니다.

## 🔍 작동 방식

### 계산 로직

```typescript
function calculateIngredientDisclosure(ingredients: Array<{
  name: string
  percentage?: number
  disclosure_level?: 'full' | 'partial' | 'none'
}>): {
  fully_disclosed: number      // 완전 공개 비율 (%)
  partially_disclosed: number   // 부분 공개 비율 (%)
  not_disclosed: number        // 미공개 비율 (%)
}
```

### 계산 방법

1. **각 원료의 비율 확인**
   - `percentage` 필드가 있으면 해당 값 사용
   - 없으면 전체 원료 수로 균등 분배 (예: 10개 원료면 각 10%)

2. **공개 수준별 집계**
   - `disclosure_level: 'full'` → 완전 공개에 합산
   - `disclosure_level: 'partial'` → 부분 공개에 합산
   - `disclosure_level: 'none'` → 미공개에 합산
   - `disclosure_level`이 없으면 → 미공개로 처리

3. **정규화**
   - 모든 비율의 합이 100%가 되도록 정규화
   - 반올림하여 정수로 반환

### 예시

```typescript
// 입력
ingredients: [
  { name: '닭고기', percentage: 30, disclosure_level: 'full' },
  { name: '쌀', percentage: 25, disclosure_level: 'full' },
  { name: '옥수수', percentage: 20, disclosure_level: 'partial' },
  { name: '동물성 지방', percentage: 15, disclosure_level: 'partial' },
  { name: '식물성 단백질', percentage: 10, disclosure_level: 'none' }
]

// 출력
{
  fully_disclosed: 55,      // (30 + 25) = 55%
  partially_disclosed: 35,   // (20 + 15) = 35%
  not_disclosed: 10          // 10%
}
```

## 📍 적용 위치

### 1. 브랜드 상세 API (`/api/brands/[brandName]`)

- **레거시 데이터 (JSON)**: `ingredients` 배열이 있고 `disclosure_level`이 있으면 자동 계산
- **Supabase 데이터**: `ingredients` 필드가 있으면 자동 계산 (향후 확장 가능)

### 2. 브랜드 상세 페이지 (`/brands/[brandName]`)

- API 응답의 `ingredient_disclosure` 값을 그대로 표시
- 자동 계산된 값이 자동으로 반영됨

## 🔄 우선순위

1. **자동 계산** (우선순위 높음)
   - `ingredients` 배열이 있고 `disclosure_level`이 있으면 자동 계산

2. **하드코딩된 값** (fallback)
   - `ingredient_disclosure` 필드가 직접 정의되어 있으면 해당 값 사용
   - 레거시 데이터의 경우 하드코딩된 값이 우선

## 💡 향후 확장

### Supabase에 `ingredients` 필드 추가 시

```sql
-- Supabase SQL Editor에서 실행
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]';

-- 예시 데이터 구조
-- [
--   {
--     "name": "닭고기",
--     "percentage": 30,
--     "disclosure_level": "full"
--   },
--   {
--     "name": "옥수수",
--     "percentage": 20,
--     "disclosure_level": "partial"
--   }
-- ]
```

이렇게 하면 Supabase 데이터에서도 자동 계산이 작동합니다.

## 📊 데이터 구조

### Ingredient 인터페이스

```typescript
interface Ingredient {
  name: string                    // 원료명
  percentage?: number             // 비율 (0-100)
  source?: string                 // 원산지 (선택사항)
  disclosure_level?: 'full' | 'partial' | 'none'  // 공개 수준
}
```

### Ingredient Disclosure 인터페이스

```typescript
interface IngredientDisclosure {
  fully_disclosed: number        // 완전 공개 비율 (0-100)
  partially_disclosed: number     // 부분 공개 비율 (0-100)
  not_disclosed: number          // 미공개 비율 (0-100)
}
```

## ✅ 검증

브랜드 상세 페이지에서 다음을 확인하세요:

1. 투명성 점수 섹션에 "완전 공개", "부분 공개", "미공개" 비율이 표시됨
2. 각 비율의 합이 100%가 됨
3. `ingredients` 배열의 `disclosure_level`을 변경하면 비율이 자동으로 업데이트됨

## 🐛 문제 해결

### 비율이 0%로 표시되는 경우

- `ingredients` 배열이 비어있거나
- 모든 원료에 `disclosure_level`이 없는 경우
- → 기본값 `{ fully_disclosed: 0, partially_disclosed: 0, not_disclosed: 0 }` 반환

### 비율의 합이 100%가 아닌 경우

- 반올림으로 인한 오차 가능 (예: 33.3% + 33.3% + 33.3% = 99.9%)
- 정상적인 동작입니다.

