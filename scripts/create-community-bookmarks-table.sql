-- =====================================================
-- Community Bookmarks Table
-- 사용자가 북마크한 Q&A 게시글 저장
-- =====================================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. community_bookmarks 테이블 생성
CREATE TABLE IF NOT EXISTS community_bookmarks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES community_questions(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 중복 방지: 같은 사용자가 같은 질문을 두 번 북마크할 수 없음
  UNIQUE(user_id, question_id)
);

-- 2. 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_bookmarks_user_id ON community_bookmarks(user_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_question_id ON community_bookmarks(question_id);
CREATE INDEX IF NOT EXISTS idx_bookmarks_created_at ON community_bookmarks(created_at DESC);

-- 3. RLS (Row Level Security) 활성화
ALTER TABLE community_bookmarks ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 생성

-- 정책 1: 본인의 북마크만 조회 가능
DROP POLICY IF EXISTS "Users can view own bookmarks" ON community_bookmarks;
CREATE POLICY "Users can view own bookmarks"
  ON community_bookmarks FOR SELECT
  USING (auth.uid() = user_id);

-- 정책 2: 본인의 북마크만 생성 가능
DROP POLICY IF EXISTS "Users can create own bookmarks" ON community_bookmarks;
CREATE POLICY "Users can create own bookmarks"
  ON community_bookmarks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 정책 3: 본인의 북마크만 삭제 가능
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON community_bookmarks;
CREATE POLICY "Users can delete own bookmarks"
  ON community_bookmarks FOR DELETE
  USING (auth.uid() = user_id);

-- 5. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_bookmarks_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_community_bookmarks_updated_at ON community_bookmarks;
CREATE TRIGGER update_community_bookmarks_updated_at
  BEFORE UPDATE ON community_bookmarks
  FOR EACH ROW
  EXECUTE FUNCTION update_bookmarks_updated_at();

-- 6. 테이블 코멘트
COMMENT ON TABLE community_bookmarks IS '사용자가 북마크한 Q&A 게시글';
COMMENT ON COLUMN community_bookmarks.user_id IS '북마크한 사용자 ID (profiles 테이블 참조)';
COMMENT ON COLUMN community_bookmarks.question_id IS '북마크된 질문 ID (community_questions 테이블 참조)';

-- 완료 메시지
DO $$
BEGIN
  RAISE NOTICE '✅ community_bookmarks 테이블 생성 완료';
  RAISE NOTICE '✅ RLS 정책 설정 완료';
  RAISE NOTICE '✅ 인덱스 생성 완료';
END $$;
