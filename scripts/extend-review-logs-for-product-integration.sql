-- ============================================
-- 급여 후기 - 제품 평가 연동 시스템
-- review_logs 테이블 확장
-- ============================================

-- 1. 제품 ID 컬럼 추가 (제품 상세와 연결)
ALTER TABLE review_logs 
ADD COLUMN IF NOT EXISTS product_id TEXT;

-- 2. 세부 평가 점수 컬럼 추가 (1-5 점수)
ALTER TABLE review_logs 
ADD COLUMN IF NOT EXISTS palatability_score INTEGER CHECK (palatability_score >= 1 AND palatability_score <= 5);

ALTER TABLE review_logs 
ADD COLUMN IF NOT EXISTS digestibility_score INTEGER CHECK (digestibility_score >= 1 AND digestibility_score <= 5);

ALTER TABLE review_logs 
ADD COLUMN IF NOT EXISTS coat_quality_score INTEGER CHECK (coat_quality_score >= 1 AND coat_quality_score <= 5);

ALTER TABLE review_logs 
ADD COLUMN IF NOT EXISTS stool_quality_score INTEGER CHECK (stool_quality_score >= 1 AND stool_quality_score <= 5);

-- 3. 리뷰 도움됨 카운트
ALTER TABLE review_logs 
ADD COLUMN IF NOT EXISTS helpful_count INTEGER DEFAULT 0;

-- 4. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_review_logs_product_id ON review_logs(product_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_brand ON review_logs(brand);
CREATE INDEX IF NOT EXISTS idx_review_logs_recommend ON review_logs(recommend);

-- 5. 코멘트 추가
COMMENT ON COLUMN review_logs.product_id IS '제품 ID (products 테이블 연결용)';
COMMENT ON COLUMN review_logs.palatability_score IS '기호성 평가 (1-5)';
COMMENT ON COLUMN review_logs.digestibility_score IS '소화력 평가 (1-5)';
COMMENT ON COLUMN review_logs.coat_quality_score IS '털 상태 평가 (1-5)';
COMMENT ON COLUMN review_logs.stool_quality_score IS '변 상태 평가 (1-5)';
COMMENT ON COLUMN review_logs.helpful_count IS '도움됨 카운트';

-- ============================================
-- 완료!
-- 이제 급여 후기 작성 시 세부 평가가 자동으로 제품 상세에 반영됩니다.
-- ============================================
