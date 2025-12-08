-- Brands 테이블에 transparency_score 컬럼 추가
-- 투명성 점수를 저장하는 필드 (0-100점)

-- transparency_score 컬럼 추가
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS transparency_score INTEGER DEFAULT 75 
CHECK (transparency_score >= 0 AND transparency_score <= 100);

-- 인덱스 추가 (선택사항 - 정렬 성능 향상)
CREATE INDEX IF NOT EXISTS idx_brands_transparency_score 
ON brands(transparency_score DESC);

-- 컬럼 설명 추가
COMMENT ON COLUMN brands.transparency_score IS '브랜드 투명성 점수 (0-100점, 기본값: 75)';

