-- ============================================
-- Review Logs 트리거 제거 스크립트
-- ============================================
-- 문제: calculate_duration_days 트리거가 잘못된 EXTRACT 함수 사용
-- 해결: 모든 트리거 제거 (duration_days는 클라이언트에서 계산)
-- ============================================

-- ============================================
-- STEP 1: 문제가 되는 트리거만 제거
-- ============================================
DROP TRIGGER IF EXISTS calculate_review_logs_duration ON review_logs;

-- ============================================
-- STEP 2: 문제가 되는 트리거 함수만 제거
-- ============================================
DROP FUNCTION IF EXISTS calculate_duration_days();

-- ============================================
-- 참고: update_updated_at_column()은 다른 테이블에서도 사용하므로 삭제하지 않음
-- 참고: update_comments_count()도 필요하면 남겨둠
-- ============================================

-- ============================================
-- STEP 3: 확인
-- ============================================
-- 남아있는 트리거 확인 (결과가 비어있어야 함)
SELECT 
  trigger_name,
  event_manipulation,
  event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'review_logs';

SELECT '✅ 모든 트리거가 제거되었습니다!' as status;
