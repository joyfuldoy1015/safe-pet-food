# 브랜드 ID 오류 해결 가이드

## ❌ 문제

에러 메시지: `invalid input syntax for type uuid: "로얄캐닌"`

**원인**: `brand_id` 필드는 UUID 타입인데, 브랜드 이름('로얄캐닌')을 입력했습니다.

## ✅ 해결 방법

### 1단계: 브랜드 ID 조회

먼저 브랜드의 실제 UUID를 조회해야 합니다.

```sql
-- 브랜드 ID 조회
SELECT id, name FROM brands WHERE name = '로얄캐닌';
```

**결과 예시:**
```
id                                   | name
-------------------------------------|----------
a1b2c3d4-e5f6-7890-abcd-ef1234567890 | 로얄캐닌
```

### 2단계: 조회한 UUID 사용

위에서 조회한 `id` 값(UUID)을 사용합니다.

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
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',  -- 위에서 조회한 실제 UUID 값
  '로얄캐닌 인도어 성묘용',
  '🏠',
  '실내에서 생활하는 성묘를 위한 전용 사료로, 헤어볼 케어와 체중 관리에 도움을 줍니다.',
  ARRAY['AAFCO', 'FEDIAF', 'HACCP'],
  '{"country_of_origin": "프랑스", "manufacturing_country": "한국", "manufacturing_facilities": ["김천공장"]}'::jsonb,
  ARRAY['닭고기분', '쌀', '옥수수', '동물성지방', '식물성단백질', '비트펄프'],
  '{"protein": "27% 이상", "fat": "13% 이상", "fiber": "5% 이하", "moisture": "10% 이하"}'::jsonb,
  ARRAY['헤어볼 배출에 효과적', '체중 관리에 도움'],
  ARRAY['옥수수 함량이 높음', '가격이 비쌈'],
  '{"palatability": 4.2, "digestibility": 4.0, "coat_quality": 4.3, "stool_quality": 3.8, "overall_satisfaction": 4.1}'::jsonb,
  '{"recommend_yes": 847, "recommend_no": 203, "total_votes": 1050}'::jsonb,
  '[]'::jsonb
);
```

## 💡 더 간편한 방법: 서브쿼리 사용

브랜드 이름으로 직접 조회할 수도 있습니다:

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
  '로얄캐닌 인도어 성묘용',
  '🏠',
  '실내에서 생활하는 성묘를 위한 전용 사료로, 헤어볼 케어와 체중 관리에 도움을 줍니다.',
  ARRAY['AAFCO', 'FEDIAF', 'HACCP'],
  '{"country_of_origin": "프랑스", "manufacturing_country": "한국", "manufacturing_facilities": ["김천공장"]}'::jsonb,
  ARRAY['닭고기분', '쌀', '옥수수', '동물성지방', '식물성단백질', '비트펄프'],
  '{"protein": "27% 이상", "fat": "13% 이상", "fiber": "5% 이하", "moisture": "10% 이하"}'::jsonb,
  ARRAY['헤어볼 배출에 효과적', '체중 관리에 도움'],
  ARRAY['옥수수 함량이 높음', '가격이 비쌈'],
  '{"palatability": 4.2, "digestibility": 4.0, "coat_quality": 4.3, "stool_quality": 3.8, "overall_satisfaction": 4.1}'::jsonb,
  '{"recommend_yes": 847, "recommend_no": 203, "total_votes": 1050}'::jsonb,
  '[]'::jsonb
);
```

이 방법이 더 편리합니다! 브랜드 이름만 알면 자동으로 ID를 찾아서 사용합니다.

