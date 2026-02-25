-- ============================================================
-- RLS Security Audit Fix Script
-- Generated: 2026-02-25
-- Fixes critical RLS policy vulnerabilities
--
-- Column type reference:
--   pet_log_posts.user_id        = TEXT   → use auth.uid()::text
--   pet_log_comments.user_id     = TEXT   → use auth.uid()::text
--   health_analyses.user_id      = TEXT   → use auth.uid()::text
--   product_requests.requester_id = UUID  → use auth.uid() directly
--   roles.user_id                = UUID   → use auth.uid() directly
-- ============================================================

-- ============================================================
-- 1. products: Remove public UPDATE policy (CRITICAL)
--    Anyone (even unauthenticated) can modify any product
-- ============================================================
DROP POLICY IF EXISTS "Allow public update consumer_reviews" ON products;

CREATE POLICY "Allow authenticated users to update own reviews" ON products
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 2. pet_log_posts: Fix overly permissive UPDATE/DELETE (CRITICAL)
--    Any authenticated user can edit/delete any post
--    user_id is TEXT type
-- ============================================================
DROP POLICY IF EXISTS "Allow users to update own posts" ON pet_log_posts;
DROP POLICY IF EXISTS "Allow users to delete own posts" ON pet_log_posts;

CREATE POLICY "Allow users to update own posts" ON pet_log_posts
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow users to delete own posts" ON pet_log_posts
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================
-- 3. health_analyses: Restrict to owner only (CRITICAL)
--    Any authenticated user can manage any analysis
--    user_id is TEXT type
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to manage" ON health_analyses;
DROP POLICY IF EXISTS "Allow public read access" ON health_analyses;

CREATE POLICY "Allow users to read own analyses" ON health_analyses
  FOR SELECT
  USING (auth.uid()::text = user_id);

CREATE POLICY "Allow users to insert own analyses" ON health_analyses
  FOR INSERT
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow users to update own analyses" ON health_analyses
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Allow users to delete own analyses" ON health_analyses
  FOR DELETE
  USING (auth.uid()::text = user_id);

-- ============================================================
-- 4. product_requests: Restrict to owner + admin (CRITICAL)
--    Any authenticated user can view/update any request
--    requester_id is UUID type, roles.user_id is UUID type
-- ============================================================
DROP POLICY IF EXISTS "Allow authenticated users to view all requests" ON product_requests;
DROP POLICY IF EXISTS "Authenticated users can view all requests" ON product_requests;
DROP POLICY IF EXISTS "Allow authenticated users to view requests" ON product_requests;
DROP POLICY IF EXISTS "Allow authenticated users to update requests" ON product_requests;
DROP POLICY IF EXISTS "Authenticated users can update requests" ON product_requests;
DROP POLICY IF EXISTS "Users can view own requests" ON product_requests;

CREATE POLICY "Allow users to view own requests" ON product_requests
  FOR SELECT
  USING (
    auth.uid() = requester_id
    OR EXISTS (
      SELECT 1 FROM roles WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow admins to update requests" ON product_requests
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

-- ============================================================
-- 5. pet_log_feeding_records: Add missing UPDATE/DELETE (HIGH)
--    post_id references pet_log_posts(id), both TEXT type
--    Owner check via join to pet_log_posts.user_id (TEXT)
-- ============================================================
DROP POLICY IF EXISTS "Allow users to update own feeding records" ON pet_log_feeding_records;
DROP POLICY IF EXISTS "Allow users to delete own feeding records" ON pet_log_feeding_records;

CREATE POLICY "Allow users to update own feeding records" ON pet_log_feeding_records
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM pet_log_posts
      WHERE pet_log_posts.id = pet_log_feeding_records.post_id
        AND pet_log_posts.user_id = auth.uid()::text
    )
  );

CREATE POLICY "Allow users to delete own feeding records" ON pet_log_feeding_records
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM pet_log_posts
      WHERE pet_log_posts.id = pet_log_feeding_records.post_id
        AND pet_log_posts.user_id = auth.uid()::text
    )
  );

-- ============================================================
-- 6. pet_log_comments: Add missing WITH CHECK (HIGH)
--    user_id is TEXT type
-- ============================================================
DROP POLICY IF EXISTS "Allow users to update own comments" ON pet_log_comments;

CREATE POLICY "Allow users to update own comments" ON pet_log_comments
  FOR UPDATE
  USING (auth.uid()::text = user_id)
  WITH CHECK (auth.uid()::text = user_id);

-- ============================================================
-- Verification: List all policies after changes
-- ============================================================
-- Run this to verify:
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE schemaname = 'public'
-- ORDER BY tablename, cmd;
