# 제품군별 상세 분석 데이터 추가 가이드

## 📋 개요

Supabase에 제품 데이터를 추가하여 "제품군별 상세 분석" 섹션에 표시하는 방법입니다.

## 🔍 1단계: 브랜드 ID 확인

먼저 제품을 추가할 브랜드의 ID를 확인해야 합니다.

### SQL Editor에서 확인

```sql
-- 브랜드 목록과 ID 확인
SELECT id, name FROM brands ORDER BY name;

-- 특정 브랜드 ID 확인 (예: 로얄캐닌)
SELECT id, name FROM brands WHERE name = '로얄캐닌';
```

**결과 예시:**
```
id                                   | name
-------------------------------------|----------
a1b2c3d4-e5f6-7890-abcd-ef1234567890 | 로얄캐닌
```

이 `id` 값을 복사해두세요.

## 💾 2단계: 데이터 추가 방법

### 방법 1: SQL Editor 사용 (권장)

#### 기본 구조

```sql
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
  '제품명',
  '이모지 또는 이미지 URL',
  '제품 설명',
  ARRAY['인증서1', '인증서2'],
  '{"country_of_origin": "프랑스", "manufacturing_country": "한국", "manufacturing_facilities": ["공장명"]}'::jsonb,
  ARRAY['원료1', '원료2', '원료3'],
  '{"protein": "27% 이상", "fat": "13% 이상", "fiber": "5% 이하", "moisture": "10% 이하"}'::jsonb,
  ARRAY['추천 이유1', '추천 이유2'],
  ARRAY['비추천 이유1', '비추천 이유2'],
  '{"palatability": 4.2, "digestibility": 4.0, "coat_quality": 4.3, "stool_quality": 3.8, "overall_satisfaction": 4.1}'::jsonb,
  '{"recommend_yes": 847, "recommend_no": 203, "total_votes": 1050}'::jsonb,
  '[]'::jsonb  -- 리뷰는 나중에 추가 가능
);
```

#### 실제 예시: 로얄캐닌 인도어 성묘용

**방법 1: 브랜드 ID를 먼저 조회**

```sql
-- 1. 브랜드 ID 확인
SELECT id, name FROM brands WHERE name = '로얄캐닌';

-- 2. 제품 추가 (위에서 확인한 브랜드 ID 사용)
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
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  -- 위에서 조회한 실제 UUID 값
```

**방법 2: 서브쿼리 사용 (더 편리!)**

```sql
-- 브랜드 이름으로 자동 조회 (권장)
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
  (SELECT id FROM brands WHERE name = '로얄캐닌'),  -- 서브쿼리로 자동 조회
  '로얄캐닌 인도어 성묘용',
  '🏠',
  '실내에서 생활하는 성묘를 위한 전용 사료로, 헤어볼 케어와 체중 관리에 도움을 줍니다.',
  ARRAY['AAFCO', 'FEDIAF', 'HACCP'],
  '{"country_of_origin": "프랑스", "manufacturing_country": "한국", "manufacturing_facilities": ["김천공장"]}'::jsonb,
  ARRAY['닭고기분', '쌀', '옥수수', '동물성지방', '식물성단백질', '비트펄프', '어유', '대두유', '프락토올리고당', '차전자피', '루테인'],
  '{"protein": "27% 이상", "fat": "13% 이상", "fiber": "5% 이하", "moisture": "10% 이하", "ash": "8.1% 이하"}'::jsonb,
  ARRAY['헤어볼 배출에 효과적인 섬유질 함량', '실내 고양이의 활동량을 고려한 적절한 칼로리', '소화율이 높아 배변 냄새 감소', '오메가-3 지방산으로 모질 개선'],
  ARRAY['옥수수 함량이 높아 알레르기 유발 가능성', '인공 보존료 사용', '상대적으로 높은 가격'],
  '{"palatability": 4.2, "digestibility": 4.0, "coat_quality": 4.3, "stool_quality": 3.8, "overall_satisfaction": 4.1}'::jsonb,
  '{"recommend_yes": 847, "recommend_no": 203, "total_votes": 1050}'::jsonb,
  '[{"id": "r1", "user_name": "고양이맘123", "rating": 4, "comment": "우리 고양이가 정말 잘 먹어요. 헤어볼도 확실히 줄어든 것 같고, 변 냄새도 많이 개선되었습니다.", "date": "2024-12-15", "helpful_count": 12}]'::jsonb
);
```

#### 실제 예시: 로얄캐닌 다이제스티브 케어

```sql
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
  (SELECT id FROM brands WHERE name = '로얄캐닌'),  -- 서브쿼리로 자동 조회
  '로얄캐닌 다이제스티브 케어',
  '💊',
  '소화기가 민감한 고양이를 위한 특별 처방식으로, 소화율을 높이고 장 건강을 개선합니다.',
  ARRAY['AAFCO', 'FEDIAF', 'FDA'],
  '{"country_of_origin": "프랑스", "manufacturing_country": "프랑스", "manufacturing_facilities": ["아이메르그 공장"]}'::jsonb,
  ARRAY['쌀', '탈수닭고기', '동물성지방', '옥수수글루텐', '비트펄프', '어유', '대두유', '프락토올리고당', '마리골드추출물'],
  '{"protein": "32% 이상", "fat": "15% 이상", "fiber": "1.4% 이하", "moisture": "10% 이하"}'::jsonb,
  ARRAY['높은 소화율(90% 이상)', '프리바이오틱스로 장내 유익균 증식', '저섬유질로 소화기 부담 최소화', '수의사 처방식으로 신뢰성 높음'],
  ARRAY['처방식으로 일반 구매 어려움', '장기 급여 시 수의사 상담 필요', '높은 가격'],
  '{"palatability": 3.8, "digestibility": 4.6, "coat_quality": 4.1, "stool_quality": 4.4, "overall_satisfaction": 4.2}'::jsonb,
  '{"recommend_yes": 312, "recommend_no": 88, "total_votes": 400}'::jsonb,
  '[{"id": "r4", "user_name": "소화불량냥이맘", "rating": 5, "comment": "소화기가 약한 우리 고양이에게 정말 좋아요. 설사도 멈추고 변 상태가 많이 좋아졌어요.", "date": "2024-12-14", "helpful_count": 15}]'::jsonb
);
```

### 방법 2: Table Editor 사용 (GUI)

1. **Supabase Dashboard → Table Editor**
   - 좌측 메뉴에서 "Table Editor" 클릭
   - `products` 테이블 선택

2. **새 행 추가**
   - "Insert row" 버튼 클릭
   - 각 필드 입력:

#### 필수 필드
- **brand_id**: 브랜드 ID (UUID 형식)
- **name**: 제품명 (예: "로얄캐닌 인도어 성묘용")

#### 선택 필드
- **image**: 이모지 또는 이미지 URL (예: "🏠")
- **description**: 제품 설명
- **certifications**: 배열 형식 (예: `["AAFCO", "FEDIAF"]`)
- **ingredients**: 배열 형식 (예: `["닭고기분", "쌀", "옥수수"]`)

#### JSONB 필드 (JSON 형식으로 입력)

**origin_info:**
```json
{
  "country_of_origin": "프랑스",
  "manufacturing_country": "한국",
  "manufacturing_facilities": ["김천공장"]
}
```

**guaranteed_analysis:**
```json
{
  "protein": "27% 이상",
  "fat": "13% 이상",
  "fiber": "5% 이하",
  "moisture": "10% 이하",
  "ash": "8.1% 이하"
}
```

**consumer_ratings:**
```json
{
  "palatability": 4.2,
  "digestibility": 4.0,
  "coat_quality": 4.3,
  "stool_quality": 3.8,
  "overall_satisfaction": 4.1
}
```

**community_feedback:**
```json
{
  "recommend_yes": 847,
  "recommend_no": 203,
  "total_votes": 1050
}
```

**consumer_reviews:**
```json
[
  {
    "id": "r1",
    "user_name": "고양이맘123",
    "rating": 4,
    "comment": "우리 고양이가 정말 잘 먹어요.",
    "date": "2024-12-15",
    "helpful_count": 12
  }
]
```

## 📊 3단계: 필드별 상세 설명

### 필수 필드

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `brand_id` | UUID | 브랜드 ID (brands 테이블 참조) | `a1b2c3d4-e5f6-7890-abcd-ef1234567890` |
| `name` | TEXT | 제품명 | `로얄캐닌 인도어 성묘용` |

### 선택 필드

| 필드명 | 타입 | 설명 | 예시 |
|--------|------|------|------|
| `image` | TEXT | 제품 이미지 (이모지 또는 URL) | `🏠` 또는 `https://...` |
| `description` | TEXT | 제품 설명 | `실내 고양이를 위한 전용 사료...` |
| `certifications` | TEXT[] | 인증서 배열 | `["AAFCO", "FEDIAF", "HACCP"]` |
| `ingredients` | TEXT[] | 원료명칭 배열 | `["닭고기분", "쌀", "옥수수"]` |
| `pros` | TEXT[] | 추천 이유 배열 | `["헤어볼 배출에 효과적", "체중 관리에 도움"]` |
| `cons` | TEXT[] | 비추천 이유 배열 | `["옥수수 함량이 높음", "가격이 비쌈"]` |

### JSONB 필드

#### origin_info
```json
{
  "country_of_origin": "프랑스",           // 원산지
  "manufacturing_country": "한국",        // 제조국
  "manufacturing_facilities": ["김천공장"] // 제조 공장 배열
}
```

#### guaranteed_analysis
```json
{
  "protein": "27% 이상",      // 조단백질
  "fat": "13% 이상",          // 조지방
  "fiber": "5% 이하",         // 조섬유
  "moisture": "10% 이하",     // 수분
  "ash": "8.1% 이하",        // 조회분 (선택)
  "calcium": "0.7% 이상",     // 칼슘 (선택)
  "phosphorus": "0.6% 이상"   // 인 (선택)
}
```

#### consumer_ratings
```json
{
  "palatability": 4.2,           // 기호성 (1-5)
  "digestibility": 4.0,           // 소화력 (1-5)
  "coat_quality": 4.3,           // 모질 개선 (1-5)
  "stool_quality": 3.8,          // 변 상태 (1-5)
  "overall_satisfaction": 4.1    // 전체 만족도 (1-5)
}
```

#### community_feedback
```json
{
  "recommend_yes": 847,    // 추천 수
  "recommend_no": 203,     // 비추천 수
  "total_votes": 1050      // 총 투표 수
}
```

#### consumer_reviews
```json
[
  {
    "id": "r1",                                    // 리뷰 ID
    "user_name": "고양이맘123",                    // 사용자명
    "rating": 4,                                   // 평점 (1-5)
    "comment": "우리 고양이가 정말 잘 먹어요...",   // 리뷰 내용
    "date": "2024-12-15",                          // 작성일
    "helpful_count": 12                            // 도움됨 수
  }
]
```

## ✅ 4단계: 데이터 확인

### 추가한 제품 확인

```sql
-- 특정 브랜드의 모든 제품 조회
SELECT id, name, description 
FROM products 
WHERE brand_id = '브랜드-ID'
ORDER BY created_at;

-- 제품 상세 정보 확인
SELECT * FROM products WHERE name = '로얄캐닌 인도어 성묘용';
```

### 브랜드 상세 페이지에서 확인

1. `/brands/로얄캐닌` 페이지 접속
2. "제품군별 상세 분석" 섹션 확인
3. 추가한 제품이 표시되는지 확인

## 🔄 5단계: 데이터 수정/삭제

### 제품 수정

```sql
UPDATE products 
SET 
  description = '수정된 제품 설명',
  pros = ARRAY['새로운 추천 이유1', '새로운 추천 이유2']
WHERE id = '제품-ID';
```

### 제품 삭제

```sql
DELETE FROM products WHERE id = '제품-ID';
```

## 💡 팁

1. **여러 제품 한 번에 추가**
   - SQL Editor에서 여러 `INSERT` 문을 연속으로 실행 가능

2. **빈 필드는 생략 가능**
   - 필수 필드(`brand_id`, `name`)만 있으면 추가 가능
   - 나머지는 나중에 `UPDATE`로 추가 가능

3. **JSONB 필드 검증**
   - Table Editor에서 JSON 형식 자동 검증
   - SQL Editor에서는 `'...'::jsonb` 형식 사용

4. **배열 필드 입력**
   - SQL: `ARRAY['항목1', '항목2']`
   - Table Editor: `["항목1", "항목2"]` 형식으로 입력

## 🐛 문제 해결

### 브랜드 ID를 찾을 수 없는 경우

```sql
-- 브랜드 이름 확인
SELECT id, name FROM brands;

-- 브랜드 추가 (없는 경우)
INSERT INTO brands (name, manufacturer, country) 
VALUES ('로얄캐닌', '마스 펫케어', '프랑스')
RETURNING id;
```

### JSON 형식 오류

- Table Editor에서 JSON 유효성 검사 확인
- SQL에서는 `'...'::jsonb` 형식 사용
- JSON 형식이 올바른지 확인 (쉼표, 따옴표 등)

### 제품이 표시되지 않는 경우

- `brand_id`가 올바른지 확인
- 브랜드 상세 페이지 새로고침
- 브라우저 캐시 삭제 후 재시도

