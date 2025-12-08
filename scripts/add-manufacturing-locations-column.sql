-- Brands 테이블에 manufacturing_locations 컬럼 추가
-- 제조 공장 위치 정보를 저장하는 배열 필드

-- manufacturing_locations 컬럼 추가 (TEXT 배열)
ALTER TABLE brands 
ADD COLUMN IF NOT EXISTS manufacturing_locations TEXT[] DEFAULT '{}';

-- 인덱스 추가 (선택사항 - 검색 성능 향상)
CREATE INDEX IF NOT EXISTS idx_brands_manufacturing_locations 
ON brands USING GIN (manufacturing_locations);

-- 기존 데이터에 대한 주석
COMMENT ON COLUMN brands.manufacturing_locations IS '제조 공장 위치 목록 (예: ["프랑스 아이메르그", "한국 김천", "미국 오클라호마"])';

