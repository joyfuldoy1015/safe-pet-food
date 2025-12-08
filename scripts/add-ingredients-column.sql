-- 브랜드 테이블에 ingredients 컬럼 추가
-- Safe Pet Food - Supabase Schema Update

-- ingredients 컬럼 추가 (JSONB 타입)
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS ingredients JSONB DEFAULT '[]';

-- 인덱스 추가 (선택사항 - JSONB 필드 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_brands_ingredients 
ON brands USING GIN (ingredients);

-- 컬럼 설명 추가
COMMENT ON COLUMN brands.ingredients IS '브랜드 대표 원료 정보 배열. 각 원료는 name, percentage, source, disclosure_level을 포함합니다.';

-- 예시 데이터 구조:
-- [
--   {
--     "name": "닭고기",
--     "percentage": 18,
--     "source": "프랑스산",
--     "disclosure_level": "full"
--   },
--   {
--     "name": "쌀",
--     "percentage": 15,
--     "source": "미국산",
--     "disclosure_level": "full"
--   },
--   {
--     "name": "옥수수",
--     "percentage": 12,
--     "disclosure_level": "partial"
--   },
--   {
--     "name": "동물성 지방",
--     "percentage": 8,
--     "disclosure_level": "partial"
--   },
--   {
--     "name": "식물성 단백질",
--     "percentage": 6,
--     "disclosure_level": "none"
--   }
-- ]

-- 기존 브랜드에 예시 데이터 추가 (선택사항)
-- UPDATE brands 
-- SET ingredients = '[
--   {"name": "닭고기", "percentage": 18, "source": "프랑스산", "disclosure_level": "full"},
--   {"name": "쌀", "percentage": 15, "source": "미국산", "disclosure_level": "full"},
--   {"name": "옥수수", "percentage": 12, "disclosure_level": "partial"},
--   {"name": "동물성 지방", "percentage": 8, "disclosure_level": "partial"},
--   {"name": "식물성 단백질", "percentage": 6, "disclosure_level": "none"}
-- ]'::jsonb
-- WHERE name = '로얄캐닌';

