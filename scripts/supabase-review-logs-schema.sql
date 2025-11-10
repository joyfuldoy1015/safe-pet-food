-- ============================================
-- Review Logs Schema with RLS
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 1. Profiles Table
-- ============================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nickname TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 2. Pets Table
-- ============================================
CREATE TABLE IF NOT EXISTS pets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat')),
  birth_date DATE NOT NULL,
  weight_kg NUMERIC(5,2),
  tags TEXT[] DEFAULT '{}',
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 3. Review Logs Table
-- ============================================
CREATE TABLE IF NOT EXISTS review_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  category TEXT NOT NULL CHECK (category IN ('feed', 'snack', 'supplement', 'toilet')),
  brand TEXT NOT NULL,
  product TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('feeding', 'paused', 'completed')),
  period_start DATE NOT NULL,
  period_end DATE,
  duration_days INTEGER,
  rating NUMERIC(2,1) CHECK (rating >= 0 AND rating <= 5),
  recommend BOOLEAN,
  continue_reasons TEXT[] DEFAULT '{}',
  stop_reasons TEXT[] DEFAULT '{}',
  excerpt TEXT NOT NULL,
  notes TEXT,
  likes INTEGER DEFAULT 0,
  views INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT check_period_end CHECK (
    (status = 'completed' AND period_end IS NOT NULL) OR
    (status != 'completed')
  )
);

-- ============================================
-- 4. Comments Table
-- ============================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  log_id UUID NOT NULL REFERENCES review_logs(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX IF NOT EXISTS idx_pets_owner_id ON pets(owner_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_pet_id ON review_logs(pet_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_owner_id ON review_logs(owner_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_status ON review_logs(status);
CREATE INDEX IF NOT EXISTS idx_review_logs_category ON review_logs(category);
CREATE INDEX IF NOT EXISTS idx_review_logs_created_at ON review_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_comments_log_id ON comments(log_id);
CREATE INDEX IF NOT EXISTS idx_comments_author_id ON comments(author_id);
CREATE INDEX IF NOT EXISTS idx_comments_parent_id ON comments(parent_id);

-- ============================================
-- Functions
-- ============================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Calculate duration_days
CREATE OR REPLACE FUNCTION calculate_duration_days()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.period_end IS NOT NULL AND NEW.period_start IS NOT NULL THEN
    NEW.duration_days = EXTRACT(DAY FROM (NEW.period_end - NEW.period_start))::INTEGER;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Update comments_count
CREATE OR REPLACE FUNCTION update_comments_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE review_logs
    SET comments_count = comments_count + 1
    WHERE id = NEW.log_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE review_logs
    SET comments_count = GREATEST(comments_count - 1, 0)
    WHERE id = OLD.log_id;
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- Triggers
-- ============================================

-- Drop existing triggers if they exist (idempotent)
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
DROP TRIGGER IF EXISTS update_pets_updated_at ON pets;
DROP TRIGGER IF EXISTS update_review_logs_updated_at ON review_logs;
DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
DROP TRIGGER IF EXISTS calculate_review_logs_duration ON review_logs;
DROP TRIGGER IF EXISTS update_review_logs_comments_count ON comments;

-- Update updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pets_updated_at
  BEFORE UPDATE ON pets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_review_logs_updated_at
  BEFORE UPDATE ON review_logs
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
  BEFORE UPDATE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Calculate duration_days
CREATE TRIGGER calculate_review_logs_duration
  BEFORE INSERT OR UPDATE ON review_logs
  FOR EACH ROW
  EXECUTE FUNCTION calculate_duration_days();

-- Update comments_count
CREATE TRIGGER update_review_logs_comments_count
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_comments_count();

-- ============================================
-- Row Level Security (RLS)
-- ============================================

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pets ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- Profiles RLS Policies
-- ============================================
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON profiles;

-- Anyone can read profiles
CREATE POLICY "Profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

-- Users can insert their own profile
CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- ============================================
-- Pets RLS Policies
-- ============================================
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Pets are viewable by everyone" ON pets;
DROP POLICY IF EXISTS "Users can insert their own pets" ON pets;
DROP POLICY IF EXISTS "Users can update their own pets" ON pets;
DROP POLICY IF EXISTS "Users can delete their own pets" ON pets;

-- Anyone can read pets
CREATE POLICY "Pets are viewable by everyone"
  ON pets FOR SELECT
  USING (true);

-- Users can insert pets for themselves
CREATE POLICY "Users can insert their own pets"
  ON pets FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can update their own pets
CREATE POLICY "Users can update their own pets"
  ON pets FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Users can delete their own pets
CREATE POLICY "Users can delete their own pets"
  ON pets FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================
-- Review Logs RLS Policies
-- ============================================
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Review logs are viewable by everyone" ON review_logs;
DROP POLICY IF EXISTS "Users can insert their own review logs" ON review_logs;
DROP POLICY IF EXISTS "Users can update their own review logs" ON review_logs;
DROP POLICY IF EXISTS "Users can delete their own review logs" ON review_logs;

-- Anyone can read review logs (only visible ones)
CREATE POLICY "Review logs are viewable by everyone"
  ON review_logs FOR SELECT
  USING (admin_status = 'visible' OR admin_status IS NULL);

-- Users can insert review logs for themselves
CREATE POLICY "Users can insert their own review logs"
  ON review_logs FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

-- Users can update their own review logs
CREATE POLICY "Users can update their own review logs"
  ON review_logs FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Users can delete their own review logs
CREATE POLICY "Users can delete their own review logs"
  ON review_logs FOR DELETE
  USING (auth.uid() = owner_id);

-- ============================================
-- Comments RLS Policies
-- ============================================
-- Drop existing policies if they exist (idempotent)
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON comments;
DROP POLICY IF EXISTS "Authenticated users can insert comments" ON comments;
DROP POLICY IF EXISTS "Users can update their own comments" ON comments;
DROP POLICY IF EXISTS "Users can delete their own comments" ON comments;

-- Anyone can read comments
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

-- Authenticated users can insert comments
CREATE POLICY "Authenticated users can insert comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own comments
CREATE POLICY "Users can update their own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Users can delete their own comments
CREATE POLICY "Users can delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = author_id);

