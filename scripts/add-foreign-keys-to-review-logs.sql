-- ============================================
-- Review Logs에 Foreign Key 추가
-- ============================================
-- 문제: pet_id와 owner_id에 Foreign Key가 없어서
--       Supabase의 관계 쿼리(profiles!owner_id, pets!pet_id)가 작동하지 않음
-- ============================================

-- ============================================
-- STEP 1: 현재 Foreign Key 확인
-- ============================================
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'review_logs' 
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.constraint_name;

-- ============================================
-- STEP 2: pet_id에 Foreign Key 추가
-- ============================================
DO $$ 
BEGIN
  -- 먼저 기존 constraint가 있는지 확인하고 삭제
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'review_logs_pet_id_fkey' 
    AND table_name = 'review_logs'
  ) THEN
    ALTER TABLE review_logs DROP CONSTRAINT review_logs_pet_id_fkey;
  END IF;
  
  -- Foreign Key 추가
  ALTER TABLE review_logs 
  ADD CONSTRAINT review_logs_pet_id_fkey 
  FOREIGN KEY (pet_id) 
  REFERENCES pets(id) 
  ON DELETE CASCADE;
  
  RAISE NOTICE '✅ pet_id Foreign Key 추가 완료';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ pet_id Foreign Key 추가 실패: %', SQLERRM;
END $$;

-- ============================================
-- STEP 3: owner_id에 Foreign Key 추가
-- ============================================
DO $$ 
BEGIN
  -- 먼저 기존 constraint가 있는지 확인하고 삭제
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'review_logs_owner_id_fkey' 
    AND table_name = 'review_logs'
  ) THEN
    ALTER TABLE review_logs DROP CONSTRAINT review_logs_owner_id_fkey;
  END IF;
  
  -- Foreign Key 추가 (profiles 테이블로 변경)
  ALTER TABLE review_logs 
  ADD CONSTRAINT review_logs_owner_id_fkey 
  FOREIGN KEY (owner_id) 
  REFERENCES profiles(id) 
  ON DELETE CASCADE;
  
  RAISE NOTICE '✅ owner_id Foreign Key 추가 완료';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE '⚠️ owner_id Foreign Key 추가 실패: %', SQLERRM;
END $$;

-- ============================================
-- STEP 4: 최종 확인
-- ============================================
SELECT '=== Foreign Key 확인 ===' as step;
SELECT
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.table_name = 'review_logs' 
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.constraint_name;

-- ============================================
-- STEP 5: 테스트 쿼리 (실제 페이지에서 사용하는 쿼리와 동일)
-- ============================================
SELECT '=== 테스트 쿼리 ===' as step;
SELECT 
  rl.id,
  rl.brand,
  rl.product,
  rl.excerpt,
  rl.admin_status,
  p.nickname,
  pet.name as pet_name
FROM review_logs rl
LEFT JOIN profiles p ON rl.owner_id = p.id
LEFT JOIN pets pet ON rl.pet_id = pet.id
WHERE rl.admin_status = 'visible'
ORDER BY rl.created_at DESC
LIMIT 10;

SELECT '✅ 완료! 이제 /pet-log 페이지에서 데이터가 보여야 합니다!' as status;
