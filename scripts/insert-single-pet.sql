-- ============================================
-- Single Pet Insert Template
-- ============================================
-- 
-- 빠르게 한 마리만 추가하고 싶을 때 사용하세요
-- 1. YOUR_USER_ID를 본인의 user ID로 교체
-- 2. 반려동물 정보 수정
-- 3. Run 클릭
-- ============================================

-- Step 1: User ID 확인 (먼저 실행)
SELECT id as user_id, email FROM auth.users ORDER BY created_at DESC LIMIT 3;

-- Step 2: 아래 템플릿을 수정해서 사용하세요

-- 🐶 강아지 추가 템플릿
INSERT INTO pets (
  owner_id,
  name,
  species,
  birth_date,
  weight_kg,
  tags
) VALUES (
  'YOUR_USER_ID_HERE'::uuid,  -- ⚠️ 필수: 본인의 user ID
  '강아지이름',                 -- ⚠️ 필수: 예) 뽀미, 코코
  'dog',                       -- ⚠️ 필수: 'dog' 고정
  '2021-01-01',               -- ⚠️ 필수: 생년월일 (YYYY-MM-DD)
  10.0,                        -- 선택: 몸무게 (kg), NULL 가능
  ARRAY['tag1', 'tag2']        -- 선택: 태그, ARRAY[]::TEXT[] (빈 배열)
);

-- 🐱 고양이 추가 템플릿
INSERT INTO pets (
  owner_id,
  name,
  species,
  birth_date,
  weight_kg,
  tags
) VALUES (
  'YOUR_USER_ID_HERE'::uuid,  -- ⚠️ 필수: 본인의 user ID
  '고양이이름',                 -- ⚠️ 필수: 예) 모모, 나비
  'cat',                       -- ⚠️ 필수: 'cat' 고정
  '2022-01-01',               -- ⚠️ 필수: 생년월일 (YYYY-MM-DD)
  4.0,                         -- 선택: 몸무게 (kg), NULL 가능
  ARRAY['indoor']              -- 선택: 태그, ARRAY[]::TEXT[] (빈 배열)
);

-- Step 3: 입력 결과 확인
SELECT 
  id,
  name,
  species,
  birth_date,
  weight_kg,
  tags,
  created_at
FROM pets 
WHERE owner_id = 'YOUR_USER_ID_HERE'::uuid
ORDER BY created_at DESC;
