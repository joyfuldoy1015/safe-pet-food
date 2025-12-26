-- ============================================
-- 테스트 계정 생성 스크립트
-- ID: user@test.com
-- PW: user123
-- ============================================

-- 1. 테스트 사용자 생성 (Supabase Auth)
-- 주의: 이 스크립트는 Supabase 대시보드의 SQL Editor에서 실행해야 합니다.

-- Step 1: auth.users 테이블에 사용자 생성
INSERT INTO auth.users (
  instance_id,
  id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  invited_at,
  confirmation_token,
  confirmation_sent_at,
  recovery_token,
  recovery_sent_at,
  email_change_token_new,
  email_change,
  email_change_sent_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  phone_change,
  phone_change_token,
  phone_change_sent_at,
  email_change_token_current,
  email_change_confirm_status,
  banned_until,
  reauthentication_token,
  reauthentication_sent_at,
  is_sso_user,
  deleted_at
)
VALUES (
  '00000000-0000-0000-0000-000000000000',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479', -- 고정 UUID (테스트용)
  'authenticated',
  'authenticated',
  'user@test.com',
  crypt('user123', gen_salt('bf')), -- 비밀번호 해싱
  NOW(),
  NULL,
  '',
  NULL,
  '',
  NULL,
  '',
  '',
  NULL,
  NULL,
  '{"provider":"email","providers":["email"]}',
  '{}',
  FALSE,
  NOW(),
  NOW(),
  NULL,
  NULL,
  '',
  '',
  NULL,
  '',
  0,
  NULL,
  '',
  NULL,
  FALSE,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  email = 'user@test.com',
  encrypted_password = crypt('user123', gen_salt('bf')),
  email_confirmed_at = NOW(),
  updated_at = NOW();

-- Step 2: auth.identities 테이블에 ID 정보 추가
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  last_sign_in_at,
  created_at,
  updated_at
)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '{"sub":"f47ac10b-58cc-4372-a567-0e02b2c3d479","email":"user@test.com"}',
  'email',
  NOW(),
  NOW(),
  NOW()
)
ON CONFLICT (id, provider) DO UPDATE SET
  updated_at = NOW();

-- Step 3: public.profiles 테이블에 프로필 생성 (RLS 정책에 맞춤)
INSERT INTO public.profiles (
  id,
  nickname,
  avatar_url,
  created_at,
  updated_at
)
VALUES (
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '테스트유저',
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  nickname = '테스트유저',
  updated_at = NOW();

-- Step 4: 테스트용 반려동물 생성
INSERT INTO public.pets (
  id,
  owner_id,
  name,
  species,
  birth_date,
  weight_kg,
  breed,
  tags,
  avatar_url,
  created_at,
  updated_at
)
VALUES (
  'pet-test-001',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '뽀삐',
  'dog',
  '2020-01-01',
  10.5,
  '골든 리트리버',
  ARRAY['활발함', '친근함'],
  NULL,
  NOW(),
  NOW()
),
(
  'pet-test-002',
  'f47ac10b-58cc-4372-a567-0e02b2c3d479',
  '나비',
  'cat',
  '2021-06-15',
  4.2,
  '코리안 숏헤어',
  ARRAY['조용함', '독립적'],
  NULL,
  NOW(),
  NOW()
)
ON CONFLICT (id) DO UPDATE SET
  updated_at = NOW();

-- ============================================
-- 완료!
-- ============================================

-- 테스트 계정 정보:
-- 이메일: user@test.com
-- 비밀번호: user123
-- 반려동물: 뽀삐 (강아지), 나비 (고양이)

-- 로그인 테스트:
-- 1. http://localhost:3000
-- 2. "로그인" 버튼 클릭
-- 3. 이메일: user@test.com
-- 4. 비밀번호: user123
-- 5. "로그인" 클릭
