-- brands 테이블에 대표 제품 ID 컬럼 추가
ALTER TABLE brands
  ADD COLUMN IF NOT EXISTS representative_product_id uuid REFERENCES products(id);

COMMENT ON COLUMN brands.representative_product_id IS '원료 투명성 점수 산정에 사용되는 대표 제품 ID';

-- 기존 representative_product(텍스트)와 매칭하여 자동 연결
UPDATE brands b
SET representative_product_id = p.id
FROM products p
WHERE b.representative_product IS NOT NULL
  AND b.representative_product != ''
  AND p.brand_id = b.id
  AND p.name ILIKE '%' || b.representative_product || '%';

-- 확인 쿼리
SELECT
  b.name AS brand_name,
  b.representative_product AS product_text,
  b.representative_product_id,
  p.name AS matched_product_name
FROM brands b
LEFT JOIN products p ON b.representative_product_id = p.id
ORDER BY b.name;
