# 카카오 로그인 디버그 가이드

## 🔍 현재 문제

카카오 OAuth 프로세스는 성공하지만 세션이 생성되지 않는 문제

---

## 🧪 디버깅 단계

### **Step 1: 브라우저 개발자 도구 확인**

#### 1️⃣ Console 탭 열기 (F12)

**카카오 로그인 버튼 클릭 시 확인할 로그:**

```javascript
// 정상 흐름:
[Auth Callback] Request received: { code: "abc123...", next: "/", ... }
[Auth Callback] Exchanging code for session...
[Auth Callback] Code exchange successful: { userId: "...", email: "...", hasSession: true }
[Auth Callback] Session verified: { userId: "...", expiresAt: ... }
[Auth Callback] Profile created successfully (또는 Profile already exists)
[Auth Callback] Redirecting to: http://localhost:3000/?auth=success

[Login Page] Auth success detected, checking session...
[Login Page] Session check attempt 1: { hasSession: true, userId: "..." }
[Login Page] Session found, will redirect via useAuth

[useAuth] Auth success parameter detected, reloading session...
[useAuth] Session reload attempt 1: { hasSession: true, userId: "..." }
[useAuth] Session found! Updating state...
[useAuth] Auth state changed: SIGNED_IN user@example.com

[Login Page] User logged in, redirecting to: /
```

**비정상 흐름 (문제 발생 시):**

```javascript
// 패턴 1: 세션 생성 실패
[Auth Callback] Error exchanging code for session: { message: "..." }

// 패턴 2: 세션 확인 실패
[Auth Callback] Session not found after code exchange!

// 패턴 3: 세션 로드 실패
[Login Page] Session check attempt 1-5: { hasSession: false, ... }
[useAuth] Session reload attempt 1-5: { hasSession: false, ... }
```

---

### **Step 2: Network 탭 확인**

#### 1️⃣ Network 탭 열기 (F12 → Network)

#### 2️⃣ 카카오 로그인 흐름 확인:

**정상 흐름:**
```
1. POST /auth/v1/authorize (Supabase)
   → Status: 302 Redirect
   → Location: kauth.kakao.com

2. GET kauth.kakao.com/oauth/authorize
   → 카카오 로그인 페이지 표시

3. POST kauth.kakao.com/oauth/token
   → 카카오 인증 완료

4. GET /auth/callback?code=...
   → Status: 307 Redirect
   → Location: /?auth=success
   
5. GET /
   → 홈페이지 로드 (로그인 상태)
```

**문제 확인 포인트:**
```
□ /auth/callback 요청의 Response Headers에 Set-Cookie가 있는가?
□ Set-Cookie에 sb-...-auth-token이 포함되어 있는가?
□ 최종 리다이렉트 후 쿠키가 브라우저에 저장되었는가?
```

---

### **Step 3: Application 탭 → Cookies 확인**

#### 1️⃣ Application 탭 → Cookies → localhost:3000

**확인할 쿠키:**
```
sb-hkyutzlbcnfdfzlcopxh-auth-token
  ↑ 이 쿠키가 있어야 함

쿠키 내용 예시:
- Name: sb-hkyutzlbcnfdfzlcopxh-auth-token
- Value: base64-xxxxx... (JSON Web Token)
- Domain: localhost
- Path: /
- HttpOnly: No
- Secure: No (localhost에서는 No)
```

**쿠키가 없다면:**
→ `/auth/callback`에서 세션 생성이 실패했거나 쿠키가 설정되지 않음

---

### **Step 4: 터미널 로그 확인**

#### Next.js 개발 서버 터미널에서:

**정상 로그:**
```bash
[Auth Callback] Request received: { code: "abc123...", next: "/", ... }
[Auth Callback] Exchanging code for session...
[Auth Callback] Code exchange successful: { userId: "...", ... }
[Auth Callback] Session verified: { userId: "..." }
[Auth Callback] Profile created successfully
[Auth Callback] Redirecting to: http://localhost:3000/?auth=success
```

**에러 로그:**
```bash
[Auth Callback] Error exchanging code for session: { ... }
```

---

## 🛠️ 문제별 해결 방법

### **문제 1: "세션이 생성되지 않음"**

#### 증상:
```javascript
[Auth Callback] Session not found after code exchange!
```

#### 원인:
- Supabase Auth 설정 문제
- 카카오 OAuth 프로바이더 비활성화
- Redirect URI 불일치

#### 해결:

**1. Supabase 카카오 프로바이더 확인:**
```
https://supabase.com/dashboard/project/hkyutzlbcnfdfzlcopxh/auth/providers

□ Kakao Toggle: ON
□ Client ID: [카카오 REST API 키]
□ Client Secret: [카카오 Client Secret]
```

**2. 카카오 Redirect URI 확인:**
```
https://developers.kakao.com/console/app
→ 제품 설정 → 카카오 로그인 → Redirect URI

필수 URI:
✅ http://localhost:3000/auth/callback
✅ https://hkyutzlbcnfdfzlcopxh.supabase.co/auth/v1/callback
```

---

### **문제 2: "쿠키가 설정되지 않음"**

#### 증상:
```
Application → Cookies → localhost:3000
→ sb-hkyutzlbcnfdfzlcopxh-auth-token 없음
```

#### 원인:
- 브라우저의 Third-party 쿠키 차단
- Supabase 콜백 처리 오류

#### 해결:

**1. 브라우저 쿠키 설정 확인:**
```
Chrome: 설정 → 개인정보 및 보안 → 쿠키 및 기타 사이트 데이터
→ "모든 쿠키 허용" 또는 "localhost 허용"

Safari: 환경설정 → 개인 정보 보호
→ "모든 쿠키 차단" 해제
```

**2. Incognito/Private 모드 테스트:**
```
Ctrl+Shift+N (Chrome) 또는 Cmd+Shift+N (Mac)
→ 시크릿 창에서 로그인 테스트
```

**3. 브라우저 캐시 및 쿠키 삭제:**
```
F12 → Application → Storage → Clear site data
→ 페이지 새로고침 후 재시도
```

---

### **문제 3: "세션은 있지만 리다이렉트 안 됨"**

#### 증상:
```javascript
[Login Page] Session check attempt 1-5: { hasSession: true, userId: "..." }
// 하지만 여전히 로그인 페이지에 있음
```

#### 원인:
- `useAuth` 훅의 상태 업데이트 지연
- React Router 캐시 문제

#### 해결:

**1. 강제 새로고침:**
```javascript
// 브라우저 콘솔에서 실행
window.location.href = '/'
```

**2. 세션 수동 확인:**
```javascript
// 브라우저 콘솔에서 실행
const supabase = window.supabase || createClient(...)
const { data: { session } } = await supabase.auth.getSession()
console.log('Current session:', session)
```

---

### **문제 4: "Profile 생성 실패"**

#### 증상:
```bash
[Auth Callback] Error creating profile: { code: "23505", ... }
```

#### 원인:
- Profile이 이미 존재함 (중복 생성 시도)
- RLS 정책 오류

#### 해결:

**1. Supabase에서 Profile 확인:**
```sql
-- Supabase SQL Editor에서 실행
SELECT * FROM profiles WHERE id = '[USER_ID]';
```

**2. Profile 수동 생성:**
```sql
INSERT INTO profiles (id, nickname)
VALUES ('[USER_ID]', '사용자');
```

---

## 🔧 수동 디버깅 명령어

### **브라우저 콘솔에서 실행:**

#### 1️⃣ 현재 세션 확인:
```javascript
const supabase = window.supabaseClient
const { data: { session } } = await supabase.auth.getSession()
console.log('Session:', session)
console.log('User ID:', session?.user?.id)
console.log('Email:', session?.user?.email)
console.log('Expires at:', new Date(session?.expires_at * 1000))
```

#### 2️⃣ 쿠키 확인:
```javascript
console.log('All cookies:', document.cookie)
```

#### 3️⃣ localStorage 확인:
```javascript
const authToken = localStorage.getItem('sb-hkyutzlbcnfdfzlcopxh-auth-token')
console.log('Auth token:', authToken)
```

#### 4️⃣ 수동 로그인 상태 설정:
```javascript
// 세션이 있는데도 로그인 안 되면
window.location.href = '/?auth=success'
```

---

## 📊 체크리스트

### **카카오 OAuth 설정:**
```
□ 카카오 개발자 앱 생성
□ REST API 키 확보
□ Client Secret 생성
□ Redirect URI 등록:
  □ http://localhost:3000/auth/callback
  □ https://hkyutzlbcnfdfzlcopxh.supabase.co/auth/v1/callback
□ 카카오 로그인 활성화
□ 동의 항목 설정 (닉네임, 이메일)
```

### **Supabase 설정:**
```
□ Kakao Provider 활성화
□ Client ID 입력
□ Client Secret 입력
□ Site URL: http://localhost:3000
□ Redirect URLs 등록:
  □ http://localhost:3000/**
  □ http://localhost:3000/auth/callback
```

### **브라우저 설정:**
```
□ 쿠키 허용
□ JavaScript 활성화
□ Third-party 쿠키 허용 (또는 localhost 예외)
□ 개발자 도구 Console/Network 확인
```

---

## 🎯 최종 테스트 시나리오

### **1. 완전 초기화:**
```bash
# 1. 브라우저 캐시/쿠키 삭제
F12 → Application → Clear site data

# 2. 개발 서버 재시작
npm run dev

# 3. 새 탭에서 로그인 페이지 열기
http://localhost:3000/login
```

### **2. 카카오 로그인:**
```
1. F12 개발자 도구 열기
2. Console 탭으로 이동
3. "카카오로 로그인" 버튼 클릭
4. 카카오 로그인 페이지에서 로그인
5. 로그 확인:
   - [Auth Callback] 로그들
   - [Login Page] 로그들
   - [useAuth] 로그들
6. 자동 리다이렉트 확인
7. 우측 상단에 사용자 이름 표시 확인
```

### **3. 세션 지속성 테스트:**
```
1. 로그인 후 다른 페이지 이동
2. F5로 페이지 새로고침
3. 여전히 로그인 상태인지 확인
4. 쿠키가 유지되는지 확인
```

---

## 🚨 긴급 해결 방법

### **아무것도 작동하지 않을 때:**

**1. 이메일/비밀번호 로그인 사용:**
```
/login 페이지에서
→ "비밀번호로 로그인" 섹션 사용
→ 테스트 계정: user@test.com / user123
```

**2. Supabase 직접 테스트:**
```javascript
// 브라우저 콘솔에서 실행
const { createClient } = supabase
const client = createClient(
  'https://hkyutzlbcnfdfzlcopxh.supabase.co',
  'eyJhbG...' // ANON_KEY
)

const { data, error } = await client.auth.signInWithOAuth({
  provider: 'kakao'
})
console.log('Direct OAuth result:', data, error)
```

---

## 📝 로그 수집 방법

**문제가 지속되면 다음 정보를 제공해주세요:**

```
1. 브라우저 Console 전체 로그 (스크린샷)
2. Network 탭의 /auth/callback 요청 상세 (Headers, Response)
3. Application 탭의 Cookies 목록 (스크린샷)
4. 터미널의 서버 로그
5. Supabase 카카오 프로바이더 설정 (스크린샷)
6. 카카오 개발자 콘솔 Redirect URI 설정 (스크린샷)
```

---

**이 가이드를 따라 디버깅한 후 결과를 알려주세요!** 🔍
