# Google Auth redirect_uri_mismatch 오류 해결 가이드

## 🔴 오류 원인

`redirect_uri_mismatch` 오류는 **Google Console에 등록된 리디렉션 URI**와 **실제 요청하는 URI**가 일치하지 않을 때 발생합니다.

### Supabase OAuth의 특성

Supabase를 통한 Google OAuth는 **2단계 리디렉션**을 사용합니다:

1. **1단계**: 사용자 → Google → **Supabase 콜백 URL**
2. **2단계**: Supabase → **애플리케이션 콜백 URL**

따라서:
- **Google Console**에는 **Supabase 콜백 URL**을 등록해야 합니다
- **Supabase Dashboard**에는 **애플리케이션 콜백 URL**을 등록해야 합니다

---

## ✅ 해결 방법

### 1. Supabase 콜백 URL 확인

1. **Supabase Dashboard** → **Authentication** → **Providers** → **Google**
2. **Callback URL** 섹션에서 다음 URL을 확인:
   ```
   https://your-project-id.supabase.co/auth/v1/callback
   ```
   ⚠️ **이 URL을 복사해두세요!**

### 2. Google Console 설정

1. **Google Cloud Console** 접속: https://console.cloud.google.com/
2. **API 및 서비스** → **사용자 인증 정보** 이동
3. OAuth 2.0 클라이언트 ID 선택 (또는 새로 생성)
4. **승인된 리디렉션 URI** 섹션 확인

#### ✅ 추가해야 할 URI:

```
https://your-project-id.supabase.co/auth/v1/callback
```

⚠️ **중요 사항:**
- 정확히 위 URL을 복사해서 붙여넣기
- `http://`가 아닌 `https://` 사용
- 마지막에 `/` 없이 입력
- 프로토콜, 도메인, 경로가 정확히 일치해야 함

#### ❌ 잘못된 예시:
```
http://your-project-id.supabase.co/auth/v1/callback  ❌ (http 사용)
https://your-project-id.supabase.co/auth/v1/callback/  ❌ (끝에 / 있음)
https://your-project-id.supabase.co/auth/callback  ❌ (경로 불일치)
```

### 3. Supabase Dashboard 설정

1. **Supabase Dashboard** → **Authentication** → **URL Configuration**
2. **Redirect URLs** 섹션에 다음 추가:

#### 개발 환경:
```
http://localhost:3000/auth/callback
```

#### 프로덕션 환경:
```
https://safe-pet-food.vercel.app/auth/callback
```

⚠️ **중요 사항:**
- 여러 URL을 추가하려면 각각 별도 줄에 입력
- 프로토콜(`http://` 또는 `https://`) 포함
- 포트 번호 포함 (localhost의 경우)
- 경로(`/auth/callback`) 포함

### 4. Google Console - 승인된 JavaScript 원본 (선택사항)

OAuth 팝업을 사용하는 경우 필요할 수 있습니다:

1. **Google Cloud Console** → **API 및 서비스** → **사용자 인증 정보**
2. OAuth 2.0 클라이언트 ID 선택
3. **승인된 JavaScript 원본** 섹션에 추가:

#### 개발 환경:
```
http://localhost:3000
```

#### 프로덕션 환경:
```
https://safe-pet-food.vercel.app
```

⚠️ **참고:**
- 프로토콜 포함
- 포트 번호 포함 (localhost의 경우)
- 경로(`/auth/callback` 등) 포함하지 않음

---

## 🔍 문제 진단 체크리스트

### 1. 현재 설정 확인

#### Google Console 확인:
- [ ] OAuth 2.0 클라이언트 ID가 생성되어 있음
- [ ] 승인된 리디렉션 URI에 Supabase 콜백 URL이 정확히 등록됨
- [ ] URL에 오타가 없음 (프로토콜, 도메인, 경로)

#### Supabase Dashboard 확인:
- [ ] Google Provider가 Enabled 상태
- [ ] Client ID와 Client Secret이 올바르게 설정됨
- [ ] Redirect URLs에 애플리케이션 콜백 URL이 등록됨
- [ ] Site URL이 올바르게 설정됨

### 2. 오류 메시지 확인

브라우저 콘솔 또는 네트워크 탭에서 다음을 확인:

1. **요청하는 redirect_uri 값**:
   - Google OAuth 요청 시 `redirect_uri` 파라미터 확인
   - 이 값이 Google Console에 등록된 URI와 정확히 일치해야 함

2. **오류 상세 정보**:
   ```
   Error 400: redirect_uri_mismatch
   ```
   - 오류 메시지에 표시된 URI 확인
   - 이 URI가 Google Console에 등록되어 있는지 확인

### 3. 환경별 확인

#### 개발 환경 (localhost:3000):
- [ ] Google Console: `https://your-project-id.supabase.co/auth/v1/callback` 등록됨
- [ ] Supabase Dashboard: `http://localhost:3000/auth/callback` 등록됨
- [ ] `.env.local`에 환경 변수 설정됨

#### 프로덕션 환경 (Vercel):
- [ ] Google Console: `https://your-project-id.supabase.co/auth/v1/callback` 등록됨 (동일)
- [ ] Supabase Dashboard: `https://safe-pet-food.vercel.app/auth/callback` 등록됨
- [ ] Vercel 환경 변수 설정됨
- [ ] 재배포 완료

---

## 🛠️ 단계별 해결 절차

### Step 1: Supabase 콜백 URL 확인

1. Supabase Dashboard → Authentication → Providers → Google
2. Callback URL 복사 (예: `https://hkyutzlbcnfdfzlcophxh.supabase.co/auth/v1/callback`)

### Step 2: Google Console에 URI 추가

1. Google Cloud Console → API 및 서비스 → 사용자 인증 정보
2. OAuth 2.0 클라이언트 ID 선택
3. "승인된 리디렉션 URI" 섹션에서 "URI 추가" 클릭
4. Step 1에서 복사한 URL 붙여넣기
5. "저장" 클릭

### Step 3: Supabase Redirect URLs 확인

1. Supabase Dashboard → Authentication → URL Configuration
2. "Redirect URLs" 섹션 확인
3. 다음 URL들이 있는지 확인:
   - `http://localhost:3000/auth/callback` (개발)
   - `https://safe-pet-food.vercel.app/auth/callback` (프로덕션)
4. 없으면 추가

### Step 4: 테스트

1. 개발 서버 재시작:
   ```bash
   npm run dev
   ```

2. `/login` 페이지에서 "Google로 로그인" 클릭

3. Google 로그인 진행

4. 오류가 발생하면:
   - 브라우저 콘솔 확인
   - 네트워크 탭에서 `redirect_uri` 파라미터 확인
   - Google Console의 등록된 URI와 비교

---

## 🚨 자주 발생하는 실수

### 1. 잘못된 URI 등록
- ❌ Google Console에 애플리케이션 URL(`/auth/callback`) 등록
- ✅ Google Console에는 Supabase 콜백 URL만 등록

### 2. 프로토콜 불일치
- ❌ `http://`와 `https://` 혼용
- ✅ 정확한 프로토콜 사용

### 3. 경로 불일치
- ❌ `/auth/callback/` (끝에 `/`)
- ✅ `/auth/callback` (끝에 `/` 없음)

### 4. 포트 번호 누락
- ❌ `http://localhost/auth/callback`
- ✅ `http://localhost:3000/auth/callback`

### 5. 환경 변수 미설정
- ❌ Vercel에 환경 변수 미설정
- ✅ Production 환경에 환경 변수 설정 후 재배포

---

## 📝 요약

### Google Console에 등록:
```
https://your-project-id.supabase.co/auth/v1/callback
```

### Supabase Dashboard에 등록:
```
http://localhost:3000/auth/callback
https://safe-pet-food.vercel.app/auth/callback
```

### 핵심 포인트:
1. **Google Console** = Supabase 콜백 URL
2. **Supabase Dashboard** = 애플리케이션 콜백 URL
3. 정확한 URL 복사/붙여넣기 (오타 주의)
4. 프로토콜, 도메인, 경로 정확히 일치

---

## 🔗 관련 문서

- [Google OAuth 설정 가이드](./GOOGLE_AUTH_SETUP.md)
- [프로덕션 설정 가이드](./PRODUCTION_GOOGLE_AUTH_SETUP.md)
- [Supabase Auth 문서](https://supabase.com/docs/guides/auth)
- [Google OAuth 문서](https://developers.google.com/identity/protocols/oauth2)

---

**작성일**: 2024년 12월  
**최종 수정**: 2024년 12월

