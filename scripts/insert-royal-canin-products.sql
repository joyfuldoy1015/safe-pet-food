-- 로얄캐닌 제품 데이터 추가
-- 브랜드 ID를 먼저 확인한 후 실행하세요

-- 1단계: 브랜드 ID 확인
-- SELECT id, name FROM brands WHERE name = '로얄캐닌';

-- 2단계: 제품 데이터 삽입 (브랜드 ID를 실제 UUID로 변경하세요)
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
) VALUES
-- 제품 1: 로얄캐닌 인도어 성묘용
(
  (SELECT id FROM brands WHERE name = '로얄캐닌' LIMIT 1),
  '로얄캐닌 인도어 성묘용',
  '🏠',
  '실내에서 생활하는 성묘를 위한 전용 사료로, 헤어볼 케어와 체중 관리에 도움을 줍니다.',
  ARRAY['AAFCO', 'FEDIAF', 'HACCP'],
  '{
    "country_of_origin": "프랑스",
    "manufacturing_country": "한국",
    "manufacturing_facilities": ["김천공장"]
  }'::jsonb,
  ARRAY['닭고기분', '쌀', '옥수수', '동물성지방', '식물성단백질', '비트펄프', '어유', '대두유', '프락토올리고당', '차전자피', '루테인'],
  '{
    "protein": "27% 이상",
    "fat": "13% 이상",
    "fiber": "5% 이하",
    "moisture": "10% 이하",
    "ash": "8.1% 이하"
  }'::jsonb,
  ARRAY['헤어볼 배출에 효과적인 섬유질 함량', '실내 고양이의 활동량을 고려한 적절한 칼로리', '소화율이 높아 배변 냄새 감소', '오메가-3 지방산으로 모질 개선'],
  ARRAY['옥수수 함량이 높아 알레르기 유발 가능성', '인공 보존료 사용', '상대적으로 높은 가격'],
  '{
    "palatability": 4.2,
    "digestibility": 4.0,
    "coat_quality": 4.3,
    "stool_quality": 3.8,
    "overall_satisfaction": 4.1
  }'::jsonb,
  '{
    "recommend_yes": 847,
    "recommend_no": 203,
    "total_votes": 1050
  }'::jsonb,
  '[
    {
      "id": "r1",
      "user_name": "고양이집사123",
      "rating": 5,
      "comment": "헤어볼 때문에 고생하던 우리 고양이가 이 사료 먹고 완전히 좋아졌어요!",
      "date": "2024-12-15",
      "helpful_count": 32
    },
    {
      "id": "r2",
      "user_name": "실내고양이맘",
      "rating": 4,
      "comment": "체중 관리에 도움이 되는 것 같아요. 다만 가격이 좀 부담스럽네요.",
      "date": "2024-12-10",
      "helpful_count": 18
    }
  ]'::jsonb
),
-- 제품 2: 로얄캐닌 퍼피
(
  (SELECT id FROM brands WHERE name = '로얄캐닌' LIMIT 1),
  '로얄캐닌 퍼피',
  '🐕',
  '생후 2~12개월 강아지를 위한 전용 사료로, 성장기 영양 요구사항을 충족시킵니다.',
  ARRAY['AAFCO', 'FEDIAF', 'HACCP'],
  '{
    "country_of_origin": "프랑스",
    "manufacturing_country": "한국",
    "manufacturing_facilities": ["김천공장"]
  }'::jsonb,
  ARRAY['닭고기분', '옥수수', '쌀', '동물성지방', '어유', '비트펄프', '프락토올리고당', '콜린클로라이드'],
  '{
    "protein": "32% 이상",
    "fat": "18% 이상",
    "fiber": "4% 이하",
    "moisture": "10% 이하",
    "ash": "7.5% 이하"
  }'::jsonb,
  ARRAY['성장기 강아지의 영양 요구사항 충족', '면역력 강화를 위한 항산화제 함유', '소화율이 높아 배변 상태 양호', '뼈와 관절 건강에 도움'],
  ARRAY['옥수수 함량이 높음', '일부 강아지에서 알레르기 반응 가능', '가격이 높음'],
  '{
    "palatability": 4.5,
    "digestibility": 4.3,
    "coat_quality": 4.4,
    "stool_quality": 4.2,
    "overall_satisfaction": 4.4
  }'::jsonb,
  '{
    "recommend_yes": 923,
    "recommend_no": 127,
    "total_votes": 1050
  }'::jsonb,
  '[
    {
      "id": "p1",
      "user_name": "퍼피맘",
      "rating": 5,
      "comment": "수의사 추천으로 시작했는데 정말 좋아요. 우리 강아지가 잘 먹고 건강하게 자라고 있어요!",
      "date": "2024-12-14",
      "helpful_count": 45
    },
    {
      "id": "p2",
      "user_name": "강아지사랑",
      "rating": 4,
      "comment": "품질은 좋은데 가격이 부담스러워요. 그래도 효과는 확실합니다.",
      "date": "2024-12-08",
      "helpful_count": 22
    }
  ]'::jsonb
),
-- 제품 3: 로얄캐닌 처방식 소화기
(
  (SELECT id FROM brands WHERE name = '로얄캐닌' LIMIT 1),
  '로얄캐닌 처방식 소화기',
  '🏥',
  '소화기 민감한 반려동물을 위한 처방식 사료로, 소화율을 높이고 배변 상태를 개선합니다.',
  ARRAY['AAFCO', 'FEDIAF', 'HACCP'],
  '{
    "country_of_origin": "프랑스",
    "manufacturing_country": "한국",
    "manufacturing_facilities": ["김천공장"]
  }'::jsonb,
  ARRAY['쌀', '옥수수 글루텐', '동물성지방', '어유', '비트펄프', '프락토올리고당', 'EPA', 'DHA'],
  '{
    "protein": "22% 이상",
    "fat": "12% 이상",
    "fiber": "1.5% 이하",
    "moisture": "10% 이하",
    "ash": "6.5% 이하"
  }'::jsonb,
  ARRAY['소화율이 매우 높아 배변 상태 개선', '설사 완화에 효과적', '수의사 처방식으로 신뢰도 높음', '저지방으로 소화 부담 감소'],
  ARRAY['처방식이라 일반 판매점에서 구매 어려움', '가격이 매우 높음', '기호성이 다소 떨어질 수 있음'],
  '{
    "palatability": 3.5,
    "digestibility": 4.8,
    "coat_quality": 4.0,
    "stool_quality": 4.9,
    "overall_satisfaction": 4.3
  }'::jsonb,
  '{
    "recommend_yes": 269,
    "recommend_no": 131,
    "total_votes": 400
  }'::jsonb,
  '[
    {
      "id": "h4",
      "user_name": "소화기전문집사",
      "rating": 5,
      "comment": "설사로 고생하던 우리 강아지가 이 사료로 완전히 좋아졌어요. 처방식이라 비싸지만 효과는 확실합니다.",
      "date": "2024-12-12",
      "helpful_count": 25
    },
    {
      "id": "h5",
      "user_name": "수의사추천",
      "rating": 4,
      "comment": "수의사님이 추천해주신 사료입니다. 소화율이 정말 높고 변 상태가 많이 개선되었어요.",
      "date": "2024-12-08",
      "helpful_count": 13
    }
  ]'::jsonb
)
ON CONFLICT DO NOTHING;

-- 확인 쿼리
-- SELECT p.id, p.name, b.name as brand_name 
-- FROM products p 
-- JOIN brands b ON p.brand_id = b.id 
-- WHERE b.name = '로얄캐닌';

