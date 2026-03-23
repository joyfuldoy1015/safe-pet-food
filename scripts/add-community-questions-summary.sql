-- community_questions 테이블에 AI 요약 컬럼 추가
-- Supabase Dashboard > SQL Editor에서 실행

ALTER TABLE community_questions
  ADD COLUMN IF NOT EXISTS summary TEXT;

COMMENT ON COLUMN community_questions.summary IS 'AI(GPT-4o-mini)가 생성한 질문 요약. 200자 이상 본문에 대해 사용자 승인 후 저장';
