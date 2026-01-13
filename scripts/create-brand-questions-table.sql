-- 브랜드 Q&A 테이블 생성
-- Safe Pet Food - Brand Questions Schema

-- ============================================
-- brand_questions 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS brand_questions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL DEFAULT '익명',
  question TEXT NOT NULL,
  answer TEXT,
  answered_at TIMESTAMP WITH TIME ZONE,
  is_answered BOOLEAN DEFAULT false,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_brand_questions_brand_id ON brand_questions(brand_id);
CREATE INDEX IF NOT EXISTS idx_brand_questions_user_id ON brand_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_brand_questions_created_at ON brand_questions(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE brand_questions ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책 (모든 사용자가 질문 조회 가능)
DROP POLICY IF EXISTS "Anyone can read brand questions" ON brand_questions;
CREATE POLICY "Anyone can read brand questions" ON brand_questions
  FOR SELECT USING (true);

-- 인증된 사용자만 질문 작성 가능
DROP POLICY IF EXISTS "Authenticated users can create questions" ON brand_questions;
CREATE POLICY "Authenticated users can create questions" ON brand_questions
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 본인 질문만 수정 가능
DROP POLICY IF EXISTS "Users can update own questions" ON brand_questions;
CREATE POLICY "Users can update own questions" ON brand_questions
  FOR UPDATE USING (auth.uid() = user_id);

-- 본인 질문만 삭제 가능
DROP POLICY IF EXISTS "Users can delete own questions" ON brand_questions;
CREATE POLICY "Users can delete own questions" ON brand_questions
  FOR DELETE USING (auth.uid() = user_id);

-- 컬럼 설명
COMMENT ON TABLE brand_questions IS '브랜드별 Q&A 테이블';
COMMENT ON COLUMN brand_questions.brand_id IS '브랜드 ID (brands 테이블 참조)';
COMMENT ON COLUMN brand_questions.user_id IS '질문 작성자 ID (auth.users 참조)';
COMMENT ON COLUMN brand_questions.user_name IS '질문 작성자 닉네임';
COMMENT ON COLUMN brand_questions.question IS '질문 내용';
COMMENT ON COLUMN brand_questions.answer IS '답변 내용 (브랜드 담당자)';
COMMENT ON COLUMN brand_questions.is_answered IS '답변 여부';
