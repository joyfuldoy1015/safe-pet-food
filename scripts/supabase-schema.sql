-- Safe Pet Food - Supabase Database Schema
-- 이 SQL을 Supabase 대시보드의 SQL Editor에서 실행하세요

-- ============================================
-- 1. Brands 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS brands (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  manufacturer TEXT NOT NULL,
  country TEXT NOT NULL,
  overall_rating DECIMAL(2,1) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  established_year INTEGER,
  product_lines TEXT[] DEFAULT '{}',
  certifications TEXT[] DEFAULT '{}',
  recall_history JSONB DEFAULT '[]',
  brand_description TEXT,
  manufacturing_info TEXT,
  brand_pros TEXT[] DEFAULT '{}',
  brand_cons TEXT[] DEFAULT '{}',
  image TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_brands_name ON brands(name);
CREATE INDEX IF NOT EXISTS idx_brands_country ON brands(country);
CREATE INDEX IF NOT EXISTS idx_brands_rating ON brands(overall_rating DESC);

ALTER TABLE brands ENABLE ROW LEVEL SECURITY;

-- 공개 읽기 정책
DROP POLICY IF EXISTS "Allow public read access" ON brands;
CREATE POLICY "Allow public read access" ON brands
  FOR SELECT USING (true);

-- 인증된 사용자만 생성/수정/삭제
DROP POLICY IF EXISTS "Allow authenticated users to manage" ON brands;
CREATE POLICY "Allow authenticated users to manage" ON brands
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 2. Pet Log Posts 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS pet_log_posts (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  pet_name TEXT NOT NULL,
  pet_breed TEXT NOT NULL,
  pet_age TEXT NOT NULL,
  pet_weight TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_avatar TEXT,
  pet_avatar TEXT,
  pet_species TEXT CHECK (pet_species IN ('dog', 'cat')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_records INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  likes INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  is_liked BOOLEAN DEFAULT false
);

CREATE INDEX IF NOT EXISTS idx_pet_log_posts_user_id ON pet_log_posts(user_id);
CREATE INDEX IF NOT EXISTS idx_pet_log_posts_created_at ON pet_log_posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_pet_log_posts_updated_at ON pet_log_posts(updated_at DESC);

ALTER TABLE pet_log_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON pet_log_posts;
CREATE POLICY "Allow public read access" ON pet_log_posts
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert" ON pet_log_posts;
CREATE POLICY "Allow authenticated users to insert" ON pet_log_posts
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow users to update own posts" ON pet_log_posts;
CREATE POLICY "Allow users to update own posts" ON pet_log_posts
  FOR UPDATE USING (auth.uid()::text = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow users to delete own posts" ON pet_log_posts;
CREATE POLICY "Allow users to delete own posts" ON pet_log_posts
  FOR DELETE USING (auth.uid()::text = user_id OR auth.role() = 'authenticated');

-- ============================================
-- 3. Pet Log Feeding Records 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS pet_log_feeding_records (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES pet_log_posts(id) ON DELETE CASCADE,
  product_name TEXT NOT NULL,
  category TEXT CHECK (category IN ('사료', '간식', '영양제', '화장실')),
  brand TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  status TEXT CHECK (status IN ('급여중', '급여완료', '급여중지')),
  duration TEXT,
  palatability INTEGER CHECK (palatability >= 1 AND palatability <= 5),
  satisfaction INTEGER CHECK (satisfaction >= 1 AND satisfaction <= 5),
  repurchase_intent BOOLEAN,
  comment TEXT,
  price TEXT,
  purchase_location TEXT,
  side_effects TEXT[] DEFAULT '{}',
  benefits TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feeding_records_post_id ON pet_log_feeding_records(post_id);
CREATE INDEX IF NOT EXISTS idx_feeding_records_status ON pet_log_feeding_records(status);

ALTER TABLE pet_log_feeding_records ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON pet_log_feeding_records;
CREATE POLICY "Allow public read access" ON pet_log_feeding_records
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert" ON pet_log_feeding_records;
CREATE POLICY "Allow authenticated users to insert" ON pet_log_feeding_records
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 4. Pet Log Comments 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS pet_log_comments (
  id TEXT PRIMARY KEY,
  post_id TEXT REFERENCES pet_log_posts(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  likes INTEGER DEFAULT 0,
  is_liked BOOLEAN DEFAULT false,
  replies JSONB DEFAULT '[]'
);

CREATE INDEX IF NOT EXISTS idx_comments_post_id ON pet_log_comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_created_at ON pet_log_comments(created_at ASC);

ALTER TABLE pet_log_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON pet_log_comments;
CREATE POLICY "Allow public read access" ON pet_log_comments
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert" ON pet_log_comments;
CREATE POLICY "Allow authenticated users to insert" ON pet_log_comments
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow users to update own comments" ON pet_log_comments;
CREATE POLICY "Allow users to update own comments" ON pet_log_comments
  FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Allow users to delete own comments" ON pet_log_comments;
CREATE POLICY "Allow users to delete own comments" ON pet_log_comments
  FOR DELETE USING (auth.uid()::text = user_id);

-- ============================================
-- 5. Feed Grade Analysis 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS feed_grade_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  feed_name TEXT NOT NULL,
  brand_name TEXT,
  category TEXT,
  raw_material_quality INTEGER CHECK (raw_material_quality >= 0 AND raw_material_quality <= 20),
  detailed_labeling INTEGER CHECK (detailed_labeling >= 0 AND detailed_labeling <= 20),
  safety INTEGER CHECK (safety >= 0 AND safety <= 20),
  nutritional_standard INTEGER CHECK (nutritional_standard >= 0 AND nutritional_standard <= 20),
  preservative_type INTEGER CHECK (preservative_type >= 0 AND preservative_type <= 20),
  total_score INTEGER,
  grade TEXT,
  strengths TEXT[] DEFAULT '{}',
  weaknesses TEXT[] DEFAULT '{}',
  recommendations TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feed_grade_analyses_user_id ON feed_grade_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_feed_grade_analyses_created_at ON feed_grade_analyses(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_feed_grade_analyses_total_score ON feed_grade_analyses(total_score DESC);

ALTER TABLE feed_grade_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON feed_grade_analyses;
CREATE POLICY "Allow public read access" ON feed_grade_analyses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to insert" ON feed_grade_analyses;
CREATE POLICY "Allow authenticated users to insert" ON feed_grade_analyses
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================
-- 6. Health Analysis 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS health_analyses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT,
  pet_name TEXT,
  pet_species TEXT,
  pet_age TEXT,
  analysis_data JSONB NOT NULL,
  analysis_result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_health_analyses_user_id ON health_analyses(user_id);
CREATE INDEX IF NOT EXISTS idx_health_analyses_created_at ON health_analyses(created_at DESC);

ALTER TABLE health_analyses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access" ON health_analyses;
CREATE POLICY "Allow public read access" ON health_analyses
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow authenticated users to manage" ON health_analyses;
CREATE POLICY "Allow authenticated users to manage" ON health_analyses
  FOR ALL USING (auth.role() = 'authenticated');

-- ============================================
-- 7. Pet Profiles 테이블
-- ============================================
CREATE TABLE IF NOT EXISTS pet_profiles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  species TEXT CHECK (species IN ('dog', 'cat')) NOT NULL,
  breed TEXT NOT NULL,
  age INTEGER,
  age_unit TEXT CHECK (age_unit IN ('개월', '세')),
  weight DECIMAL(4,2),
  weight_unit TEXT CHECK (weight_unit IN ('kg', 'g')),
  gender TEXT CHECK (gender IN ('male', 'female', 'neutered_male', 'neutered_female')),
  allergies TEXT[] DEFAULT '{}',
  health_conditions TEXT[] DEFAULT '{}',
  special_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pet_profiles_user_id ON pet_profiles(user_id);

ALTER TABLE pet_profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow users to read own profiles" ON pet_profiles;
CREATE POLICY "Allow users to read own profiles" ON pet_profiles
  FOR SELECT USING (auth.uid()::text = user_id OR auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Allow users to insert own profiles" ON pet_profiles;
CREATE POLICY "Allow users to insert own profiles" ON pet_profiles
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Allow users to update own profiles" ON pet_profiles;
CREATE POLICY "Allow users to update own profiles" ON pet_profiles
  FOR UPDATE USING (auth.uid()::text = user_id);

DROP POLICY IF EXISTS "Allow users to delete own profiles" ON pet_profiles;
CREATE POLICY "Allow users to delete own profiles" ON pet_profiles
  FOR DELETE USING (auth.uid()::text = user_id);

-- ============================================
-- 8. Updated At 트리거 함수
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 적용
DROP TRIGGER IF EXISTS update_brands_updated_at ON brands;
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pet_log_posts_updated_at ON pet_log_posts;
CREATE TRIGGER update_pet_log_posts_updated_at BEFORE UPDATE ON pet_log_posts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_feed_grade_analyses_updated_at ON feed_grade_analyses;
CREATE TRIGGER update_feed_grade_analyses_updated_at BEFORE UPDATE ON feed_grade_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_health_analyses_updated_at ON health_analyses;
CREATE TRIGGER update_health_analyses_updated_at BEFORE UPDATE ON health_analyses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_pet_profiles_updated_at ON pet_profiles;
CREATE TRIGGER update_pet_profiles_updated_at BEFORE UPDATE ON pet_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 완료!
-- ============================================
-- 이제 데이터베이스 스키마가 준비되었습니다.
-- 다음 단계: 기존 JSON 데이터 마이그레이션

