# Supabase 마이그레이션 빠른 시작 가이드

## ✅ 현재 상태
- Supabase 프로젝트 생성 완료 (`safe-pet-food`)

## 🚀 빠른 시작 (10분)

### 1단계: 환경 변수 설정 (2분)

#### Supabase에서 API 키 가져오기
1. Supabase 대시보드 접속: https://supabase.com/dashboard
2. `safe-pet-food` 프로젝트 선택
3. **Settings** → **API** 클릭
4. 다음 값 복사:
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` 키 → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

#### 로컬 환경 변수 설정
프로젝트 루트에 `.env.local` 파일 생성:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

#### Vercel 환경 변수 설정
1. Vercel 대시보드 → 프로젝트 선택
2. **Settings** → **Environment Variables**
3. 위 두 변수 추가 (모든 환경에 적용)

### 2단계: 데이터베이스 스키마 생성 (5분)

1. **Supabase 대시보드 → SQL Editor** 클릭
2. **New query** 버튼 클릭
3. `scripts/supabase-schema.sql` 파일 내용 전체 복사
4. SQL Editor에 붙여넣기
5. **Run** 버튼 클릭

생성되는 테이블 확인:
- **Table Editor**에서 다음 테이블들이 생성되었는지 확인:
  - ✅ `brands`
  - ✅ `pet_log_posts`
  - ✅ `pet_log_feeding_records`
  - ✅ `pet_log_comments`
  - ✅ `feed_grade_analyses`
  - ✅ `health_analyses`
  - ✅ `pet_profiles`

### 3단계: Brands 데이터 마이그레이션 (3분)

```bash
# tsx 설치 (아직 없다면)
npm install tsx --save-dev

# 마이그레이션 실행
npx tsx scripts/migrate-brands-to-supabase.ts
```

**결과 확인:**
- Supabase 대시보드 → **Table Editor** → **brands** 테이블 확인
- 데이터가 제대로 들어갔는지 확인

### 4단계: 테스트 (1분)

#### 로컬 테스트
```bash
npm run dev
```

브라우저에서 확인:
1. `http://localhost:3000/api/brands` 접속
   - Supabase에서 데이터가 반환되는지 확인
   - 빈 배열이면 환경 변수를 확인하세요

2. `http://localhost:3000/brands` 페이지 접속
   - 브랜드 목록이 제대로 표시되는지 확인

## 🎯 작동 방식

### 안정적인 Fallback 시스템

현재 구현된 API들은 다음과 같이 작동합니다:

1. **Supabase 사용 가능 시:**
   - ✅ Supabase에서 데이터 가져오기
   - ✅ 새 데이터는 Supabase에 저장

2. **Supabase 사용 불가 시:**
   - ✅ 기존 JSON 파일 사용 (Brands)
   - ✅ localStorage 사용 (Pet Logs)
   - ✅ 기존 기능 계속 작동

### 데이터 흐름

```
사용자 요청
    ↓
API 라우트
    ↓
Supabase 사용 가능?
    ├─ YES → Supabase에서 데이터 조회/저장
    │         └─ 성공 → Supabase 데이터 반환
    │         └─ 실패 → Fallback (JSON/localStorage)
    │
    └─ NO → Fallback (JSON/localStorage)
```

## 📊 현재 구현 상태

### ✅ 완료
- Brands API (GET, POST, PUT, DELETE) - Supabase 연동 완료
- Brands 상세 API - Supabase 연동 완료
- Pet Log API 구조 생성 (GET, POST)
- Pet Log 상세 API 구조 생성
- Feed Grade Analysis API 구조 생성
- Fallback 시스템 구현

### ⏳ 다음 단계
1. 환경 변수 설정 및 스키마 생성
2. Brands 데이터 마이그레이션 실행
3. Pet Log 클라이언트 코드 업데이트 (API 연동)
4. Feed Grade Analysis 클라이언트 코드 업데이트

## 🔍 문제 해결

### Q: API가 빈 배열을 반환해요
**A:** 환경 변수를 확인하세요:
- `.env.local` 파일에 `NEXT_PUBLIC_SUPABASE_URL`과 `NEXT_PUBLIC_SUPABASE_ANON_KEY`가 올바르게 설정되어 있는지 확인
- 서버 재시작 필요: `npm run dev` 재실행

### Q: Supabase 에러가 발생해요
**A:** 
1. Supabase 프로젝트가 정상적으로 작동하는지 확인
2. 테이블이 생성되었는지 확인 (Table Editor)
3. RLS 정책이 올바르게 설정되었는지 확인

### Q: 기존 데이터가 보이지 않아요
**A:**
- Brands 데이터는 마이그레이션 스크립트 실행 필요
- Pet Logs는 새로 생성되는 데이터만 Supabase에 저장됨
- 기존 localStorage 데이터는 클라이언트에서 fallback으로 사용

## ✅ 체크리스트

- [ ] Supabase 환경 변수 설정 완료 (로컬 & Vercel)
- [ ] 데이터베이스 스키마 생성 완료
- [ ] Brands 데이터 마이그레이션 완료
- [ ] Brands API 테스트 완료
- [ ] 브라우저에서 `/brands` 페이지 정상 작동 확인
- [ ] Pet Log API 테스트 완료
- [ ] 프로덕션 배포 및 테스트 완료

## 📚 다음 단계

모든 것이 정상 작동하면:
1. Pet Log 클라이언트 코드 업데이트 (API 호출로 변경)
2. Feed Grade Analysis 클라이언트 코드 업데이트
3. Health Analysis API 생성
4. 점진적으로 localStorage 의존성 제거

---

**참고 문서:**
- `docs/MOCK_TO_REAL_DATA_MIGRATION.md` - 전체 마이그레이션 가이드
- `docs/SUPABASE_SETUP_STEP_BY_STEP.md` - 단계별 상세 가이드
- `SUPABASE_SETUP.md` - Supabase 설정 가이드

