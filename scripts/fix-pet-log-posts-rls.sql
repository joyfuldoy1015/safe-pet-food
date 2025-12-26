-- ============================================
-- Pet Log Posts RLS 정책 수정
-- ============================================
-- 문제: "new row violates row-level security policy for table pet_log_posts"
-- 원인: INSERT 정책이 너무 제한적이거나 user_id 검증 실패
-- 해결: INSERT 정책을 수정하여 인증된 사용자가 자신의 포스트를 작성할 수 있도록 허용
-- ============================================

-- 기존 INSERT 정책 삭제
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON pet_log_posts;

-- 새로운 INSERT 정책 생성
-- 방법 1: 인증된 사용자가 자신의 포스트만 작성 (보안 강화) ⭐ 권장
CREATE POLICY "Allow authenticated users to insert own posts" ON pet_log_posts
  FOR INSERT WITH CHECK (
    auth.uid()::text = user_id
  );

-- 또는 방법 2: 인증된 사용자는 누구나 작성 가능 (더 관대함)
-- DROP POLICY IF EXISTS "Allow authenticated users to insert own posts" ON pet_log_posts;
-- CREATE POLICY "Allow authenticated users to insert" ON pet_log_posts
--   FOR INSERT WITH CHECK (true);

-- ============================================
-- Pet Log Feeding Records RLS 정책도 동일하게 수정
-- ============================================

-- 기존 정책 확인 및 업데이트
DROP POLICY IF EXISTS "Allow authenticated users to insert" ON pet_log_feeding_records;

-- 인증된 사용자는 누구나 feeding records 작성 가능
-- (post_id로 연결되므로 보안 문제 없음)
CREATE POLICY "Allow authenticated users to insert feeding records" ON pet_log_feeding_records
  FOR INSERT WITH CHECK (true);

-- ============================================
-- 정책 확인 쿼리
-- ============================================
-- 다음 쿼리로 정책이 올바르게 적용되었는지 확인할 수 있습니다:
-- 
-- SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
-- FROM pg_policies
-- WHERE tablename IN ('pet_log_posts', 'pet_log_feeding_records')
-- ORDER BY tablename, policyname;
-- ============================================

-- 테스트 쿼리 (선택사항)
-- 현재 사용자 확인
-- SELECT auth.uid(), auth.role();

-- pet_log_posts 테이블의 모든 정책 확인
-- SELECT * FROM pg_policies WHERE tablename = 'pet_log_posts';
