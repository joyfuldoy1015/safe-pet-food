# Supabase Products 테이블 추가 가이드

## 📋 개요

제품군별 상세 분석을 Supabase에서 관리하기 위해 `products` 테이블을 추가합니다.

## 🔧 1단계: Supabase 스키마 업데이트

### SQL 스크립트 실행

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 프로젝트 선택

2. **SQL Editor 열기**
   - 좌측 메뉴에서 "SQL Editor" 클릭
   - "New query" 클릭

3. **스크립트 실행**
   - `scripts/add-products-table.sql` 파일 내용 복사
   - SQL Editor에 붙여넣기
   - "Run" 버튼 클릭

### 실행할 SQL

```sql
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  description TEXT,
  certifications TEXT[] DEFAULT '{}',
  origin_info JSONB DEFAULT '{}',
  ingredients TEXT[] DEFAULT '{}',
  guaranteed_analysis JSONB DEFAULT '{}',
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  consumer_ratings JSONB DEFAULT '{}',
  community_feedback JSONB DEFAULT '{}',
  consumer_reviews JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);

ALTER TABLE products ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

CREATE POLICY "Allow authenticated users to manage" ON products
  FOR ALL USING (auth.role() = 'authenticated');
```

## 📊 2단계: 데이터 구조

### 필드 설명

| 필드명 | 타입 | 설명 |
|--------|------|------|
| `id` | UUID | 제품 고유 ID (자동 생성) |
| `brand_id` | UUID | 브랜드 ID (brands 테이블 참조) |
| `name` | TEXT | 제품명 |
| `image` | TEXT | 제품 이미지 (이모지 또는 URL) |
| `description` | TEXT | 제품 설명 |
| `certifications` | TEXT[] | 인증서 배열 (예: ['AAFCO', 'FDA']) |
| `origin_info` | JSONB | 원산지 및 제조 정보 |
| `ingredients` | TEXT[] | 원료명칭 배열 |
| `guaranteed_analysis` | JSONB | 등록성분량 |
| `pros` | TEXT[] | 추천 이유 배열 |
| `cons` | TEXT[] | 비추천 이유 배열 |
| `consumer_ratings` | JSONB | 소비자 평가 |
| `community_feedback` | JSONB | 커뮤니티 피드백 |
| `consumer_reviews` | JSONB | 소비자 리뷰 배열 |

### JSONB 필드 구조

#### origin_info
```json
{
  "country_of_origin": "프랑스",
  "manufacturing_country": "한국",
  "manufacturing_facilities": ["김천공장"]
}
```

#### guaranteed_analysis
```json
{
  "protein": "27% 이상",
  "fat": "13% 이상",
  "fiber": "5% 이하",
  "moisture": "10% 이하",
  "ash": "8.1% 이하",
  "calcium": "0.7% 이상",
  "phosphorus": "0.6% 이상"
}
```

#### consumer_ratings
```json
{
  "palatability": 4.2,
  "digestibility": 4.0,
  "coat_quality": 4.3,
  "stool_quality": 3.8,
  "overall_satisfaction": 4.1
}
```

#### community_feedback
```json
{
  "recommend_yes": 847,
  "recommend_no": 203,
  "total_votes": 1050
}
```

#### consumer_reviews
```json
[
  {
    "id": "r1",
    "user_name": "고양이맘123",
    "rating": 4,
    "comment": "우리 고양이가 정말 잘 먹어요...",
    "date": "2024-12-15",
    "helpful_count": 12
  }
]
```

## 💾 3단계: 데이터 입력 방법

### 방법 1: Supabase Dashboard (Table Editor)

1. **Table Editor 열기**
   - 좌측 메뉴에서 "Table Editor" 클릭
   - `products` 테이블 선택

2. **데이터 입력**
   - "Insert row" 클릭
   - 각 필드 입력
   - JSONB 필드는 JSON 형식으로 입력

### 방법 2: SQL로 직접 입력

```sql
-- 먼저 브랜드 ID 확인
SELECT id, name FROM brands WHERE name = '로얄캐닌';

-- 제품 추가
INSERT INTO products (
  brand_id,
  name,
  image,
  description,
  certifications,
  origin_info,
  ingredients,
  guaranteed_analysis,
  pros,
  cons,
  consumer_ratings,
  community_feedback,
  consumer_reviews
) VALUES (
  '브랜드-ID',  -- 위에서 확인한 브랜드 ID
  '로얄캐닌 인도어 성묘용',
  '🏠',
  '실내에서 생활하는 성묘를 위한 전용 사료로, 헤어볼 케어와 체중 관리에 도움을 줍니다.',
  ARRAY['AAFCO', 'FEDIAF', 'HACCP'],
  '{"country_of_origin": "프랑스", "manufacturing_country": "한국", "manufacturing_facilities": ["김천공장"]}'::jsonb,
  ARRAY['닭고기분', '쌀', '옥수수', '동물성지방', '식물성단백질', '비트펄프'],
  '{"protein": "27% 이상", "fat": "13% 이상", "fiber": "5% 이하", "moisture": "10% 이하"}'::jsonb,
  ARRAY['헤어볼 배출에 효과적인 섬유질 함량', '실내 고양이의 활동량을 고려한 적절한 칼로리'],
  ARRAY['옥수수 함량이 높아 알레르기 유발 가능성', '인공 보존료 사용'],
  '{"palatability": 4.2, "digestibility": 4.0, "coat_quality": 4.3, "stool_quality": 3.8, "overall_satisfaction": 4.1}'::jsonb,
  '{"recommend_yes": 847, "recommend_no": 203, "total_votes": 1050}'::jsonb,
  '[{"id": "r1", "user_name": "고양이맘123", "rating": 4, "comment": "우리 고양이가 정말 잘 먹어요.", "date": "2024-12-15", "helpful_count": 12}]'::jsonb
);
```

### 방법 3: API를 통한 업데이트 (향후 구현)

```typescript
// POST /api/products 요청
const response = await fetch('/api/products', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    brand_id: 'brand-id',
    name: '로얄캐닌 인도어 성묘용',
    // ... 기타 필드
  })
})
```

## ✅ 4단계: 검증

### 브랜드 상세 페이지 확인

1. `/brands/[brandName]` 페이지 접속
2. "제품군별 상세 분석" 섹션 확인
3. Supabase에서 추가한 제품이 표시되는지 확인

### API 응답 확인

```bash
# 브랜드 상세 API 호출
curl http://localhost:3000/api/brands/로얄캐닌

# 응답에 다음 필드가 포함되어야 함:
# - products: 제품 배열
#   - 각 제품에 origin_info, ingredients, guaranteed_analysis 등 포함
```

## 🔄 5단계: 우선순위

1. **Supabase 데이터** (우선순위 높음)
   - `products` 테이블에 데이터가 있으면 Supabase 데이터 사용

2. **레거시 데이터** (fallback)
   - Supabase에 데이터가 없으면 레거시 하드코딩 데이터 사용
   - `getBrandDataLegacy` 함수의 `products` 배열

## 🐛 문제 해결

### products가 빈 배열로 표시되는 경우

- Supabase에 제품 데이터가 입력되지 않았을 수 있음
- `brand_id`가 올바른지 확인 (brands 테이블의 id와 일치해야 함)
- Table Editor에서 `products` 테이블 확인

### JSONB 필드 파싱 오류

- JSON 형식이 올바른지 확인
- Supabase Table Editor에서 JSON 유효성 검사
- SQL로 입력 시 `'...'::jsonb` 형식 사용

### 브랜드와 제품 연결 안 됨

- `brand_id`가 brands 테이블의 `id`와 정확히 일치하는지 확인
- 외래 키 제약 조건 확인

## 📝 참고사항

- `products` 테이블은 선택사항입니다 (없어도 동작)
- Supabase에 제품이 없으면 레거시 데이터 사용
- 여러 제품을 한 브랜드에 추가 가능
- 제품 삭제 시 `ON DELETE CASCADE`로 자동 처리

## 🔗 관련 문서

- [브랜드 상세 페이지 구조](./BRAND_EVALUATION_PROMPT.md)
- [Supabase 스키마 가이드](../scripts/supabase-schema.sql)

