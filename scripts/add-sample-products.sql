-- 로얄캐닌 제품 샘플 데이터 추가
-- 브랜드 ID 확인 후 제품 데이터 삽입

-- Step 1: 로얄캐닌 브랜드 ID 확인
DO $$
DECLARE
  royal_canin_brand_id UUID;
BEGIN
  -- 로얄캐닌 브랜드 ID 가져오기
  SELECT id INTO royal_canin_brand_id
  FROM brands
  WHERE name = '로얄캐닌'
  LIMIT 1;

  -- 브랜드가 없으면 에러
  IF royal_canin_brand_id IS NULL THEN
    RAISE EXCEPTION '로얄캐닌 브랜드를 찾을 수 없습니다. brands 테이블을 먼저 확인하세요.';
  END IF;

  -- 기존 제품 데이터 삭제 (중복 방지)
  DELETE FROM products WHERE brand_id = royal_canin_brand_id;

  -- 제품 1: 로얄캐닌 독 어덜트
  INSERT INTO products (
    id,
    brand_id,
    name,
    description,
    grade,
    grade_text,
    image,
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
    gen_random_uuid(),
    royal_canin_brand_id,
    '로얄캐닌 독 어덜트',
    '성견을 위한 종합 영양 사료입니다.',
    'A',
    '매우 우수',
    '🍖',
    ARRAY['AAFCO 승인', 'FDA 등록', 'ISO 9001'],
    jsonb_build_object(
      'origin_country', '프랑스',
      'manufacturing_country', '한국',
      'factory_location', '경기도 평택시'
    ),
    jsonb_build_array(
      jsonb_build_object('name', '닭고기', 'percentage', 28, 'source', '프랑스산'),
      jsonb_build_object('name', '쌀', 'percentage', 22, 'source', '국내산'),
      jsonb_build_object('name', '옥수수', 'percentage', 15, 'source', '미국산'),
      jsonb_build_object('name', '치킨 부산물', 'percentage', 12, 'source', '프랑스산'),
      jsonb_build_object('name', '비트펄프', 'percentage', 8, 'source', '독일산')
    ),
    jsonb_build_object(
      'protein', 25.0,
      'fat', 14.0,
      'fiber', 3.5,
      'moisture', 10.0,
      'ash', 6.8,
      'calcium', 1.2,
      'phosphorus', 1.0
    ),
    ARRAY[
      '높은 기호성과 소화율',
      '프리미엄 원료 사용',
      '국제 인증 획득',
      '일관된 품질 관리'
    ],
    ARRAY[
      '상대적으로 높은 가격',
      '일부 부산물 포함',
      '곡물 함량이 다소 높음'
    ],
    jsonb_build_object(
      'palatability', 4.5,
      'digestibility', 4.2,
      'coat_quality', 4.3,
      'stool_quality', 4.1,
      'overall_satisfaction', 4.4
    ),
    jsonb_build_object(
      'recommend_yes', 842,
      'recommend_no', 158,
      'total_votes', 1000
    ),
    jsonb_build_array()
  );

  -- 제품 2: 로얄캐닌 퍼피
  INSERT INTO products (
    id,
    brand_id,
    name,
    description,
    grade,
    grade_text,
    image,
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
    gen_random_uuid(),
    royal_canin_brand_id,
    '로얄캐닌 퍼피',
    '자견을 위한 성장기 영양 사료입니다.',
    'A',
    '매우 우수',
    '🐕',
    ARRAY['AAFCO 승인', 'FDA 등록'],
    jsonb_build_object(
      'origin_country', '프랑스',
      'manufacturing_country', '한국',
      'factory_location', '경기도 평택시'
    ),
    jsonb_build_array(
      jsonb_build_object('name', '닭고기', 'percentage', 30, 'source', '프랑스산'),
      jsonb_build_object('name', '쌀', 'percentage', 20, 'source', '국내산'),
      jsonb_build_object('name', 'DHA', 'percentage', 5, 'source', '노르웨이산')
    ),
    jsonb_build_object(
      'protein', 28.0,
      'fat', 16.0,
      'fiber', 2.5,
      'moisture', 10.0,
      'ash', 7.0,
      'calcium', 1.4,
      'phosphorus', 1.1
    ),
    ARRAY[
      '성장기 맞춤 영양',
      'DHA 함유로 뇌 발달 지원',
      '높은 소화율',
      '작은 입자 크기'
    ],
    ARRAY[
      '가격이 비쌈',
      '성견용으로는 부적합'
    ],
    jsonb_build_object(
      'palatability', 4.6,
      'digestibility', 4.5,
      'coat_quality', 4.4,
      'stool_quality', 4.3,
      'overall_satisfaction', 4.5
    ),
    jsonb_build_object(
      'recommend_yes', 920,
      'recommend_no', 80,
      'total_votes', 1000
    ),
    jsonb_build_array()
  );

  -- 제품 3: 로얄캐닌 시니어
  INSERT INTO products (
    id,
    brand_id,
    name,
    description,
    grade,
    grade_text,
    image,
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
    gen_random_uuid(),
    royal_canin_brand_id,
    '로얄캐닌 시니어',
    '노령견을 위한 특별 배합 사료입니다.',
    'A',
    '매우 우수',
    '🦴',
    ARRAY['AAFCO 승인', 'FDA 등록'],
    jsonb_build_object(
      'origin_country', '프랑스',
      'manufacturing_country', '한국',
      'factory_location', '경기도 평택시'
    ),
    jsonb_build_array(
      jsonb_build_object('name', '닭고기', 'percentage', 26, 'source', '프랑스산'),
      jsonb_build_object('name', '쌀', 'percentage', 24, 'source', '국내산'),
      jsonb_build_object('name', '글루코사민', 'percentage', 3, 'source', '미국산'),
      jsonb_build_object('name', '콘드로이틴', 'percentage', 2, 'source', '미국산')
    ),
    jsonb_build_object(
      'protein', 23.0,
      'fat', 12.0,
      'fiber', 4.0,
      'moisture', 10.0,
      'ash', 6.5,
      'calcium', 1.0,
      'phosphorus', 0.9
    ),
    ARRAY[
      '관절 건강 지원',
      '적절한 칼로리 조절',
      '노령견 맞춤 영양',
      '쉬운 소화'
    ],
    ARRAY[
      '가격이 비쌈',
      '기호성이 다소 낮을 수 있음'
    ],
    jsonb_build_object(
      'palatability', 4.2,
      'digestibility', 4.4,
      'coat_quality', 4.1,
      'stool_quality', 4.3,
      'overall_satisfaction', 4.3
    ),
    jsonb_build_object(
      'recommend_yes', 780,
      'recommend_no', 220,
      'total_votes', 1000
    ),
    jsonb_build_array()
  );

  RAISE NOTICE '로얄캐닌 제품 3개가 성공적으로 추가되었습니다!';
END $$;

-- 결과 확인
SELECT 
  b.name as brand_name,
  p.name as product_name,
  p.grade,
  p.description
FROM products p
JOIN brands b ON p.brand_id = b.id
WHERE b.name = '로얄캐닌'
ORDER BY p.created_at DESC;
