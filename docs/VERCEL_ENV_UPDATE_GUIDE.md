# Vercel 프로덕션 환경 변수 업데이트 가이드

## 📋 업데이트할 환경 변수

### 1. NEXT_PUBLIC_SUPABASE_URL

**기존 값 (잘못됨):**
```
https://hkyutzlbcnfdfzlcophxh.supabase.co
```

**새로운 값 (올바름):**
```
https://hkyutzlbcnfdfzlcopxh.supabase.co
```

**차이점:** 마지막 부분이 `cophxh` → `copxh` (h 하나 제거)

### 2. NEXT_PUBLIC_SUPABASE_ANON_KEY

**현재 값 (확인 필요):**
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhreXV0emxiY25mZGZ6bGNvcHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MzM0ODUsImV4cCI6MjA3NjUwOTQ4NX0.ZU0s539F_Lfd_D95k16q612wH-CtnziZsccy-xXoJCU
```

## 🚀 단계별 업데이트 방법

### 1단계: Vercel Dashboard 접속

1. **Vercel 웹사이트 접속**
   - https://vercel.com 접속
   - 로그인

2. **프로젝트 선택**
   - 대시보드에서 `safe-pet-food` 프로젝트 클릭

### 2단계: Environment Variables 페이지로 이동

1. **Settings 메뉴 클릭**
   - 프로젝트 페이지 상단 메뉴에서 **Settings** 클릭

2. **Environment Variables 메뉴 클릭**
   - 왼쪽 사이드바에서 **Environment Variables** 클릭

### 3단계: NEXT_PUBLIC_SUPABASE_URL 업데이트

1. **기존 환경 변수 찾기**
   - `NEXT_PUBLIC_SUPABASE_URL` 찾기
   - 또는 검색 기능 사용

2. **Edit 버튼 클릭**
   - 해당 환경 변수의 **Edit** 버튼 클릭

3. **Value 수정**
   - 기존 값: `https://hkyutzlbcnfdfzlcophxh.supabase.co`
   - 새로운 값: `https://hkyutzlbcnfdfzlcopxh.supabase.co`
   - ⚠️ **주의**: 마지막 부분이 `cophxh` → `copxh`로 변경됨 (h 하나 제거)

4. **Environment 선택 확인**
   - ✅ **Production** 체크되어 있는지 확인
   - ✅ **Preview** (선택사항)
   - ✅ **Development** (선택사항)

5. **Save 버튼 클릭**

### 4단계: NEXT_PUBLIC_SUPABASE_ANON_KEY 확인

1. **기존 환경 변수 찾기**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 찾기

2. **값 확인**
   - 현재 설정된 값이 올바른지 확인
   - 올바른 값: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhreXV0emxiY25mZGZ6bGNvcHhoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA5MzM0ODUsImV4cCI6MjA3NjUwOTQ4NX0.ZU0s539F_Lfd_D95k16q612wH-CtnziZsccy-xXoJCU`

3. **다르다면 업데이트**
   - Edit 버튼 클릭
   - 올바른 값으로 수정
   - Save 버튼 클릭

### 5단계: 재배포

1. **자동 재배포**
   - 환경 변수 저장 시 자동으로 재배포가 시작될 수 있음
   - 또는 Deployments 탭에서 확인

2. **수동 재배포 (필요시)**
   - Deployments 탭으로 이동
   - 최신 배포의 **Redeploy** 버튼 클릭

### 6단계: 프로덕션 테스트

1. **배포 완료 대기**
   - 배포 상태가 "Ready"가 될 때까지 대기

2. **프로덕션 URL 접속**
   - `https://safe-pet-food.vercel.app/brands` 접속
   - 브랜드 목록이 정상적으로 표시되는지 확인

3. **API 테스트**
   - `https://safe-pet-food.vercel.app/api/brands` 접속
   - JSON 응답이 정상적으로 반환되는지 확인

## ✅ 확인 체크리스트

- [ ] Vercel Dashboard 접속 완료
- [ ] Settings → Environment Variables 페이지 접속
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 값 수정 완료
  - [ ] 기존: `https://hkyutzlbcnfdfzlcophxh.supabase.co`
  - [ ] 새로운: `https://hkyutzlbcnfdfzlcopxh.supabase.co`
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 값 확인/수정 완료
- [ ] Production 환경에 체크되어 있는지 확인
- [ ] 재배포 완료
- [ ] 프로덕션 페이지 테스트 완료 (`/brands`)
- [ ] 프로덕션 API 테스트 완료 (`/api/brands`)

## 🔍 문제 해결

### 환경 변수가 보이지 않는 경우
- 검색 기능 사용
- 또는 새로 추가 (Add New 버튼)

### 재배포가 자동으로 시작되지 않는 경우
- Deployments 탭에서 수동으로 Redeploy

### 프로덕션에서 여전히 오류가 발생하는 경우
1. 환경 변수가 올바르게 저장되었는지 확인
2. 재배포가 완료되었는지 확인
3. 브라우저 캐시 클리어 후 재시도
4. Vercel 배포 로그 확인

## 📝 참고

- 환경 변수 변경 후 **반드시 재배포**가 필요합니다
- Production 환경 변수만 업데이트해도 되지만, Preview와 Development도 함께 업데이트하는 것을 권장합니다
- 환경 변수는 보안상 마스킹되어 표시됩니다 (예: `eyJhbG...`)

---

**업데이트 날짜**: 2024년 12월
**상태**: 대기 중 (사용자 확인 필요)

