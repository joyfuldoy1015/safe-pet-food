-- products 테이블의 시드 데이터(consumer_reviews, consumer_ratings) 정리
-- 실행 후에는 review_logs의 실제 사용자 리뷰 데이터만 브랜드 상세에 표시됨

-- 1. consumer_reviews (시드 리뷰) 비우기
UPDATE products
SET consumer_reviews = '[]'::jsonb
WHERE consumer_reviews IS NOT NULL
  AND consumer_reviews != '[]'::jsonb;

-- 2. consumer_ratings (시드 별점) 초기화
UPDATE products
SET consumer_ratings = '{"palatability": 0, "digestibility": 0, "coat_quality": 0, "stool_quality": 0, "overall_satisfaction": 0}'::jsonb
WHERE consumer_ratings IS NOT NULL;

-- 확인 쿼리: 정리 후 상태 확인
SELECT id, name,
  consumer_reviews,
  consumer_ratings
FROM products
LIMIT 10;
