-- ============================================
-- Authoring Schema Patches
-- Safe Pet Food - Feeding Reviews, Q&A, Brand Ratings
-- ============================================

-- ============================================
-- 1. Review Logs: Add feed-only fields
-- ============================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'review_logs') THEN
    -- Add feed-only fields (optional, only for category='feed')
    ALTER TABLE public.review_logs 
      ADD COLUMN IF NOT EXISTS kcal_per_kg NUMERIC(8,2) CHECK (kcal_per_kg > 0),
      ADD COLUMN IF NOT EXISTS dosage_unit TEXT CHECK (LENGTH(dosage_unit) <= 20),
      ADD COLUMN IF NOT EXISTS dosage_value NUMERIC(8,2) CHECK (dosage_value > 0);
    
    -- Add constraint: feed-only fields should only be set when category is 'feed'
    -- Note: This is enforced at application level, but we can add a check constraint
    -- However, PostgreSQL doesn't support conditional NOT NULL, so we'll rely on app validation
  END IF;
END $$;

-- ============================================
-- 2. Review Logs: Update brand/product length constraints
-- ============================================
-- Note: PostgreSQL TEXT doesn't have length limit, but we enforce at application level
-- Add check constraints for length
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'review_logs') THEN
    -- Drop existing constraints if they exist
    ALTER TABLE public.review_logs DROP CONSTRAINT IF EXISTS check_brand_length;
    ALTER TABLE public.review_logs DROP CONSTRAINT IF EXISTS check_product_length;
    ALTER TABLE public.review_logs DROP CONSTRAINT IF EXISTS check_excerpt_length;
    ALTER TABLE public.review_logs DROP CONSTRAINT IF EXISTS check_notes_length;
    
    -- Add length constraints
    ALTER TABLE public.review_logs 
      ADD CONSTRAINT check_brand_length CHECK (LENGTH(TRIM(brand)) >= 1 AND LENGTH(brand) <= 120),
      ADD CONSTRAINT check_product_length CHECK (LENGTH(TRIM(product)) >= 1 AND LENGTH(product) <= 120),
      ADD CONSTRAINT check_excerpt_length CHECK (LENGTH(TRIM(excerpt)) >= 1 AND LENGTH(excerpt) <= 80),
      ADD CONSTRAINT check_notes_length CHECK (notes IS NULL OR LENGTH(notes) <= 3000);
  END IF;
END $$;

-- ============================================
-- 3. Review Logs: Update continue_reasons and stop_reasons constraints
-- ============================================
-- Note: Array length constraints are enforced at application level
-- PostgreSQL arrays don't have built-in length constraints

-- ============================================
-- 4. Q&A Threads: Add admin_status
-- ============================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'qa_threads') THEN
    ALTER TABLE public.qa_threads 
      ADD COLUMN IF NOT EXISTS admin_status TEXT DEFAULT 'visible' 
      CHECK (admin_status IN ('visible', 'hidden', 'deleted'));
    
    -- Add length constraint for title
    ALTER TABLE public.qa_threads DROP CONSTRAINT IF EXISTS check_title_length;
    ALTER TABLE public.qa_threads 
      ADD CONSTRAINT check_title_length CHECK (LENGTH(TRIM(title)) >= 1 AND LENGTH(title) <= 120);
  END IF;
END $$;

-- ============================================
-- 5. Q&A Posts: Add admin_status
-- ============================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'qa_posts') THEN
    ALTER TABLE public.qa_posts 
      ADD COLUMN IF NOT EXISTS admin_status TEXT DEFAULT 'visible' 
      CHECK (admin_status IN ('visible', 'hidden', 'deleted'));
    
    -- Add length constraint for content
    ALTER TABLE public.qa_posts DROP CONSTRAINT IF EXISTS check_content_length;
    ALTER TABLE public.qa_posts 
      ADD CONSTRAINT check_content_length CHECK (LENGTH(TRIM(content)) >= 10 AND LENGTH(content) <= 5000);
  END IF;
END $$;

-- ============================================
-- 6. Brand Ratings: Create table if not exists
-- ============================================
CREATE TABLE IF NOT EXISTS public.brand_ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  species TEXT NOT NULL CHECK (species IN ('dog', 'cat')),
  brand TEXT NOT NULL CHECK (LENGTH(TRIM(brand)) >= 1 AND LENGTH(brand) <= 120),
  product TEXT CHECK (product IS NULL OR (LENGTH(TRIM(product)) >= 0 AND LENGTH(product) <= 120)),
  rating NUMERIC(2,1) NOT NULL CHECK (rating >= 1 AND rating <= 5),
  pros TEXT[] DEFAULT '{}',
  cons TEXT[] DEFAULT '{}',
  comment TEXT CHECK (comment IS NULL OR LENGTH(comment) <= 2000),
  admin_status TEXT DEFAULT 'visible' CHECK (admin_status IN ('visible', 'hidden', 'deleted')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_brand_ratings_author_id ON public.brand_ratings(author_id);
CREATE INDEX IF NOT EXISTS idx_brand_ratings_species ON public.brand_ratings(species);
CREATE INDEX IF NOT EXISTS idx_brand_ratings_brand ON public.brand_ratings(brand);
CREATE INDEX IF NOT EXISTS idx_brand_ratings_rating ON public.brand_ratings(rating DESC);
CREATE INDEX IF NOT EXISTS idx_brand_ratings_admin_status ON public.brand_ratings(admin_status);
CREATE INDEX IF NOT EXISTS idx_brand_ratings_created_at ON public.brand_ratings(created_at DESC);

-- Update updated_at trigger
DROP TRIGGER IF EXISTS update_brand_ratings_updated_at ON public.brand_ratings;
CREATE TRIGGER update_brand_ratings_updated_at
  BEFORE UPDATE ON public.brand_ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 7. Brand Ratings: RLS Policies
-- ============================================
ALTER TABLE public.brand_ratings ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Brand ratings are viewable by everyone" ON public.brand_ratings;
DROP POLICY IF EXISTS "Users can insert their own brand ratings" ON public.brand_ratings;
DROP POLICY IF EXISTS "Users can update their own brand ratings" ON public.brand_ratings;
DROP POLICY IF EXISTS "Users can delete their own brand ratings" ON public.brand_ratings;

-- Anyone can read visible brand ratings
CREATE POLICY "Brand ratings are viewable by everyone"
  ON public.brand_ratings FOR SELECT
  USING (admin_status = 'visible' OR admin_status IS NULL);

-- Users can insert their own brand ratings
CREATE POLICY "Users can insert their own brand ratings"
  ON public.brand_ratings FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own brand ratings
CREATE POLICY "Users can update their own brand ratings"
  ON public.brand_ratings FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Users can delete their own brand ratings
CREATE POLICY "Users can delete their own brand ratings"
  ON public.brand_ratings FOR DELETE
  USING (auth.uid() = author_id);

-- ============================================
-- 8. Q&A Threads: Update RLS to filter admin_status
-- ============================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'qa_threads') THEN
    -- Drop existing policy
    DROP POLICY IF EXISTS "qa_threads read all" ON public.qa_threads;
    
    -- Create new policy with admin_status filter
    CREATE POLICY "qa_threads read all"
      ON public.qa_threads FOR SELECT
      USING (admin_status = 'visible' OR admin_status IS NULL);
  END IF;
END $$;

-- ============================================
-- 9. Q&A Posts: Update RLS to filter admin_status
-- ============================================
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'qa_posts') THEN
    -- Drop existing policy
    DROP POLICY IF EXISTS "qa_posts read all" ON public.qa_posts;
    
    -- Create new policy with admin_status filter
    CREATE POLICY "qa_posts read all"
      ON public.qa_posts FOR SELECT
      USING (admin_status = 'visible' OR admin_status IS NULL);
  END IF;
END $$;

