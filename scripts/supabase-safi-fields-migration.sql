-- ============================================
-- SAFI 필드 추가 마이그레이션
-- ============================================
-- 실행 방법: Supabase 대시보드 → SQL Editor에서 실행

-- 1. SAFI 입력 필드 추가
ALTER TABLE review_logs
ADD COLUMN IF NOT EXISTS stool_score INTEGER CHECK (stool_score >= 1 AND stool_score <= 5),
ADD COLUMN IF NOT EXISTS allergy_symptoms TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS vomiting BOOLEAN,
ADD COLUMN IF NOT EXISTS appetite_change TEXT CHECK (appetite_change IN ('INCREASED', 'NORMAL', 'DECREASED', 'REFUSED'));

-- 2. SAFI 계산 결과 필드 추가 (선택사항 - 계산된 점수 저장)
ALTER TABLE review_logs
ADD COLUMN IF NOT EXISTS safi_score NUMERIC(5,2) CHECK (safi_score >= 0 AND safi_score <= 100),
ADD COLUMN IF NOT EXISTS safi_level TEXT CHECK (safi_level IN ('SAFE', 'NORMAL', 'CAUTION')),
ADD COLUMN IF NOT EXISTS safi_detail JSONB;

-- 3. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_review_logs_safi_score ON review_logs(safi_score DESC);
CREATE INDEX IF NOT EXISTS idx_review_logs_safi_level ON review_logs(safi_level);
CREATE INDEX IF NOT EXISTS idx_review_logs_brand_product ON review_logs(brand, product);

-- 4. 기존 데이터 확인 (NULL로 시작하는 것이 정상)
SELECT 
  COUNT(*) as total_logs,
  COUNT(stool_score) as logs_with_stool_score,
  COUNT(allergy_symptoms) as logs_with_allergy_symptoms,
  COUNT(vomiting) as logs_with_vomiting,
  COUNT(appetite_change) as logs_with_appetite_change,
  COUNT(safi_score) as logs_with_safi_score
FROM review_logs;

