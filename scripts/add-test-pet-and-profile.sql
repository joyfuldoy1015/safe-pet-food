-- ============================================
-- Test Pet & Profile 추가 스크립트
-- ============================================
-- 목적: /pet-log 페이지에서 review_logs 데이터가 보이도록
--       pets 및 profiles 테이블에 필요한 데이터 추가
-- ============================================

-- ============================================
-- STEP 1: 현재 상태 확인
-- ============================================
SELECT '=== 현재 review_logs 데이터 ===' as step;
SELECT 
  id,
  owner_id,
  pet_id,
  brand,
  product,
  excerpt,
  created_at
FROM review_logs 
ORDER BY created_at DESC 
LIMIT 1;

SELECT '=== pets 테이블 확인 ===' as step;
SELECT id, name, species, owner_id 
FROM pets 
WHERE id = 'f84b515e-f952-4197-a4f4-a1307677ef7c';

SELECT '=== profiles 테이블 확인 ===' as step;
SELECT id, nickname, avatar_url 
FROM profiles 
WHERE id = '97562a83-669d-4298-9d8e-e866cba61d6f';

-- ============================================
-- STEP 2: pets 테이블에 반려동물 추가 (없는 경우만)
-- ============================================
INSERT INTO pets (
  id,
  owner_id,
  name,
  species,
  birth_date,
  weight_kg,
  tags,
  avatar_url,
  created_at,
  updated_at
) VALUES (
  'f84b515e-f952-4197-a4f4-a1307677ef7c',
  '97562a83-669d-4298-9d8e-e866cba61d6f',
  '테스트 멍멍이',
  'dog',
  '2020-01-01',
  25.0,
  ARRAY['골든 리트리버', '대형견'],
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- ============================================
-- STEP 3: profiles 테이블에 프로필 추가 (없는 경우만)
-- ============================================
INSERT INTO profiles (
  id,
  nickname,
  avatar_url,
  created_at,
  updated_at
) VALUES (
  '97562a83-669d-4298-9d8e-e866cba61d6f',
  'Test User',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  nickname = EXCLUDED.nickname,
  updated_at = NOW();

-- ============================================
-- STEP 4: 최종 확인 - /pet-log에서 보일 데이터
-- ============================================
SELECT '=== 최종 확인: /pet-log 페이지에서 보일 데이터 ===' as step;
SELECT 
  rl.id as review_id,
  rl.brand,
  rl.product,
  rl.excerpt,
  rl.rating,
  rl.created_at,
  p.nickname as owner_nickname,
  p.avatar_url as owner_avatar,
  pet.name as pet_name,
  pet.species as pet_species
FROM review_logs rl
LEFT JOIN profiles p ON rl.owner_id = p.id
LEFT JOIN pets pet ON rl.pet_id = pet.id
WHERE rl.owner_id = '97562a83-669d-4298-9d8e-e866cba61d6f'
ORDER BY rl.created_at DESC;

SELECT '✅ 완료! 이제 http://localhost:3000/pet-log 페이지에서 후기가 보여야 합니다!' as status;
