-- ============================================
-- User ID 확인용 스크립트
-- ============================================
-- Supabase SQL Editor에서 실행하세요
-- ============================================

-- 방법 1: 이메일로 user ID 찾기
SELECT 
  id as user_id, 
  email, 
  created_at,
  last_sign_in_at
FROM auth.users 
WHERE email = 'your-email@example.com'  -- ⚠️ 본인의 이메일로 교체
LIMIT 1;

-- 방법 2: 모든 사용자 확인 (관리자용)
SELECT 
  id as user_id, 
  email, 
  created_at,
  CASE 
    WHEN last_sign_in_at IS NOT NULL 
    THEN '✅ 로그인 기록 있음' 
    ELSE '❌ 로그인 안함' 
  END as status
FROM auth.users 
ORDER BY created_at DESC;

-- 방법 3: 가장 최근 가입한 사용자 (테스트용)
SELECT 
  id as user_id, 
  email,
  '👆 이 user_id를 복사해서 사용하세요' as instruction
FROM auth.users 
ORDER BY created_at DESC 
LIMIT 1;

-- 방법 4: 본인의 반려동물이 있는지 확인
SELECT 
  p.id as pet_id,
  p.name as pet_name,
  p.species,
  p.owner_id as user_id,
  u.email as owner_email
FROM pets p
JOIN auth.users u ON p.owner_id = u.id
ORDER BY p.created_at DESC;
