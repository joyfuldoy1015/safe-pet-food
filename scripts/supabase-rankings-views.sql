-- ============================================
-- Product Rankings Views for Feeding Leaderboard
-- ============================================

-- Ensure review_logs_with_duration view exists (if not already created)
-- This view should compute duration_days for each log
CREATE OR REPLACE VIEW public.review_logs_with_duration AS
SELECT 
  rl.*,
  CASE 
    WHEN rl.period_end IS NOT NULL THEN 
      EXTRACT(DAY FROM (rl.period_end - rl.period_start))::INTEGER
    WHEN rl.status = 'feeding' THEN 
      EXTRACT(DAY FROM (CURRENT_DATE - rl.period_start))::INTEGER
    ELSE 
      rl.duration_days
  END AS duration_days
FROM public.review_logs rl;

-- ============================================
-- 1. Product Longest Feeding View
-- ============================================
-- Groups by (category, brand, product) and finds max duration_days
CREATE OR REPLACE VIEW public.product_longest_feeding AS
SELECT
  rl.category,
  rl.brand,
  rl.product,
  MAX(v.duration_days)::INTEGER AS max_days,
  COUNT(*)::INTEGER AS logs_count,
  MAX(rl.updated_at) AS last_updated
FROM public.review_logs rl
JOIN public.review_logs_with_duration v ON v.id = rl.id
WHERE v.duration_days IS NOT NULL
GROUP BY rl.category, rl.brand, rl.product;

-- ============================================
-- 2. Product Mentions View
-- ============================================
-- Counts total logs per product (mentions count)
CREATE OR REPLACE VIEW public.product_mentions AS
SELECT
  rl.category,
  rl.brand,
  rl.product,
  COUNT(*)::INTEGER AS mentions,
  MAX(rl.updated_at) AS last_updated
FROM public.review_logs rl
GROUP BY rl.category, rl.brand, rl.product;

-- ============================================
-- 3. Product Longest Feeding with Species
-- ============================================
-- Adds species filter support by joining with pets
CREATE OR REPLACE VIEW public.product_longest_feeding_with_species AS
SELECT DISTINCT
  plf.category,
  plf.brand,
  plf.product,
  plf.max_days,
  plf.logs_count,
  plf.last_updated,
  p.species
FROM public.product_longest_feeding plf
JOIN public.review_logs rl ON 
  rl.category = plf.category AND 
  rl.brand = plf.brand AND 
  rl.product = plf.product
JOIN public.pets p ON p.id = rl.pet_id
GROUP BY plf.category, plf.brand, plf.product, plf.max_days, plf.logs_count, plf.last_updated, p.species;

-- ============================================
-- Indexes for Performance
-- ============================================
CREATE INDEX IF NOT EXISTS idx_review_logs_brand_product 
  ON public.review_logs(category, brand, product);

CREATE INDEX IF NOT EXISTS idx_pets_species 
  ON public.pets(species);

CREATE INDEX IF NOT EXISTS idx_review_logs_pet_id_species 
  ON public.review_logs(pet_id);

-- ============================================
-- Grant Permissions
-- ============================================
-- Allow public read access to views (RLS will handle row-level security)
GRANT SELECT ON public.product_longest_feeding TO anon, authenticated;
GRANT SELECT ON public.product_mentions TO anon, authenticated;
GRANT SELECT ON public.product_longest_feeding_with_species TO anon, authenticated;
GRANT SELECT ON public.review_logs_with_duration TO anon, authenticated;

