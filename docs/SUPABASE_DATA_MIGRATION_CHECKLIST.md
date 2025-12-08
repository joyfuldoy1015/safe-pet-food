# Supabase 실제 데이터 마이그레이션 체크리스트

## 📋 사전 준비사항 확인

### 1단계: Supabase 프로젝트 확인

- [ ] Supabase 프로젝트 생성 완료
  - https://supabase.com/dashboard 접속
  - 프로젝트가 생성되어 있는지 확인

- [ ] API 키 확인
  - Settings → API 메뉴 접속
  - `Project URL` 확인 (예: `https://xxxxx.supabase.co`)
  - `anon public` 키 복사 준비

### 2단계: 환경 변수 설정 확인

#### 로컬 개발 환경 (`.env.local`)
```bash
# .env.local 파일 확인
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

- [ ] `.env.local` 파일 존재 확인
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 설정 확인 (placeholder가 아닌 실제 URL)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 설정 확인

#### Vercel 프로덕션 환경
- [ ] Vercel Dashboard → Settings → Environment Variables 접속
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 추가 확인
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가 확인
- [ ] Production 환경에 체크되어 있는지 확인

### 3단계: 데이터베이스 스키마 생성

Supabase Dashboard → SQL Editor에서 다음 스키마들을 순서대로 실행:

#### 3.1 기본 스키마 (profiles, pets, review_logs)
- [ ] `scripts/supabase-schema.sql` 실행
  - profiles 테이블 생성
  - pets 테이블 생성
  - review_logs 테이블 생성
  - RLS (Row Level Security) 정책 설정

#### 3.2 추가 스키마 (필요한 경우)
- [ ] `scripts/supabase-review-logs-schema.sql` 실행 (이미 포함되어 있을 수 있음)
- [ ] `scripts/supabase-admin-schema.sql` 실행 (관리자 기능용)
- [ ] `scripts/supabase-qa-schema.sql` 실행 (Q&A 포럼용)
- [ ] `scripts/supabase-rankings-views.sql` 실행 (랭킹 기능용)

#### 3.3 Storage Bucket 설정 (이미지 업로드용)
- [ ] Storage → Create bucket 클릭
- [ ] Bucket 이름: `avatars` (프로필 이미지용)
- [ ] Public bucket: ✅ 체크 (공개 접근 허용)
- [ ] RLS 정책 설정:
  ```sql
  -- Storage RLS 정책 (SQL Editor에서 실행)
  CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

  CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
  ```

### 4단계: 기존 데이터 마이그레이션

#### 4.1 Brands 데이터 마이그레이션
- [ ] `scripts/migrate-brands-to-supabase.ts` 실행
  ```bash
  npx tsx scripts/migrate-brands-to-supabase.ts
  ```
- [ ] Supabase Dashboard → Table Editor → brands 테이블에서 데이터 확인

#### 4.2 기타 데이터 마이그레이션 (필요한 경우)
- [ ] Cat Litter 제품 데이터
- [ ] Cat Treats 제품 데이터
- [ ] Feed Grade 데이터

### 5단계: 기능별 테스트

#### 5.1 인증 기능 테스트
- [ ] 회원가입 테스트 (`/signup`)
- [ ] 로그인 테스트 (`/login`)
  - Google 로그인
  - Kakao 로그인
  - 이메일/비밀번호 로그인
- [ ] 로그아웃 테스트

#### 5.2 프로필 기능 테스트
- [ ] 프로필 조회 (`/profile`)
- [ ] 프로필 수정 (닉네임 변경)
- [ ] 프로필 이미지 업로드 (Storage bucket 확인)

#### 5.3 펫 로그 기능 테스트
- [ ] 펫 로그 목록 조회 (`/pet-log`)
- [ ] 새 로그 작성 (`/pet-log/posts/write`)
- [ ] 로그 상세 보기
- [ ] 댓글 작성/답글

#### 5.4 브랜드 평가 기능 테스트
- [ ] 브랜드 목록 조회 (`/brands`)
- [ ] 브랜드 상세 페이지 (`/brands/[brandName]`)
- [ ] 브랜드 평가 작성

### 6단계: 프로덕션 배포 확인

- [ ] Vercel에서 최신 배포 확인
- [ ] 프로덕션 환경에서 로그인 테스트
- [ ] 프로덕션 환경에서 데이터 조회 테스트
- [ ] 프로덕션 환경에서 데이터 작성 테스트

## 🚨 주의사항

### 1. 환경 변수 확인
- 로컬과 프로덕션 모두 환경 변수가 설정되어 있어야 합니다
- `placeholder` 값이 아닌 실제 Supabase 프로젝트 URL과 키를 사용해야 합니다

### 2. RLS 정책 확인
- 모든 테이블에 RLS가 활성화되어 있는지 확인
- 공개 읽기/인증된 사용자 쓰기 정책이 올바르게 설정되어 있는지 확인

### 3. Storage 설정
- 이미지 업로드 기능을 사용하려면 Storage bucket이 설정되어 있어야 합니다
- RLS 정책이 올바르게 설정되어 있어야 합니다

### 4. 점진적 마이그레이션
- 한 번에 모든 기능을 전환하지 말고 단계별로 진행
- 각 단계마다 충분히 테스트 후 다음 단계 진행

## 📚 참고 문서

- [MOCK_TO_REAL_DATA_MIGRATION.md](./MOCK_TO_REAL_DATA_MIGRATION.md) - 상세 마이그레이션 가이드
- [QUICK_START_SUPABASE.md](./QUICK_START_SUPABASE.md) - 빠른 시작 가이드
- [VERCEL_ENV_VARIABLES_GUIDE.md](../VERCEL_ENV_VARIABLES_GUIDE.md) - Vercel 환경 변수 설정

## ✅ 마이그레이션 완료 확인

모든 체크리스트를 완료했다면:

1. **로컬 테스트**: `npm run dev` 실행 후 모든 기능 테스트
2. **프로덕션 배포**: Vercel에서 자동 배포 확인
3. **프로덕션 테스트**: 실제 사용자 시나리오로 테스트

---

**마지막 업데이트**: 2024년 12월

