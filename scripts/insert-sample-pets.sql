-- ============================================
-- Sample Pets Data for Testing
-- ============================================
-- 
-- 사용 방법:
-- 1. Supabase Dashboard → SQL Editor
-- 2. 아래 SQL을 복사-붙여넣기
-- 3. YOUR_USER_ID를 본인의 실제 user ID로 교체
-- 4. Run 클릭
--
-- User ID 확인 방법:
-- SELECT id, email FROM auth.users;
-- ============================================

-- ============================================
-- 1. 현재 로그인한 사용자 ID 확인 (먼저 실행)
-- ============================================
-- 아래 쿼리를 먼저 실행해서 user_id를 복사하세요
SELECT 
  id as user_id, 
  email, 
  created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- ============================================
-- 2. 강아지 샘플 데이터 (3마리)
-- ============================================

-- 강아지 1: 뽀미 (골든 리트리버, 3세, 28kg)
-- 특징: 닭고기 알러지, 소화기 민감
INSERT INTO pets (
  owner_id,
  name,
  species,
  birth_date,
  weight_kg,
  tags,
  avatar_url
) VALUES (
  'YOUR_USER_ID_HERE'::uuid,  -- ⚠️ 여기를 본인의 user ID로 교체하세요!
  '뽀미',
  'dog',
  '2021-03-15',
  28.0,
  ARRAY['allergy-chicken', 'sensitive-stomach', 'large-breed'],
  NULL
);

-- 강아지 2: 코코 (대형견, 4세, 32kg)
-- 특징: 활동적, 건강함
INSERT INTO pets (
  owner_id,
  name,
  species,
  birth_date,
  weight_kg,
  tags,
  avatar_url
) VALUES (
  'YOUR_USER_ID_HERE'::uuid,  -- ⚠️ 여기를 본인의 user ID로 교체하세요!
  '코코',
  'dog',
  '2020-06-20',
  32.0,
  ARRAY['active', 'healthy'],
  NULL
);

-- 강아지 3: 루이 (포메라니안, 2세, 3.5kg)
-- 특징: 소형견, 심장 관리 필요
INSERT INTO pets (
  owner_id,
  name,
  species,
  birth_date,
  weight_kg,
  tags,
  avatar_url
) VALUES (
  'YOUR_USER_ID_HERE'::uuid,  -- ⚠️ 여기를 본인의 user ID로 교체하세요!
  '루이',
  'dog',
  '2022-05-10',
  3.5,
  ARRAY['small-breed', 'heart-care'],
  NULL
);

-- ============================================
-- 3. 고양이 샘플 데이터 (3마리)
-- ============================================

-- 고양이 1: 모모 (페르시안, 2세, 4.2kg)
-- 특징: 장모종, 까다로운 입맛
INSERT INTO pets (
  owner_id,
  name,
  species,
  birth_date,
  weight_kg,
  tags,
  avatar_url
) VALUES (
  'YOUR_USER_ID_HERE'::uuid,  -- ⚠️ 여기를 본인의 user ID로 교체하세요!
  '모모',
  'cat',
  '2022-01-10',
  4.2,
  ARRAY['picky-eater', 'long-hair'],
  NULL
);

-- 고양이 2: 나비 (코리안 숏헤어, 5세, 4.8kg)
-- 특징: 실내묘, 체중 관리 중
INSERT INTO pets (
  owner_id,
  name,
  species,
  birth_date,
  weight_kg,
  tags,
  avatar_url
) VALUES (
  'YOUR_USER_ID_HERE'::uuid,  -- ⚠️ 여기를 본인의 user ID로 교체하세요!
  '나비',
  'cat',
  '2019-08-15',
  4.8,
  ARRAY['indoor', 'weight-management'],
  NULL
);

-- 고양이 3: 까미 (먼치킨, 1세, 3.2kg)
-- 특징: 단모종, 활발함
INSERT INTO pets (
  owner_id,
  name,
  species,
  birth_date,
  weight_kg,
  tags,
  avatar_url
) VALUES (
  'YOUR_USER_ID_HERE'::uuid,  -- ⚠️ 여기를 본인의 user ID로 교체하세요!
  '까미',
  'cat',
  '2023-06-01',
  3.2,
  ARRAY['short-hair', 'playful'],
  NULL
);

-- ============================================
-- 4. 입력 결과 확인
-- ============================================
-- 아래 쿼리로 입력된 데이터를 확인하세요
SELECT 
  id,
  name,
  species,
  EXTRACT(YEAR FROM AGE(birth_date))::int || '세' as age,
  weight_kg || 'kg' as weight,
  tags,
  created_at
FROM pets 
WHERE owner_id = 'YOUR_USER_ID_HERE'::uuid  -- ⚠️ 여기도 본인의 user ID로 교체하세요!
ORDER BY created_at DESC;

-- ============================================
-- 5. 통계 확인 (선택사항)
-- ============================================
-- 종류별 반려동물 수
SELECT 
  species,
  COUNT(*) as count,
  AVG(weight_kg)::numeric(5,2) as avg_weight
FROM pets
WHERE owner_id = 'YOUR_USER_ID_HERE'::uuid  -- ⚠️ 여기도 본인의 user ID로 교체하세요!
GROUP BY species;

-- ============================================
-- 6. 삭제 (필요시)
-- ============================================
-- 테스트 데이터를 삭제하려면 아래 주석을 해제하고 실행하세요
-- DELETE FROM pets WHERE owner_id = 'YOUR_USER_ID_HERE'::uuid;
