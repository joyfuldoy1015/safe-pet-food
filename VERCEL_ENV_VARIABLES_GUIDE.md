# Vercel 환경 변수 설정 가이드

## 📋 개요

Vercel에서 환경 변수를 추가하고 확인하는 방법을 단계별로 안내합니다.

---

## 🚀 단계별 가이드

### 1단계: Vercel Dashboard 접속

1. **Vercel 웹사이트 접속**
   - https://vercel.com 접속
   - 로그인

2. **프로젝트 선택**
   - 대시보드에서 `safe-pet-food` 프로젝트 클릭
   - 또는 프로젝트 목록에서 선택

### 2단계: 환경 변수 설정 페이지로 이동

1. **Settings 메뉴 클릭**
   - 프로젝트 페이지 상단 메뉴에서 **Settings** 클릭

2. **Environment Variables 메뉴 클릭**
   - 왼쪽 사이드바에서 **Environment Variables** 클릭
   - 또는 Settings 페이지에서 **Environment Variables** 섹션 찾기

### 3단계: 환경 변수 추가

#### 3.1. 환경 변수 입력

1. **Key 입력**
   - **Key** 필드에 환경 변수 이름 입력
   - 예: `NEXT_PUBLIC_SUPABASE_URL`

2. **Value 입력**
   - **Value** 필드에 환경 변수 값 입력
   - 예: `https://your-project-id.supabase.co`

3. **Environment 선택**
   - ✅ **Production** (프로덕션 환경 - 필수)
   - ✅ **Preview** (프리뷰 환경 - 선택사항)
   - ✅ **Development** (개발 환경 - 선택사항)
   
   ⚠️ **중요**: Google Auth를 프로덕션에서 사용하려면 **Production**을 반드시 선택해야 합니다.

4. **Add 버튼 클릭**
   - 입력 완료 후 **Add** 버튼 클릭

#### 3.2. Google Auth에 필요한 환경 변수

다음 두 개의 환경 변수를 추가해야 합니다:

**1. NEXT_PUBLIC_SUPABASE_URL**
```
Key: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
Environment: ✅ Production (필수)
```

**2. NEXT_PUBLIC_SUPABASE_ANON_KEY**
```
Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... (실제 키 값)
Environment: ✅ Production (필수)
```

### 4단계: 환경 변수 값 찾기

#### Supabase에서 API 키 가져오기

1. **Supabase Dashboard 접속**
   - https://supabase.com/dashboard 접속
   - 프로젝트 선택

2. **Settings → API 클릭**
   - 왼쪽 사이드바에서 **Settings** 클릭
   - **API** 메뉴 클릭

3. **Project URL 복사**
   - **Project URL** 섹션에서 URL 복사
   - 예: `https://abcdefghijklmnop.supabase.co`
   - 이것이 `NEXT_PUBLIC_SUPABASE_URL` 값입니다

4. **anon public 키 복사**
   - **Project API keys** 섹션에서 **anon public** 키 복사
   - **Reveal** 버튼을 클릭하여 키 표시
   - 긴 문자열 (예: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.abcdefghijklmnopqrstuvwxyz1234567890`)
   - 이것이 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 값입니다

### 5단계: 환경 변수 확인

#### 추가된 환경 변수 확인

1. **Environment Variables 페이지에서 확인**
   - 추가한 환경 변수가 목록에 표시되는지 확인
   - Key, Value (마스킹됨), Environment 정보 확인

2. **환경 변수 편집/삭제**
   - 각 환경 변수 옆의 **"..."** 메뉴 클릭
   - **Edit** 또는 **Delete** 선택 가능

### 6단계: 재배포

⚠️ **중요**: 환경 변수를 추가/수정한 후에는 **재배포**가 필요합니다.

#### 방법 1: Vercel Dashboard에서 수동 재배포

1. **Deployments 탭 클릭**
   - 프로젝트 페이지 상단 메뉴에서 **Deployments** 클릭

2. **최신 배포 찾기**
   - 목록에서 가장 최근 배포 찾기

3. **재배포 실행**
   - 배포 항목 옆의 **"..."** 메뉴 클릭
   - **Redeploy** 선택
   - 확인 대화상자에서 **Redeploy** 클릭

#### 방법 2: Git 커밋으로 자동 재배포

```bash
# 빈 커밋 생성 (환경 변수 변경만 반영)
git commit --allow-empty -m "chore: update environment variables"

# 푸시 (자동으로 재배포됨)
git push
```

---

## 📝 환경 변수 예시

### Google Auth에 필요한 환경 변수

```bash
# Supabase URL
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co

# Supabase Anon Key
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFiY2RlZmdoaWprbG1ub3AiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTYzODk2NzI5MCwiZXhwIjoxOTU0NTQzMjkwfQ.abcdefghijklmnopqrstuvwxyz1234567890
```

### 선택적 환경 변수 (다른 기능용)

```bash
# OpenAI API Key (건강검진표 분석 기능용 - 선택사항)
OPENAI_API_KEY=sk-...

# Vercel API Token (배포 관리 기능용 - 선택사항)
VERCEL_TOKEN=vercel_...

# Vercel Team ID (팀 계정 사용 시 - 선택사항)
VERCEL_TEAM_ID=team_...
```

---

## 🔍 환경 변수 확인 방법

### 1. Vercel Dashboard에서 확인

1. **Settings → Environment Variables** 페이지에서 확인
2. 추가된 환경 변수 목록 확인
3. Value는 보안상 마스킹되어 표시됨 (예: `eyJhbG...`)

### 2. 배포 로그에서 확인

1. **Deployments** 탭에서 배포 선택
2. **Build Logs** 확인
3. 환경 변수가 올바르게 로드되었는지 확인

### 3. 런타임에서 확인 (디버깅용)

⚠️ **주의**: 프로덕션에서는 환경 변수를 로그로 출력하지 마세요!

```typescript
// 개발 환경에서만 확인
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  // Value는 출력하지 않기 (보안)
}
```

---

## ⚠️ 주의사항

### 1. 환경 변수 이름 규칙

- `NEXT_PUBLIC_` 접두사가 붙은 변수만 클라이언트에서 접근 가능
- 서버 사이드 전용 변수는 `NEXT_PUBLIC_` 없이 사용

### 2. 환경 변수 보안

- ✅ **공개해도 되는 값**: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ❌ **절대 공개하면 안 되는 값**: `SUPABASE_SERVICE_ROLE_KEY`, `OPENAI_API_KEY` (서버 사이드 전용)

### 3. 환경 변수 적용 시점

- 환경 변수 추가/수정 후 **재배포**가 필요합니다
- 재배포하지 않으면 변경사항이 적용되지 않습니다

### 4. 환경별 설정

- **Production**: 프로덕션 환경 (`https://safe-pet-food.vercel.app`)
- **Preview**: 프리뷰 환경 (Pull Request 미리보기)
- **Development**: 개발 환경 (로컬 개발 시 사용)

---

## 🐛 문제 해결

### 환경 변수가 적용되지 않음

1. **재배포 확인**
   - 환경 변수 추가 후 재배포했는지 확인
   - 최신 배포가 완료되었는지 확인

2. **환경 변수 이름 확인**
   - 오타가 없는지 확인
   - 대소문자 정확히 일치하는지 확인

3. **Environment 선택 확인**
   - Production 환경에 추가했는지 확인
   - Preview나 Development에만 추가했다면 Production에도 추가 필요

### 환경 변수 값이 잘못됨

1. **Supabase Dashboard에서 다시 확인**
   - Settings → API에서 정확한 값 복사
   - 공백이나 줄바꿈이 포함되지 않았는지 확인

2. **환경 변수 편집**
   - Environment Variables 페이지에서 **"..."** 메뉴 → **Edit** 클릭
   - 올바른 값으로 수정 후 저장

### 빌드 실패

1. **빌드 로그 확인**
   - Deployments → 최신 배포 → Build Logs 확인
   - 환경 변수 관련 오류 메시지 확인

2. **환경 변수 필수 여부 확인**
   - 코드에서 필수 환경 변수가 누락되지 않았는지 확인

---

## 📚 참고 자료

- [Vercel 환경 변수 문서](https://vercel.com/docs/concepts/projects/environment-variables)
- [Next.js 환경 변수 문서](https://nextjs.org/docs/basic-features/environment-variables)
- [Supabase API 키 가이드](https://supabase.com/docs/guides/api/api-keys)

---

## ✅ 체크리스트

환경 변수 설정 완료 확인:

- [ ] Vercel Dashboard 접속
- [ ] Settings → Environment Variables 페이지 이동
- [ ] `NEXT_PUBLIC_SUPABASE_URL` 추가 (Production 환경)
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` 추가 (Production 환경)
- [ ] 환경 변수 값이 올바른지 확인
- [ ] 재배포 완료
- [ ] 프로덕션 환경에서 Google Auth 테스트

---

**작성일**: 2024년 12월  
**최종 수정**: 2024년 12월

