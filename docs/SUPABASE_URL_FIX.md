# Supabase URL 문제 해결 가이드

## 🔍 문제 진단

현재 `.env.local`에 설정된 URL:
```
https://hkyutzlbcnfdfzlcophxh.supabase.co
```

DNS 조회 결과: **NXDOMAIN** (도메인이 존재하지 않음)

## ✅ 해결 방법

### 1단계: Supabase Dashboard에서 올바른 URL 확인

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard
   - 로그인

2. **프로젝트 선택**
   - 프로젝트 목록에서 `safe-pet-food` 또는 해당 프로젝트 선택

3. **Settings → API 메뉴 접속**
   - 왼쪽 사이드바에서 **Settings** 클릭
   - **API** 탭 클릭

4. **Project URL 확인**
   - **Project URL** 필드에서 올바른 URL 복사
   - 형식: `https://[프로젝트-참조-ID].supabase.co`
   - 예시: `https://abcdefghijklmnop.supabase.co`

### 2단계: 환경 변수 업데이트

`.env.local` 파일 수정:

```bash
# 기존 (잘못된 URL)
NEXT_PUBLIC_SUPABASE_URL=https://hkyutzlbcnfdfzlcophxh.supabase.co

# 새로운 (올바른 URL)
NEXT_PUBLIC_SUPABASE_URL=https://[올바른-프로젝트-ID].supabase.co
```

### 3단계: 연결 테스트

```bash
# DNS 조회 테스트
nslookup [프로젝트-ID].supabase.co

# HTTP 연결 테스트
curl -I https://[프로젝트-ID].supabase.co/rest/v1/
```

### 4단계: 마이그레이션 재시도

```bash
npx tsx scripts/migrate-brands-to-supabase.ts
```

## 🔍 추가 확인 사항

### 프로젝트가 일시 중지되었는지 확인
- Supabase Dashboard에서 프로젝트 상태 확인
- Free tier의 경우 일정 기간 비활성 시 일시 중지될 수 있음
- 필요 시 프로젝트 재활성화

### 프로젝트가 삭제되었는지 확인
- 프로젝트 목록에 프로젝트가 있는지 확인
- 없다면 새 프로젝트 생성 필요

### 새 프로젝트 생성이 필요한 경우
1. **New Project** 클릭
2. 프로젝트 정보 입력
3. 새 프로젝트의 URL과 API 키 복사
4. `.env.local` 업데이트
5. 스키마 다시 생성 (`scripts/supabase-schema.sql`)

## 📝 체크리스트

- [ ] Supabase Dashboard에서 프로젝트 확인
- [ ] Settings → API에서 올바른 URL 확인
- [ ] `.env.local` 파일 업데이트
- [ ] DNS 조회 테스트 성공
- [ ] HTTP 연결 테스트 성공
- [ ] 마이그레이션 스크립트 실행 성공

