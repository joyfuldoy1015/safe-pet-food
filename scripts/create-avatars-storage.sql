-- 프로필 이미지 저장을 위한 Supabase Storage 버킷 생성
-- Supabase Dashboard > SQL Editor에서 실행하세요

-- 1. avatars 버킷 생성 (public 접근 허용)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 2. avatars 버킷에 대한 정책 설정

-- 모든 사용자가 avatars 버킷의 파일을 볼 수 있음
CREATE POLICY "Avatar images are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 인증된 사용자만 자신의 아바타를 업로드할 수 있음
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
);

-- 인증된 사용자만 자신의 아바타를 업데이트할 수 있음
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);

-- 인증된 사용자만 자신의 아바타를 삭제할 수 있음
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
);
