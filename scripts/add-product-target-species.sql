-- products 테이블에 target_species 컬럼 추가
-- 값: 'dog', 'cat', 'all'

ALTER TABLE products
  ADD COLUMN IF NOT EXISTS target_species text DEFAULT 'all';

COMMENT ON COLUMN products.target_species IS '대상 동물: dog(강아지), cat(고양이), all(전체)';

-- 기존 제품 자동 분류 (제품명 기반)
-- 고양이 사료
UPDATE products
SET target_species = 'cat'
WHERE target_species = 'all'
  AND (
    name ILIKE '%캣%'
    OR name ILIKE '%cat%'
    OR name ILIKE '%키튼%'
    OR name ILIKE '%kitten%'
    OR name ILIKE '%고양이%'
  );

-- 강아지 사료
UPDATE products
SET target_species = 'dog'
WHERE target_species = 'all'
  AND (
    name ILIKE '%독%'
    OR name ILIKE '%dog%'
    OR name ILIKE '%퍼피%'
    OR name ILIKE '%puppy%'
    OR name ILIKE '%강아지%'
  );

-- 확인 쿼리
SELECT id, name, target_species FROM products ORDER BY target_species, name;
