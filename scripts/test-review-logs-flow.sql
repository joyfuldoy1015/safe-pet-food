-- ============================================
-- Review Logs Flow 테스트 스크립트
-- ============================================
-- 목적: /owners/[ownerId]/pets/[petId] 페이지에서
--       실제 사용자가 입력한 급여 기록이 표시되는지 확인
-- ============================================

-- ============================================
-- STEP 1: 현재 로그인한 사용자 ID 확인
-- ============================================
-- 아래 쿼리를 실행해서 user_id를 복사하세요
SELECT 
  id as user_id, 
  email, 
  created_at 
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 5;

-- ⚠️ 위에서 복사한 user_id를 아래 변수에 입력하세요
-- 예: SET user_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890';


-- ============================================
-- STEP 2: 반려동물 등록 (pets 테이블)
-- ============================================
-- 강아지 1마리 등록
INSERT INTO pets (
  owner_id,
  name,
  species,
  birth_date,
  weight_kg,
  tags
) VALUES (
  'YOUR_USER_ID_HERE'::uuid,  -- ⚠️ 실제 user_id로 교체하세요!
  '뽀미',
  'dog',
  '2021-03-15',
  28.0,
  ARRAY['large-breed', 'sensitive-stomach']
) RETURNING id, name;

-- ⚠️ 위에서 반환된 pet_id를 복사하세요


-- ============================================
-- STEP 3: 급여 기록 등록 (review_logs 테이블)
-- ============================================

-- 기록 1: 로얄캐닌 (현재 급여 중)
INSERT INTO review_logs (
  pet_id,
  owner_id,
  category,
  brand,
  product,
  status,
  period_start,
  rating,
  recommend,
  continue_reasons,
  excerpt,
  notes
) VALUES (
  'YOUR_PET_ID_HERE'::uuid,   -- ⚠️ 위에서 복사한 pet_id 입력
  'YOUR_USER_ID_HERE'::uuid,  -- ⚠️ 실제 user_id로 교체
  'feed',
  '로얄캐닌',
  '맥시 어덜트',
  'feeding',
  '2024-01-15',
  4.5,
  true,
  ARRAY['good-digestion', 'like-taste', 'good-poop'],
  '소화도 잘 되고 변 상태도 좋아요. 뽀미가 잘 먹습니다.',
  '가격은 조금 비싸지만 품질이 좋은 것 같아요.'
);

-- 기록 2: 힐스 사료 (완료)
INSERT INTO review_logs (
  pet_id,
  owner_id,
  category,
  brand,
  product,
  status,
  period_start,
  period_end,
  duration_days,
  rating,
  recommend,
  stop_reasons,
  excerpt,
  notes
) VALUES (
  'YOUR_PET_ID_HERE'::uuid,   -- ⚠️ 위에서 복사한 pet_id 입력
  'YOUR_USER_ID_HERE'::uuid,  -- ⚠️ 실제 user_id로 교체
  'feed',
  '힐스',
  '사이언스 다이어트 어덜트',
  'completed',
  '2023-10-01',
  '2023-12-31',
  91,
  3.5,
  false,
  ARRAY['not-like-taste', 'digestive-issues'],
  '처음에는 잘 먹었는데 나중에 입맛이 떨어졌어요.',
  '소화는 괜찮았지만 기호성이 떨어져서 다른 사료로 변경했습니다.'
);

-- 기록 3: 간식 (현재 급여 중)
INSERT INTO review_logs (
  pet_id,
  owner_id,
  category,
  brand,
  product,
  status,
  period_start,
  rating,
  recommend,
  continue_reasons,
  excerpt
) VALUES (
  'YOUR_PET_ID_HERE'::uuid,   -- ⚠️ 위에서 복사한 pet_id 입력
  'YOUR_USER_ID_HERE'::uuid,  -- ⚠️ 실제 user_id로 교체
  'snack',
  '그리니즈',
  '덴탈 스낵 대형견용',
  'feeding',
  '2024-02-01',
  5.0,
  true,
  ARRAY['good-teeth', 'like-taste'],
  '치아 건강에 좋고 너무 좋아해요. 매일 저녁 하나씩 줍니다.'
);

-- 기록 4: 영양제 (일시 중단)
INSERT INTO review_logs (
  pet_id,
  owner_id,
  category,
  brand,
  product,
  status,
  period_start,
  rating,
  recommend,
  stop_reasons,
  excerpt,
  notes
) VALUES (
  'YOUR_PET_ID_HERE'::uuid,   -- ⚠️ 위에서 복사한 pet_id 입력
  'YOUR_USER_ID_HERE'::uuid,  -- ⚠️ 실제 user_id로 교체
  'supplement',
  '뉴트리벳',
  '관절 케어 프로',
  'paused',
  '2024-01-01',
  4.0,
  true,
  ARRAY['expensive', 'need-break'],
  '효과는 좋았는데 가격이 부담되어 일시 중단했습니다.',
  '다음 달부터 다시 급여 예정입니다.'
);


-- ============================================
-- STEP 4: 입력 결과 확인
-- ============================================
-- 반려동물 정보 확인
SELECT 
  id,
  name,
  species,
  EXTRACT(YEAR FROM AGE(birth_date))::int || '세' as age,
  weight_kg || 'kg' as weight,
  created_at
FROM pets 
WHERE owner_id = 'YOUR_USER_ID_HERE'::uuid;  -- ⚠️ 실제 user_id로 교체

-- 급여 기록 확인
SELECT 
  id,
  category,
  brand,
  product,
  status,
  period_start,
  period_end,
  rating,
  recommend,
  excerpt,
  created_at
FROM review_logs 
WHERE owner_id = 'YOUR_USER_ID_HERE'::uuid  -- ⚠️ 실제 user_id로 교체
ORDER BY created_at DESC;


-- ============================================
-- STEP 5: 웹에서 확인
-- ============================================
-- 1. 로그인 상태에서 아래 URL로 이동:
--    http://localhost:3000/owners/YOUR_USER_ID_HERE/pets/YOUR_PET_ID_HERE
--
-- 2. 확인할 내용:
--    - 반려동물 프로필이 표시되는가?
--    - 급여 기록 4개가 카테고리별로 표시되는가?
--    - 각 기록을 클릭하면 상세 내용이 보이는가?
--
-- 3. 추가 테스트:
--    - "새 로그 작성" 버튼으로 새 기록 추가
--    - 작성한 기록이 즉시 페이지에 반영되는지 확인


-- ============================================
-- STEP 6: 데이터 삭제 (테스트 종료 시)
-- ============================================
-- 테스트가 끝나면 아래 주석을 해제하고 실행하세요
-- 
-- DELETE FROM review_logs WHERE owner_id = 'YOUR_USER_ID_HERE'::uuid;
-- DELETE FROM pets WHERE owner_id = 'YOUR_USER_ID_HERE'::uuid;


-- ============================================
-- 추가: RLS 정책 확인 (문제 발생 시)
-- ============================================
-- review_logs SELECT 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'review_logs';

-- pets SELECT 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'pets';
