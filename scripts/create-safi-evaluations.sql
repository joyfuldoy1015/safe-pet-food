-- SAFI 평가 저장 테이블 생성
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. safi_evaluations 테이블 생성
CREATE TABLE IF NOT EXISTS safi_evaluations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  brand_name VARCHAR(255) NOT NULL,
  product_name VARCHAR(255),  -- NULL이면 브랜드 전체 평가
  
  -- 평가 데이터
  stool_score INT NOT NULL CHECK (stool_score >= 1 AND stool_score <= 5),
  appetite_change VARCHAR(20) NOT NULL CHECK (appetite_change IN ('INCREASED', 'NORMAL', 'DECREASED', 'REFUSED')),
  vomiting BOOLEAN NOT NULL,
  allergy_symptoms TEXT[],  -- 배열로 저장
  
  -- 메타데이터
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. 인덱스 생성 (중복 평가 체크 성능 향상)
CREATE INDEX IF NOT EXISTS idx_safi_evaluations_user_brand 
  ON safi_evaluations(user_id, brand_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_safi_evaluations_user_product 
  ON safi_evaluations(user_id, brand_name, product_name, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_safi_evaluations_brand 
  ON safi_evaluations(brand_name, created_at DESC);

-- 3. RLS 활성화
ALTER TABLE safi_evaluations ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책: 모든 사용자가 평가 조회 가능 (SAFI 점수 계산용)
CREATE POLICY "Anyone can view safi evaluations"
ON safi_evaluations FOR SELECT
USING (true);

-- 5. RLS 정책: 인증된 사용자만 자신의 평가 추가 가능
CREATE POLICY "Users can add their own safi evaluation"
ON safi_evaluations FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- 6. RLS 정책: 인증된 사용자만 자신의 평가 수정 가능
CREATE POLICY "Users can update their own safi evaluation"
ON safi_evaluations FOR UPDATE
USING (auth.uid() = user_id);

-- 7. RLS 정책: 인증된 사용자만 자신의 평가 삭제 가능
CREATE POLICY "Users can delete their own safi evaluation"
ON safi_evaluations FOR DELETE
USING (auth.uid() = user_id);

-- 8. 중복 평가 방지를 위한 함수 (3개월 내 동일 브랜드/제품 평가 체크)
CREATE OR REPLACE FUNCTION check_safi_evaluation_allowed(
  p_user_id UUID,
  p_brand_name VARCHAR(255),
  p_product_name VARCHAR(255) DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  last_evaluation_date TIMESTAMP WITH TIME ZONE;
  three_months_ago TIMESTAMP WITH TIME ZONE;
BEGIN
  three_months_ago := NOW() - INTERVAL '3 months';
  
  IF p_product_name IS NOT NULL THEN
    -- 제품별 평가 체크
    SELECT created_at INTO last_evaluation_date
    FROM safi_evaluations
    WHERE user_id = p_user_id
      AND brand_name = p_brand_name
      AND product_name = p_product_name
      AND created_at > three_months_ago
    ORDER BY created_at DESC
    LIMIT 1;
  ELSE
    -- 브랜드 전체 평가 체크
    SELECT created_at INTO last_evaluation_date
    FROM safi_evaluations
    WHERE user_id = p_user_id
      AND brand_name = p_brand_name
      AND product_name IS NULL
      AND created_at > three_months_ago
    ORDER BY created_at DESC
    LIMIT 1;
  END IF;
  
  -- 3개월 내 평가가 없으면 TRUE (평가 가능)
  RETURN last_evaluation_date IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
