-- ============================================================
-- RLS Security Audit Fix Script (v2)
-- Updated: 2026-02-25
-- 현재 pg_policies CSV 기반으로 정확히 매칭
--
-- ⚠️ Supabase Dashboard > SQL Editor에서 실행
-- ⚠️ 실행 후 하단 검증 쿼리로 적용 확인
-- ============================================================

-- ============================================================
-- 1. products: 과도한 ALL 정책 제거 (CRITICAL)
--    현재: "Allow authenticated users to manage" (ALL) → 누구나 INSERT/DELETE 가능
--    변경: SELECT 공개, UPDATE 인증자, INSERT admin 전용
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to manage" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update own reviews" ON products;
DROP POLICY IF EXISTS "Allow public update consumer_reviews" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON products;
DROP POLICY IF EXISTS "Allow authenticated users to update products" ON products;
DROP POLICY IF EXISTS "Allow admin to insert products" ON products;

CREATE POLICY "Allow authenticated users to update products" ON products
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow admin to insert products" ON products
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 2. brands: 완전 개방 상태 정리 (CRITICAL)
--    현재: "Enable all access for all users" (ALL, true/true)
--         + 중복 정책 다수 → 비인증자도 모든 작업 가능
--    변경: SELECT 공개, INSERT/UPDATE/DELETE admin 전용
-- ============================================================
DROP POLICY IF EXISTS "Enable all access for all users" ON brands;
DROP POLICY IF EXISTS "Allow authenticated users to manage" ON brands;
DROP POLICY IF EXISTS "Enable delete for all users" ON brands;
DROP POLICY IF EXISTS "Allow authenticated users to delete" ON brands;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON brands;
DROP POLICY IF EXISTS "Enable insert for all users" ON brands;
DROP POLICY IF EXISTS "Allow public read access" ON brands;
DROP POLICY IF EXISTS "Enable read access for all users" ON brands;
DROP POLICY IF EXISTS "Allow authenticated users to update" ON brands;
DROP POLICY IF EXISTS "Enable update for all users" ON brands;

CREATE POLICY "Allow public read access" ON brands
  FOR SELECT USING (true);

CREATE POLICY "Allow admin to insert brands" ON brands
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow admin to update brands" ON brands
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow admin to delete brands" ON brands
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================
-- 3. pet_log_comments: INSERT 스푸핑 방지 (HIGH)
--    현재: "Allow authenticated users to insert" → user_id 검증 없음
--    변경: 본인 ID로만 삽입 가능
--    (DELETE, UPDATE는 이미 소유자 확인 적용됨)
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON pet_log_comments;
DROP POLICY IF EXISTS "Allow users to insert own comments" ON pet_log_comments;

CREATE POLICY "Allow users to insert own comments" ON pet_log_comments
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

-- ============================================================
-- 4. pet_log_feeding_records: INSERT 강화 (HIGH)
--    현재: "Allow authenticated users to insert feeding records"
--          WITH CHECK (true) → 타인 포스트에 기록 삽입 가능
--    변경: 본인 포스트에만 기록 삽입 가능
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to insert feeding records" ON pet_log_feeding_records;
DROP POLICY IF EXISTS "Allow users to insert own feeding records" ON pet_log_feeding_records;
DROP POLICY IF EXISTS "Allow users to insert feeding records" ON pet_log_feeding_records;
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON pet_log_feeding_records;

CREATE POLICY "Allow users to insert own feeding records" ON pet_log_feeding_records
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM pet_log_posts
      WHERE pet_log_posts.id = post_id
        AND pet_log_posts.user_id = auth.uid()::text
    )
  );

-- ============================================================
-- 아래 섹션은 이미 적용 완료 (재실행해도 안전)
-- CSV에서 정상 확인된 항목들
-- ============================================================

-- pet_log_posts: 소유자 전용 (이미 적용됨 ✅)
-- health_analyses: 소유자 전용 (이미 적용됨 ✅)
-- product_requests: 소유자+admin (이미 적용됨 ✅)
-- pet_log_feeding_records UPDATE/DELETE: 소유자 확인 (이미 적용됨 ✅)
-- pet_log_comments UPDATE/DELETE: 소유자 확인 (이미 적용됨 ✅)

-- ============================================================
-- Verification: 실행 후 이 쿼리로 결과 확인
-- ============================================================
-- SELECT tablename, policyname, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
--   AND tablename IN ('products', 'brands', 'pet_log_comments', 'pet_log_feeding_records')
-- ORDER BY tablename, cmd;
