-- 제품군별 상세 분석을 위한 products 테이블 생성
-- Safe Pet Food - Supabase Schema Update

-- ============================================
-- Products 테이블 생성
-- ============================================
CREATE TABLE IF NOT EXISTS products (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  brand_id UUID REFERENCES brands(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  image TEXT,
  description TEXT,
  certifications TEXT[] DEFAULT '{}',
  origin_info JSONB DEFAULT '{}',
  ingredients TEXT[] DEFAULT '{}',
  guaranteed_analysis JSONB DEFAULT '{}',
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  consumer_ratings JSONB DEFAULT '{}',
  community_feedback JSONB DEFAULT '{}',
  consumer_reviews JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_products_brand_id ON products(brand_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
DROP POLICY IF EXISTS "Allow public read access" ON products;
CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

-- 인증된 사용자만 생성/수정/삭제
DROP POLICY IF EXISTS "Allow authenticated users to manage" ON products;
CREATE POLICY "Allow authenticated users to manage" ON products
  FOR ALL USING (auth.role() = 'authenticated');

-- 컬럼 설명 추가
COMMENT ON TABLE products IS '브랜드별 제품 상세 정보 테이블. 제품군별 상세 분석에 사용됩니다.';
COMMENT ON COLUMN products.brand_id IS '브랜드 ID (brands 테이블 참조)';
COMMENT ON COLUMN products.origin_info IS '원산지 및 제조 정보 JSONB: {country_of_origin, manufacturing_country, manufacturing_facilities[]}';
COMMENT ON COLUMN products.guaranteed_analysis IS '등록성분량 JSONB: {protein, fat, fiber, moisture, ash, calcium, phosphorus}';
COMMENT ON COLUMN products.consumer_ratings IS '소비자 평가 JSONB: {palatability, digestibility, coat_quality, stool_quality, overall_satisfaction}';
COMMENT ON COLUMN products.community_feedback IS '커뮤니티 피드백 JSONB: {recommend_yes, recommend_no, total_votes}';
COMMENT ON COLUMN products.consumer_reviews IS '소비자 리뷰 배열 JSONB: [{id, user_name, rating, comment, date, helpful_count}]';

-- 예시 데이터 구조:
-- origin_info: {
--   "country_of_origin": "프랑스",
--   "manufacturing_country": "한국",
--   "manufacturing_facilities": ["김천공장"]
-- }
--
-- guaranteed_analysis: {
--   "protein": "27% 이상",
--   "fat": "13% 이상",
--   "fiber": "5% 이하",
--   "moisture": "10% 이하",
--   "ash": "8.1% 이하"
-- }
--
-- consumer_ratings: {
--   "palatability": 4.2,
--   "digestibility": 4.0,
--   "coat_quality": 4.3,
--   "stool_quality": 3.8,
--   "overall_satisfaction": 4.1
-- }
--
-- community_feedback: {
--   "recommend_yes": 847,
--   "recommend_no": 203,
--   "total_votes": 1050
-- }
--
-- consumer_reviews: [
--   {
--     "id": "r1",
--     "user_name": "고양이맘123",
--     "rating": 4,
--     "comment": "우리 고양이가 정말 잘 먹어요...",
--     "date": "2024-12-15",
--     "helpful_count": 12
--   }
-- ]

-- 예시 데이터 추가 (선택사항)
-- 먼저 brands 테이블에서 브랜드 ID를 확인한 후 실행하세요
-- SELECT id, name FROM brands WHERE name = '로얄캐닌';
--
-- UPDATE brands SET id = '브랜드-ID' WHERE name = '로얄캐닌';
--
-- INSERT INTO products (
--   brand_id,
--   name,
--   image,
--   description,
--   certifications,
--   origin_info,
--   ingredients,
--   guaranteed_analysis,
--   pros,
--   cons,
--   consumer_ratings,
--   community_feedback,
--   consumer_reviews
-- ) VALUES (
--   '브랜드-ID',
--   '로얄캐닌 인도어 성묘용',
--   '🏠',
--   '실내에서 생활하는 성묘를 위한 전용 사료로, 헤어볼 케어와 체중 관리에 도움을 줍니다.',
--   ARRAY['AAFCO', 'FEDIAF', 'HACCP'],
--   '{"country_of_origin": "프랑스", "manufacturing_country": "한국", "manufacturing_facilities": ["김천공장"]}'::jsonb,
--   ARRAY['닭고기분', '쌀', '옥수수', '동물성지방', '식물성단백질', '비트펄프', '어유', '대두유', '프락토올리고당', '차전자피', '루테인'],
--   '{"protein": "27% 이상", "fat": "13% 이상", "fiber": "5% 이하", "moisture": "10% 이하", "ash": "8.1% 이하"}'::jsonb,
--   ARRAY['헤어볼 배출에 효과적인 섬유질 함량', '실내 고양이의 활동량을 고려한 적절한 칼로리', '소화율이 높아 배변 냄새 감소', '오메가-3 지방산으로 모질 개선'],
--   ARRAY['옥수수 함량이 높아 알레르기 유발 가능성', '인공 보존료 사용', '상대적으로 높은 가격'],
--   '{"palatability": 4.2, "digestibility": 4.0, "coat_quality": 4.3, "stool_quality": 3.8, "overall_satisfaction": 4.1}'::jsonb,
--   '{"recommend_yes": 847, "recommend_no": 203, "total_votes": 1050}'::jsonb,
--   '[{"id": "r1", "user_name": "고양이맘123", "rating": 4, "comment": "우리 고양이가 정말 잘 먹어요. 헤어볼도 확실히 줄어든 것 같고, 변 냄새도 많이 개선되었습니다.", "date": "2024-12-15", "helpful_count": 12}]'::jsonb
-- );

