-- 로얄캐닌 제품 데이터 확인 쿼리
-- Supabase SQL Editor에서 실행하여 데이터가 제대로 들어갔는지 확인하세요

-- 1단계: 브랜드 ID 확인
SELECT id, name FROM brands WHERE name = '로얄캐닌';

-- 2단계: 해당 브랜드의 제품 확인
SELECT 
  p.id,
  p.name,
  p.brand_id,
  b.name as brand_name,
  p.description,
  p.certifications,
  p.created_at
FROM products p
JOIN brands b ON p.brand_id = b.id
WHERE b.name = '로얄캐닌'
ORDER BY p.created_at ASC;

-- 3단계: 제품 개수 확인
SELECT 
  b.name as brand_name,
  COUNT(p.id) as product_count
FROM brands b
LEFT JOIN products p ON p.brand_id = b.id
WHERE b.name = '로얄캐닌'
GROUP BY b.id, b.name;

-- 4단계: RLS 정책 확인
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'products';

