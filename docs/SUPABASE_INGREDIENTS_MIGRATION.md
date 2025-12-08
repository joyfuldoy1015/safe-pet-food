# Supabase Ingredients 필드 추가 가이드

## 📋 개요

브랜드 테이블에 `ingredients` 필드를 추가하여 브랜드 대표 원료 정보를 Supabase에서 관리할 수 있도록 합니다.

## 🔧 1단계: Supabase 스키마 업데이트

### SQL 스크립트 실행

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 좌측 메뉴에서 "SQL Editor" 클릭
   - "New query" 클릭

3. **스크립트 실행**
   - `scripts/add-ingredients-column.sql` 파일 내용 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭

### 실행할 SQL

```sql
-- 브랜드 테이블에 ingredients 컬럼 추가
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]';

-- 인덱스 추가 (JSONB 필드 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_brands_ingredients 
ON brands USING GIN (ingredients);

-- 컬럼 설명 추가
COMMENT ON COLUMN brands.ingredients IS '브랜드 대표 원료 정보 배열. 각 원료는 name, percentage, source, disclosure_level을 포함합니다.';
```

## 📊 2단계: 데이터 구조

### JSONB 데이터 형식

```json
[
  {
    "name": "닭고기",
    "percentage": 18,
    "source": "프랑스산",
    "disclosure_level": "full"
  },
  {
    "name": "쌀",
    "percentage": 15,
    "source": "미국산",
    "disclosure_level": "full"
  },
  {
    "name": "옥수수",
    "percentage": 12,
    "disclosure_level": "partial"
  },
  {
    "name": "동물성 지방",
    "percentage": 8,
    "disclosure_level": "partial"
  },
  {
    "name": "식물성 단백질",
    "percentage": 6,
    "disclosure_level": "none"
  }
]
```

### 필드 설명

- `name` (필수): 원료명
- `percentage` (선택): 비율 (0-100)
- `source` (선택): 원산지
- `disclosure_level` (선택): 공개 수준
  - `"full"`: 완전 공개
  - `"partial"`: 부분 공개
  - `"none"`: 미공개

## 💾 3단계: 데이터 입력 방법

### 방법 1: Supabase Dashboard (Table Editor)

1. **Table Editor 열기**
   - 좌측 메뉴에서 "Table Editor" 클릭
   - `brands` 테이블 선택

2. **데이터 입력**
   - 브랜드 행 선택
   - `ingredients` 컬럼 클릭
   - JSON 형식으로 데이터 입력
   - 저장

### 방법 2: SQL로 직접 입력

```sql
-- 예시: 로얄캐닌 브랜드에 ingredients 추가
UPDATE brands 
SET ingredients = '[
  {"name": "닭고기", "percentage": 18, "source": "프랑스산", "disclosure_level": "full"},
  {"name": "쌀", "percentage": 15, "source": "미국산", "disclosure_level": "full"},
  {"name": "옥수수", "percentage": 12, "disclosure_level": "partial"},
  {"name": "동물성 지방", "percentage": 8, "disclosure_level": "partial"},
  {"name": "식물성 단백질", "percentage": 6, "disclosure_level": "none"},
  {"name": "비트펄프", "percentage": 5, "source": "유럽산", "disclosure_level": "full"}
]'::jsonb
WHERE name = '로얄캐닌';
```

### 방법 3: API를 통한 업데이트

```typescript
// PUT /api/brands 요청
const response = await fetch('/api/brands', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    id: 'brand-id',
    name: '로얄캐닌',
    ingredients: [
      { name: '닭고기', percentage: 18, source: '프랑스산', disclosure_level: 'full' },
      { name: '쌀', percentage: 15, source: '미국산', disclosure_level: 'full' },
      // ...
    ]
  })
})
```

## 🔄 4단계: 자동 계산 확인

`ingredients` 배열이 추가되면 자동으로 `ingredient_disclosure`가 계산됩니다:

- **완전 공개**: `disclosure_level: 'full'`인 원료들의 비율 합
- **부분 공개**: `disclosure_level: 'partial'`인 원료들의 비율 합
- **미공개**: `disclosure_level: 'none'`인 원료들의 비율 합

### 계산 로직

1. 각 원료의 `percentage` 확인 (없으면 균등 분배)
2. `disclosure_level`에 따라 분류
3. 비율 합산 및 정규화 (총합 100%)

## ✅ 5단계: 검증

### 브랜드 상세 페이지 확인

1. `/brands/[brandName]` 페이지 접속
2. 투명성 점수 섹션 확인
3. "완전 공개", "부분 공개", "미공개" 비율이 올바르게 표시되는지 확인

### API 응답 확인

```bash
# 브랜드 상세 API 호출
curl http://localhost:3000/api/brands/로얄캐닌

# 응답에 다음 필드가 포함되어야 함:
# - ingredients: 원료 배열
# - ingredient_disclosure: 자동 계산된 공개 상태
```

## 🐛 문제 해결

### ingredients가 null로 표시되는 경우

- Supabase에 데이터가 입력되지 않았을 수 있음
- Table Editor에서 `ingredients` 컬럼 확인
- 기본값은 빈 배열 `[]`

### ingredient_disclosure가 모두 0%인 경우

- `ingredients` 배열이 비어있거나
- 모든 원료에 `disclosure_level`이 없는 경우
- → 원료 데이터에 `disclosure_level` 필드 추가 필요

### JSON 파싱 오류

- JSON 형식이 올바른지 확인
- Supabase Table Editor에서 JSON 유효성 검사
- SQL로 입력 시 `'...'::jsonb` 형식 사용

## 📝 참고사항

- `ingredients` 필드는 선택사항입니다 (없어도 동작)
- `ingredients`가 없으면 `ingredient_disclosure`는 모두 0%
- 레거시 데이터(`getBrandDataLegacy`)의 하드코딩된 값은 우선순위가 낮음
- Supabase 데이터가 있으면 자동 계산된 값 사용

## 🔗 관련 문서

- [성분 공개 상태 자동 계산 가이드](./INGREDIENT_DISCLOSURE_AUTO_CALCULATION.md)
- [투명성 점수 가이드](./TRANSPARENCY_SCORE_GUIDE.md)

