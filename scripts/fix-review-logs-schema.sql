-- ============================================
-- Review Logs Schema 수정 스크립트
-- ============================================
-- 문제: admin_status 컬럼이 없는데 RLS 정책에서 참조함
-- 해결: admin_status 컬럼 추가
-- ============================================

-- ============================================
-- STEP 1: admin_status 컬럼 추가
-- ============================================
ALTER TABLE review_logs 
ADD COLUMN IF NOT EXISTS admin_status TEXT DEFAULT 'visible' 
CHECK (admin_status IN ('visible', 'hidden', 'deleted'));

-- ============================================
-- STEP 2: 기존 데이터에 기본값 설정
-- ============================================
UPDATE review_logs 
SET admin_status = 'visible' 
WHERE admin_status IS NULL;

-- ============================================
-- STEP 3: RLS 정책 재생성
-- ============================================

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Review logs are viewable by everyone" ON review_logs;
DROP POLICY IF EXISTS "Users can insert their own review logs" ON review_logs;
DROP POLICY IF EXISTS "Users can update their own review logs" ON review_logs;
DROP POLICY IF EXISTS "Users can delete their own review logs" ON review_logs;

-- Anyone can read review logs (only visible ones)
CREATE POLICY "Review logs are viewable by everyone"
  ON review_logs FOR SELECT
  USING (admin_status = 'visible' OR admin_status IS NULL);

-- Users can insert review logs for themselves
CREATE POLICY "Users can insert their own review logs"
  ON review_logs FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can update their own review logs
CREATE POLICY "Users can update their own review logs"
  ON review_logs FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Users can delete their own review logs
CREATE POLICY "Users can delete their own review logs"
  ON review_logs FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================
-- STEP 4: 확인
-- ============================================
-- 테이블 구조 확인
SELECT 
  column_name, 
  data_type, 
  is_nullable, 
  column_default
FROM information_schema.columns
WHERE table_name = 'review_logs'
ORDER BY ordinal_position;

-- RLS 정책 확인
SELECT 
  policyname,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'review_logs';
