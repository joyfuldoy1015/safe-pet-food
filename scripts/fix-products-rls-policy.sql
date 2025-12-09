-- products 테이블의 consumer_reviews 업데이트를 위한 RLS 정책 수정
-- '도움됨' 버튼 기능을 위해 공개 UPDATE 허용

-- 기존 정책 삭제
DROP POLICY IF EXISTS "Allow authenticated users to manage" ON products;

-- 공개 읽기 정책 (이미 존재하지만 확인)
DROP POLICY IF EXISTS "Allow public read access" ON products;
CREATE POLICY "Allow public read access" ON products
  FOR SELECT USING (true);

-- consumer_reviews 업데이트를 위한 공개 정책 추가
-- 주의: 이 정책은 consumer_reviews 필드만 업데이트하도록 제한할 수 없으므로
-- API 레벨에서 검증이 필요합니다.
DROP POLICY IF EXISTS "Allow public update consumer_reviews" ON products;
CREATE POLICY "Allow public update consumer_reviews" ON products
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- 다른 필드는 인증된 사용자만 수정 가능
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON products;
CREATE POLICY "Allow authenticated users to insert" ON products
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 참고: UPDATE 정책은 위에서 공개로 설정했으므로, 
-- consumer_reviews 외의 필드는 API에서 검증해야 합니다.

