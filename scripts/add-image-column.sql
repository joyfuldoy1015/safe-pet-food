-- Supabase brands 테이블에 image 컬럼 추가
-- SQL Editor에서 실행하세요

ALTER TABLE brands ADD COLUMN IF NOT EXISTS image TEXT;

-- 완료 메시지
SELECT 'Image column added successfully!' as message;

