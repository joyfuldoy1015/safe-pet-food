-- ============================================
-- Review Logs 테이블 간단 생성 스크립트
-- ============================================
-- 가장 기본적인 구조로 테이블 생성 (트리거 없이)
-- ============================================

-- UUID extension 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- Review Logs 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS review_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('feed', 'snack', 'supplement', 'toilet')),
  brand TEXT NOT NULL,
  product TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('feeding', 'paused', 'completed')),
  period_start DATE NOT NULL,
  period_end DATE,
  duration_days INTEGER,
  rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
  recommend BOOLEAN,
  continue_reasons TEXT[],
  stop_reasons TEXT[],
  excerpt TEXT NOT NULL,
  notes TEXT,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  admin_status TEXT DEFAULT 'visible' CHECK (admin_status IN ('visible', 'hidden', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_review_logs_pet_id ON review_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_owner_id ON review_logs(owner_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_status ON review_logs(status);
CREATE INDEX IF NOT EXISTS idx_review_logs_category ON review_logs(category);
CREATE INDEX IF NOT EXISTS idx_review_logs_created_at ON review_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_review_logs_admin_status ON review_logs(admin_status);

-- ============================================
-- RLS 활성화
-- ============================================
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS 정책
-- ============================================

-- 기존 정책 삭제 (있다면)
DROP POLICY IF EXISTS "Review logs are viewable by everyone" ON review_logs;
DROP POLICY IF EXISTS "Users can insert their own review logs" ON review_logs;
DROP POLICY IF EXISTS "Users can update their own review logs" ON review_logs;
DROP POLICY IF EXISTS "Users can delete their own review logs" ON review_logs;

-- Anyone can read review logs (only visible ones)
CREATE POLICY "Review logs are viewable by everyone"
  ON review_logs FOR SELECT
  USING (admin_status = 'visible');

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
-- 확인
-- ============================================
SELECT 'review_logs 테이블이 성공적으로 생성되었습니다!' as message;

-- 테이블 구조 확인
SELECT 
  column_name, 
  data_type, 
  column_default
FROM information_schema.columns
WHERE table_name = 'review_logs'
ORDER BY ordinal_position;
