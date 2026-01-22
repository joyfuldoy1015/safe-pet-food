-- review_log_helpful 테이블 생성
-- 사용자별 '도움돼요' 기록을 저장합니다

CREATE TABLE IF NOT EXISTS review_log_helpful (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  log_id UUID NOT NULL REFERENCES review_logs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(log_id, user_id)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_review_log_helpful_log_id ON review_log_helpful(log_id);
CREATE INDEX IF NOT EXISTS idx_review_log_helpful_user_id ON review_log_helpful(user_id);

-- RLS 활성화
ALTER TABLE review_log_helpful ENABLE ROW LEVEL SECURITY;

-- RLS 정책: 모든 사용자가 조회 가능
CREATE POLICY "Anyone can view helpful marks"
ON review_log_helpful FOR SELECT
USING (true);

-- RLS 정책: 인증된 사용자만 자신의 도움돼요 추가 가능
CREATE POLICY "Users can add their own helpful mark"
ON review_log_helpful FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- RLS 정책: 인증된 사용자만 자신의 도움돼요 삭제 가능
CREATE POLICY "Users can remove their own helpful mark"
ON review_log_helpful FOR DELETE
USING (auth.uid() = user_id);
